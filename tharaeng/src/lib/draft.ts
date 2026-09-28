/**
 * เก็บร่างการแจ้งปัญหาไว้ในเครื่อง — ถ้าแท็บถูกปิด (เช่น มือถือปิดเว็บตอนเปิดกล้อง) หรือกดย้อนกลับ
 * กลับมาแล้วกรอกต่อได้ ข้อความเก็บใน localStorage ส่วนรูปเก็บใน IndexedDB (ใหญ่เกิน localStorage)
 */
const KEY = 'tharaeng:report-draft';
const DB = 'tharaeng';
const STORE = 'drafts';

export interface DraftFields {
  step: number;
  pos: { lat: number; lng: number } | null;
  category: string | null;
  placeName: string;
  description: string;
  reporterName: string;
  hasPhoto: boolean;
  savedAt: number;
}

export function loadDraftFields(): DraftFields | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as DraftFields;
    // ร่างเก่ากว่า 3 วันถือว่าไม่ใช้แล้ว
    if (Date.now() - d.savedAt > 3 * 24 * 3600_000) {
      clearDraft();
      return null;
    }
    return d;
  } catch {
    return null;
  }
}

export function saveDraftFields(d: Omit<DraftFields, 'savedAt'>) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...d, savedAt: Date.now() }));
  } catch {
    /* เครื่องไม่ให้เก็บ ก็ข้ามไป */
  }
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T | undefined> {
  try {
    const db = await openDb();
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const req = fn(tx.objectStore(STORE));
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return undefined;
  }
}

export const saveDraftPhoto = (blob: Blob | null) =>
  withStore<unknown>('readwrite', (s) => (blob ? s.put(blob, 'photo') : s.delete('photo')) as IDBRequest<unknown>);

export const loadDraftPhoto = () => withStore<Blob>('readonly', (s) => s.get('photo') as IDBRequest<Blob>);

export function clearDraft() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  void saveDraftPhoto(null);
}
