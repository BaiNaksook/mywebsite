# UI-06: Report form (3-step flow): best practices and critique

Scope: `tharaeng/src/components/ReportFlow.tsx`, `LocationPicker.tsx` and `PhotoPicker.tsx`, plus the helpers they call (`lib/image.ts`, `lib/reports.ts`, `lib/storage.ts`, `hooks/useRoute.ts`, `hooks/useAuth.tsx`, `firebase.ts`).
Users: people of every age on low-end Android phones with patchy rural mobile data.

> Research caveat: the egress proxy blocked direct fetches of design-system.service.gov.uk, nngroup.com, baymard.com and smashingmagazine.com, and the session's web-search budget ran out partway through. Findings come from search-result extracts of those sources (cited below) plus well-established published guidance: GOV.UK patterns, Wroblewski's *Web Form Design* and Material 3. Where a point comes from general knowledge and I could not re-verify it this session, it is marked (unverified).

---

## 0. TL;DR: the top five changes

| # | Change | Why | Effort |
|---|---|---|---|
| P0-1 | **Persist the draft** (all fields plus the photo Blob) to IndexedDB or sessionStorage and restore it on mount | Low-memory Android often **kills the browser tab while the camera app is open**. Reloads, Android back and sign-in redirects also wipe the draft today. | M |
| P0-2 | **Put each step in the URL hash** (`#/report/1`, `#/report/2`, …) so the Android hardware back button moves back one step | Today hardware back leaves the flow for the map and throws the draft away | S |
| P0-3 | **Make submit robust on weak signal**: detect stalled uploads, offer "send without the photo" after a failure, and say that the data is still safe | `uploadBytesResumable` can hang for minutes on EDGE/3G. `navigator.onLine` does not detect "connected but no data". | M |
| P1-4 | **Cut typing**: quick-phrase chips for each category that insert text into the description, suggested place names from nearby existing reports, and a hint to use the keyboard mic | Typing Thai on a small keyboard is the slowest part of the flow for older users | M |
| P1-5 | **Split the photo control into "Take a photo" and "Choose from album" buttons**, and compress harder on slow networks | Older users do not know what the combined chooser will do. A 1600px JPEG at q0.82 is often 300–600 KB, which is slow on rural data. | S |

---

## 1. What the research says

### 1.1 Step count and structure
- **GOV.UK "one thing per page"**: start with one question per page. Low-confidence users find it easier, it suits mobile, and it handles errors, branching and saving progress better. Group fields only if research shows it helps. ([GOV.UK design notes, 2015](https://designnotes.blog.gov.uk/2015/07/03/one-thing-per-page/); [Question pages](https://design-system.service.gov.uk/patterns/question-pages); [Smashing case study](https://www.smashingmagazine.com/2017/05/better-form-design-one-thing-per-page/))
- **NN/g on wizards**: use them when users are unfamiliar with a process or rarely do it, which fits a citizen report. Wizard pages are simpler and less overwhelming. Show a list of the steps and highlight the current one. ([NN/g Wizards](https://www.nngroup.com/articles/wizards/))
- **Interpretation for Tharaeng**: three steps is about right. Location, details and review are natural chunks, and the review step is justified because the post is **public**. The details step holds five fields. That is acceptable on one page, but it is the densest point in the flow (see §2.2).

### 1.2 Progress indicators
- GOV.UK: question pages must have a back link, a heading and a continue button. Add a progress indicator only if research shows it helps. ([Question pages](https://design-system.service.gov.uk/patterns/question-pages))
- NN/g: numbered steps or a bar help users judge the remaining effort and give a sense of progress. ([NN/g Wizards](https://www.nngroup.com/articles/wizards/))
- Good practice: the step should also appear in text ("Step 2 of 3") inside the heading or a caption, so screen-reader users hear it when focus moves.

### 1.3 Validation timing and error summary
- **GOV.UK**: validate **on submit**, not when the user leaves a field. Show an error summary at the top and move keyboard focus to it. Each summary entry links to its field, and the same message also appears next to the field. ([Error summary](https://design-system.service.gov.uk/components/error-summary); [Validation pattern](https://design-system.service.gov.uk/patterns/validation); [Error message](https://design-system.service.gov.uk/components/error-message/))
- **Baymard**: avoid **premature** inline validation, meaning errors that appear before the user finishes a field. Remove an error as soon as the input is corrected, and consider positive inline confirmation. ([Baymard: inline validation](https://baymard.com/blog/inline-form-validation))
- **Wroblewski**: on-blur inline validation cut errors in his tests compared with submit-only validation (a figure of 22% is often quoted). ([LukeW PDF](https://static.lukew.com/webforms_lukew.pdf); [Web Form Design](https://rosenfeldmedia.com/books/web-form-design/))
- **Reconciling the two**: for a short form used by a low-confidence audience, the GOV.UK approach is safer: validate on submit, clear each error when the field changes, and never show an error while the user is typing. The one exception is a character-length hint shown as neutral help text.
- **Material 3**: the error text **replaces** the supporting (helper) text so the layout does not jump. Show an error icon as well as colour. If several errors are possible, the message should say how to fix the most likely one. ([M3 text fields](https://m3.material.io/components/text-fields/guidelines))
- **GOV.UK message placement** (unverified this session): the error message goes between the label or hint and the input, with a visually hidden "Error:" prefix. The page `<title>` also gets an "Error: " prefix.

### 1.4 Required and optional fields
- Baymard: mark **both** required and optional fields explicitly. Only 14% of desktop sites and 6% of mobile sites do this. ([Baymard](https://baymard.com/blog/required-optional-form-fields))
- GOV.UK (unverified): ask only for what you need. Mark optional fields "(optional)" and leave required fields unmarked, because most fields should be required.

### 1.5 Smart defaults and reducing typing
- Wroblewski covers smart defaults, gradual engagement and inline validation as key form topics. ([Web Form Design](https://rosenfeldmedia.com/books/web-form-design/); [Review](https://www.digital-web.com/articles/review_web_form_design_luke_wroblewski/))
- Gradual engagement (unverified detail): let people start the task before asking them to register or sign in.
- Typical smart defaults in civic-reporting apps: the current location, the last reporter name used, suggested place names, and preset descriptions for each category.

### 1.6 Location permission priming
- NN/g: permission requests tied to something the user just did (context-related) surprise users less than requests the system starts on its own. Explain **why** and **what the user gets**. Ask when the feature is first used. ([NN/g permission requests](https://www.nngroup.com/articles/permission-requests/); [video](https://www.nngroup.com/videos/app-permission-requests/))
- Corollary (unverified): if the permission is already granted, skip the priming screen. If it is denied, give instructions for recovering, because the browser will not show its prompt again.

### 1.7 Photo capture on Android
- `accept="image/*"` without `capture` usually shows a chooser. Depending on the Android and Chrome version, that chooser may or may not include the camera. `capture="environment"` opens the camera directly, with **no** gallery option. ([capacitor #6536](https://github.com/ionic-team/capacitor/issues/6536); [gist: picker + camera](https://gist.github.com/danawoodman/4788404bc620d5392d111dba98c73873); [addpipe: Android 14/15 camera option missing](https://blog.addpipe.com/html-file-input-accept-video-camera-option-is-missing-android-14-15/))
- The robust pattern is two explicit buttons: "ถ่ายรูป" (`capture="environment"`) and "เลือกจากอัลบั้ม" (no `capture`).

### 1.8 Confirmation page
- GOV.UK confirmation pages contain a confirmation panel (plus a reference number where relevant), a **"What happens next"** section, contact details, links to related services, and a way to keep a record. ([GOV.UK confirmation pages](https://design-system.service.gov.uk/patterns/confirmation-pages); [NHS](https://service-manual.nhs.uk/design-system/patterns/confirmation-page); [ONS](https://service-manual.ons.gov.uk/design-system/patterns/confirmation-page))

### 1.9 Error summaries in practice
- Other public-sector systems use the same pattern, including NHS, the Home Office and CMS: focus the summary, link each item to its field, and use the same wording in both places. ([NHS error summary](https://service-manual.nhs.uk/design-system/components/error-summary); [Home Office](https://design.homeoffice.gov.uk/accessibility/interactivity/error-messages); [CMS](https://design.cms.gov/patterns/Forms/error-validation/?theme=core))

---

## 2. Critique of the current implementation

### What already works well (keep it)
- **The error summary follows the GOV.UK pattern** (`ReportFlow.tsx` L235–256). It appears only on submit, receives focus, and links to each field. The field-level messages stay in place and use the same wording. Errors clear when their field changes (`set()` L68–71), as Baymard recommends.
- **Continue buttons say where they go**: "ถัดไป: กรอกข้อมูล" and "ถัดไป: ตรวจสอบข้อมูล". There is a named final action ("ยืนยันและส่งเรื่อง") and a retry label ("ลองส่งอีกครั้ง").
- **Location priming is triggered by the user** (`LocationPicker` L131–155): an explanation plus "อนุญาตและค้นหา" and "ไม่ใช่ตอนนี้". There are separate messages for denied, error and outside-the-area cases.
- **Each step has alternative inputs**: tap, drag, pin at the centre (which also serves keyboard users) and GPS. Existing reports appear as faint dots so users can spot duplicates.
- **Retries are idempotent**: `reportIdRef` and `uploadedRef` stop a retry from creating a second document or uploading the photo twice.
- **Smart default for the name** from localStorage or `displayName`, with the hint "ชื่อนี้จะแสดงต่อสาธารณะ ใช้ชื่อเล่นได้".
- **Client-side compression** with EXIF orientation handled (`lib/image.ts`), and the photo is marked "(ไม่บังคับ)".
- **The success page** has next actions and an honest disclaimer that reports do not reach อบต. automatically.
- A slow-save notice appears after 8 seconds.

### 2.1 Step 1: location (`LocationPicker.tsx`)
| Issue | Severity | Recommendation |
|---|---|---|
| The priming card appears on **every** tap, even when permission is already granted, which adds an extra tap each time | Med | Check `navigator.permissions?.query({name:'geolocation'})`. If the state is `granted`, call `locate()` directly. If it is `denied`, show the recovery steps straight away: "แตะไอคอนแม่กุญแจข้างที่อยู่เว็บ > สิทธิ์ > ตำแหน่ง". Keep the priming only for `prompt`. |
| `enableHighAccuracy:true, timeout:15000` with no fallback. Rural GPS without assisted GPS (weak data) often times out, and the user just sees "หาตำแหน่งไม่สำเร็จ". | Med | On TIMEOUT, retry once with `enableHighAccuracy:false`, or use `watchPosition` and take the first fix under about 50 m. Show the accuracy as "แม่นยำประมาณ ±30 ม." with a circle, and tell the user to drag the pin if it is off. |
| No cancel option while locating | Low | Show a "ยกเลิก" link next to "กำลังหาตำแหน่ง…". |
| Two mental models: a **crosshair is always visible** while the pin is placed by tapping. Dragging a 44px pin is hard for older users and for anyone with shaky hands. | Med | Consider the **fixed centre pin** model that Grab, LINE MAN and Bolt use, which is familiar in Thailand: the user moves the map under a pin that stays in the centre. At minimum, remove the crosshair once a pin is placed, or make "ปักหมุดที่กึ่งกลาง" the main instruction. |
| The duplicate hint is passive, because the existing dots are non-interactive | Low–Med | After the pin is placed, if an **open** report lies within about 50 m, show "ใกล้ ๆ นี้มีคนแจ้งแล้ว: [น้ำท่วมขัง – ซอย 3] ดูเรื่องนี้ / แจ้งเรื่องใหม่ต่อ". The `existing` prop already provides the data. |
| Raw coordinates are shown ("พิกัดที่เลือก 13.xxxxx") | Low | They mean nothing to users. Replace them with "✓ ปักหมุดแล้ว" or a nearby place name. Coordinates could go in a `<details>` element. |
| Several `role="alert"` messages can stack (for example `outside` together with the step error `errors.pos`) | Low | Merge them into a single message area. |

### 2.2 Step 2: details (`ReportFlow.tsx` L233–340)
| Issue | Severity | Recommendation |
|---|---|---|
| **The description is required with at least 5 characters, and it is typed freehand in Thai.** This is the biggest effort cost in the whole flow. | High | Add **quick-phrase chips for each category** under the textarea. Tapping one appends the text, and the user can still edit it. Examples: flood → "น้ำท่วมถนน", "รถเล็กผ่านไม่ได้", "ท่วมบ้าน", "น้ำไม่ระบาย"; light → "ไฟดับทั้งเส้น", "ไฟกะพริบ", "เสาไฟล้ม"; road → "หลุมใหญ่", "ถนนทรุด", "ฝาท่อหาย"; garbage → "ขยะกองริมถนน", "ไม่มีคนเก็บหลายวัน", "ส่งกลิ่นเหม็น". Add a hint: "พิมพ์ไม่สะดวก? แตะไมค์บนแป้นพิมพ์เพื่อพูดแทนได้" (Gboard supports Thai voice input). Consider making the description **optional** when a photo is attached. |
| **The place name is required and typed.** Many users will not know an official name. | Med | Suggest up to three chips from the `placeName` of existing reports within about 200 m. Accept a generic landmark, and consider making the field optional with a fallback title built from the category plus the nearest known place. |
| **Five fields on one page**, with the photo last. For field reporting the photo is often the *first* thing a user wants to do, and it captures evidence while they are on site. | Med | Reorder to category, photo, description (with chips), place name. Move **reporter name to the review step** as "ส่งในชื่อ: สมชาย · เปลี่ยน", because it is prefilled in about 90% of cases after the first report. The page then feels like three quick things. |
| Examples are placeholder text only ("เช่น ทางแยกท่าแร้ง…"). Placeholders disappear once the user starts typing, can have low contrast, and older users mistake them for filled values. | Med | Move the examples into persistent hint text under the label, linked with `aria-describedby`. Keep placeholders empty or very short. |
| The error message sits **below** the input and the counter. On mobile, the keyboard can hide it. Category errors have no `aria-describedby`, and the fieldset has no invalid state. | Low–Med | Following GOV.UK, put the error between the label or hint and the input, add an ⚠ icon (as M3 advises), and add a visually hidden "ข้อผิดพลาด:" prefix. Link the category error with `aria-describedby` on the fieldset. |
| The counter shows "0/2000" from the start. It adds noise and a 2000 limit is never reached. | Low | Show the counter only when the user is within 200 characters of the limit. |
| The length error message "รายละเอียดสั้นเกินไป เล่าเพิ่มอีกนิด" is fine. The 5-character minimum is arbitrary: Thai words like "ไฟดับ" are exactly 5 code units. | Low | Drop the minimum or lower it to 3, or require either a photo or a description of at least 3 characters. |
| The required/optional marking only covers optional fields ("(ไม่บังคับ)"), which is the GOV.UK approach and acceptable. | OK | Keep it. Make sure every required field has no optional marker, which is already true. |
| The heading is the same "แจ้งปัญหา" on every step. Focus moves to the h1 when the step changes, so screen readers never hear which step the user is on. | Med | Use a heading such as "ขั้นที่ 2 จาก 3 · กรอกข้อมูล", or a caption above the h1 that changes each step. Also update `document.title`, and prefix it with "ข้อผิดพลาด: " when the error summary is showing. |
| Stepper: `.stepper__num` is hidden, and at 0.8rem the labels are small for older eyes | Low | Show the numbers, raise the label size to at least 0.875rem, and make done steps tappable to go back (optional). |

### 2.3 Photo (`PhotoPicker.tsx`, `lib/image.ts`)
| Issue | Severity | Recommendation |
|---|---|---|
| A single `accept="image/*"` input. What happens varies by device: on some Android 14/15 Chrome builds the camera option is missing. | High (for field reporting) | Use two buttons that share one handler: **"📷 ถ่ายรูป"** (`capture="environment"`) and **"🖼 เลือกจากอัลบั้ม"** (no capture). |
| **Tab eviction while the camera is open**: on 2–3 GB Android phones Chrome often discards the backgrounded page, and when the user returns the whole draft is gone | **High** | This is the P0-1 draft persistence. Save before opening the picker as well as on every change. |
| Compression uses a 1600px long side at q0.82, typically 300–600 KB. Rural EDGE/3G can take 30–120 s or more. | Med | Use a 1280px long side at q0.72, or iterate until the file is 250 KB or less. If `navigator.connection?.saveData` is set or `effectiveType` is `2g`/`slow-2g`, use 1024px at q0.65. Show the size after compression ("ขนาดรูป 180 KB"). |
| The busy state "กำลังเตรียมรูป…" is not announced, and the label stays clickable while busy | Low | Add `aria-live="polite"`, and disable the input while busy. |
| The preview offers only "remove (X)", not "change photo" | Low | Add a "เปลี่ยนรูป" button. Give the X a hit target of at least 44px. |
| No note on privacy or what to photograph | Low | Add a hint: "ถ่ายให้เห็นปัญหาชัด ๆ หลีกเลี่ยงหน้าคนและป้ายทะเบียนรถ" ("show the problem clearly; avoid faces and number plates"). This matters because the photo is public. |
| Compression keeps no EXIF data (it re-encodes through a canvas), so GPS metadata is removed | OK, good for privacy | Keep this. Optionally, a future feature could read EXIF GPS *before* stripping it to suggest a pin. |

### 2.4 Step 3: review and submit
| Issue | Severity | Recommendation |
|---|---|---|
| **The upload has no stall detection or cancel.** `uploadBytesResumable` retries internally (the Firebase default `maxUploadRetryTime` is about 10 minutes, unverified), so the button can sit on "กำลังอัปโหลดรูป… 12%" for minutes. | **High** | Add a watchdog: if `bytesTransferred` has not grown in 20 s, show "สัญญาณอ่อน รูปยังส่งไม่เสร็จ" with the choices **[รอต่อ] [ส่งโดยไม่มีรูป] [ยกเลิก]**. Call `task.cancel()` on cancel. Set `storage.maxUploadRetryTime` to about 60 s so failures surface. |
| The error state offers only "ลองส่งอีกครั้ง" | High | Add a secondary "ส่งโดยไม่มีรูป" when the failure happened during upload. Tell the user their data is safe: "ข้อมูลที่กรอกยังอยู่ครบ ลองใหม่เมื่อสัญญาณดีขึ้น". |
| `navigator.onLine` is the only offline check, and it is true on "connected, no data" (captive networks, a 0-bar signal) | Med | Rely on the watchdog above. Optional P2: an **outbox**. Save the pending report plus Blob in IndexedDB, retry on `online` or when the page next opens, and show a banner "มีเรื่องรอส่ง 1 เรื่อง". Firestore uses the default memory cache here, so `batch.commit()` waits for the server. |
| Review shows raw **coordinates**. Editing uses a single "แก้ข้อมูล" link at the bottom, plus "แก้ตำแหน่ง". | Med | Show a small static map thumbnail, or "📍 ใกล้ [placeName]", in place of the coordinates. Give each row its own **"แก้" link** (GOV.UK check-answers style). Put the photo near the top of the review. |
| There is no reminder that the post is public next to the submit button | Med | Above the button: "เรื่องนี้จะแสดงบนแผนที่สาธารณะ พร้อมชื่อ 'สมชาย' และรูป". |
| Busy button text changes, but the percentage is only in the button label, which may not be announced | Low | Add a visible progress bar plus an `aria-live` status line. |

### 2.5 Success (L165–187)
| Issue | Severity | Recommendation |
|---|---|---|
| **Focus does not move to the success h1.** The `useEffect` depends only on `[step]`, which stays at 2, so there is no scroll or focus reset. `role="status"` on a large container can also be read out verbosely. | Med | Run the focus and scroll effect on `submit.state === 'success'` too, and put `role="status"` on the h1 only. |
| No "what happens next" or tracking information | Med | Add a short "ขั้นต่อไป" list: neighbours and volunteers can press "ช่วยได้" → status changes to "กำลังดำเนินการ" → the reporter or a volunteer marks it resolved with a photo. Say where the user can follow it ("ดูสถานะได้ที่หมุดของคุณ"). |
| Missing next actions that suit Thai communities | Med | **"แชร์ให้เพื่อนบ้านทาง LINE"** (Web Share API with a deep link `#/r/{id}`) and **"แจ้งเรื่องอื่นอีก"** (a new draft with the name kept). |

### 2.6 Flow-level issues
| Issue | Severity | Recommendation |
|---|---|---|
| **Android hardware back button**: steps are not in the history (`useRoute` only knows `#/report`), so back from step 2 or 3 goes to the map and the draft is lost | **High** | Use `#/report/1..3`, or `history.pushState` for each step. Guard deep links: step 3 without valid data redirects to the first invalid step. Also confirm before leaving with a dirty draft, or rely on persistence. |
| **No draft persistence at all.** State lives in `useState` and the photo Blob only in memory. | **High** | Keep a `tharaeng:draft` record in IndexedDB (idb-keyval is tiny, or raw IndexedDB) holding pos, category, text fields and the photo Blob. Restore it with "มีเรื่องที่กรอกค้างไว้ ทำต่อ / เริ่มใหม่". Clear it on success. Expire it after 7 days. |
| **The sign-in wall comes before step 1.** The stepper is shown, yet the user cannot start. | Med | Use gradual engagement: let users pin and fill details first, and ask for sign-in on the review step ("เข้าสู่ระบบเพื่อส่ง"). This needs P0-1 first, because the popup can fall back to `signInWithRedirect` (`useAuth.tsx`), which reloads the page. |
| The cancel icon on step 0 exits with no confirmation even if a pin has been placed | Low | With persistence in place this is harmless. Otherwise ask "ยกเลิกเรื่องนี้?". |

---

## 3. Suggested microcopy (Thai)

| Where | Current | Suggested |
|---|---|---|
| Heading, step 2 | แจ้งปัญหา | ขั้นที่ 2 จาก 3 · เล่าให้ฟังหน่อย |
| Description hint | (placeholder only) | บอกสั้น ๆ ว่าเจออะไร แตะคำด้านล่างเพื่อเติมเร็ว ๆ หรือกดไมค์บนแป้นพิมพ์เพื่อพูดแทนพิมพ์ |
| Place-name hint | (placeholder only) | จุดที่คนในพื้นที่รู้จัก เช่น หน้าวัด ซอย 3 ทางแยกท่าแร้ง |
| Photo buttons | ถ่ายรูปหรือเลือกจากเครื่อง | 📷 ถ่ายรูป · 🖼 เลือกจากอัลบั้ม |
| Upload stalled | (none) | สัญญาณอ่อน รูปยังส่งไม่เสร็จ · [รอต่อ] [ส่งโดยไม่มีรูป] |
| Send error | ส่งไม่สำเร็จ — {msg} | ส่งไม่สำเร็จ ข้อมูลที่กรอกยังอยู่ครบ — {msg} |
| Draft restore | (none) | คุณกรอกเรื่องค้างไว้เมื่อ 10 นาทีก่อน · [ทำต่อ] [เริ่มใหม่] |
| Location already denied | ไม่ได้รับอนุญาต… | ยังไม่ได้เปิดสิทธิ์ตำแหน่ง ไม่เป็นไร แตะแผนที่เพื่อปักหมุดเองได้เลย (เปิดสิทธิ์ได้ที่ไอคอนแม่กุญแจข้างที่อยู่เว็บ) |
| Before submit | (none) | เรื่องนี้จะแสดงบนแผนที่สาธารณะ พร้อมชื่อ "{name}" |
| Success next | 2 buttons | ขั้นต่อไป: เพื่อนบ้าน/จิตอาสากด "ช่วยได้" → สถานะเปลี่ยนเป็น "กำลังดำเนินการ" · [ดูหมุด] [แชร์ทาง LINE] [แจ้งเรื่องอื่น] |

Tone: keep the current friendly, plain style. Use short sentences, avoid technical words ("อัปโหลด" is fine, but avoid "พิกัด"), and always pair a problem with what to do next.

---

## 4. Prioritized backlog

**P0 (prevents data loss or failed sends; do these first)**
1. Draft persistence in IndexedDB, including the photo Blob, with restore and discard prompts (ReportFlow). Save before opening the file picker.
2. Put steps in the URL hash so the Android back button goes back one step (useRoute, ReportFlow).
3. Upload watchdog with "send without photo" and a shorter `maxUploadRetryTime`. Error copy that reassures users their data is kept.

**P1 (reduces effort and improves clarity)**

4. Quick-phrase chips for each category, plus a voice-typing hint. Relax the 5-character minimum.
5. Separate "take a photo" and "choose from album" buttons. Compression adapted to the network (≤250 KB target).
6. Reorder step 2 (category, photo, description, place) and move the reporter name to the review step as "ส่งในชื่อ … เปลี่ยน".
7. Suggested place names and a duplicate warning from nearby `existing` reports.
8. Headings and `document.title` that include the step; focus on success.
9. Skip location priming when permission is already granted, show recovery steps when denied, fall back to low accuracy, and show accuracy.

**P2 (polish)**

10. Per-row "แก้" links on the review step, a map thumbnail in place of coordinates, and a public-visibility reminder.
11. Success page: "what happens next", LINE share and "report another".
12. Error placement above the input with an icon and a hidden prefix. Hints instead of placeholders. Counter shown only near the limit.
13. Gradual engagement: sign in at the review step, which depends on P0-1.
14. Offline outbox that sends automatically when the connection returns.

---

## Sources
- GOV.UK Design System: [Error summary](https://design-system.service.gov.uk/components/error-summary) · [Error message](https://design-system.service.gov.uk/components/error-message/) · [Validation pattern](https://design-system.service.gov.uk/patterns/validation) · [Question pages](https://design-system.service.gov.uk/patterns/question-pages) · [Confirmation pages](https://design-system.service.gov.uk/patterns/confirmation-pages) · [One thing per page (design notes)](https://designnotes.blog.gov.uk/2015/07/03/one-thing-per-page/) · [Error summary backlog #46](https://github.com/alphagov/govuk-design-system-backlog/issues/46)
- NHS / ONS / Home Office / CMS: [NHS error summary](https://service-manual.nhs.uk/design-system/components/error-summary) · [NHS confirmation](https://service-manual.nhs.uk/design-system/patterns/confirmation-page) · [ONS confirmation](https://service-manual.ons.gov.uk/design-system/patterns/confirmation-page) · [Home Office errors](https://design.homeoffice.gov.uk/accessibility/interactivity/error-messages) · [CMS error validation](https://design.cms.gov/patterns/Forms/error-validation/?theme=core)
- Baymard: [Inline form validation](https://baymard.com/blog/inline-form-validation) · [Required & optional fields](https://baymard.com/blog/required-optional-form-fields) · [Input fields](https://baymard.com/blog/input-fields)
- NN/g: [Wizards](https://www.nngroup.com/articles/wizards/) · [Permission requests](https://www.nngroup.com/articles/permission-requests/) · [Reduce cognitive load in forms](https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/) · [Progress indicators](https://www.nngroup.com/articles/progress-indicators/)
- Material 3: [Text fields guidelines](https://m3.material.io/components/text-fields/guidelines)
- Luke Wroblewski: [Web Form Design (Rosenfeld)](https://rosenfeldmedia.com/books/web-form-design/) · [Best practices PDF](https://static.lukew.com/webforms_lukew.pdf)
- Android file input: [capacitor #6536](https://github.com/ionic-team/capacitor/issues/6536) · [picker + camera gist](https://gist.github.com/danawoodman/4788404bc620d5392d111dba98c73873) · [addpipe Android 14/15](https://blog.addpipe.com/html-file-input-accept-video-camera-option-is-missing-android-14-15/)
- [Smashing: One thing per page case study](https://www.smashingmagazine.com/2017/05/better-form-design-one-thing-per-page/)
