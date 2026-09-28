// ทดสอบ Firestore/Storage Security Rules กับ Emulator
// รัน: npm run test:rules
import { test, before, after, beforeEach } from 'node:test';
import { readFileSync } from 'node:fs';
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import {
  doc,
  collection,
  writeBatch,
  runTransaction,
  serverTimestamp,
  deleteField,
  FieldPath,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';

let env;

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-tharaeng',
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
    storage: { rules: readFileSync('storage.rules', 'utf8'), host: '127.0.0.1', port: 9199 },
  });
});

after(async () => {
  await env?.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
});

const db = (uid) => (uid ? env.authenticatedContext(uid).firestore() : env.unauthenticatedContext().firestore());

function newReport(uid, overrides = {}) {
  return {
    reporterUid: uid,
    reporterName: 'นาย ก',
    category: 'flood',
    placeName: 'ทางแยกท่าแร้ง',
    description: 'มีน้ำท่วมขังหลังฝนตก',
    lat: 13.159,
    lng: 99.96,
    photoUrl: null,
    status: 'open',
    volunteers: {},
    resolution: null,
    hidden: false,
    reopenCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...overrides,
  };
}

async function createReport(uid, overrides = {}, historyOverrides = {}) {
  const d = db(uid);
  const reportRef = doc(collection(d, 'reports'));
  const evRef = doc(collection(reportRef, 'history'));
  const batch = writeBatch(d);
  batch.set(reportRef, { ...newReport(uid, overrides), lastEventId: evRef.id });
  batch.set(evRef, {
    type: 'created',
    byUid: uid,
    byName: 'นาย ก',
    at: serverTimestamp(),
    note: null,
    fromStatus: null,
    toStatus: 'open',
    ...historyOverrides,
  });
  await batch.commit();
  return reportRef.id;
}

async function act(uid, reportId, type, fromStatus, toStatus, reportUpdate, name = 'ผู้ใช้') {
  const d = db(uid);
  const reportRef = doc(d, 'reports', reportId);
  const evRef = doc(collection(reportRef, 'history'));
  const batch = writeBatch(d);
  batch.update(reportRef, { ...reportUpdate, updatedAt: serverTimestamp(), lastEventId: evRef.id });
  batch.set(evRef, { type, byUid: uid, byName: name, at: serverTimestamp(), note: null, fromStatus, toStatus });
  return batch.commit();
}

const join = (uid, id, from = 'open', name = 'นาย ข') =>
  act(uid, id, 'joined', from, 'in_progress', {
    status: 'in_progress',
    [`volunteers.${uid}`]: { name, joinedAt: serverTimestamp() },
  }, name);

const resolve = (uid, id, extra = {}) =>
  act(uid, id, 'resolved', 'in_progress', 'resolved', {
    status: 'resolved',
    resolution: { note: 'ลอกท่อระบายน้ำแล้ว', photoUrl: null, byUid: uid, byName: 'นาย ข', at: serverTimestamp(), ...extra },
  });

const reopen = (uid, id, count = 1) =>
  act(uid, id, 'reopened', 'resolved', 'open', { status: 'open', volunteers: {}, resolution: null, reopenCount: count });

test('ทุกคนอ่านรายงานได้โดยไม่ต้องเข้าสู่ระบบ แต่เขียนไม่ได้', async () => {
  const id = await createReport('alice');
  await assertSucceeds(getDoc(doc(db(null), 'reports', id)));
  await assertSucceeds(getDocs(query(collection(db(null), 'reports'), where('hidden', '==', false), orderBy('createdAt', 'desc'))));
  await assertFails(setDoc(doc(db(null), 'reports', 'x'), newReport('anon')));
});

test('ผู้ใช้แบบไม่ต้องล็อกอิน (anonymous) แจ้งปัญหาได้ แต่แก้ของคนอื่นไม่ได้', async () => {
  const anon = env.authenticatedContext('anon-device-1', { firebase: { sign_in_provider: 'anonymous' } }).firestore();
  const reportRef = doc(collection(anon, 'reports'));
  const evRef = doc(collection(reportRef, 'history'));
  const batch = writeBatch(anon);
  batch.set(reportRef, { ...newReport('anon-device-1'), lastEventId: evRef.id });
  batch.set(evRef, { type: 'created', byUid: 'anon-device-1', byName: 'พี่ต้อย', at: serverTimestamp(), note: null, fromStatus: null, toStatus: 'open' });
  await assertSucceeds(batch.commit());
  await assertFails(updateDoc(doc(db('anon-device-2'), 'reports', reportRef.id), { description: 'แก้มั่ว' }));
});

test('แจ้งปัญหาได้เมื่อเข้าสู่ระบบ และต้องเป็นชื่อ uid ของตัวเอง', async () => {
  await assertSucceeds(createReport('alice'));
  await assertFails(createReport('alice', { reporterUid: 'bob' }));
});

test('แจ้งปัญหาโดยไม่เขียนประวัติไม่ได้', async () => {
  const d = db('alice');
  await assertFails(setDoc(doc(d, 'reports', 'r1'), { ...newReport('alice'), lastEventId: 'nope' }));
});

test('ห้ามสร้างรายงานพร้อมสถานะอื่นหรือพิกัดนอกพื้นที่', async () => {
  await assertFails(createReport('alice', { status: 'resolved' }, { toStatus: 'resolved' }));
  await assertFails(createReport('alice', { lat: 13.75, lng: 100.5 }));
  await assertFails(createReport('alice', { volunteers: { alice: { name: 'x', joinedAt: serverTimestamp() } } }));
  await assertFails(createReport('alice', { category: 'hack' }));
  await assertFails(createReport('alice', { description: '' }));
  await assertFails(createReport('alice', { photoUrl: 'https://evil.example.com/x.jpg' }));
});

test('จิตอาสารับช่วยเหลือได้ และสถานะเปลี่ยนเป็นกำลังดำเนินการ', async () => {
  const id = await createReport('alice');
  await assertSucceeds(join('bob', id));
  await assertSucceeds(join('carol', id, 'in_progress', 'นาย ค'));
  const snap = await getDoc(doc(db('bob'), 'reports', id));
  const data = snap.data();
  if (data.status !== 'in_progress') throw new Error('status not in_progress');
  if (Object.keys(data.volunteers).sort().join(',') !== 'bob,carol') throw new Error('volunteers mismatch');
});

test('รับงานซ้ำไม่ได้ และเพิ่มชื่อคนอื่นแทนไม่ได้', async () => {
  const id = await createReport('alice');
  await assertSucceeds(join('bob', id));
  await assertFails(join('bob', id, 'in_progress'));
  await assertFails(
    act('bob', id, 'joined', 'in_progress', 'in_progress', {
      status: 'in_progress',
      'volunteers.mallory': { name: 'ปลอม', joinedAt: serverTimestamp() },
    }),
  );
});

test('แก้ไขข้อมูลรายงานของผู้อื่นโดยพลการไม่ได้', async () => {
  const id = await createReport('alice');
  await assertFails(updateDoc(doc(db('bob'), 'reports', id), { description: 'แก้มั่ว' }));
  await assertFails(
    act('bob', id, 'joined', 'open', 'in_progress', { status: 'in_progress', description: 'แก้มั่ว',
      'volunteers.bob': { name: 'นาย ข', joinedAt: serverTimestamp() } }),
  );
  // ผู้แจ้งเองก็ข้ามขั้นไปเป็น "แก้ไขแล้ว" โดยไม่ได้รับงานไม่ได้
  await assertFails(resolve('alice', id));
});

test('เฉพาะจิตอาสาที่รับงานแจ้งว่าแก้ไขแล้วได้', async () => {
  const id = await createReport('alice');
  await join('bob', id);
  await assertFails(resolve('carol', id));
  await assertFails(resolve('bob', id, { byUid: 'carol' }));
  await assertSucceeds(resolve('bob', id));
  const data = (await getDoc(doc(db('bob'), 'reports', id))).data();
  if (data.status !== 'resolved') throw new Error('not resolved');
});

test('ถอนตัวได้เฉพาะตัวเอง และกลับเป็นรอความช่วยเหลือเมื่อไม่เหลือใคร', async () => {
  const id = await createReport('alice');
  await join('bob', id);
  const leave = (uid, target, toStatus) =>
    act(uid, id, 'left', 'in_progress', toStatus, {
      status: toStatus,
      [`volunteers.${target}`]: deleteField(),
    });
  await assertFails(leave('carol', 'bob', 'open'));
  await assertFails(leave('bob', 'bob', 'in_progress'));
  await assertSucceeds(leave('bob', 'bob', 'open'));
});

test('ผู้แจ้งหรือผู้ดูแลเปิดปัญหาอีกครั้งได้ คนอื่นทำไม่ได้', async () => {
  const id = await createReport('alice');
  await join('bob', id);
  await resolve('bob', id);
  await assertFails(reopen('bob', id));
  await assertFails(reopen('alice', id, 5));
  await assertSucceeds(reopen('alice', id));

  await join('bob', id);
  await resolve('bob', id);
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'admins', 'admin1'), { note: 'ผู้ดูแล' });
  });
  await assertSucceeds(reopen('admin1', id, 2));
});

test('เปิดปัญหาที่ยังไม่แก้ไขอีกครั้งไม่ได้', async () => {
  const id = await createReport('alice');
  await assertFails(reopen('alice', id));
});

test('ซ่อนรายงาน: ผู้แจ้งซ่อนของตัวเองได้ถ้ายังไม่มีคนรับ, ผู้ดูแลซ่อนได้เสมอ', async () => {
  const hide = (uid, id, from) => act(uid, id, 'hidden', from, from, { hidden: true });
  const a = await createReport('alice');
  await assertFails(hide('bob', a, 'open'));
  await assertSucceeds(hide('alice', a, 'open'));
  await assertFails(getDoc(doc(db(null), 'reports', a)));

  const b = await createReport('alice');
  await join('bob', b);
  await assertFails(hide('alice', b, 'in_progress'));
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'admins', 'admin1'), { note: 'ผู้ดูแล' });
  });
  await assertSucceeds(hide('admin1', b, 'in_progress'));
});

test('ประวัติแก้ไขหรือลบไม่ได้ และสร้างลอย ๆ ไม่ได้', async () => {
  const id = await createReport('alice');
  const d = db('alice');
  const hist = await getDocs(collection(d, 'reports', id, 'history'));
  const evId = hist.docs[0].id;
  await assertFails(updateDoc(doc(d, 'reports', id, 'history', evId), { note: 'แก้' }));
  await assertFails(
    setDoc(doc(d, 'reports', id, 'history', 'loose'), {
      type: 'resolved', byUid: 'alice', byName: 'x', at: serverTimestamp(), note: null, fromStatus: 'open', toStatus: 'open',
    }),
  );
});

test('รับงานพร้อมกันผ่าน transaction ได้ครบทุกคน ไม่ทับกัน', async () => {
  const id = await createReport('alice');
  const joinTx = (uid) => {
    const d = db(uid);
    const reportRef = doc(d, 'reports', id);
    return runTransaction(d, async (tx) => {
      const snap = await tx.get(reportRef);
      const data = snap.data();
      if (data.volunteers[uid]) throw new Error('already');
      const evRef = doc(collection(reportRef, 'history'));
      tx.update(reportRef, new FieldPath('volunteers', uid), { name: uid, joinedAt: serverTimestamp() },
        'status', 'in_progress', 'updatedAt', serverTimestamp(), 'lastEventId', evRef.id);
      tx.set(evRef, { type: 'joined', byUid: uid, byName: uid, at: serverTimestamp(), note: null,
        fromStatus: data.status, toStatus: 'in_progress' });
    });
  };
  // เหมือนในแอป (src/lib/reports.ts): ถ้าถูกปฏิเสธเพราะข้อมูลเพิ่งเปลี่ยน ลองใหม่ 1 ครั้งด้วยข้อมูลล่าสุด
  const joinWithRetry = (uid) =>
    joinTx(uid).catch((e) => (e.code === 'permission-denied' || e.code === 'aborted' ? joinTx(uid) : Promise.reject(e)));
  await Promise.all(['v1', 'v2', 'v3', 'v4', 'v5', 'v6'].map(joinWithRetry));
  const data = (await getDoc(doc(db('alice'), 'reports', id))).data();
  if (Object.keys(data.volunteers).length !== 6) throw new Error('expected 6 volunteers, got ' + Object.keys(data.volunteers).length);
  const hist = await getDocs(collection(db('alice'), 'reports', id, 'history'));
  if (hist.size !== 7) throw new Error('expected 7 history events, got ' + hist.size);
});

test('ผู้ดูแลอ่านได้เฉพาะเอกสารผู้ดูแลของตัวเอง', async () => {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'admins', 'admin1'), { note: 'ผู้ดูแล' });
  });
  await assertSucceeds(getDoc(doc(db('admin1'), 'admins', 'admin1')));
  await assertFails(getDoc(doc(db('bob'), 'admins', 'admin1')));
  await assertFails(setDoc(doc(db('bob'), 'admins', 'bob'), { note: 'x' }));
});

test('Storage: อัปโหลดรูปได้เฉพาะโฟลเดอร์ตัวเอง และต้องเป็นรูปภาพ', async () => {
  const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
  const s = (uid) => env.authenticatedContext(uid).storage();
  await assertSucceeds(uploadBytes(ref(s('alice'), 'reports/alice/r1/photo.jpg'), bytes, { contentType: 'image/jpeg' }));
  await assertFails(uploadBytes(ref(s('alice'), 'reports/bob/r1/photo.jpg'), bytes, { contentType: 'image/jpeg' }));
  await assertFails(uploadBytes(ref(s('alice'), 'reports/alice/r1/x.html'), bytes, { contentType: 'text/html' }));
  await assertFails(
    uploadBytes(ref(env.unauthenticatedContext().storage(), 'reports/anon/r1/p.jpg'), bytes, { contentType: 'image/jpeg' }),
  );
});
