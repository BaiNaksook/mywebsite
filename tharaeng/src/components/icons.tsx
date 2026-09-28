import { CircleAlert, CircleCheck, CircleHelp, Construction, Droplets, Lightbulb, Trash2, Wrench, type LucideProps } from 'lucide-react';
import type { CategoryId, ReportStatus } from '../types';

export function CategoryIcon({ id, ...p }: { id: CategoryId } & LucideProps) {
  switch (id) {
    case 'flood':
      return <Droplets {...p} />;
    case 'garbage':
      return <Trash2 {...p} />;
    case 'road':
      return <Construction {...p} />;
    case 'light':
      return <Lightbulb {...p} />;
    default:
      return <CircleHelp {...p} />;
  }
}

export function StatusIcon({ status, ...p }: { status: ReportStatus } & LucideProps) {
  if (status === 'open') return <CircleAlert {...p} />;
  if (status === 'in_progress') return <Wrench {...p} />;
  return <CircleCheck {...p} />;
}

export function FacebookIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.62 23.1 24 18.1 24 12.07"
      />
    </svg>
  );
}

/** ไอคอนในหมุดบนแผนที่ (สตริง SVG สำหรับ Leaflet divIcon) */
export const PIN_GLYPH: Record<ReportStatus, string> = {
  open: '<path d="M12 6.5v7"/><path d="M12 17.5h.01"/>',
  in_progress:
    '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z"/>',
  resolved: '<path d="M20 6 9 17l-5-5"/>',
};
