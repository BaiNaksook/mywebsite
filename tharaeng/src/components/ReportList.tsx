import { ImageIcon, Users } from 'lucide-react';
import { categoryLabel } from '../config';
import { timeAgo } from '../lib/time';
import { reportTitle } from '../lib/title';
import type { Report } from '../types';
import { CategoryIcon } from './icons';
import { StatusBadge } from './StatusBadge';

interface Props {
  reports: Report[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRetry: () => void;
  onClearFilters: () => void;
  onReport: () => void;
}

export function ReportList({ reports, totalCount, loading, error, selectedId, onSelect, onRetry, onClearFilters, onReport }: Props) {
  if (error) {
    return (
      <div className="state state--error" role="alert">
        <p className="state__title">โหลดข้อมูลไม่สำเร็จ</p>
        <p className="state__text">{error}</p>
        <button type="button" className="btn btn--secondary" onClick={onRetry}>
          ลองอีกครั้ง
        </button>
      </div>
    );
  }
  if (loading) {
    return (
      <ul className="report-list" aria-busy="true" aria-label="กำลังโหลดรายการปัญหา">
        {[0, 1, 2].map((i) => (
          <li key={i} className="report-item report-item--skeleton">
            <span className="sk sk--icon" />
            <span className="sk-lines">
              <span className="sk sk--line" />
              <span className="sk sk--line sk--short" />
            </span>
          </li>
        ))}
      </ul>
    );
  }
  if (totalCount === 0) {
    return (
      <div className="state">
        <p className="state__title">ยังไม่มีการแจ้งปัญหา</p>
        <p className="state__text">ถ้าพบน้ำท่วมขัง ขยะ ถนนชำรุด หรือไฟดับในชุมชน แจ้งไว้ที่นี่ให้เพื่อนบ้านช่วยกันดูแลได้เลย</p>
        <button type="button" className="btn btn--primary" onClick={onReport}>
          แจ้งปัญหาแรก
        </button>
      </div>
    );
  }
  if (reports.length === 0) {
    return (
      <div className="state">
        <p className="state__title">ไม่พบปัญหาตามตัวกรองนี้</p>
        <button type="button" className="btn btn--secondary" onClick={onClearFilters}>
          ล้างตัวกรอง
        </button>
      </div>
    );
  }
  return (
    <ul className="report-list" aria-label="รายการปัญหาล่าสุด">
      {reports.map((r) => (
        <li key={r.id}>
          <button
            type="button"
            className={`report-item${selectedId === r.id ? ' is-selected' : ''}`}
            onClick={() => onSelect(r.id)}
            data-report-id={r.id}
          >
            <span className={`report-item__icon cat-icon cat-icon--${r.status}`} aria-hidden>
              <CategoryIcon id={r.category} size={20} />
            </span>
            <span className="report-item__body">
              <span className="report-item__title">{reportTitle(r)}</span>
              <span className="report-item__meta">
                <StatusBadge status={r.status} size="sm" />
                <span>{timeAgo(r.createdAt)}</span>
                {r.volunteers.length > 0 && (
                  <span className="meta-inline" title="จำนวนจิตอาสา">
                    <Users size={13} aria-hidden /> {r.volunteers.length}
                  </span>
                )}
                {r.photoUrl && (
                  <span className="meta-inline" title="มีรูปภาพ">
                    <ImageIcon size={13} aria-label="มีรูปภาพ" />
                  </span>
                )}
              </span>
              <span className="sr-only">ประเภท {categoryLabel(r.category)}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
