import { categoryLabel } from '../config';
import type { Report } from '../types';

/** ชื่อปัญหา เช่น "น้ำท่วมขัง บริเวณทางแยกท่าแร้ง" */
export function reportTitle(r: Pick<Report, 'category' | 'placeName'>) {
  const place = r.placeName.trim();
  const head = r.category === 'other' ? 'ปัญหา' : categoryLabel(r.category);
  if (!place) return head;
  const joiner = /^(บริเวณ|ที่|หน้า|ข้าง|ใกล้|ภายใน|ริม)/.test(place) ? ' ' : ' บริเวณ';
  return head + joiner + place;
}
