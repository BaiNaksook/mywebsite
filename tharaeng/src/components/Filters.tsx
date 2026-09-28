import { CATEGORIES } from '../config';
import type { CategoryId } from '../types';
import { CategoryIcon } from './icons';

interface Props {
  category: CategoryId | 'all';
  onCategory: (c: CategoryId | 'all') => void;
}

/** กรองตามประเภท (การกรองตามสถานะใช้ปุ่มสถิติด้านบน) */
export function Filters({ category, onCategory }: Props) {
  return (
    <div className="filters">
      <div className="chip-row" role="group" aria-label="กรองตามประเภทปัญหา">
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
            <CategoryIcon id={c.id} size={16} aria-hidden />
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
