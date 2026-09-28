// ใส่ข้อมูลตัวอย่างลง Firestore Emulator เท่านั้น (ใช้ตอนพัฒนา)
// รัน: npm run dev:emulators (หน้าต่างหนึ่ง) แล้ว npm run seed:emulator (อีกหน้าต่าง)
// สคริปต์นี้ปฏิเสธการทำงานถ้าไม่ได้ชี้ไปที่ emulator ในเครื่อง จึงไม่มีทางเขียนลงฐานข้อมูลจริง
const HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
const PROJECT = 'demo-tharaeng';

if (!/^(127\.0\.0\.1|localhost):\d+$/.test(HOST)) {
  console.error('ยกเลิก: seed ใช้ได้เฉพาะกับ Firestore Emulator ในเครื่องเท่านั้น');
  process.exit(1);
}

const base = `http://${HOST}/v1/projects/${PROJECT}/databases/(default)/documents`;
const headers = { Authorization: 'Bearer owner', 'Content-Type': 'application/json' };

const now = Date.now();
const ago = (h) => new Date(now - h * 3600_000).toISOString();

const v = (x) => {
  if (x === null) return { nullValue: null };
  if (x instanceof Date) return { timestampValue: x.toISOString() };
  if (typeof x === 'string' && /^\d{4}-\d\d-\d\dT/.test(x)) return { timestampValue: x };
  if (typeof x === 'string') return { stringValue: x };
  if (typeof x === 'boolean') return { booleanValue: x };
  if (Number.isInteger(x)) return { integerValue: String(x) };
  if (typeof x === 'number') return { doubleValue: x };
  return { mapValue: { fields: Object.fromEntries(Object.entries(x).map(([k, y]) => [k, v(y)])) } };
};
const fields = (o) => Object.fromEntries(Object.entries(o).map(([k, y]) => [k, v(y)]));

async function put(path, data) {
  const res = await fetch(`${base}/${path}`, { method: 'PATCH', headers, body: JSON.stringify({ fields: fields(data) }) });
  if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`);
}

const samples = [
  {
    id: 'sample-flood', category: 'flood', placeName: 'ถนนหน้ามัสยิดนัศรุ้ลบารีย์', lat: 13.1562, lng: 99.9612,
    description: '[ข้อมูลตัวอย่าง] มีน้ำท่วมขังหลังฝนตก รถจักรยานยนต์ผ่านลำบาก', reporterName: 'นาย ก (ตัวอย่าง)',
    status: 'open', volunteers: {}, hoursAgo: 3,
  },
  {
    id: 'sample-garbage', category: 'garbage', placeName: 'ริมคลองท่าแร้ง', lat: 13.1605, lng: 99.9745,
    description: '[ข้อมูลตัวอย่าง] ขยะพลาสติกติดริมคลอง ส่งกลิ่นเหม็น', reporterName: 'ป้าแดง (ตัวอย่าง)',
    status: 'in_progress', hoursAgo: 26,
    volunteers: { 'sample-v1': { name: 'นาย ข (ตัวอย่าง)', joinedAt: ago(20) }, 'sample-v2': { name: 'น้องมิ้น (ตัวอย่าง)', joinedAt: ago(18) } },
  },
  {
    id: 'sample-light', category: 'light', placeName: 'ซอยข้างโรงเรียนวัดกุฏิ', lat: 13.1512, lng: 99.9495,
    description: '[ข้อมูลตัวอย่าง] ไฟทางดับ 2 ต้น กลางคืนมืดมาก', reporterName: 'นาย ค (ตัวอย่าง)',
    status: 'resolved', hoursAgo: 72,
    volunteers: { 'sample-v3': { name: 'ลุงสมชาย (ตัวอย่าง)', joinedAt: ago(60) } },
    resolution: { note: '[ข้อมูลตัวอย่าง] ประสานช่างเปลี่ยนหลอดไฟแล้ว', photoId: null, byUid: 'sample-v3', byName: 'ลุงสมชาย (ตัวอย่าง)', at: ago(40) },
  },
  {
    id: 'sample-road', category: 'road', placeName: 'ถนนเข้าบ้านคลองมอญ', lat: 13.1655, lng: 99.9840,
    description: '[ข้อมูลตัวอย่าง] ถนนเป็นหลุมลึก ขอบถนนทรุด', reporterName: 'นาง ง (ตัวอย่าง)',
    status: 'open', volunteers: {}, hoursAgo: 8,
  },
];

for (const s of samples) {
  const at = ago(s.hoursAgo);
  await put(`reports/${s.id}`, {
    reporterUid: 'sample-reporter', reporterName: s.reporterName, category: s.category, placeName: s.placeName,
    description: s.description, lat: s.lat, lng: s.lng, photoId: null, status: s.status, volunteers: s.volunteers,
    resolution: s.resolution ?? null, hidden: false, reopenCount: 0, createdAt: at, updatedAt: at, lastEventId: 'e0',
  });
  await put(`reports/${s.id}/history/e0`, {
    type: 'created', byUid: 'sample-reporter', byName: s.reporterName, at, note: null, fromStatus: null, toStatus: 'open',
  });
}
console.log(`ใส่ข้อมูลตัวอย่าง ${samples.length} รายการลง Emulator แล้ว (${HOST})`);
