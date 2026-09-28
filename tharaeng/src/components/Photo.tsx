import { useEffect, useState } from 'react';
import { loadPhoto } from '../lib/reports';

const cache = new Map<string, string>();

/** แสดงรูปที่เก็บในฐานข้อมูล (โหลดเมื่อเปิดดูรายละเอียดเท่านั้น) */
export function Photo({ id, alt }: { id: string; alt: string }) {
  const [src, setSrc] = useState<string | null>(() => cache.get(id) ?? null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (cache.has(id)) {
      setSrc(cache.get(id)!);
      return;
    }
    let alive = true;
    setSrc(null);
    setFailed(false);
    loadPhoto(id)
      .then((d) => {
        if (!alive) return;
        if (d) {
          cache.set(id, d);
          setSrc(d);
        } else setFailed(true);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [id]);

  if (failed) return <p className="muted small">โหลดรูปไม่สำเร็จ</p>;
  return (
    <div className="detail__photo" aria-busy={!src}>
      {src ? <img src={src} alt={alt} /> : <span className="sk detail__photo-sk" aria-label="กำลังโหลดรูป" />}
    </div>
  );
}
