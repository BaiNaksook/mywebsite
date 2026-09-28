import { CATEGORIES, STATUSES } from '../config';
import type { CategoryId, ReportStatus } from '../types';
import { CategoryIcon, StatusIcon } from './icons';

interface Props {
  status: ReportStatus | 'all';
  category: CategoryId | 'all';
  onStatus: (s: ReportStatus | 'all') => void;
  onCategory: (c: CategoryId | 'all') => void;
}

export function Filters({ status, category, onStatus, onCategory }: Props) {
  return (
    <div className="filters">
      <div className="chip-row" role="group" aria-label="กรองตามสถานะ">
        <span className="chip-row__label">สถานะ</span>
        <button type="button" className="chip" aria-pressed={status === 'all'} onClick={() => onStatus('all')}>
          ทั้งหมด
        </button>
        {STATUSES.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`chip chip--${s.id}`}
            aria-pressed={status === s.id}
            onClick={() => onStatus(s.id)}
          >
            <StatusIcon status={s.id} size={15} strokeWidth={2.4} aria-hidden />
            {s.label}
          </button>
        ))}
      </div>
      <div className="chip-row" role="group" aria-label="กรองตามประเภทปัญหา">
        <span className="chip-row__label">ประเภท</span>
        <button type="button" className="chip" aria-pressed={category === 'all'} onClick={() => onCategory('all')}>
          ทุกประเภท
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            className="chip"
            aria-pressed={category === c.id}
            onClick={() => onCategory(c.id)}
          >
            <CategoryIcon id={c.id} size={15} aria-hidden />
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
