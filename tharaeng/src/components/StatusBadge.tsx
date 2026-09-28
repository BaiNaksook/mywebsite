import { statusLabel } from '../config';
import type { ReportStatus } from '../types';
import { StatusIcon } from './icons';

export function StatusBadge({ status, size = 'md' }: { status: ReportStatus; size?: 'sm' | 'md' }) {
  return (
    <span className={`badge badge--${status} badge--${size}`}>
      <StatusIcon status={status} size={size === 'sm' ? 14 : 16} strokeWidth={2.4} aria-hidden />
      {statusLabel(status)}
    </span>
  );
}
