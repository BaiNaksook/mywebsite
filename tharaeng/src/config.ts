import type { CategoryId, ReportStatus } from './types';

/**
 * จุดกึ่งกลางโดยประมาณของตำบลท่าแร้ง อ.บ้านแหลม จ.เพชรบุรี
 * อ้างอิงพิกัดตำบลจากชุดข้อมูลสาธารณะ spicydog/thailand-province-district-subdistrict-zipcode-latitude-longitude
 * (เป็นจุดอ้างอิงสำหรับโฟกัสแผนที่เท่านั้น ไม่ใช่ขอบเขตตำบล)
 */
export const AREA_CENTER: [number, number] = [13.159, 99.96];
export const AREA_ZOOM = 14;

/**
 * กรอบพื้นที่กว้าง ๆ ที่อนุญาตให้ปักหมุด (ต้องตรงกับ inArea() ใน firestore.rules)
 * ใช้กันการปักหมุดผิดจังหวัด ไม่ได้แทนขอบเขตตำบลจริง
 */
export const ALLOWED_BOUNDS = {
  south: 12.95,
  north: 13.4,
  west: 99.75,
  east: 100.2,
};

/** ไฟล์ขอบเขตตำบล GeoJSON (ถ้ามี) — ใส่เมื่อได้ข้อมูลที่ยืนยันแหล่งที่มาแล้วเท่านั้น */
export const BOUNDARY_GEOJSON_URL = (import.meta.env.VITE_BOUNDARY_GEOJSON_URL as string | undefined) || '';

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
