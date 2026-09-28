export function SetupNeeded({ missing }: { missing: string[] }) {
  return (
    <main className="narrow">
      <div className="page prose">
        <h1>ยังไม่ได้ตั้งค่า Firebase</h1>
        <p>
          เว็บนี้ต้องเชื่อมต่อโปรเจกต์ Firebase ของคุณก่อนจึงจะใช้งานได้ ให้คัดลอกไฟล์ <code>.env.example</code> เป็น{' '}
          <code>.env.local</code> แล้วใส่ค่าจาก Firebase Console → Project settings → Your apps (Web app)
        </p>
        <p>ค่าที่ยังขาด:</p>
        <ul>
          {missing.map((k) => (
            <li key={k}>
              <code>{k}</code>
            </li>
          ))}
        </ul>
        <p className="muted">ดูขั้นตอนทั้งหมดใน README.md ของโปรเจกต์</p>
      </div>
    </main>
  );
}
