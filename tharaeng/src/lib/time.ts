const full = new Intl.DateTimeFormat('th-TH', {
  day: 'numeric',
  month: 'short',
  year: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatDateTime(d: Date | null): string {
  if (!d) return 'กำลังบันทึก…';
  return full.format(d) + ' น.';
}

export function timeAgo(d: Date | null, now = Date.now()): string {
  if (!d) return 'เมื่อสักครู่';
  const s = Math.max(0, Math.round((now - d.getTime()) / 1000));
  if (s < 60) return 'เมื่อสักครู่';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} นาทีที่แล้ว`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ชั่วโมงที่แล้ว`;
  const day = Math.floor(h / 24);
  if (day < 7) return `${day} วันที่แล้ว`;
  return formatDateTime(d);
}
