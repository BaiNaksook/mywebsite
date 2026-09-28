import type { CategoryId, ReportStatus } from './types';

/**
 * จุดกึ่งกลางของตำบลท่าแร้ง อ.บ้านแหลม จ.เพชรบุรี (รหัส 760709)
 * คำนวณจากเส้นขอบเขตใน src/data/tha-raeng-boundary.json
 */
export const AREA_CENTER: [number, number] = [13.1621, 99.9699];
export const AREA_ZOOM = 14;

/**
 * กรอบสี่เหลี่ยมรอบเขตตำบล (เผื่อขอบประมาณ 800 ม.) ต้องตรงกับ inArea() ใน firestore.rules
 * ฝั่งหน้าเว็บตรวจละเอียดกว่านี้ด้วยเส้นขอบเขตจริง (isInTambon ใน lib/geo.ts)
 */
export const ALLOWED_BOUNDS = {
  south: 13.125,
  north: 13.19,
  west: 99.938,
  east: 100.012,
};

export const TAMBON_FACEBOOK_URL = 'https://www.facebook.com/tambontaraeng';

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'flood', label: 'น้ำท่วมขัง' },
  { id: 'garbage', label: 'ขยะ' },
  { id: 'road', label: 'ถนนชำรุด' },
  { id: 'light', label: 'ไฟส่องสว่าง' },
  { id: 'other', label: 'อื่น ๆ' },
];

export const STATUSES: { id: ReportStatus; label: string; short: string }[] = [
  { id: 'open', label: 'รอความช่วยเหลือ', short: 'รอช่วย' },
  { id: 'in_progress', label: 'กำลังดำเนินการ', short: 'กำลังทำ' },
  { id: 'resolved', label: 'แก้ไขแล้ว', short: 'แก้แล้ว' },
];

export const categoryLabel = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)?.label ?? 'อื่น ๆ';
export const statusLabel = (id: ReportStatus) => STATUSES.find((s) => s.id === id)?.label ?? '';

export const LIMITS = {
  name: 60,
  placeName: 120,
  description: 2000,
  note: 1000,
};

export function isInAllowedArea(lat: number, lng: number) {
  return (
    lat > ALLOWED_BOUNDS.south && lat < ALLOWED_BOUNDS.north && lng > ALLOWED_BOUNDS.west && lng < ALLOWED_BOUNDS.east
  );
}
