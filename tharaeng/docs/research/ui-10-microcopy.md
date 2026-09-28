# UI-10: Thai microcopy & trust/transparency — ท่าแร้งช่วยกัน

Scope: research on Thai UX writing tone and civic-platform transparency patterns, then a prioritized rewrite list for the UI strings in `tharaeng/src` (read-only; nothing modified).

> **Research caveat:** nearly every page I tried to open was blocked by the egress proxy (medium.com, nngroup.com, gov.uk design system, standard.dga.or.th, traffy.in.th, nstda.or.th, fixmystreet.com, societyworks.org, tcdc, marketingoops, shinoshigoto, wordpress, gtelocalize). The findings below come from **search-result snippets** plus established practice. Snippet-derived claims are marked (S). Before quoting any of them in a report, check them against the primary source.

---

## 1. Research findings

### 1.1 Register & voice for Thai UI
| Question | Recommendation | Why / source |
|---|---|---|
| **ครับ / ค่ะ?** | **Don't use them in UI chrome** (buttons, labels, errors, badges). At most, use them in one or two "human" moments (for example the thank-you screen), and when you do, write the whole message in one voice. | A particle sets the gender of the speaker. The team is mixed and the "speaker" is a website, so any choice sounds like a chatbot or a call-centre. Thai UX writers advise drafting copy as a spoken conversation and then trimming it into microcopy (S: Medium/Mai Kanapornchai "UX Writing best practices"; Ueakarn "Don'ts of UX writing"). Bank and government apps (K PLUS, Traffy) write system messages with no particles (S: Pantip quotes of K PLUS "ขออภัย ระบบไม่สามารถทำรายการได้ในขณะนี้ กรุณาทำรายการใหม่อีกครั้งในภายหลัง"). |
| **"คุณ"?** | Thai drops the subject pronoun naturally, so **leave it out by default**. Keep "คุณ" only where ownership must be clear: privacy ("ชื่อที่คุณพิมพ์"), errors about the user's own action, and "ตำแหน่งของคุณ". | Too many "คุณ" reads like a translation from English. "ท่าน" is too bureaucratic, and "เธอ/แก" too casual or age-marked. |
| **กรุณา / โปรด** | Use sparingly. **Validation errors should say what is missing and what to do** ("ยังไม่ได้ใส่ชื่อ — ใช้ชื่อเล่นก็ได้"). Keep กรุณา for real requests ("กรุณาอย่าปิดหน้านี้" is fine). Use "ขออภัย" only when **our** side failed. | This is GOV.UK guidance: there is usually no need for "please" in error messages. Say "sorry" only when something serious went wrong, describe what happened, say how to fix it, and reuse the field label (S: GOV.UK Design System – Error message). A block of "กรุณา…" in red reads like a government office form. |
| **Word choice for older readers** | Prefer everyday verbs: ใส่/พิมพ์ over กรอก, ส่งเรื่อง over ทำรายการ, ดูทั้งหมด over ล้างตัวกรอง, and "เปิดหน้าใหม่" over "รีเฟรช". Keep sentences short (about 15–20 words, one idea each), put the action first, and give icons text labels. | Plain-language and older-adult guidance: short sentences, no jargon, descriptive labels instead of "click here", clear feedback after each action, and icons with text because older users know symbols less well (S: NN/g "Usability for older adults"; uxdesign.cc checklist; Adchitects). |
| **Warm but not childish** | Use neighbourly verbs ("ช่วยกัน", "อาสา", "เพื่อนบ้าน") and plain thanks ("ขอบคุณที่ช่วยกันดูแลชุมชน"). Avoid emoji, "น้า~", "เย้!", cute mascots, and the teasing "งั้นลอง…". | It keeps respect for elders while avoiding the stiff "ดำเนินการ / ทำรายการ / ระบบ" register. |
| **Inclusive / multicultural** | Use neutral landmarks and names in examples. Avoid merit-making or religious idioms (ทำบุญ, สาธุ, อนุโมทนา), religious greetings, and วันพระ references. If a religious landmark appears in an example, show **both** (หน้าวัด / หน้ามัสยิด) or neither. Keep Buddhist-Era dates (the `th-TH` default); that is the civil standard and is used by everyone. | About 60% of residents are Muslim. The current placeholder "หน้าวัด" (ReportFlow) quietly assumes a Buddhist default. |
| **"จิตอาสา"** | Fine as a general word, but be aware that it is also closely tied to the state program "จิตอาสาพระราชทาน". Pair it with "เพื่อนบ้าน" and don't imply any official scheme. | This avoids a perceived official affiliation, which matches the not-อบต. requirement. |
| **One noun per thing** | The code currently uses ปัญหา, รายงาน, เรื่อง, จุด and หมุด for the same object. Settle on **"ปัญหา / เรื่อง"** for the content and **"หมุด"** for the map object, and drop **"รายงาน"** (translationese for "report"). | Consistency is one of the five core principles (Clear, Concise, Constructive, Conversational, Consistent) (S: Mai Kanapornchai). |

### 1.2 Status wording — how comparable platforms phrase it
- **Traffy Fondue (NECTEC, Thai gov):** รอรับเรื่อง → กำลังดำเนินการ → เสร็จสิ้น. A later version has four states: รอรับเรื่อง / ดำเนินการอยู่ / ส่งต่อแล้ว / แก้เสร็จแล้ว. It also has before/after photos and citizen satisfaction ratings (S: bangkokbiznews, prachachat, NSTDA "6 new features", Walailak blog).
- **FixMyStreet (UK):** Open / Investigating / Action scheduled / Fixed, plus explicit closed reasons such as "not responsible", "duplicate" and "unable to fix". Its operator blog argues that specific closed statuses increase transparency (S: SocietyWorks 2022).
- **What this means for us:** "กำลังดำเนินการ" is exactly Traffy's and the government's word. It suggests *an agency is handling it*, which works against the "not run by อบต." message. It is better to describe the **people** state: who needs to act next.

| id | Current (long / short) | Recommended (long / short) | Alternatives considered |
|---|---|---|---|
| open | รอความช่วยเหลือ / รอช่วย | **รอคนช่วย / รอคนช่วย** | ยังไม่มีคนรับ (clear but negative); รอจิตอาสา; รอความช่วยเหลือ sounds like disaster relief or someone in distress |
| in_progress | กำลังดำเนินการ / กำลังทำ | **มีคนอาสาแล้ว / กำลังช่วย** | กำลังช่วยกัน; มีคนรับแล้ว; ดำเนินการ = bureaucratic |
| resolved | แก้ไขแล้ว / แก้แล้ว | **แก้แล้ว / แก้แล้ว** (show "แจ้งโดย {ชื่อ} · {วันเวลา}" beside it) | เรียบร้อยแล้ว (softer, but vaguer); เสร็จสิ้น (official) |
| future closed reasons | — | ซ้ำกับหมุดอื่น · อยู่นอกพื้นที่ · ต้องให้หน่วยงานแก้ (with a link to the อบต. or PEA channel) | modelled on FixMyStreet's closed statuses |

Add a one-line meaning under each status in the About legend. For example: "รอคนช่วย — ยังไม่มีใครอาสา กดอาสาได้เลย".

### 1.3 Trust & transparency patterns (volunteer/community platforms)
1. **Public, timestamped history of who did what.** Surface events publicly instead of hiding them in a dashboard (S: dev.to "Closing the loop on civic tech"). The app already has `ประวัติการเปลี่ยนสถานะ` with actor and time, which is good. Rename it and make it visible by default.
2. **Show both absolute and relative time.** Already done (`2 ชั่วโมงที่แล้ว · 28 ก.ย. 69 14:05 น.`). Keep it.
3. **Mark self-reported claims as self-reported.** "แก้แล้ว" is a volunteer's claim, not a verification, so write "{ชื่อ} แจ้งว่าแก้แล้ว". Traffy uses citizen ratings and before/after photos for the same purpose.
4. **Reporter identity: pseudonymous display name, no contact details.** FixMyStreet lets reporters hide their name and even anonymise a report afterwards. Tell people plainly what is public (name, text, photo, pin) and what is not (email, Google account name).
5. **Visible moderation.** FixMyStreet uses reactive moderation and stamps "moderated" with a timestamp and where content was removed (S: FixMyStreet FAQ/admin manual). For hidden items, a direct link could show "ซ่อนแล้วเมื่อ … เหตุผล: แจ้งซ้ำ" instead of "ไม่พบ".
6. **Keep the student-project disclosure next to the actions, not only on the About page.** Include it in the header subtitle, on the success screen, and in the sign-in card.
7. **Give a human contact.** Older users trust a visible contact (a phone number, or a LINE group run by the teacher or school) (S: older-adult guidance: "make phone support prominently available"). There is currently no way to reach the student team.
8. **Emergency deflection with concrete numbers**, not "ติดต่อหน่วยงานที่เกี่ยวข้อง": 1669 (medical), 199 (fire), 191 (police), 1129 (PEA, fallen power lines). Confirm the local อบต. phone number with the อบต. page before adding it.

---

## 2. Prioritized rewrites (current → proposed, reason)

Priority: **P0** = misleading, a trust or safety issue, or ambiguous meaning. **P1** = clarity for older readers and consistency. **P2** = polish.

### P0 — meaning, safety, trust
| # | File:line | Current | Proposed | Reason |
|---|---|---|---|---|
| 1 | ReportDetail.tsx:156, :36-ish buttons; AboutPage:26; ReportDetail:486 | รับช่วยเหลือ | **อาสาช่วย** (history: "อาสาช่วย") | "รับช่วยเหลือ" usually means *to receive help*, as in ผู้รับความช่วยเหลือ = beneficiary. An older reader may think the button is for asking for help. |
| 2 | ReportDetail.tsx:101 | ยังไม่มีผู้รับช่วยเหลือ | **ยังไม่มีใครอาสา — เป็นคนแรกได้เลย** | Same ambiguity ("no one has received help yet"), plus an invitation to act. |
| 3 | ReportDetail.tsx:274 / :282 | รับช่วยเหลือจุดนี้ / ยืนยันรับช่วยเหลือ | **อาสาช่วยจุดนี้ / ยืนยัน ลงชื่ออาสา** | Consistent with #1. |
| 4 | ReportDetail.tsx:264 | รับช่วยเหลือแล้ว ขอบคุณที่ช่วยชุมชน | **ลงชื่ออาสาแล้ว ขอบคุณที่ช่วยกันดูแลชุมชน** | Same as above; warm and neutral. |
| 5 | lib/reports.ts:214, :252 | คุณรับช่วยเหลือจุดนี้อยู่แล้ว / ต้องรับช่วยเหลือจุดนี้ก่อน จึงจะแจ้งว่าแก้ไขแล้วได้ | **คุณลงชื่ออาสาจุดนี้ไว้แล้ว / ต้องลงชื่ออาสาก่อน จึงจะบันทึกว่าแก้แล้วได้** | Consistent with #1. |
| 6 | LocationPicker.tsx:134 | เว็บจะขอสิทธิ์เข้าถึงตำแหน่งของคุณ**เพื่อปักหมุดครั้งนี้เท่านั้น** ไม่มีการเก็บตำแหน่งของคุณไว้ | **เว็บจะใช้ตำแหน่งโทรศัพท์เพื่อวางหมุดให้ครั้งนี้เท่านั้น ตำแหน่งหมุดที่คุณกดส่งจะแสดงให้ทุกคนเห็น — ถ้าตอนนี้อยู่ที่บ้าน ลากหมุดไปที่จุดปัญหาก่อนส่ง** | "ไม่มีการเก็บตำแหน่ง" is **inaccurate** if the user submits the GPS pin, because the pin becomes a public, stored point, possibly the user's home. |
| 7 | LocationPicker.tsx:141 / :138 | อนุญาตและค้นหา / ไม่ใช่ตอนนี้ | **ตกลง ใช้ตำแหน่งของฉัน** (hint: "โทรศัพท์จะถามอีกครั้ง ให้กด 'อนุญาต'") / **ไม่ใช้ ปักหมุดเอง** | Tells older users that a second, browser-level popup will follow. "ไม่ใช่ตอนนี้" is a translation of "Not now". |
| 8 | Header.tsx:18 | ต.ท่าแร้ง อ.บ้านแหลม จ.เพชรบุรี | **โครงงานนักเรียน · ต.ท่าแร้ง จ.เพชรบุรี** | Shows the not-อบต. disclosure on every screen. The place-name header alone can read as an official site. |
| 9 | Community.tsx:9 | ติดตามข่าวสารจาก อบต.ท่าแร้ง | **เพจ Facebook ของ อบต.ท่าแร้ง** + small "(เว็บภายนอก)" | The current wording plus the FB branding, placed at the top of our site, suggests an affiliation. Name the page as external. |
| 10 | Community.tsx:19–20 (StudentProjectNote) | “ท่าแร้งช่วยกัน” เป็นโครงงานของนักเรียน ไม่ได้ดำเนินการโดยองค์การบริหารส่วนตำบลท่าแร้ง เรื่องที่แจ้งในเว็บนี้ไม่ได้ส่งถึง อบต. โดยอัตโนมัติ เพจ Facebook ด้านบนเป็นช่องทางภายนอก… | **เว็บนี้เป็นโครงงานของนักเรียน ไม่ใช่เว็บของ อบต.ท่าแร้ง เรื่องที่แจ้งที่นี่ อบต. จะไม่ได้รับ ถ้าต้องการให้ อบต. ช่วย ให้ติดต่อ อบต. โดยตรง** | Shorter sentences, active voice, and one idea each. "ด้านบน" depends on the layout and breaks when the note is reused elsewhere. |
| 11 | AboutPage.tsx:46 | เรื่องเร่งด่วนหรืออันตราย เช่น สายไฟขาด ไฟไหม้ หรือมีผู้บาดเจ็บ ให้ติดตามข่าวสารและติดต่อหน่วยงานที่เกี่ยวข้องโดยตรง | **เรื่องเร่งด่วนหรืออันตราย อย่าแจ้งที่นี่ โทรทันที: เจ็บป่วยฉุกเฉิน 1669 · ไฟไหม้ 199 · ตำรวจ 191 · สายไฟขาด/ไฟฟ้า (กฟภ.) 1129** (make them tel: links) | "ติดตามข่าวสาร" is the wrong action in an emergency. Concrete numbers are a safety requirement. Use the same block on the success screen (#12). |
| 12 | ReportFlow.tsx:174 | เว็บนี้เป็นโครงงานของนักเรียน ข้อมูลไม่ได้ส่งถึง อบต.ท่าแร้ง โดยอัตโนมัติ หากเป็นเรื่องเร่งด่วนควรติดต่อหน่วยงานโดยตรง | **เว็บนี้เป็นโครงงานของนักเรียน อบต. จะไม่ได้รับเรื่องนี้ ถ้าเร่งด่วนหรืออันตราย โทร 1669 / 199 / 1129** | Same fix; "ควรติดต่อหน่วยงาน" is vague. |
| 13 | ReportFlow.tsx:172 | หมุดของคุณขึ้นบนแผนที่แล้ว เพื่อนบ้านและจิตอาสาจะเห็นทันที | **หมุดขึ้นบนแผนที่แล้ว ใครเปิดเว็บนี้ก็เห็นได้ ส่งลิงก์ให้เพื่อนบ้านใน LINE เพื่อให้มีคนมาช่วยเร็วขึ้น** (+ share button) | "จะเห็นทันที" promises attention the site cannot guarantee, since there are no notifications. Sharing is the real way to get help. |
| 14 | config.ts:36–38 (statuses) | รอความช่วยเหลือ / กำลังดำเนินการ / แก้ไขแล้ว | **รอคนช่วย / มีคนอาสาแล้ว (short: กำลังช่วย) / แก้แล้ว** | See §1.2. "ดำเนินการ" implies an official agency, and "รอความช่วยเหลือ" sounds like distress. (Affects StatsBar, legend, badges, toasts at ReportDetail:137/309/358 and the SR summary at StatsBar:27; update them all together.) |
| 15 | ReportDetail.tsx:115 | บันทึกโดย {byName} · {date} | **{byName} แจ้งว่าแก้แล้ว · {date}** | Makes clear it is a claim by a named person, not a verified fact (trust pattern 3). |
| 16 | SignInCard.tsx:36 | เราใช้ชื่อบัญชีเพื่อยืนยันตัวตนเท่านั้น ชื่อที่แสดงบนเว็บคือชื่อที่คุณกรอกเอง | **เว็บจะไม่แสดงอีเมลหรือชื่อบัญชี Google ของคุณ คนอื่นจะเห็นเฉพาะชื่อที่คุณพิมพ์เอง** | Says what is *not* shown, which is what older users worry about. "เรา" is undefined; is it อบต.? *(Check that the Google displayName/email is never written to public docs.)* |
| 17 | ReportFlow.tsx:217 | เข้าสู่ระบบก่อนแจ้งปัญหา เพื่อยืนยันว่าผู้แจ้งเป็นคนจริงและป้องกันการแก้ไขข้อมูลโดยผู้อื่น | **ขอให้เข้าสู่ระบบด้วยบัญชี Google ก่อน เพื่อกันไม่ให้คนอื่นมาแก้หรือลบเรื่องที่คุณแจ้ง** | "ยืนยันว่าเป็นคนจริง" sounds suspicious of the user. Leading with the benefit to the user is friendlier. |
| 18 | ReportFlow.tsx:286 | เช่น ทางแยกท่าแร้ง, หน้าวัด, ซอย 3 | **เช่น ทางแยกท่าแร้ง, หน้าโรงเรียน, ใกล้ตลาด, ซอย 3** (or include both หน้าวัด and หน้ามัสยิด) | Inclusive: don't make a Buddhist landmark the default example. Use real local landmarks the team has verified. |

### P1 — clarity for older readers, consistency
| # | File:line | Current | Proposed | Reason |
|---|---|---|---|---|
| 19 | ReportFlow.tsx:322 / ReportDetail.tsx:238 | เช่น นาย ก / เช่น นาย ข หรือ ป้าแดง | **เช่น ป้าแดง, พี่ต้น** (both fields) | "นาย ก" is form-style, masculine and bureaucratic. Nicknames signal that informality is OK. |
| 20 | ReportFlow.tsx:329 | ชื่อนี้จะแสดงต่อสาธารณะ ใช้ชื่อเล่นได้ | **ทุกคนจะเห็นชื่อนี้ ใช้ชื่อเล่นก็ได้ ไม่ต้องใส่นามสกุลหรือเบอร์โทร** | "สาธารณะ" is abstract. Say who sees it and what to leave out. |
| 21 | ReportFlow.tsx:84, ReportDetail:257/:340/:417 | กรุณากรอกชื่อผู้แจ้ง / กรุณากรอกชื่อผู้ช่วย / กรุณากรอกชื่อ | **ยังไม่ได้ใส่ชื่อ — ใช้ชื่อเล่นก็ได้** | GOV.UK: state what is missing and how to fix it, without "please". "กรอก" is form jargon. |
| 22 | ReportFlow.tsx:76 | กรุณาปักหมุดตำแหน่งที่พบปัญหา | **ยังไม่ได้ปักหมุด — แตะแผนที่ตรงจุดที่พบปัญหา** | Gives the concrete action. |
| 23 | ReportFlow.tsx:77, LocationPicker:173 | หมุดอยู่นอกพื้นที่ที่รับแจ้ง (…กรุณาเลื่อนหมุดให้อยู่ในพื้นที่ตำบลท่าแร้งและบริเวณใกล้เคียง) | **หมุดอยู่ไกลจากท่าแร้งเกินไป ลากหมุดมาไว้ในตำบลท่าแร้ง** | Says why and what to do. "พื้นที่ที่รับแจ้ง" is jargon. |
| 24 | ReportFlow.tsx:80–82 | กรุณาเลือกประเภทปัญหา / กรุณาระบุชื่อจุดหรือสถานที่ / กรุณาเล่ารายละเอียดของปัญหา | **เลือกประเภทปัญหา 1 อย่าง / บอกชื่อจุดหรือสิ่งที่อยู่ใกล้ ๆ / เล่าสั้น ๆ ว่าเจออะไร** | Shorter and action-first. Reuses the field label, per GOV.UK. |
| 25 | ReportFlow.tsx:83 | รายละเอียดสั้นเกินไป เล่าเพิ่มอีกนิด | **เล่าเพิ่มอีกนิด เช่น เป็นอย่างไร เริ่มเมื่อไร** | Good tone already; the examples make it actionable. |
| 26 | ReportFlow.tsx:237 | มีข้อมูลที่ต้องแก้ไข {n} ช่อง | **ยังขาดข้อมูล {n} ช่อง — ดูจุดที่มีตัวแดงด้านล่าง** | Most errors are *missing* data, not wrong data, and the text points to where to look. |
| 27 | ReportFlow.tsx:38 steps; :229; :337 | เลือกตำแหน่ง / กรอกข้อมูล / ตรวจสอบและส่ง · ถัดไป: กรอกข้อมูล · ถัดไป: ตรวจสอบข้อมูล | **ปักหมุด / เล่าปัญหา / ตรวจแล้วส่ง · ถัดไป: เล่าปัญหา · ถัดไป: ตรวจก่อนส่ง** | Everyday verbs that match what the user actually does. |
| 28 | ReportFlow.tsx:395 / :171 | ยืนยันและส่งเรื่อง / ส่งเรื่องเรียบร้อย | **ส่งเรื่อง / แจ้งปัญหาเรียบร้อยแล้ว ขอบคุณที่ช่วยกันดูแลชุมชน** | The button stands alone; the heading gives closure and thanks without particles. |
| 29 | ReportDetail.tsx:188, :131, :134, :489; AboutPage:28 | ยังไม่แก้ไขจริง — เปิดปัญหาอีกครั้ง / เปิดปัญหานี้อีกครั้ง | **ยังไม่เรียบร้อย? แจ้งว่ายังมีปัญหาอยู่** (history: "แจ้งว่ายังไม่เรียบร้อย") | "เปิดปัญหาอีกครั้ง" comes from ticketing jargon ("reopen"). |
| 30 | ReportDetail.tsx:137 | เปิดปัญหาอีกครั้งแล้ว สถานะกลับเป็น “รอความช่วยเหลือ” | **บันทึกแล้ว สถานะกลับเป็น “รอคนช่วย”** | Follows the new status names. |
| 31 | ReportDetail.tsx:165, :308, :316, :487 | ถอนตัวจากจุดนี้ / ถอนตัวจากจุดนี้? / ยืนยันถอนตัว / ถอนตัว | **ยกเลิกการอาสา / ยกเลิกการอาสาจุดนี้? / ยืนยันยกเลิก** (hint: "ไม่เป็นไร ถ้าไม่มีใครอาสาต่อ สถานะจะกลับเป็น “รอคนช่วย”") | "ถอนตัว" feels heavy, even like quitting in disgrace. The phrasing should be non-judgmental. |
| 32 | lib/reports.ts:294 | ระบบไม่อนุญาตให้ทำรายการนี้ อาจเป็นเพราะสถานะเพิ่งเปลี่ยน ลองรีเฟรชหน้าแล้วลองใหม่ | **ทำไม่ได้ในตอนนี้ อาจมีคนเพิ่งเปลี่ยนสถานะ ลองปิดแล้วเปิดหน้านี้ใหม่** | "ทำรายการ" is banking jargon and "รีเฟรช" is technical. |
| 33 | lib/reports.ts:298–300 | พื้นที่จัดเก็บเต็มชั่วคราว… / ฐานข้อมูลยังตั้งค่าไม่ครบ (เช่น ยังไม่ได้สร้าง index) ติดต่อผู้ดูแลเว็บ / เกิดข้อผิดพลาดบางอย่าง ลองอีกครั้ง | **ขออภัย เว็บมีปัญหาชั่วคราว ลองใหม่อีกครั้งภายหลัง ถ้ายังไม่ได้ แจ้งทีมนักเรียนที่ {ช่องทางติดต่อ}** (log the technical detail to the console) | This is our failure, so "ขออภัย" is justified (GOV.UK). Hide dev jargon and give a human contact (trust pattern 7). |
| 34 | App.tsx:168–169 | ไม่พบรายงานนี้ / อาจถูกซ่อนหรือลิงก์ไม่ถูกต้อง | **ไม่พบหมุดนี้ / อาจถูกซ่อนไปแล้ว (เช่น แจ้งซ้ำ) หรือลิงก์ไม่ครบ** | Settles the noun ("รายงาน" → "หมุด"). Better still, show a hidden-item notice with its reason and date (trust pattern 5). |
| 35 | ReportDetail.tsx:196, :141, :144, :148, :490–491 | ซ่อนรายงานนี้ (แจ้งผิด/ซ้ำ) / ซ่อนรายงาน / ซ่อนรายงานแล้ว | **ซ่อนหมุดนี้ (แจ้งผิด/ซ้ำ) / ซ่อนหมุด / ซ่อนหมุดแล้ว** | Same noun consistency. |
| 36 | config.ts:31 | ไฟส่องสว่าง | **ไฟถนนดับ** | The other categories name the *problem* (น้ำท่วมขัง, ถนนชำรุด). This one names an object, and "ส่องสว่าง" is official wording. |
| 37 | Header.tsx:24 / AboutPage:13 / Community:44 | ข้อมูลชุมชน / เกี่ยวกับโครงงาน | **วิธีใช้ & เกี่ยวกับเว็บ** (one label everywhere) | The page is about the website, not community data, and it currently has two different names. |

### P2 — polish
| # | File:line | Current | Proposed | Reason |
|---|---|---|---|---|
| 38 | ReportList.tsx:62–64 | ไม่พบปัญหาตามตัวกรองนี้ / ล้างตัวกรอง | **ไม่มีปัญหาที่ตรงกับที่เลือก / ดูทั้งหมด** | "ตัวกรอง" is jargon for older users. |
| 39 | ReportList.tsx:25 | โหลดข้อมูลไม่สำเร็จ | **โหลดรายการไม่ได้ ตรวจสัญญาณเน็ตแล้วกด “ลองอีกครั้ง”** | Adds a reason and the next step. |
| 40 | ReportDetail.tsx:508 / :479 / :472 | ประวัติการเปลี่ยนสถานะ / แชร์ลิงก์จุดนี้ / คัดลอกลิงก์แล้ว | **ใครทำอะไร เมื่อไร / ส่งต่อให้เพื่อนบ้าน / คัดลอกลิงก์แล้ว วางใน LINE ได้เลย** | Frames the history as transparency, frames sharing as a neighbourly act, and tells the user where to paste. |

Keep as-is (already good): the offline banner (App.tsx:102), `อินเทอร์เน็ตค่อนข้างช้า … อย่าปิดหน้านี้`, the empty state (ReportList:51–52), the photo errors (PhotoPicker:32–43), the geo-denied and not-found messages (LocationPicker:158/163/168), the description placeholder, `(ไม่บังคับ)`, and the relative-plus-absolute time. Dev-only strings (SetupNeeded, emulator, `unauthorized-domain`) are out of scope.

---

## 3. Mini style sheet (to paste into the README)
- No ครับ/ค่ะ in UI. Drop "คุณ" unless ownership matters. Use "ขออภัย" only for our own failures.
- Verbs: แจ้ง, อาสา, ช่วย, ใส่, พิมพ์, แตะ, ส่ง. Avoid: ดำเนินการ, ทำรายการ, กรอก, รีเฟรช, ตัวกรอง, สาธารณะ.
- Nouns: ปัญหา/เรื่อง (content) and หมุด (map object). Never use รายงาน.
- Errors follow the pattern: what is missing or went wrong + what to do (+ an alternative).
- Every public-data moment says who sees it. Every official-looking moment says "โครงงานนักเรียน, ไม่ใช่ อบต.".
- Use neutral examples: nicknames of mixed gender, and landmarks such as schools, markets and bridges. No religious idioms.

## Sources (most blocked for full-text; snippets via search)
- Traffy Fondue statuses: [bangkokbiznews](https://www.bangkokbiznews.com/news/1013964), [prachachat](https://www.prachachat.net/hilight-prachachat/news-1810379), [NSTDA new features](https://www.nstda.or.th/home/news_post/traffy-fondue-6-new-features/), [Traffy platform page](https://www.traffy.in.th/?page_id=27351), [Walailak blog](https://blog.wu.ac.th/archives/14155)
- Thai UX writing: [Mai Kanapornchai – UX Writing best practices](https://medium.com/mcontentspotlight/%E0%B9%80%E0%B8%97%E0%B8%84%E0%B8%99%E0%B8%B4%E0%B8%84%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B9%80%E0%B8%82%E0%B8%B5%E0%B8%A2%E0%B8%99-ux-writing-best-practices-b1f1d7d6d371), [Ueakarn – Don'ts of UX writing](https://medium.com/@mamaewueakarn/the-personally-donts-of-ux-writing-%E0%B8%82%E0%B9%89%E0%B8%AD-%E0%B9%84%E0%B8%A1%E0%B9%88-%E0%B9%81%E0%B8%99%E0%B8%B0%E0%B8%99%E0%B8%B3%E0%B8%AA%E0%B8%B3%E0%B8%AB%E0%B8%A3%E0%B8%B1%E0%B8%9A%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B9%80%E0%B8%82%E0%B8%B5%E0%B8%A2%E0%B8%99-microcopy-5028d33542e3), [TCDC – UX Writer](https://hr.tcdc.or.th/th/Articles/Detail/UX-Writer), [shinoshigoto – microcopy](https://shinoshigoto.com/2024/12/18/effective-microcopy/)
- K PLUS error phrasing (user reports): [Pantip 43770410](https://pantip.com/topic/43770410)
- DGA website standard v3.0: [standard.dga.or.th](https://standard.dga.or.th/article/4035/) (blocked; not verified)
- Error messages: [GOV.UK Design System – Error message](https://design-system.service.gov.uk/components/error-message/), [GOV.UK – writing for user interfaces](https://gov.uk/service-manual/design/writing-for-user-interfaces)
- Older adults: [NN/g – Usability for older adults](https://www.nngroup.com/articles/usability-for-senior-citizens/), [uxdesign.cc checklist](https://uxdesign.cc/designing-for-older-audiences-checklist-best-practices-b6ca3ec5bcbf), [Adchitects guide](https://adchitects.co/blog/guide-to-interface-design-for-older-adults)
- Transparency/moderation: [FixMyStreet FAQ](https://www.fixmystreet.com/faq), [SocietyWorks – report statuses](https://www.societyworks.org/2022/07/20/how-to-increase-transparency-with-fixmystreets-report-statuses/), [FixMyStreet admin manual](https://fixmystreet.org/running/admin_manual/), [dev.to – Closing the loop on civic tech](https://dev.to/puneet_khandelwal_429a72e/closing-the-loop-on-civic-tech-4ig8)
- Could not find (searched): a public Grab TH, LINE or KBank Thai voice-and-tone guide. Claims about those apps rest only on observed message text.
