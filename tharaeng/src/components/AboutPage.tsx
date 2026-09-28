import { ArrowLeft } from 'lucide-react';
import { STATUSES } from '../config';
import { StatusIcon } from './icons';
import { FacebookButton, StudentProjectNote } from './Community';

export function AboutPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="page">
      <div className="flow__top">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="กลับหน้าแผนที่">
          <ArrowLeft size={22} />
        </button>
        <h1>ข้อมูลชุมชน</h1>
      </div>

      <section className="prose">
        <h2>ท่าแร้งช่วยกัน คืออะไร</h2>
        <p>
          พื้นที่ให้คนในตำบลท่าแร้ง อำเภอบ้านแหลม จังหวัดเพชรบุรี ปักหมุดปัญหาที่พบในชุมชน เช่น น้ำท่วมขัง ขยะ ถนนชำรุด
          หรือไฟส่องสว่างดับ แล้วให้เพื่อนบ้านที่พอช่วยได้มารับเป็นจิตอาสา ลงมือแก้ และบันทึกผลไว้ให้ทุกคนเห็น
        </p>

        <h2>ใช้งานอย่างไร</h2>
        <ol>
          <li>กด “แจ้งปัญหา” ปักหมุดตรงจุดที่พบ กรอกรายละเอียด แนบรูปได้ถ้ามี</li>
          <li>จิตอาสาเปิดหมุด กด “รับช่วยเหลือ” ช่วยกันได้หลายคนในจุดเดียว</li>
          <li>เมื่อเสร็จ กด “แจ้งว่าแก้ไขแล้ว” พร้อมเล่าสิ่งที่ทำ และแนบรูปหลังแก้ไข</li>
          <li>ถ้ายังไม่เรียบร้อยจริง ผู้แจ้งหรือผู้ดูแลเปิดปัญหาอีกครั้งได้</li>
        </ol>

        <h2>ความหมายของสีหมุด</h2>
        <ul className="legend">
          {STATUSES.map((s) => (
            <li key={s.id}>
              <span className={`legend__pin legend__pin--${s.id}`} aria-hidden>
                <StatusIcon status={s.id} size={14} strokeWidth={2.6} />
              </span>
              {s.label}
            </li>
          ))}
        </ul>

        <h2>ช่องทางชุมชน</h2>
        <FacebookButton />
        <StudentProjectNote />
        <p>เรื่องเร่งด่วนหรืออันตราย เช่น สายไฟขาด ไฟไหม้ หรือมีผู้บาดเจ็บ ให้ติดตามข่าวสารและติดต่อหน่วยงานที่เกี่ยวข้องโดยตรง</p>

        <h2>ข้อมูลและความเป็นส่วนตัว</h2>
        <p>
          ชื่อที่คุณกรอก รายละเอียด รูปภาพ และพิกัดของหมุด จะแสดงต่อสาธารณะ ไม่ควรใส่เบอร์โทรศัพท์หรือข้อมูลส่วนตัวของผู้อื่น
          การเข้าสู่ระบบใช้เพื่อยืนยันตัวตนและป้องกันการแก้ไขข้อมูลโดยผู้อื่น
        </p>
        <p className="muted small">
          แผนที่จาก © ผู้ร่วมพัฒนา{' '}
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">
            OpenStreetMap
          </a>
          .
        </p>
        <p className="muted small">
          เส้นประบนแผนที่คือเขตตำบลท่าแร้ง (รหัส 760709) <strong>โดยประมาณ</strong> จากข้อมูลขอบเขตการปกครองของ UN OCHA /
          กรมแผนที่ทหาร (CC BY-IGO) ซึ่งเป็นข้อมูลแบบย่อ ไม่ใช่แนวเขตตามกฎหมาย จุดสถานที่สำคัญมาจาก OpenStreetMap และ Overture Maps
          หากพบว่าตำแหน่งไหนคลาดเคลื่อน แจ้งผู้จัดทำเพื่อแก้ไขได้
        </p>
      </section>
    </div>
  );
}
