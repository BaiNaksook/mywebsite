import {
  collection,
  doc,
  FieldPath,
  deleteField,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
  writeBatch,
  type DocumentData,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { db, storage } from '../firebase';
import type { CategoryId, HistoryEvent, HistoryType, Report, ReportStatus, Resolution } from '../types';

const SNAP_OPTS = { serverTimestamps: 'estimate' } as const;

/** ข้อผิดพลาดที่ต้องแสดงให้ผู้ใช้เห็นเป็นภาษาไทย */
export class ActionError extends Error {}

function toDate(v: unknown): Date | null {
  if (v && typeof v === 'object' && 'toDate' in v && typeof (v as { toDate: unknown }).toDate === 'function') {
    return (v as { toDate: () => Date }).toDate();
  }
  return null;
}

export function parseReport(snap: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>): Report {
  const d = snap.data(SNAP_OPTS) ?? {};
  const volunteersMap = (d.volunteers ?? {}) as Record<string, { name?: string; joinedAt?: unknown }>;
  const volunteers = Object.entries(volunteersMap)
    .map(([uid, v]) => ({ uid, name: String(v?.name ?? ''), joinedAt: toDate(v?.joinedAt) }))
    .sort((a, b) => (a.joinedAt?.getTime() ?? Infinity) - (b.joinedAt?.getTime() ?? Infinity));
  const r = d.resolution as (Omit<Resolution, 'at'> & { at: unknown }) | null | undefined;
  return {
    id: snap.id,
    reporterUid: d.reporterUid,
    reporterName: d.reporterName ?? '',
    category: d.category ?? 'other',
    placeName: d.placeName ?? '',
    description: d.description ?? '',
    lat: Number(d.lat),
    lng: Number(d.lng),
    photoUrl: d.photoUrl ?? null,
    status: d.status ?? 'open',
    volunteers,
    resolution: r ? { note: r.note, photoUrl: r.photoUrl ?? null, byUid: r.byUid, byName: r.byName, at: toDate(r.at) } : null,
    hidden: Boolean(d.hidden),
    reopenCount: Number(d.reopenCount ?? 0),
    createdAt: toDate(d.createdAt),
    updatedAt: toDate(d.updatedAt),
  };
}

/** ฟังรายงานทั้งหมดแบบเรียลไทม์ (ไม่รวมที่ถูกซ่อน) */
export function subscribeReports(onData: (reports: Report[]) => void, onError: (e: Error) => void) {
  const q = query(collection(db, 'reports'), where('hidden', '==', false), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map(parseReport).filter((r) => Number.isFinite(r.lat) && Number.isFinite(r.lng))),
    onError,
  );
}

export function subscribeHistory(reportId: string, onData: (events: HistoryEvent[]) => void, onError: (e: Error) => void) {
  const q = query(collection(db, 'reports', reportId, 'history'), orderBy('at', 'asc'));
  return onSnapshot(
    q,
    (snap) =>
      onData(
        snap.docs.map((s) => {
          const d = s.data(SNAP_OPTS);
          return {
            id: s.id,
            type: d.type,
            byUid: d.byUid,
            byName: d.byName,
            at: toDate(d.at),
            note: d.note ?? null,
            fromStatus: d.fromStatus ?? null,
            toStatus: d.toStatus,
          } satisfies HistoryEvent;
        }),
      ),
    onError,
  );
}

/** อัปโหลดรูป (บีบอัดแล้ว) ไปยัง Storage และคืน URL — ยกเลิกได้ผ่าน signal */
export function uploadPhoto(
  folder: 'reports' | 'resolutions',
  uid: string,
  reportId: string,
  blob: Blob,
  onProgress?: (pct: number) => void,
  signal?: AbortSignal,
): Promise<string> {
  const path = `${folder}/${uid}/${reportId}/${Date.now()}.jpg`;
  const task = uploadBytesResumable(ref(storage, path), blob, {
    contentType: 'image/jpeg',
    cacheControl: 'public, max-age=31536000, immutable',
  });
  signal?.addEventListener('abort', () => task.cancel(), { once: true });
  return new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      (s) => onProgress?.(s.totalBytes ? Math.round((s.bytesTransferred / s.totalBytes) * 100) : 0),
      reject,
      () => getDownloadURL(task.snapshot.ref).then(resolve, reject),
    );
  });
}

export function newReportId() {
  return doc(collection(db, 'reports')).id;
}

export interface NewReportInput {
  id: string;
  uid: string;
  reporterName: string;
  category: CategoryId;
  placeName: string;
  description: string;
  lat: number;
  lng: number;
  photoUrl: string | null;
}

/** สร้างรายงานใหม่พร้อมประวัติ "แจ้งปัญหา" ใน batch เดียวกัน */
export async function createReport(input: NewReportInput) {
  const reportRef = doc(db, 'reports', input.id);
  const evRef = doc(collection(reportRef, 'history'));
  const batch = writeBatch(db);
  batch.set(reportRef, {
    reporterUid: input.uid,
    reporterName: input.reporterName,
    category: input.category,
    placeName: input.placeName,
    description: input.description,
    lat: input.lat,
    lng: input.lng,
    photoUrl: input.photoUrl,
    status: 'open',
    volunteers: {},
    resolution: null,
    hidden: false,
    reopenCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastEventId: evRef.id,
  });
  batch.set(evRef, historyDoc('created', input.uid, input.reporterName, null, null, 'open'));
  await batch.commit();
}

function historyDoc(
  type: HistoryType,
  uid: string,
  name: string,
  note: string | null,
  fromStatus: ReportStatus | null,
  toStatus: ReportStatus,
) {
  return { type, byUid: uid, byName: name, at: serverTimestamp(), note, fromStatus, toStatus };
}

type TxBody = (
  current: Report,
  history: (type: HistoryType, toStatus: ReportStatus, note?: string | null) => { eventId: string },
) => { updates: [string | FieldPath, unknown][] };

/**
 * เปลี่ยนสถานะด้วย transaction: อ่านสถานะล่าสุดจากเซิร์ฟเวอร์ ตรวจเงื่อนไข แล้วเขียนรายงาน+ประวัติพร้อมกัน
 * ถ้ามีคนอัปเดตพร้อมกัน Firestore จะลองใหม่ด้วยข้อมูลล่าสุด
 */
async function transact(reportId: string, uid: string, name: string, body: TxBody) {
  const reportRef = doc(db, 'reports', reportId);
  const attempt = () =>
    runTransaction(db, async (tx) => {
      const snap = await tx.get(reportRef);
      if (!snap.exists()) throw new ActionError('ไม่พบรายงานนี้ อาจถูกซ่อนหรือลบไปแล้ว');
      const current = parseReport(snap);
      let pending: { type: HistoryType; toStatus: ReportStatus; note: string | null } | null = null;
      const evRef = doc(collection(reportRef, 'history'));
      const { updates } = body(current, (type, toStatus, note = null) => {
        pending = { type, toStatus, note };
        return { eventId: evRef.id };
      });
      if (!pending) throw new Error('missing history');
      const p = pending as { type: HistoryType; toStatus: ReportStatus; note: string | null };
      const flat: unknown[] = [];
      for (const [k, v] of updates) flat.push(k, v);
      flat.push('updatedAt', serverTimestamp(), 'lastEventId', evRef.id);
      const [first, firstVal, ...rest] = flat as [string | FieldPath, unknown, ...unknown[]];
      tx.update(reportRef, first, firstVal, ...rest);
      tx.set(evRef, historyDoc(p.type, uid, name, p.note, current.status, p.toStatus));
    });
  try {
    await attempt();
  } catch (e) {
    // กรณีคนกดพร้อมกันมาก ๆ บางครั้งกฎจะประเมินกับข้อมูลที่เพิ่งเปลี่ยน ลองใหม่อีกครั้งด้วยข้อมูลล่าสุด
    if ((e as { code?: string }).code === 'permission-denied' || (e as { code?: string }).code === 'aborted') {
      await attempt();
    } else {
      throw e;
    }
  }
}

export function joinReport(reportId: string, uid: string, name: string) {
  return transact(reportId, uid, name, (r, history) => {
    if (r.status === 'resolved') throw new ActionError('ปัญหานี้แก้ไขเรียบร้อยแล้ว');
    if (r.volunteers.some((v) => v.uid === uid)) throw new ActionError('คุณรับช่วยเหลือจุดนี้อยู่แล้ว');
    history('joined', 'in_progress');
    return {
      updates: [
        [new FieldPath('volunteers', uid), { name, joinedAt: serverTimestamp() }],
        ['status', 'in_progress'],
      ],
    };
  });
}

export function leaveReport(reportId: string, uid: string, name: string) {
  return transact(reportId, uid, name, (r, history) => {
    if (r.status !== 'in_progress' || !r.volunteers.some((v) => v.uid === uid)) {
      throw new ActionError('คุณไม่ได้อยู่ในรายชื่อผู้ร่วมช่วยของจุดนี้แล้ว');
    }
    const next: ReportStatus = r.volunteers.length <= 1 ? 'open' : 'in_progress';
    history('left', next);
    return {
      updates: [
        [new FieldPath('volunteers', uid), deleteField()],
        ['status', next],
      ],
    };
  });
}

export function resolveReport(
  reportId: string,
  uid: string,
  name: string,
  note: string,
  photoUrl: string | null,
  isAdmin: boolean,
) {
  return transact(reportId, uid, name, (r, history) => {
    if (r.status === 'resolved') throw new ActionError('มีผู้แจ้งว่าแก้ไขแล้วก่อนหน้านี้');
    const isVolunteer = r.volunteers.some((v) => v.uid === uid);
    if (!isVolunteer && !isAdmin) throw new ActionError('ต้องรับช่วยเหลือจุดนี้ก่อน จึงจะแจ้งว่าแก้ไขแล้วได้');
    history('resolved', 'resolved', note);
    return {
      updates: [
        ['status', 'resolved'],
        ['resolution', { note, photoUrl, byUid: uid, byName: name, at: serverTimestamp() }],
      ],
    };
  });
}

export function reopenReport(reportId: string, uid: string, name: string, reason: string, isAdmin: boolean) {
  return transact(reportId, uid, name, (r, history) => {
    if (r.status !== 'resolved') throw new ActionError('ปัญหานี้ยังเปิดอยู่แล้ว');
    if (r.reporterUid !== uid && !isAdmin) throw new ActionError('เฉพาะผู้แจ้งหรือผู้ดูแลเท่านั้นที่เปิดปัญหาอีกครั้งได้');
    history('reopened', 'open', reason);
    return {
      updates: [
        ['status', 'open'],
        ['volunteers', {}],
        ['resolution', null],
        ['reopenCount', r.reopenCount + 1],
      ],
    };
  });
}

export function hideReport(reportId: string, uid: string, name: string, reason: string | null, isAdmin: boolean) {
  return transact(reportId, uid, name, (r, history) => {
    const canHide = isAdmin || (r.reporterUid === uid && r.status === 'open' && r.volunteers.length === 0);
    if (!canHide) throw new ActionError('ซ่อนรายงานนี้ไม่ได้ เพราะมีจิตอาสารับงานแล้ว');
    history('hidden', r.status, reason);
    return { updates: [['hidden', true]] };
  });
}

/** แปลงข้อผิดพลาดจาก Firebase เป็นข้อความภาษาไทย */
export function thaiError(e: unknown): string {
  if (e instanceof ActionError) return e.message;
  const code = (e as { code?: string })?.code ?? '';
  if (!navigator.onLine) return 'ไม่มีการเชื่อมต่ออินเทอร์เน็ต ตรวจสอบสัญญาณแล้วลองอีกครั้ง';
  if (code.includes('permission-denied') || code.includes('unauthorized'))
    return 'ระบบไม่อนุญาตให้ทำรายการนี้ อาจเป็นเพราะสถานะเพิ่งเปลี่ยน ลองรีเฟรชหน้าแล้วลองใหม่';
  if (code.includes('admin-restricted-operation') || code.includes('operation-not-allowed'))
    return 'เว็บยังไม่ได้เปิดให้ใช้งานแบบไม่ต้องเข้าสู่ระบบ (ผู้ดูแลต้องเปิด Anonymous ใน Firebase Authentication)';
  if (code.includes('unauthenticated')) return 'หลุดจากระบบ เข้าสู่ระบบอีกครั้งแล้วลองใหม่';
  if (code.includes('unavailable') || code.includes('network') || code.includes('retry-limit'))
    return 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ลองอีกครั้งในอีกสักครู่';
  if (code.includes('quota')) return 'พื้นที่จัดเก็บเต็มชั่วคราว ลองใหม่ภายหลัง';
  if (code.includes('failed-precondition')) return 'ฐานข้อมูลยังตั้งค่าไม่ครบ (เช่น ยังไม่ได้สร้าง index) ติดต่อผู้ดูแลเว็บ';
  return 'ยังบันทึกไม่ได้ ข้อมูลที่กรอกไว้ยังอยู่ ลองกดอีกครั้ง';
}
