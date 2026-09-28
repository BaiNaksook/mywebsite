# ท่าแร้งช่วยกัน: design critique (UI-09)

Fresh screenshots: `research/shots/` (375, 390, 768, 1366, landscape 844x390). Map tiles were blocked, so the grey map is expected and not judged here.

## Overall

The base is solid. The palette is warm cream/green/amber, touch targets are 44–56px, and states are covered (skeleton, empty, error, filter-empty, success, error summary). Thai copy is mostly polite and plain. The page looks tidy.

What keeps it from looking designed is that **every surface is the same component**: a white rounded rectangle with a 1.5px beige border. That goes for stats, chips, list items, category tiles, the review card, the sign-in card and the done card. No element leads, and no element belongs to Tha Raeng. That sameness is what reads as generic or template-made, even without any gradients or emoji.

## Ranked issues

### 1. The home screen has no hierarchy on mobile. Stats and filters duplicate each other and push the map and list down. (High)
- `StatsBar` (4 tiles, 2x2) and the status row in `Filters` do the same thing: both filter by status (`onStatus`). On a 390 phone, the stats take about 190px before the map. In landscape (`land-home.png`) the stats fill the whole screen. Below the map there are two more rows of chips, which wrap to 4 rows at 390 (`390-home-full.png`).
- **Fix:** Merge them. Keep one compact status "segmented summary" row (`รอช่วย 2 · กำลังทำ 1 · แก้แล้ว 1`) as horizontally scrolling chips with the count inside the chip. Use the existing `short` labels in `config.ts`. Remove the 2x2 tile grid on mobile, or make it a one-line sentence ("ตอนนี้มี 2 เรื่องรอเพื่อนบ้านช่วย"). Put category chips on a single `overflow-x:auto` row with no wrapping. The map should start within about 120px of the header.

### 2. The report-detail sheet hides its main action and the map context. (High)
- The sheet is `max-height: 62dvh`. On 390 (`390-detail-signedin.png`), the **รับช่วยเหลือ** button sits below the fold, so the user has to scroll inside a sheet to find it. In landscape (`land-detail.png`), the sheet covers the pin completely and the stats tiles stay visible above it.
- The `facts` block repeats the title: the title already says "น้ำท่วมขัง บริเวณทางแยกท่าแร้ง", and then ประเภท/สถานที่ repeat both values.
- **Fix:** Order the sheet as title, badge, time/reporter meta line, primary action, description, photo, then volunteers and history. Remove the ประเภท and สถานที่ rows from `facts` (keep "แจ้งเมื่อ" and "ผู้แจ้ง" as one muted meta line). Consider a sticky action bar at the sheet bottom. In landscape, show the detail as a right-side panel (reuse `.float-card` at `min-width: 700px and orientation: landscape`) so the pin stays visible.

### 3. The brand mark and header are generic (a pin in a green squircle), and nothing is local. (High for "not AI slop")
- `Header.tsx` uses a map pin with a heart on a rounded green square. That is the default "community app" logo. The name is set in Mitr 500 next to a small subtitle, which is also the standard template header.
- **Fix:** Make one custom touch that carries through the app. Tha Raeng / Ban Laem is salt-pan and coastal country: salt mounds, a นกแร้ง silhouette, or the Phetchaburi river. For example, a simple two-colour mark of a pin whose inner shape is a small salt mound or a hand-drawn "ร" loop. Reuse the same shape on the success screen, the empty state and the favicon. Keep it flat and two-tone, not a mascot, so it stays cute without being childish.

### 4. Everything is a bordered white card, so there is no surface hierarchy. (Medium-high)
- `.stat`, `.chip`, `.report-item`, `.cat-option`, `.review`, `.card` and `.flow__done` all use `background: var(--surface); border: 1.5px solid var(--line); radius 12–16`.
- **Fix:** Use three surface levels. (a) Page: cream. (b) Grouped content (the list): one white panel with hairline dividers between rows, not 4 separate boxes. (c) Interactive highlights: tinted fills (`--green-50`, `--amber-50`) with no border. Remove borders from chips in their rest state and use `--cream-2` fill instead. That cuts the visual noise roughly in half and makes the green primary buttons stand out.

### 5. The FAB collides with map controls and content. (Medium-high)
- At 375 and 390 (`375-home.png`, `390-home.png`), the centred FAB overlaps the **กลับไปที่ท่าแร้ง** button and the OSM attribution. At 768 (`768-home.png`) it sits on top of list-item titles. In landscape it covers pins.
- **Fix:** Move `.map-home` to the top-left of the map, where it can be an icon button with a label under the zoom control. Give the list `padding-bottom` equal to FAB height plus 24px (partly done with 110px). At 600px and wider, move the FAB to bottom-right. Alternatively, dock it as a full-width bottom bar with a safe-area inset on phones, which is also easier for older users to find.

### 6. Thai line breaking and label lengths break the layout. (Medium)
- At 375, "กำลังดำเนิน / การ" breaks mid-word and "รอความช่วย / เหลือ" wraps (`375-home.png`). Detail titles wrap as "ทางแยก / ท่าแร้ง". The browser doesn't know Thai word boundaries without help.
- **Fix:** Use the `short` labels (`รอช่วย`, `กำลังทำ`, `แก้แล้ว`) wherever space is tight: stats, chips and list badges. Wrap place names and compound words in `white-space: nowrap` spans, or insert `<wbr>` or `&#8203;` at word boundaries in `reportTitle()`. Add `word-break: keep-all; line-break: strict` (or `text-wrap: balance` on headings) to `.detail__head h2`, `.stat__label` and `.review__title`.

### 7. The location picker: the red pin reads as an error, and GPS is secondary. (Medium)
- `.pin--pick` uses `--danger` (#b8472f). Red is the only red in the app apart from errors, so the "your pin" marker looks like a warning (`390-step1-pinned.png`). The crosshair stays visible under the placed pin, so the screen shows two markers.
- For elderly users, **ใช้ตำแหน่งปัจจุบันของฉัน** is the easiest path, but it is an outlined button under the map. The less useful "ปักหมุดที่กึ่งกลางแผนที่" text link sits above it.
- **Fix:** Make the picking pin brand green with a cream dot, or ink-coloured, and hide `.picker__crosshair` once `value` is set. Put the GPS button first as a large secondary button with an icon, directly under the help text. Keep "ปักหมุดที่กึ่งกลาง" as a small link under the map. Show the chosen place as words, not `13.15908, 99.95996`. On the review step, replace the raw coordinates with a small static mini-map thumbnail, or "ใกล้ทางแยกท่าแร้ง" when available.

### 8. The success, empty and error states look like templates. (Medium)
- Success (`390-done.png`) uses a stock `CheckCircle2` 48px icon, a centred title and two buttons, which is the default success screen. Empty and error states are dashed boxes with only text.
- **Fix:** Use a small illustration built from the brand shape (item 3), for example the pin sitting on a tiny salt mound with a sprout. Personalise the copy: "ขอบคุณนะ {ชื่อ} 🙏" is too cute, so prefer "ขอบคุณที่ช่วยดูแลท่าแร้ง — หมุดของคุณขึ้นแผนที่แล้ว". Move the long disclaimer into a smaller "ควรรู้" line with an icon, so it doesn't compete with the thank-you.

### 9. Typography: the scale is flat, and Mitr plus Plex Looped mix awkwardly in places. (Medium)
- Sizes cluster at 0.8–1.15rem. The page has no true display moment (the h1 is `sr-only` on home). Mitr 500 headings next to Plex Looped 600 bold item titles look like two different "bold" voices (list titles vs section h2).
- **Fix:** Pick one role per font. Use Mitr only for the brand name, page h1 and big numbers. Use Plex Looped for everything else, including the list-item titles already in use and section headings at 600. Set a clear scale: 13 / 15 / 17 / 20 / 26px. Use `font-variant-numeric: tabular-nums` for counts. Keep body text at 16px or larger for older readers. Detail `.facts dd` at 0.95rem is fine; `.badge--sm` at 0.76rem (~12px) is too small, so use at least 13px.

### 10. Iconography: mixed metaphors, and some icons carry the wrong meaning. (Low-medium)
- Status "in progress" uses a wrench (`Wrench`), which also reads as the category "road repair". Category road uses `Construction`, a barrier icon that is hard to recognise at 15px. Flood uses `Droplets`, which reads as "water/drip", not flood. Lucide defaults at 1.5–2.6 stroke widths are mixed across the app (13px/2.5, 15px/2.4, 20px/default, 24px/default).
- **Fix:** Use one stroke width (2) everywhere. For in-progress, use a hand/heart or a "people" icon, which matches the volunteer idea. For flood, use `Waves`. For road, use a custom pothole glyph or lucide `TrafficCone`. Keep category icons neutral ink inside the tinted square, and let status own the colour. Right now the `cat-icon--{status}` tint makes the list icons encode status a second time, next to the status badge.

### 11. Desktop (1366): the floating card and side panel compete. (Low-medium)
- `1366-detail.png`: the 420px side column plus the 400px float card leave the map as a narrow strip on the right. The selected pin can end up behind the card (the inset left is 432, but the card starts at 436 plus 400).
- **Fix:** Show the detail inside the side column (replacing the list, with a back arrow), or dock the card to the right edge of the map. Update `inset` in `MapView` to match so the selected pin centres in the visible map.

### 12. Microcopy tone. (Low)
- Mostly good. Some lines are long and bureaucratic: the sign-in reason "เพื่อยืนยันว่าผู้แจ้งเป็นคนจริงและป้องกันการแก้ไขข้อมูลโดยผู้อื่น" and the footer disclaimer paragraph. Suggest "เข้าสู่ระบบก่อนนะ จะได้รู้ว่าใครแจ้ง และไม่มีใครแก้เรื่องของคุณได้". Keep the full disclaimer on the About page. In the footer, a single line is enough: "โครงงานนักเรียน · ไม่ได้ส่งถึง อบต. อัตโนมัติ".
- The "กลับไปที่ท่าแร้ง" map button is warm and should stay. "ปัญหาล่าสุด" could be friendlier: "เรื่องที่เพื่อนบ้านแจ้ง".
- The stepper labels are fine. The done-step bars are the same colour as the current step. Add a check mark or a lighter green to done steps so progress is legible.

### Smaller items
- Leaflet zoom control: the default square grey-bordered box clashes with the rounded UI. Restyle it to 44px round white buttons with `--shadow`, matching `.map-home`.
- The selected list item uses a green border and fill, while the selected pin only gets a slightly larger shadow. Make the selected pin scale to 1.15 with a ring, so list and map selection agree.
- `.chip[aria-pressed=true]` uses near-black ink fill for "ทั้งหมด/ทุกประเภท". That is the heaviest element on the page and draws attention to the least interesting filter. Use `--green-50` fill with `--green-dark` text instead.
- The dev banner and dev sign-in are fine for development, but make sure they never ship. They add about 60px on mobile.
- The review card mixes an inline `แก้ตำแหน่ง` link inside a `dd` with an `แก้ข้อมูล` link at the bottom. Give each section its own right-aligned "แก้" link.

## What to keep
Warm cream background, the green primary, amber/blue/green status colours with icons (not colour-only), 48–56px buttons, the error summary, "ไม่ใช่ตอนนี้ / อนุญาตและค้นหา" geolocation priming, and the honest student-project disclaimer.
