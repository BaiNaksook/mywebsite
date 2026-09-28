/**
 * สถานที่สำคัญในตำบลท่าแร้งที่แสดงเป็นป้ายบนแผนที่
 *
 * ใส่เฉพาะจุดที่มีพิกัดจากแหล่งข้อมูลจริง และตกอยู่ในเขตตำบลตามเส้นขอบเขต (tha-raeng-boundary.json)
 * แหล่งพิกัด:
 *  - osm: OpenStreetMap (© ผู้ร่วมพัฒนา OpenStreetMap, ODbL) ผ่าน Overture Maps release 2026-09-23.1
 *  - overture: Overture Maps Places (CDLA-Permissive-2.0) — ตรวจชื่อ/ที่อยู่เทียบกับแหล่งอื่นแล้วตาม note
 * ถ้าพบว่าจุดไหนผิด แก้ที่ไฟล์นี้ได้เลย
 */
export type PlaceKind = 'village' | 'government' | 'health' | 'temple' | 'mosque' | 'school' | 'community';

export interface Place {
  name: string;
  kind: PlaceKind;
  lat: number;
  lng: number;
  source: 'osm' | 'overture';
  note?: string;
}

export const PLACES: Place[] = [
  // หมู่บ้าน
  { name: 'หมู่ 1 บ้านดอนเทพศักดิ์', kind: 'village', lat: 13.174567, lng: 99.987684, source: 'overture', note: 'ชื่อหมู่ตามข้อมูล อบต.' },
  { name: 'หมู่ 3 บ้านคลองมอญ', kind: 'village', lat: 13.164498, lng: 99.987575, source: 'osm', note: 'OSM node 4840703341' },

  // หน่วยงาน
  { name: 'อบต.ท่าแร้ง', kind: 'government', lat: 13.153058, lng: 99.957547, source: 'overture', note: 'ที่ทำการ หมู่ 7' },
  { name: 'รพ.สต.ท่าแร้ง', kind: 'health', lat: 13.150116, lng: 99.949436, source: 'overture' },

  // ศาสนสถาน
  { name: 'วัดกุฏิ', kind: 'temple', lat: 13.151362, lng: 99.947905, source: 'overture', note: 'ตรงกับ Wikidata Q102184116 ห่างไม่ถึง 200 ม.' },
  { name: 'วัดไทรทอง', kind: 'temple', lat: 13.17612, lng: 99.999983, source: 'overture', note: 'หมู่ 1 ตามข้อมูลชุมชน' },
  { name: 'มัสยิดนัศรุ้ลบารีย์', kind: 'mosque', lat: 13.156899, lng: 99.960233, source: 'overture', note: 'หมู่ 4 ตามข้อมูล สนง.คณะกรรมการกลางอิสลามฯ' },
  { name: 'มัสยิดมุฏีอะห์ตุ้ลอิสลามียะห์', kind: 'mosque', lat: 13.158913, lng: 99.970595, source: 'overture', note: 'หมู่ 3' },
  { name: 'มัสยิดซิรอยุดดีน', kind: 'mosque', lat: 13.175787, lng: 99.981049, source: 'overture', note: 'หมู่ 2' },
  { name: 'มัสยิดจรุงอิสลาม', kind: 'mosque', lat: 13.141867, lng: 99.956709, source: 'overture' },

  // โรงเรียน
  { name: 'โรงเรียนวัดกุฏิ (นันทวิเทศประชาสรรค์)', kind: 'school', lat: 13.15003, lng: 99.948341, source: 'overture' },
  { name: 'โรงเรียนบ้านคลองมอญ', kind: 'school', lat: 13.16584, lng: 99.989496, source: 'osm' },
];

export const PLACE_KIND_LABEL: Record<PlaceKind, string> = {
  village: 'หมู่บ้าน',
  government: 'หน่วยงาน',
  health: 'สาธารณสุข',
  temple: 'วัด',
  mosque: 'มัสยิด',
  school: 'โรงเรียน',
  community: 'ชุมชน',
};
