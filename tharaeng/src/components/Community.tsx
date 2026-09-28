import { ExternalLink } from 'lucide-react';
import { TAMBON_FACEBOOK_URL } from '../config';
import { FacebookIcon } from './icons';

export function FacebookButton() {
  return (
    <a className="btn btn--facebook" href={TAMBON_FACEBOOK_URL} target="_blank" rel="noopener noreferrer">
      <FacebookIcon size={18} />
      ติดตามข่าวสารจาก อบต.ท่าแร้ง
      <ExternalLink size={14} aria-hidden className="btn__ext" />
      <span className="sr-only">(เปิดในแท็บใหม่)</span>
    </a>
  );
}

export function StudentProjectNote() {
  return (
    <p className="disclaimer">
      “ท่าแร้งช่วยกัน” เป็น<strong>โครงงานของนักเรียน</strong> ไม่ได้ดำเนินการโดยองค์การบริหารส่วนตำบลท่าแร้ง
      เรื่องที่แจ้งในเว็บนี้<strong>ไม่ได้ส่งถึง อบต. โดยอัตโนมัติ</strong> เพจ Facebook ด้านบนเป็นช่องทางภายนอกสำหรับติดตามข่าวสารของ อบต. เท่านั้น
    </p>
  );
}

export function CommunityChannels() {
  return (
    <section className="community" aria-labelledby="community-title">
      <h2 id="community-title">ช่องทางชุมชน</h2>
      <FacebookButton />
      <StudentProjectNote />
    </section>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <CommunityChannels />
      <p className="footer__credit">
        แผนที่จาก{' '}
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">
          OpenStreetMap
        </a>{' '}
        · <a href="#/about">เกี่ยวกับโครงงาน</a>
      </p>
    </footer>
  );
}
