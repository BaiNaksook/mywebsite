# ท่าแร้งช่วยกัน

เว็บแผนที่สำหรับแจ้งปัญหาในตำบลท่าแร้ง อำเภอบ้านแหลม จังหวัดเพชรบุรี ให้จิตอาสารับงาน แก้ไข และบันทึกผล
**เป็นโครงงานของนักเรียน** ไม่ได้ดำเนินการโดย อบต.ท่าแร้ง และเรื่องที่แจ้งไม่ได้ส่งถึง อบต. โดยอัตโนมัติ

- React + Vite + TypeScript, Leaflet + OpenStreetMap
- Firebase Authentication (Google), Cloud Firestore (เรียลไทม์), Firebase Storage (รูปภาพ), Firebase Hosting

## โครงสร้างสำคัญ

| ไฟล์ | หน้าที่ |
| --- | --- |
| `src/config.ts` | จุดกึ่งกลางแผนที่, กรอบพื้นที่ที่รับแจ้ง, ประเภทปัญหา, ลิงก์เพจ อบต. |
| `src/lib/reports.ts` | อ่าน/เขียน Firestore — การรับงาน/แจ้งแก้ไข/เปิดใหม่ใช้ transaction |
| `firestore.rules` | กฎความปลอดภัย (ตรวจสิทธิ์ทุกการเปลี่ยนสถานะฝั่งเซิร์ฟเวอร์) |
| `storage.rules` | อัปโหลดรูปได้เฉพาะโฟลเดอร์ของตัวเอง, เฉพาะรูปภาพ, ไม่เกิน 5 MB |
| `firestore.indexes.json` | index ที่หน้าแผนที่ต้องใช้ |
| `scripts/seed-emulator.mjs` | ข้อมูลตัวอย่าง (เขียนลง Emulator เท่านั้น) |
| `tests/rules.test.mjs` | ทดสอบกฎความปลอดภัย |
| `tests/e2e.mjs` | ทดสอบเส้นทางหลักในเบราว์เซอร์จริง |

### ข้อมูลใน Firestore

- `reports/{id}` — ประเภท, ชื่อจุด, รายละเอียด, `lat`/`lng`, ผู้แจ้ง (`reporterUid`, `reporterName`), `photoUrl`, `status` (`open` / `in_progress` / `resolved`), `volunteers` (`{uid: {name, joinedAt}}`), `resolution`, `hidden`, `createdAt`, `updatedAt`
- `reports/{id}/history/{eventId}` — ประวัติทุกการเปลี่ยนแปลง (เพิ่มได้อย่างเดียว แก้/ลบไม่ได้)
- `admins/{uid}` — รายชื่อผู้ดูแล (เพิ่มเองใน Console เท่านั้น)

### สิทธิ์ที่กฎบังคับ

| การกระทำ | ใครทำได้ |
| --- | --- |
| ดูแผนที่ รายการ สถิติ | ทุกคน ไม่ต้องเข้าสู่ระบบ |
| แจ้งปัญหา | ผู้ที่เข้าสู่ระบบ (ในนามตัวเองเท่านั้น สถานะเริ่มต้นต้องเป็น “รอความช่วยเหลือ”) |
| รับช่วยเหลือ / ถอนตัว | ผู้ที่เข้าสู่ระบบ เพิ่มหรือลบได้เฉพาะชื่อตัวเอง รับซ้ำไม่ได้ |
| แจ้งว่าแก้ไขแล้ว | จิตอาสาที่รับงานจุดนั้น หรือผู้ดูแล |
| เปิดปัญหาอีกครั้ง | ผู้แจ้งเดิม หรือผู้ดูแล (เมื่อสถานะเป็น “แก้ไขแล้ว”) |
| ซ่อนรายงาน (แจ้งผิด/ซ้ำ) | ผู้ดูแล หรือผู้แจ้งเอง ถ้ายังไม่มีใครรับงาน |
| แก้ข้อความของรายงานผู้อื่น / ลบรายงาน | ไม่มีใครทำได้จากหน้าเว็บ |

ทุกการเปลี่ยนแปลงต้องเขียนประวัติคู่กันในคำขอเดียว (ตรวจด้วย `lastEventId`) จึงย้อนดูได้เสมอว่าใครทำอะไรเมื่อไร

---

## 1. ตั้งค่าโปรเจกต์ใน Firebase Console (ทำครั้งเดียว)

1. ไปที่ <https://console.firebase.google.com> → **Add project** ตั้งชื่อ เช่น `tharaeng-chuaykan`
2. **Build → Authentication → Get started → Sign-in method → Google → Enable** (ใส่อีเมลติดต่อของโปรเจกต์) → Save
3. **Build → Firestore Database → Create database** เลือก location `asia-southeast1` (สิงคโปร์) และเริ่มแบบ production mode
4. **Build → Storage → Get started** (ต้องใช้แพ็กเกจ Blaze สำหรับโปรเจกต์ใหม่ — ตั้งงบเตือนไว้ได้ ปริมาณการใช้ระดับชุมชนมักอยู่ในโควตาฟรี)
5. **Project settings (รูปเฟือง) → General → Your apps → เพิ่มแอปแบบ Web (`</>`)** ตั้งชื่ออะไรก็ได้ ไม่ต้องติ๊ก Hosting ตรงนี้
6. คัดลอกค่าใน `firebaseConfig` ที่แสดงมาใส่ไฟล์ `.env.local` (ข้อ 2 ด้านล่าง)

### ค่าที่ต้องนำมาใส่

คัดลอก `.env.example` เป็น `.env.local` แล้วเติมค่าจาก `firebaseConfig`:

| ตัวแปรใน `.env.local` | ค่าใน `firebaseConfig` |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | `apiKey` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` (เช่น `xxx.firebaseapp.com`) |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
| `VITE_FIREBASE_APP_ID` | `appId` |

และคัดลอก `.firebaserc.example` เป็น `.firebaserc` แล้วใส่ project ID ของคุณ

> ค่า config ฝั่งเว็บของ Firebase ไม่ใช่รหัสลับ (ความปลอดภัยมาจาก Security Rules) แต่ไม่ต้อง commit `.env.local` ขึ้น git
> ถ้ายังไม่ได้ใส่ค่า หน้าเว็บจะแสดงว่า “ยังไม่ได้ตั้งค่า Firebase” พร้อมรายชื่อค่าที่ขาด

## 2. รันในเครื่อง

ต้องมี Node.js 20 ขึ้นไป (Emulator ต้องมี Java 21 ด้วย)

```bash
cd tharaeng
npm install
```

**แบบเชื่อมโปรเจกต์จริง** (ใส่ `.env.local` แล้ว):

```bash
npm run dev          # เปิด http://localhost:5173
```

**แบบข้อมูลตัวอย่าง ไม่แตะข้อมูลจริง** (ใช้ Firebase Emulator):

```bash
echo "VITE_USE_EMULATORS=true" > .env.development.local
npm run dev:emulators   # หน้าต่างที่ 1: Auth/Firestore/Storage จำลอง + UI ที่ http://localhost:4000
npm run seed:emulator   # หน้าต่างที่ 2: ใส่ข้อมูลตัวอย่าง 4 จุด (ติดป้าย “ตัวอย่าง”)
npm run dev             # หน้าต่างที่ 3
```

ในโหมดนี้หน้าเว็บจะมีแถบสีเหลือง “โหมดพัฒนา … ข้อมูลทดสอบ” และมีปุ่ม “เข้าสู่ระบบด้วยบัญชีทดสอบ” (เฉพาะตอนพัฒนา — ไม่มีใน build ที่ deploy)
ลบไฟล์ `.env.development.local` เมื่อต้องการกลับไปใช้โปรเจกต์จริง

## 3. ทดสอบ

```bash
npm run test:rules   # ทดสอบ Security Rules 16 กรณี (รวมการรับงานพร้อมกัน 6 คน)
npm run test:e2e     # เบราว์เซอร์จริง: แจ้งปัญหา → หมุดขึ้นอีกเครื่องแบบเรียลไทม์ → รับช่วย 2 คน → แจ้งแก้ไขแล้ว → สถิติเปลี่ยน → เปิดใหม่
```

`test:e2e` ใช้ Playwright — ครั้งแรกให้รัน `npx playwright install chromium` หรือกำหนด `CHROMIUM_PATH` ไปยัง Chrome ที่มีอยู่

## 4. Deploy ขึ้น Firebase Hosting

```bash
npm install -g firebase-tools   # หรือใช้ npx firebase
firebase login
firebase use <project-id>       # หรือแก้ .firebaserc
npm run build
firebase deploy                 # ส่ง Hosting + Firestore rules/indexes + Storage rules
```

หลัง deploy ครั้งแรก:

1. รอให้ index ของ Firestore สร้างเสร็จ (Console → Firestore → Indexes สถานะ Enabled) ก่อนหน้านั้นหน้าแผนที่อาจแจ้งว่าโหลดข้อมูลไม่สำเร็จ
2. Authentication → Settings → **Authorized domains** — `xxx.web.app` และ `xxx.firebaseapp.com` ถูกเพิ่มให้แล้ว ถ้าใช้โดเมนของตัวเองให้เพิ่มเอง
3. เปิด URL ที่ได้ (`https://<project-id>.web.app`) ทดลองแจ้งปัญหา 1 จุดจากมือถือ แล้วเปิดอีกเครื่องดูว่าหมุดขึ้นทันที

### เพิ่มผู้ดูแล

1. ให้ผู้ดูแลเข้าสู่ระบบบนเว็บหนึ่งครั้ง
2. Console → Authentication → Users คัดลอก **User UID**
3. Console → Firestore → สร้าง collection `admins` → document ID = UID นั้น ใส่ field อะไรก็ได้ เช่น `note: "ครูที่ปรึกษา"`

ผู้ดูแลจะเห็นปุ่ม “ซ่อนรายงาน (ผู้ดูแล)”, “แจ้งว่าแก้ไขแล้ว (ผู้ดูแล)” และเปิดปัญหาอีกครั้งได้ทุกจุด
รายงานที่ถูกซ่อนยังอยู่ในฐานข้อมูล (ดูได้ใน Console) แสดงอีกครั้งได้โดยแก้ `hidden` เป็น `false`

## ขอบเขตตำบลและพิกัด

- แผนที่โฟกัสที่จุดกึ่งกลางโดยประมาณของตำบลท่าแร้ง (13.159, 99.960) อ้างอิงจากชุดข้อมูลสาธารณะ
  [spicydog/thailand-province-district-subdistrict-zipcode-latitude-longitude](https://github.com/spicydog/thailand-province-district-subdistrict-zipcode-latitude-longitude)
  ควรตรวจกับพื้นที่จริงอีกครั้ง แก้ได้ที่ `AREA_CENTER` ใน `src/config.ts`
- **ยังไม่ได้วาดขอบเขตตำบล** เพราะยังไม่มีข้อมูลที่ยืนยันได้ เมื่อได้ไฟล์ GeoJSON ที่ตรวจแหล่งที่มาแล้ว
  ให้วางไว้ที่ `public/boundary/tha-raeng.geojson` และตั้ง `VITE_BOUNDARY_GEOJSON_URL=/boundary/tha-raeng.geojson` แล้ว build ใหม่
- ระบบรับหมุดในกรอบกว้าง ๆ รอบอำเภอบ้านแหลม (กันการปักหมุดผิดจังหวัด) ถ้าจะเปลี่ยน ต้องแก้ **ทั้ง** `ALLOWED_BOUNDS` ใน `src/config.ts` และ `inArea()` ใน `firestore.rules`

## หมายเหตุ

- แผนที่ใช้ tile ของ OpenStreetMap (`tile.openstreetmap.org`) ซึ่งเหมาะกับการใช้งานปริมาณน้อยตาม
  [นโยบายการใช้งาน](https://operations.osmfoundation.org/policies/tiles/) หากผู้ใช้เยอะขึ้นควรเปลี่ยนไปใช้ผู้ให้บริการ tile อื่น
- ปุ่ม “ติดตามข่าวสารจาก อบต.ท่าแร้ง” ลิงก์ไปยังเพจ <https://www.facebook.com/tambontaraeng> เป็นช่องทางภายนอกเท่านั้น
- ถ้าเปิดลิงก์จาก LINE/Facebook แล้วเข้าสู่ระบบ Google ไม่ได้ (Google ไม่อนุญาตในเบราว์เซอร์ในแอป) หน้าเว็บจะแนะนำให้เปิดในเบราว์เซอร์ของเครื่อง
