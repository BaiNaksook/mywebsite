import type { Report, ReportStatus } from '../types';
import { StatusIcon } from './icons';

interface Props {
  reports: Report[];
  loading: boolean;
  status: ReportStatus | 'all';
  onStatus: (s: ReportStatus | 'all') => void;
}

export function computeStats(reports: Report[]) {
  const s = { all: reports.length, open: 0, in_progress: 0, resolved: 0 };
  for (const r of reports) s[r.status] += 1;
  return s;
}

export function StatsBar({ reports, loading, status, onStatus }: Props) {
  const s = computeStats(reports);
  const tiles: { id: ReportStatus | 'all'; label: string; value: number }[] = [
    { id: 'all', label: 'ปัญหาทั้งหมด', value: s.all },
    { id: 'open', label: 'รอความช่วยเหลือ', value: s.open },
    { id: 'in_progress', label: 'กำลังดำเนินการ', value: s.in_progress },
    { id: 'resolved', label: 'แก้ไขแล้ว', value: s.resolved },
  ];
  const summary = loading
    ? ''
    : `ปัญหาทั้งหมด ${s.all} รายการ รอความช่วยเหลือ ${s.open} กำลังดำเนินการ ${s.in_progress} แก้ไขแล้ว ${s.resolved}`;
  return (
    <section className="stats" aria-label="สรุปสถิติ แตะเพื่อกรองตามสถานะ">
      {/* ประกาศการเปลี่ยนแปลงเป็นประโยคเดียวครบบริบท ไม่ใช่ตัวเลขเดี่ยว ๆ */}
      <p className="sr-only" role="status" aria-atomic="true">
        {summary}
      </p>
      {tiles.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`stat stat--${t.id}${status === t.id ? ' is-active' : ''}`}
          aria-pressed={status === t.id}
          onClick={() => onStatus(status === t.id && t.id !== 'all' ? 'all' : t.id)}
          data-stat={t.id}
        >
          <span className="stat__value">
            {loading ? '–' : t.value.toLocaleString('th-TH')}
          </span>
          <span className="stat__label">
            {t.id !== 'all' && <StatusIcon status={t.id} size={13} strokeWidth={2.5} aria-hidden />}
            {t.label}
          </span>
        </button>
      ))}
    </section>
  );
}
