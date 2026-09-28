# UI-01 — Civic issue-reporting products: patterns for "ท่าแร้งช่วยกัน"

## Research caveats (read first)
- WebFetch was **blocked by the egress proxy** for: allsaft.com, medium.com (Thai Gov Design x Traffy case study), frontiersin.org (Traffy paper), maysasi.com (Traffy portfolio), mysociety.org, fixmystreet.com, dev.seeclickfix.com, civicplus help, play.google.com, wikipedia, traffy.in.th. GitHub and raw.githubusercontent **did** work.
- The session's WebSearch budget ran out after 7 searches. Search-result summaries were used where pages could not be opened.
- Marking used below: **[src]** means a fetched page or search summary confirmed it. **[known]** means well-documented public behaviour of the product, written from background knowledge and not re-verified this session. Check any [known] item before quoting it as fact.

---

## 1. Traffy Fondue (NECTEC / BMA, Thailand), the closest analogue
**Report flow [src]:** LINE OA `@traffyfondue` works as a chatbot. Steps: type the problem → take a photo → pick a type → share location (LINE location share) → pick an agency. It is marketed as "เสร็จในไม่เกิน 30 วินาที", and AI routes the report to the responsible local office. (tessabantambonpong.go.th manual; news.trueid.net; bangkokbiznews.com/tech/1008063)
- Key insight: **no app install and no account.** It runs inside LINE, which almost every Thai adult, elderly people included, already uses. For a rural ตำบล this is the most important lesson on this list.

**Status [src]:** three public states, **new / working / done** (รอรับเรื่อง / กำลังดำเนินการ / เสร็จสิ้น). Each ticket carries a time, district, photo and ticket link, and the public map draws them as small circles (github.com/icyice1998/Flood/pull/6). Citizens follow a **timeline** by Ticket ID and get push updates in LINE.

**Official response [src]:** After the Thai Gov Design challenge, BMA added four things. Resolved problems are displayed to show outcomes. The time officers took is shown. **The person or unit that solved it is named.** Reporter satisfaction is collected as a rating plus feedback. (Search summary of medium.com/thaigovdesign/…ux-design-challenge)

**Trust signals [src]:** Public counters appear everywhere: over 1M resolved and 81% positive ratings, 326,636 positive vs 77,882 unsatisfactory (bangkokpost.com/…/3210754; aseannow). The "fixed in a day or two" streetlight stories are what spread the product (thaipbsworld).

**What fails [known + src hint]:** Officials sometimes close tickets as "done" or "forwarded" without a real fix, which frustrates residents. The rating after closure exists partly to catch this. Ticket IDs are hard to remember. Photos show the problem but often lack a clear after photo. Pins from LINE location share can be off by tens of metres.

**Map vs list:** The main flow is chat (list-like, one-at-a-time). The map is a separate public dashboard mostly used by officials and media.

## 2. FixMyStreet (mySociety, UK + open-source platform)
**Flow [src]:** Enter a postcode or street, or use GPS → map opens centred → **tap to drop a pin** (which can be dragged) → pick a category → title, details and photos → name/email (can hide name) → confirm. The authority is found automatically from pin and category, so users "don't worry about the correct authority" (github.com/mysociety/fixmystreet README; mySociety search summary).

**Patterns found in the CHANGELOG [src]** (github.com/mysociety/fixmystreet/blob/master/CHANGELOG.md):
- Crowded maps made it hard to drop a new pin without tapping an old one. Fixes: a **prominent "Hide pins" link** while reporting, and **pins resized by zoom level**.
- **Auto-suggest similar nearby problems while reporting** (duplicate prevention), done inline without losing form state.
- **"More prominent display of state on report page."**
- Multi-photo upload, **client-side photo resize** before upload (important on slow rural 4G).
- "Users can hide their name on reports/updates", with clear copy separating "private report" from "hide my name".
- Keyboard-accessible map controls, skip links, focus states.

**Closing the loop [src]:** A questionnaire goes to the reporter about 4 weeks later (raw template `templates/web/base/questionnaire/index.html`). It asks "Has this problem been fixed?" (Yes / No / Don't know), invites a public update plus a photo, and asks "Want another reminder in 4 weeks?". States include `confirmed`, `investigating`, `action scheduled`, `fixed - council`, and **`fixed - user`** (Problem.pm). The **reporter or public can mark something fixed**, not only officials.

**Trust:** Every report is public with a plain-text timeline of updates, which creates social accountability. The visual design is famously plain (yellow/black, big type), with no gamification.
**Fails [known]:** The map can look like a sea of old pins. Many reports sit at "confirmed" with no council response, which looks dead. Email confirmation adds friction.

## 3. SeeClickFix (CivicPlus, US)
**Status model [src]:** **Open → Acknowledged → (In Progress) → Closed**. Only government users move Open→Acknowledged and Acknowledged→Closed. **Closing needs a comment explaining why.** Closed issues are archived after 7 days (search summary of seeclickfixusers.civicplus.help and dev.seeclickfix.com).
**Community [known]:** Other residents can **"vote" or "+1" and follow** an issue instead of filing a duplicate. Comment threads mix residents and officials, and official comments get a badge.
**Fails [src]:** Reviews say that **a wrong address cannot be edited after submission**; you have to comment or re-file. The Android app has upload and network failures and photo upload errors (search summary of the Play/App Store listings).

## 4. Waze hazard reports [known]
- Reporting takes **2 taps with big icon tiles** (Hazard → Pothole), and location comes automatically from where you are. There is no free text by default.
- **Crowd verification:** Other users passing by are asked **"Still there?" with Thumbs up / Not there**. Reports expire when enough people answer "not there" or when time passes. The reporter's name, a "reported X min ago" stamp and thank-you counts are visible.
- Lesson: let the people who pass by verify a report, and let old pins expire so the map stays honest.

## 5. Nextdoor [known]
- Identity is verified by address, and posts show **real name and neighbourhood**, which builds trust. It is also a known source of rumour, tension and profiling in "crime & safety" posts, which moderation and "kindness reminder" prompts try to reduce.
- The feed comes first and the map is secondary. "Thank" reactions matter more than likes.
- Lesson: real names build trust, but keep the tone kind. Nudge people toward describing the problem, not blaming people.

## 6. Citizen (US) [known]
- Incident map plus a live feed, with alarming push notifications, red pulsing dots and incident video.
- Widely criticised for **fear-mongering, vigilantism and misidentification**.
- Lesson (anti-pattern): don't use alarm-red urgency styling for everyday problems like garbage or lights. Save red for real danger (flood depth, a live wire).

## 7. Singapore OneService (Municipal Services Office) [known]
- A single "report once" entry point, where the government decides who handles it. Categories use **big illustrated tiles** (Cleanliness, Pests, Roads & Footpaths…).
- Photos are required, and GPS is auto-filled with a draggable pin. A reference number and SMS/in-app updates follow, and the case page shows the responsible agency and **before/after closure notes**.
- The app also shows reports others filed nearby, to cut duplicates.

## 8. ALLSAFT (allsaft.com): live Bangkok flood map [src, homepage blocked]
- Community flood reports use **passability states rather than bureaucratic states**: "Can't Pass / Caution / High Water" by district and road (search summary of allsaft.com).
- Lesson for Tha Raeng floods: residents want to know **"can I get through?"**, not "ticket status". A 3-level colour code (ผ่านได้ / ระวัง / ผ่านไม่ได้) with a "last updated X min ago" stamp is more useful than one generic flood pin.

## 9. Bangkok Risk Map / flood dashboards [known + src]
- Layered maps (flood, warnings, road pins) share **one time filter** ("15 min → all"), and **pins are hidden below zoom 13** to reduce clutter. A district counts as a hotspot when it has 5 or more open reports in 6 hours (github.com/icyice1998/Flood/pull/6).
- Lesson: add a time filter so old reports stop drowning out the current picture, and use clustering or aggregation when zoomed out.

---

## Cross-cutting synthesis
| Theme | What winners do | What fails |
|---|---|---|
| Entry friction | Traffy: LINE chat, no install, about 30 s. Waze: 2 taps | Email confirmation (FMS), mandatory account |
| Location | GPS default → draggable pin → address or landmark shown back to the user | Pin under existing pins; address not editable (SCF) |
| Category | Big icon tiles, 6–10 max (Waze, OneService) | Long dropdowns, jargon |
| Status | 3–4 plain-language states, the current one prominent (FMS v2.5) | Stuck at "open" with no sign of life |
| Closing | Comment required (SCF) + after photo + reporter confirms (FMS questionnaire, Traffy rating) | Official says "done" but the problem isn't fixed |
| Social proof | +1 / "me too" / "still there?" (SCF, Waze) | Duplicate pins for one pothole |
| Trust | Named solver, time-to-fix, public counters (Traffy) | Anonymous officials; alarmist styling (Citizen) |
| Map vs list | Map for "where", list/feed for "what's new" and accessibility | Map-only UI: unusable for low-vision users and on tiny phones |

---

## Prioritized recommendations for ท่าแร้งช่วยกัน

1. **3-step report sheet with big icon tiles.** Step 1 is "เกิดอะไรขึ้น?" with 6–8 large illustrated tiles (น้ำท่วม, ขยะ, ถนนพัง, ไฟดับ, ท่อ/น้ำประปา, ต้นไม้ล้ม, อื่นๆ) at 64px or more, each with a Thai label under the icon. Step 2 is "ที่ไหน?", step 3 is "รูป + รายละเอียด (ไม่บังคับ)". Aim for under 30 seconds, as Traffy does. Free text should be optional, not step one.
2. **Location: GPS first, fixed centre-pin you drag the map under.** Use a crosshair-style pin fixed at the map centre, not tap-to-drop. This avoids FixMyStreet's problem of tapping an existing pin. Hide other pins while choosing, as FMS "Hide pins" does. Under the map, show a human-readable place: nearest landmark or หมู่ number ("ใกล้วัดท่าแร้ง · หมู่ 3"). Add a fallback "เลือกหมู่บ้าน" list for people who can't use maps.
3. **Show "เรื่องใกล้ๆ ที่มีคนแจ้งแล้ว" during reporting.** After the location is set, show nearby open reports of the same type within about 100 m, with a big button "ใช่เรื่องนี้ → +1 เจอเหมือนกัน". This follows FMS's inline duplicate suggestion and SeeClickFix voting, and keeps the map clean.
4. **Four plain-Thai states, with the current one shown largest.** แจ้งแล้ว → มีคนรับเรื่อง (showing the volunteer's name and face) → กำลังแก้ → แก้แล้ว ✓. Show them as a horizontal stepper on the report page, and use the same colour on the pin and the list chip. Avoid "Acknowledged/Pending" style jargon.
5. **Close with proof, and let the community confirm.** To mark "แก้แล้ว", a volunteer must add a short note and an **after photo**, like SeeClickFix's mandatory comment. The report page then shows a before/after pair side by side. The reporter and neighbours get "แก้แล้วจริงไหม?" (ใช่ / ยังไม่หาย / ไม่แน่ใจ), like the FMS questionnaire and Traffy rating. Two "ยังไม่หาย" answers reopen the report automatically.
6. **Name and credit the helper.** Show "รับเรื่องโดย ลุงสมชาย (อาสา หมู่ 2)" with an avatar, time taken to fix ("แก้เสร็จใน 2 วัน"), and a "ขอบคุณ" button with a count. Traffy's biggest trust gain came from naming the solver and showing time to resolve.
7. **Show that reports stay alive, and let stale ones expire.** Show "อัปเดตล่าสุด 3 ชม.ที่แล้ว" on every card. If a report has had no activity for N days, ask passers-by "ยังอยู่ไหม?" (ยังอยู่ / หายแล้ว), as Waze does. Fade old resolved pins, and make "แก้แล้ว" pins hidden by default and toggleable.
8. **Flood gets its own passability mode (from ALLSAFT).** A flood report asks "ผ่านได้ไหม?" with three answers: 🟢 ผ่านได้ / 🟡 ระวัง / 🔴 ผ่านไม่ได้, plus an optional depth pictogram (ข้อเท้า / เข่า / เอว). These are icons, not numbers. Flood pins expire after about 12–24 h unless someone reconfirms them.
9. **Keep map and list equal, with a list-first option.** Use a bottom sheet over the map with a peek (3 nearest), half, and full list. Put a clear "แผนที่ | รายการ" segmented toggle at the top. The list is the accessible path, sorted by distance or newest and filterable by type or status chips. Cluster pins with count badges when zoomed out.
10. **One time filter.** Chips for "วันนี้ / 7 วัน / ทั้งหมด", as in the flood dashboards, so the default map shows the current situation and not years of history.
11. **Share to LINE at every key moment.** After submitting, show "ส่งต่อให้ผู้ใหญ่บ้าน/กลุ่มไลน์หมู่บ้าน" with a pre-filled message, a photo, and a deep link. Offer LINE sharing of status changes too. Traffy works because it lives inside LINE, so meet people there, even if a full LINE OA comes later.
12. **Low-friction identity, with a choice about names.** No sign-up to report: a name plus an optional phone number is enough. Show a checkbox "ไม่แสดงชื่อของฉัน" with clear copy that the report itself stays public (FMS's lesson). Volunteers always show their real name and หมู่, which builds trust in the Nextdoor way.
13. **Built for elderly users and bad networks.** Use body text of at least 18px, touch targets of 48px or more, and icons that always have a Thai text label. Compress photos on the device before upload (FMS). Save drafts offline and retry the upload. Show a clear "ส่งไม่สำเร็จ ลองอีกครั้ง" instead of silent failure; this is SeeClickFix's top review complaint. Let people edit location and details after submitting, which fixes SCF's "can't edit the address" complaint.
14. **A community scoreboard that is modest, not a gamified dashboard.** At the top of the list, show one line: "เดือนนี้ ชาวท่าแร้งแจ้ง 24 เรื่อง · แก้แล้ว 18 · อาสา 9 คน". This is Traffy-style social proof at village scale. Avoid badges, leaderboards and confetti; they read as "AI slop" and trivialise real problems.
15. **Calm colour semantics.** Use cream/green as the base. Colour status, not category: amber = แจ้งแล้ว, blue = กำลังแก้, green = แก้แล้ว, and grey for expired. Keep red only for danger (ผ่านไม่ได้, a fallen live wire) and avoid Citizen-style alarm styling. Category is shown by the icon glyph inside the pin.

## Sources
- https://github.com/mysociety/fixmystreet (README, fetched)
- https://github.com/mysociety/fixmystreet/blob/master/CHANGELOG.md (fetched)
- https://raw.githubusercontent.com/mysociety/fixmystreet/master/templates/web/base/questionnaire/index.html (fetched)
- https://raw.githubusercontent.com/mysociety/fixmystreet/master/perllib/FixMyStreet/DB/Result/Problem.pm (fetched)
- https://github.com/icyice1998/Flood/pull/6 (fetched; Traffy states and flood-map layering)
- https://medium.com/thaigovdesign/thai-gov-design-x-traffy-fondue-ux-design-challenge-1bbe511a3a02 (blocked; search summary only)
- https://www.frontiersin.org/journals/sustainable-cities/articles/10.3389/frsc.2025.1491621/full (blocked)
- https://www.tessabantambonpong.go.th/e-service/manual/content/622 ; https://news.trueid.net/detail/BZ4gzg3Nqj97 ; https://www.bangkokbiznews.com/tech/1008063 (search summaries: LINE flow)
- https://www.bangkokpost.com/thailand/general/3210754/traffy-app-hits-1mcase-milestone ; https://aseannow.com/thailand-news/bangkoks-traffy-fondue-hits-1-million-resolved-complaints-r452 ; https://www.thaipbsworld.com/world/traffy-fondue-nothing-to-do-with-cheese-but-melting-away-bangkokians-problems (search summaries)
- https://www.seeclickfixusers.civicplus.help/hc/en-us/articles/360043118654-How-do-I-close-an-Issue ; https://dev.seeclickfix.com/v2/issues/changing_status/ ; https://play.google.com/store/apps/details?id=com.seeclickfix.ma.android (blocked; search summaries)
- https://allsaft.com/ (blocked; search summary: Can't Pass / Caution / High Water)
- Waze, Nextdoor, Citizen, OneService: background knowledge, not re-verified (search budget exhausted)
