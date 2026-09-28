// ทดสอบเส้นทางหลักแบบ end-to-end กับ Firebase Emulator + เบราว์เซอร์จริง (Playwright)
// แจ้งปัญหา → หมุดปรากฏ (เรียลไทม์ในอีกเครื่อง) → จิตอาสารับช่วย (2 คน) → แจ้งแก้ไขแล้ว → สถิติเปลี่ยน → ผู้แจ้งเปิดปัญหาอีกครั้ง
// รัน: npm run test:e2e   (ถ้าใช้ Chromium ของเครื่อง ตั้ง CHROMIUM_PATH=/path/to/chrome)
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { chromium, devices } from 'playwright';

process.env.VITE_USE_EMULATORS = 'true';
const server = await createServer({ mode: 'development', server: { port: 5199, strictPort: true, host: '127.0.0.1' }, logLevel: 'warn' });
await server.listen();
const URL_BASE = 'http://127.0.0.1:5199/';

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAFklEQVR4nGP8z8DAwMDAxMDAwMDAAAANHQEDasKb6QAAAABJRU5ErkJggg==',
  'base64',
);

const step = (m) => console.log(`✓ ${m}`);

async function stat(page, id) {
  const t = await page.locator(`[data-stat="${id}"] .stat__value`).innerText();
  return Number(t.replace(/[^\d]/g, ''));
}

async function stats(page) {
  return {
    all: await stat(page, 'all'),
    open: await stat(page, 'open'),
    in_progress: await stat(page, 'in_progress'),
    resolved: await stat(page, 'resolved'),
  };
}

async function waitStats(page, expected) {
  await page.waitForFunction(
    (exp) =>
      Object.entries(exp).every(
        ([k, v]) => Number(document.querySelector(`[data-stat="${k}"] .stat__value`)?.textContent?.replace(/[^\d]/g, '')) === v,
      ),
    expected,
    { timeout: 10000 },
  );
}

/**
 * เข้าสู่ระบบด้วยบัญชี Google จำลองของ Auth Emulator
 * (ปุ่ม Google จริงต้องโหลดสคริปต์จาก apis.google.com ซึ่งอาจถูกบล็อกในสภาพแวดล้อมทดสอบ)
 */
async function signIn(page, scope, email) {
  await scope.getByTestId('test-email').fill(email);
  await scope.getByTestId('test-signin').click();
  await scope.getByTestId('test-signin').waitFor({ state: 'detached' });
}

try {
  // ผู้แจ้ง (มือถือ) และจิตอาสา (คอมพิวเตอร์) เปิดเว็บพร้อมกัน
  const reporterCtx = await browser.newContext({ ...devices['Pixel 7'], locale: 'th-TH' });
  const helperCtx = await browser.newContext({ viewport: { width: 1280, height: 860 }, locale: 'th-TH' });
  const reporter = await reporterCtx.newPage();
  const helper = await helperCtx.newPage();
  globalThis.__pages = [reporter, helper];
  for (const p of [reporter, helper]) {
    p.on('pageerror', (e) => console.error('pageerror:', e.message));
  }

  await helper.goto(URL_BASE);
  await helper.waitForSelector('.list-section');
  await helper.waitForFunction(() => !document.querySelector('.report-item--skeleton'));
  const before = await stats(helper);
  step(`เปิดหน้าแผนที่โดยไม่ต้องเข้าสู่ระบบ สถิติเริ่มต้น ${JSON.stringify(before)}`);

  // 1) แจ้งปัญหา
  await reporter.goto(URL_BASE + '#/report');
  await signIn(reporter, reporter.locator('.flow'), 'reporter@example.com');
  await reporter.waitForSelector('[data-testid="picker-map"]');
  step('ผู้แจ้งเข้าสู่ระบบ');

  // กดถัดไปโดยไม่ปักหมุด → ต้องแจ้งเตือนภาษาไทย
  await reporter.getByRole('button', { name: 'ถัดไป: กรอกข้อมูล' }).click();
  await reporter.getByText('กรุณาปักหมุดตำแหน่งที่พบปัญหา').waitFor();
  // แตะแผนที่ใกล้ อบต.ท่าแร้ง (อยู่ในเขตตำบล) แล้วลากหมุดขยับเล็กน้อย
  const ob = await reporter.locator('.place--government .place__dot').boundingBox();
  await reporter.mouse.click(ob.x + ob.width / 2 + 6, ob.y + ob.height / 2 - 4);
  await reporter.getByText(/พิกัดที่เลือก/).waitFor();
  const pin = reporter.locator('.pin--pick').first();
  const pb = await pin.boundingBox();
  const coordsBefore = await reporter.getByText(/พิกัดที่เลือก/).innerText();
  await reporter.mouse.move(pb.x + pb.width / 2, pb.y + pb.height / 2);
  await reporter.mouse.down();
  await reporter.mouse.move(pb.x + pb.width / 2 + 6, pb.y + pb.height / 2 - 3, { steps: 8 });
  await reporter.mouse.up();
  await reporter.waitForFunction((prev) => !document.body.innerText.includes(prev), coordsBefore);
  step('ปักหมุดในเขตตำบลและลากหมุดแก้ตำแหน่งได้');
  // จุดนอกเส้นประต้องถูกปฏิเสธ
  const mapBox = await reporter.locator('[data-testid="picker-map"]').boundingBox();
  await reporter.mouse.click(mapBox.x + mapBox.width - 30, mapBox.y + mapBox.height - 40);
  await reporter.getByText(/หมุดอยู่นอกตำบลท่าแร้ง/).first().waitFor();
  await reporter.mouse.click(ob.x + ob.width / 2 + 6, ob.y + ob.height / 2 - 4);
  await reporter.getByText(/พิกัดที่เลือก/).waitFor();
  step('ปักหมุดนอกเขตตำบลไม่ได้ (มีข้อความเตือน)');
  await reporter.getByRole('button', { name: 'ถัดไป: กรอกข้อมูล' }).click();

  // ส่งฟอร์มว่าง → ตรวจช่องจำเป็น
  await reporter.getByRole('button', { name: 'ถัดไป: ตรวจสอบข้อมูล' }).click();
  const summary = reporter.locator('.error-summary');
  await summary.waitFor();
  assert.equal(await summary.evaluate((el) => el === document.activeElement), true, 'โฟกัสต้องย้ายไปที่สรุปข้อผิดพลาด');
  for (const t of ['กรุณาเลือกประเภทปัญหา', 'กรุณาระบุชื่อจุดหรือสถานที่', 'กรุณาเล่ารายละเอียดของปัญหา']) {
    await summary.getByText(t).waitFor();
    await reporter.locator('.field .form-error', { hasText: t }).waitFor();
  }
  await summary.getByRole('link', { name: 'กรุณาระบุชื่อจุดหรือสถานที่' }).click();
  assert.equal(await reporter.evaluate(() => document.activeElement?.id), 'field-placeName');
  step('ตรวจช่องจำเป็น: สรุปข้อผิดพลาดภาษาไทยด้านบน (รับโฟกัส ลิงก์ไปที่ช่อง) + ข้อความใต้แต่ละช่อง');

  await reporter.locator('.cat-option', { hasText: 'น้ำท่วมขัง' }).click();
  await reporter.locator('input[name="placeName"]').fill('หน้า อบต.ท่าแร้ง (ทดสอบ E2E)');
  await reporter.locator('textarea[name="description"]').fill('มีน้ำท่วมขังหลังฝนตก รถผ่านลำบาก');
  await reporter.locator('input[name="reporterName"]').fill('นาย ก');
  await reporter.locator('[data-testid="photo-input"]').setInputFiles({ name: 'photo.png', mimeType: 'image/png', buffer: PNG });
  await reporter.locator('.photo-preview img').waitFor();
  await reporter.getByRole('button', { name: 'ถัดไป: ตรวจสอบข้อมูล' }).click();
  await reporter.getByText('น้ำท่วมขัง หน้า อบต.ท่าแร้ง (ทดสอบ E2E)').waitFor();
  await reporter.getByTestId('submit-report').click();
  await reporter.getByText('ส่งเรื่องเรียบร้อย').waitFor({ timeout: 15000 });
  step('ส่งรายงานพร้อมรูปภาพสำเร็จ');

  // 2) หมุดปรากฏบนแผนที่ของอีกเครื่องแบบเรียลไทม์ (ไม่รีโหลด)
  const item = helper.locator('.report-item', { hasText: 'หน้า อบต.ท่าแร้ง (ทดสอบ E2E)' });
  await item.waitFor({ timeout: 10000 });
  const reportId = await item.getAttribute('data-report-id');
  await helper.locator(`.leaflet-marker-icon[data-report-id="${reportId}"][data-status="open"]`).waitFor();
  await waitStats(helper, { all: before.all + 1, open: before.open + 1 });
  step(`หมุดใหม่ (${reportId}) ปรากฏบนแผนที่อีกเครื่องทันที และสถิติเพิ่มขึ้น`);

  // 3) จิตอาสารับช่วย — กดจากรายการแล้วแผนที่เลื่อนไปที่หมุด
  await item.click();
  const card = helper.locator('.float-card');
  await card.getByRole('heading', { name: 'น้ำท่วมขัง หน้า อบต.ท่าแร้ง (ทดสอบ E2E)' }).waitFor();
  await card.locator('.detail__photo img').waitFor();
  await signIn(helper, card, 'helper@example.com');
  await card.getByRole('button', { name: 'รับช่วยเหลือ' }).click();
  await card.locator('input[name="helperName"]').fill('นาย ข');
  await card.getByRole('button', { name: 'ยืนยันรับช่วยเหลือ' }).click();
  await card.locator('.badge--in_progress').waitFor();
  await card.getByTestId('volunteers').filter({ hasText: 'นาย ข' }).waitFor();
  await waitStats(helper, { all: before.all + 1, open: before.open, in_progress: before.in_progress + 1 });
  step('จิตอาสา "นาย ข" รับช่วย → สถานะ "กำลังดำเนินการ"');

  // ผู้แจ้งเห็นการเปลี่ยนแปลงเรียลไทม์ และร่วมช่วยอีกคนได้
  await reporter.getByRole('button', { name: 'ดูหมุดบนแผนที่' }).click();
  const sheet = reporter.locator('.sheet');
  await sheet.locator('.badge--in_progress').waitFor({ timeout: 10000 });
  await sheet.getByRole('button', { name: 'ร่วมช่วยอีกคน' }).click();
  await sheet.locator('input[name="helperName"]').fill('นาย ก');
  await sheet.getByRole('button', { name: 'ยืนยันรับช่วยเหลือ' }).click();
  await card.getByTestId('volunteers').filter({ hasText: 'นาย ข, นาย ก' }).waitFor({ timeout: 10000 });
  step('หลายคนร่วมช่วยจุดเดียวกันได้ แสดง "นาย ข, นาย ก"');

  // กดรับซ้ำไม่ได้ (ปุ่มหายไปเพราะเป็นผู้ช่วยแล้ว)
  assert.equal(await card.getByRole('button', { name: 'ร่วมช่วยอีกคน' }).count(), 0);

  // 4) แจ้งว่าแก้ไขแล้ว
  await card.getByRole('button', { name: 'แจ้งว่าแก้ไขแล้ว' }).click();
  await card.getByRole('button', { name: 'บันทึกผล' }).click();
  await card.getByText(/กรุณาบันทึกสิ่งที่ทำ/).waitFor();
  await card.locator('textarea[name="resolutionNote"]').fill('ลอกท่อระบายน้ำ น้ำลดแล้ว');
  await card.locator('[data-testid="photo-input"]').setInputFiles({ name: 'after.png', mimeType: 'image/png', buffer: PNG });
  await card.getByRole('button', { name: 'บันทึกผล' }).click();
  await card.locator('.badge--resolved').waitFor({ timeout: 15000 });
  await card.getByText('ลอกท่อระบายน้ำ น้ำลดแล้ว').waitFor();
  await helper.locator(`.leaflet-marker-icon[data-report-id="${reportId}"][data-status="resolved"]`).waitFor();
  await waitStats(helper, {
    all: before.all + 1,
    open: before.open,
    in_progress: before.in_progress,
    resolved: before.resolved + 1,
  });
  step('แจ้งว่าแก้ไขแล้ว → สถานะ "แก้ไขแล้ว" หมุดเป็นสีเขียว สถิติเปลี่ยนตาม');

  // จิตอาสาเปิดปัญหาอีกครั้งไม่ได้ (ไม่ใช่ผู้แจ้ง)
  assert.equal(await card.getByRole('button', { name: /เปิดปัญหาอีกครั้ง/ }).count(), 0);

  // 5) ผู้แจ้งตรวจสอบแล้วเปิดปัญหาอีกครั้ง
  await sheet.locator('.badge--resolved').waitFor({ timeout: 10000 });
  await sheet.getByRole('button', { name: /เปิดปัญหาอีกครั้ง/ }).click();
  await sheet.locator('textarea[name="reason"]').fill('ไปดูแล้วยังมีน้ำขังอยู่');
  await sheet.getByRole('button', { name: 'เปิดปัญหาอีกครั้ง' }).click();
  await sheet.locator('.badge--open').waitFor({ timeout: 10000 });
  await waitStats(helper, { all: before.all + 1, open: before.open + 1, resolved: before.resolved });
  step('ผู้แจ้งเปิดปัญหาอีกครั้ง → กลับเป็น "รอความช่วยเหลือ" และสถิติอัปเดต');

  // ประวัติการเปลี่ยนสถานะครบ
  await card.getByRole('button', { name: /ประวัติการเปลี่ยนสถานะ/ }).click();
  await card.locator('.timeline li').nth(4).waitFor();
  const history = await card.locator('.timeline').innerText();
  for (const t of ['แจ้งปัญหา', 'รับช่วยเหลือ', 'แจ้งว่าแก้ไขแล้ว', 'เปิดปัญหาอีกครั้ง']) assert.ok(history.includes(t), t);
  step('บันทึกประวัติการเปลี่ยนสถานะครบทุกขั้น');

  // ตัวกรอง
  await helper.locator('.chip', { hasText: 'ไฟส่องสว่าง' }).click();
  assert.equal(await helper.locator('.report-item', { hasText: 'หน้า อบต.ท่าแร้ง (ทดสอบ E2E)' }).count(), 0);
  await helper.locator('.chip', { hasText: 'ทุกประเภท' }).click();
  step('กรองตามประเภทได้');

  console.log('\nผ่านทุกขั้นตอน');
} catch (e) {
  console.error('\nไม่ผ่าน:', e);
  for (const [i, pg] of (globalThis.__pages ?? []).entries()) {
    await pg.screenshot({ path: `test-results/e2e-fail-${i}.png` }).catch(() => {});
  }
  process.exitCode = 1;
} finally {
  await browser.close();
  await server.close();
}
