# UI-04 — Anti-slop: what reads as AI-generated, what reads as made by people who live here

App: ท่าแร้งช่วยกัน — community problem-reporting map for ต.ท่าแร้ง อ.บ้านแหลม จ.เพชรบุรี (student project).
Researched 2026-09-28.

**Method and limits.** I read these sources in full: Anthropic's blog post on frontend design, Anthropic's `frontend-design` SKILL.md (raw GitHub), the community "unslop-ui" skill, and the GOV.UK Design System's error-message guidance (raw GitHub). Every other site was blocked by the sandbox egress proxy: dev.to, medium, gov.uk, codeforamerica.org, design.digital.go.jp, and the design blogs. For those I had only search-result snippets. The session's web-search budget ran out partway through, so the civic examples in section C come from my own knowledge and were **not re-checked this session**. Someone should open those links once before quoting them.

I also skimmed the current app code in `tharaeng/src`, so the "application" lines below refer to what is actually there now.

---

## Why slop happens (one paragraph to show the team)

Anthropic's own write-up calls it *distributional convergence*: without direction, a model samples "safe design choices — those that work universally and offend no one", and that high-probability centre is the slop look ([Anthropic blog](https://claude.com/blog/improving-frontend-design-through-skills)). One widely shared explanation says the purple comes from Tailwind: its early default accent was `indigo-500`, so that colour is over-represented in training data ([prg.sh](https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website), [925studios](https://www.925studios.co/blog/ai-slop-design-tells), snippet only). Anthropic's skill gives the key test: these traits "are defaults rather than choices, and they appear regardless of subject" ([frontend-design SKILL.md](https://github.com/anthropics/claude-code/blob/main/plugins/frontend-design/skills/frontend-design/SKILL.md)).

**So the cure is not a new style. It is making every choice traceable to ท่าแร้ง, its people, and the job of reporting a problem.**

---

## A. Tells to avoid (checklist)

Each item has three parts: the tell, where it comes from, and what it means for our app.

### Colour and surface
- [ ] **Purple / indigo / violet primary colour, or a purple-to-blue or purple-to-cyan gradient hero.** This is the tell people name most often (unslop-ui ranks it #2 and #3; [DEV "Purple Gradient Problem"](https://dev.to/james_anderson_h/the-purple-gradient-problem-why-ai-ui-all-looks-alike-and-how-to-fix-it-3j65), snippet only).
  → *App:* we are already clean here (green `#437a50`, amber, blue). Do not add any gradient to the header, to buttons or to the "แจ้งปัญหา" call to action.
- [ ] **Gradient text on headings, and gradient washes used as decoration.** (unslop-ui #3; Anthropic SKILL trait 4.)
  → *App:* the only gradient allowed is the functional loading shimmer (`styles.css:711`). Keep it that way.
- [ ] **Glassmorphism everywhere, and neon glow on a dark UI.** Frosted translucent cards with faint glow (unslop-ui #6; [Developers Digest, 16 patterns](https://www.developersdigest.tech/blog/ai-design-slop-and-how-to-spot-it), snippet only).
  → *App:* `backdrop-filter: blur(8px)` appears once, on the top bar over the map. That is a real use, because the map stays readable underneath. Do not spread it to cards or sheets. No dark neon mode.
- [ ] **The new "tasteful AI" palette: warm cream near `#F4F1EA`, a serif display face, a terracotta or clay accent near `#D97757`.** Anthropic's skill says outright that this now reads as a tell, because it is Claude's own interface colour. The same goes for near-black with an acid-green or vermilion accent.
  → *App (real risk):* our base is cream `#faf6ec` / `#f3edde`, and we use a brick-red `#7c2b18` / `#b8472f`. Keep the cream only if we can justify it, for example as the colour of paper notices at the อบต. board. Keep red strictly for danger and urgent status, never as a brand accent. Make the **green and the water blue of คลองท่าแร้ง and แม่น้ำเพชรบุรี** the identity, because they come from the place (see B).
- [ ] **The same soft grey shadow (`rgba(0,0,0,.1)`) under every card.**
  → *App:* one `--shadow` token is fine, but use it only on things that float (sheets, the map pin popup, the floating action button). List rows should sit flat and be separated by hairlines.

### Shape and layout
- [ ] **The "SaaS card kit": content chopped into identical rounded cards, one radius on everything, cards inside cards.** (Anthropic trait 4; unslop-ui #1 and #5, "Stock defaults are the giveaway".) The single most reliable give-away is the untouched shadcn `rounded-2xl shadow-lg p-6` card ([Developers Digest](https://www.developersdigest.tech/blog/ai-design-slop-and-how-to-spot-it), snippet only).
  → *App:* `--radius: 16px` everywhere is drifting toward this. Use a **radius scale that follows hierarchy**: about 4px on inputs and chips, about 10px on list items and photos, 16–20px only on the bottom sheet's top corners, and full pill shape only on the status badge. The report list should be one continuous list, not a stack of cards. Never put a card inside a sheet inside a card.
- [ ] **A 3–4px coloured left-border strip on cards or alerts.** Called "the single most reliable AI tell" (Developers Digest / vibecodekit, snippets).
  → *App:* show status with the status badge and the pin colour, not a left stripe.
- [ ] **Hero, then three feature cards (icon + heading + two lines), then a CTA.** (unslop-ui #9; [Mohit Phogat, Medium](https://mohitphogat.medium.com/ai-design-slop-why-every-ai-built-interface-looks-the-same-and-how-to-fix-it-bf874e0b470c), snippet only.)
  → *App:* we have no marketing page, and should not grow one. The **map is the hero**. The About page should read like a short article (why, who made it, how reports get handled), not like three feature tiles.
- [ ] **Meaningless stats: a big number, a small label and a gradient accent.** Anthropic calls this "the default treatment".
  → *App:* our `StatsBar` tiles are acceptable because each one is a **filter** and the numbers are real. The rules: never show them when the count is 0–3 in a way that looks like a brag, never add "+" or rounded-up figures, never add a "people helped" number we cannot back up. Better phrasing is a plain sentence: "แก้ไขแล้ว 12 จาก 30 เรื่องตั้งแต่ ต.ค. 2569".
- [ ] **Numbered markers (01 / 02 / 03) when the content is not a sequence.**
  → *App:* number only the steps of the report flow (1 ถ่ายรูป, 2 ปักหมุด, 3 เล่า), because that really is a sequence.

### Type and labels
- [ ] **Inter, Roboto, Geist or Open Sans everywhere in every weight.** (Anthropic blog; unslop-ui #8.)
  → *App:* already avoided: IBM Plex Sans Thai Looped for body, Mitr for headings. The looped body face is a good, deliberate choice for older villagers. Kanit and Prompt are the Thai equivalents of Inter; avoid switching to them. Make headings visibly different from body text in size and weight (a ratio of at least 1.5× is a good floor), not just a slightly different font.
- [ ] **Template chrome.** Anthropic's skill lists: tracked-out ALL-CAPS eyebrow labels above every heading; meta strings joined with middle dots ("A · B · C"); "WORD — fragment" labels; a monospace face for small data; "→" appended to buttons and links.
  → *App:* several of these exist now. Change "`· {formatDateTime}`" in `ReportDetail.tsx:75` and `:115`, and the "เกี่ยวกับโครงงาน" link after "·" in `Community.tsx:44`, into plain Thai phrasing, for example "แจ้งเมื่อ 3 ชม.ก่อน (28 ก.ย. 69, 14:05)" and "บันทึกโดย สมชาย เมื่อ …". The status-history "open → in progress" arrow in `ReportDetail.tsx:526` is fine, because it describes a real transition. Thai has no capital letters, so don't copy eyebrow styling onto English labels either.
- [ ] **Accenting one word in a headline** with a different colour or italic.
  → *App:* never style "ช่วยกัน" in green in a headline, for example.

### Icons and imagery
- [ ] **Emoji used as icons or bullets, and sparkle (✨) or rocket icons.** (unslop-ui #7.)
  → *App:* keep the hand-drawn `icons.tsx` set. Category icons (น้ำท่วม, ไฟดับ, ถนน, ขยะ) should be drawn the same way, not taken from emoji. No sparkle anywhere, and certainly not next to "AI".
- [ ] **Stock 3D blobs, abstract gradient orbs, and generic illustrations of diverse cartoon people holding hands.**
  → *App:* use real photos, or nothing. See B.

### Motion
- [ ] **Fade-and-slide-up on every section, and hover lift on every card.** Anthropic's skill says these "read as AI-generated"; unslop-ui #4 says the same.
  → *App:* use motion only when it answers an action: the sheet opening, the pin dropping where you tapped, a "ส่งแล้ว" confirmation. Respect `prefers-reduced-motion`.

### Copy
- [ ] **Vague hero copy that sells instead of saying.** Examples: "Empower your community", "Together we build a better tomorrow", "ร่วมสร้างชุมชนที่ยั่งยืน", "แพลตฟอร์มอัจฉริยะ", "seamless", "unlock". The rule is to "describe what something is or does in plain terms rather than selling it" (Anthropic SKILL.md, writing section).
  → *App:* use "แจ้งปัญหาในตำบลท่าแร้ง ถ่ายรูป ปักหมุด แล้ว อบต. กับเพื่อนบ้านจะเห็น". Avoid "Smart", "ดิจิทัล" and "นวัตกรรม" in anything a user reads.
- [ ] **Buttons that don't say what happens** ("Submit", "ตกลง", "Get started"). The same action must keep the same name through the whole flow ("Publish" produces "Published").
  → *App:* the button "ส่งเรื่อง" should produce the toast "ส่งเรื่องแล้ว" and the status "รอความช่วยเหลือ". Use the same verbs everywhere.
- [ ] **Vague, apologetic or jokey errors** ("เกิดข้อผิดพลาดบางอย่าง", "Oops!", "ขออภัย"). GOV.UK says to avoid "sorry", "please", "oops", "invalid" and "An error occurred", and to "describe what has happened and tell them how to fix it" ([GOV.UK Design System — Error message](https://design-system.service.gov.uk/components/error-message/), read via the GitHub source).
  → *App:* `lib/reports.ts:300` falls back to "เกิดข้อผิดพลาดบางอย่าง ลองอีกครั้ง". Replace the common cases with specific messages, such as "ส่งไม่สำเร็จ สัญญาณอินเทอร์เน็ตหลุด เรื่องที่พิมพ์ไว้ยังอยู่ กดส่งอีกครั้งได้" and "รูปใหญ่เกิน 10 MB เลือกรูปอื่นหรือถ่ายใหม่".

---

## B. Signals of craft (checklist)

- [ ] **Ground every visual choice in the subject.** "The subject's industry, subject matter, materials, and vernacular are where distinctive visual choices come from" (Anthropic SKILL.md).
  → *App:* the local vernacular is the Phetchaburi River, the canal that gave the tambon its name (floods, dead fish, vultures: นกแร้ง), tidal flooding on ถนนสายคลองโคลน, salt flats and fishing in Ban Laem, and the notice board at the อบต. office at หมู่ 7 บ้านในพัฒนา. Draw colours from these (canal green-brown, tide-line blue, salt white) instead of from a UI kit.
- [ ] **Real photography of the place, taken by the students.** A hand-shot photo of a flooded road, an actual lamp post or the อบต. building beats any illustration. Caption each photo with who took it, where and when.
  → *App:* the About page gets 2–4 real photos. Empty and onboarding states use a photo of the actual place, not a drawing. Report photos are the main content of the list, so give them room.
- [ ] **The map as the main character, with local labels.** Label the หมู่ numbers and the landmarks people actually give directions by (the วัด, the school, the canal, the bridge), not only OSM defaults. Keep a quiet, desaturated basemap so the report pins are what stands out.
- [ ] **Spend your boldness in one place.** "Let one element be the memorable thing, keep everything around it quiet" (Anthropic SKILL.md).
  → *App:* choose one memorable element. A good candidate is a custom map pin or logo with a small vulture-and-canal mark, a nod to the name's origin. Everything else stays plain.
- [ ] **A restrained palette with a point of view: 4–6 named colours, each with a job.** For example: paper (background), ink (text), canal green (primary and brand), tide blue (in progress), amber (waiting), brick (danger and resolved-problem only). Write down why each one exists.
- [ ] **Typographic hierarchy does the work that boxes do now.** Use size, weight and spacing to separate sections instead of cards and borders. Keep Thai body text at 16–18px with generous line-height (about 1.6–1.7) and lines under about 80 characters.
- [ ] **Hand-tuned spacing that is not uniform.** Tight inside a group, generous between groups. The report detail should read like a short news item: headline, photo, place, then a status timeline.
- [ ] **Specific, human copy.** Name real places and real people's roles: "ผู้ใหญ่บ้านหมู่ 3 รับเรื่องแล้ว" rather than "Your request is being processed". Use Thai Buddhist-era dates ("28 ก.ย. 69"), as villagers expect. Plain verbs, sentence case, one job per sentence.
- [ ] **Honest empty and loading states.** "An empty screen is an invitation to act" (Anthropic SKILL.md). We already have "ยังไม่มีการแจ้งปัญหา". Add the next step: "ยังไม่มีใครแจ้งในหมู่นี้ ถ้าเห็นอะไร ถ่ายรูปแล้วแจ้งได้เลย". Never seed fake reports or fake numbers. The About page's existing honest line about the missing verified tambon boundary is exactly the right tone; keep it.
- [ ] **Show who made it and who responds.** A student-project byline, the school, the teacher's name, and a real contact at the อบต. (a phone number and the Facebook page). Human accountability is the strongest anti-slop signal a civic tool can have.
- [ ] **Accessibility built in, not announced.** Visible focus, large tap targets, high contrast, working offline or on weak signal. Don't add a "♿ Accessible!" badge.
- [ ] **Design for the actual device and user.** A cheap Android phone, in sunlight, with LINE open, used by someone aged 50 or older. Big pin-drop target, a camera-first flow, and very little typing.

---

## C. Reference sites worth studying (not re-checked this session)

| Site | What to take from it |
|---|---|
| **GOV.UK** + [Design System](https://design-system.service.gov.uk/) / [Design principles](https://www.gov.uk/guidance/government-design-principles) | Plain words, one thing per page, the "Do less" and "Be consistent, not uniform" principles, near-zero decoration, specific error messages. Proof that "boring" reads as trustworthy and human. |
| **FixMyStreet** (mySociety, fixmystreet.com) | The closest analogue to our app: map plus a short form plus public status. Report pages list street names and council replies verbatim. |
| **Traffy Fondue** (Thai; used by Bangkok and many municipalities through LINE) | What Thai residents already expect from a problem report: photo, pin, category, status updates. Match its mental model, but avoid its dashboard-heavy look. |
| **ちばレポ / My City Report** (Chiba City and other Japanese municipalities) | A resident problem-reporting app. Japanese municipal sites are dense and plain, with lots of real photos of the place and text-first layouts. |
| **Japan Digital Agency Design System** (design.digital.go.jp) | A national system with a deliberately plain, typographic, well-documented approach to accessibility. |
| **Code for America** projects (e.g. GetCalFresh) | Client-centred copy at a reading level for tired, stressed people; friendly but not cute. |
| **Local newspapers and community Facebook pages in Phetchaburi** | The real local visual vocabulary: photo-first posts, place names in every caption, dates, names of the officials who responded. |

---

## D. One-minute review before shipping any screen

1. Would this screen look the same for a tambon in Chiang Mai or for a SaaS startup? If yes, what here is specific to ท่าแร้ง?
2. Is there a gradient, glass effect, glow, emoji, sparkle, a left-stripe card, or a card inside a card? Remove it.
3. Is every number real and useful to the user? Is every label needed?
4. Does each button say exactly what happens, with the same verb in the toast and the status afterwards?
5. Do the error and empty states say what happened and what to do next, in plain Thai, with no "ขออภัย"?
6. Is there a real photo or place name where there is currently an illustration or generic text?
7. "Take one accessory off" (Anthropic's Chanel line): what can be removed?

---

## Sources

Read in full:
- Anthropic, *Improving frontend design through Skills* — https://claude.com/blog/improving-frontend-design-through-skills
- Anthropic `frontend-design` SKILL.md — https://github.com/anthropics/claude-code/blob/main/plugins/frontend-design/skills/frontend-design/SKILL.md
- "unslop-ui" Claude skill (nine tells ranked by how often they appear in complaints) — https://github.com/iamneilroberts/claude-skills/blob/main/skills/unslop-ui/SKILL.md
- GOV.UK Design System, Error message guidance — https://design-system.service.gov.uk/components/error-message/ (source: github.com/alphagov/govuk-design-system)

Search snippets only (the pages themselves were blocked):
- 925studios, *AI Slop Fonts and Gradients: The Tells* — https://www.925studios.co/blog/ai-slop-design-tells
- Developers Digest, *AI Design Slop: 16 Patterns That Out Your App as Vibe-Coded* — https://www.developersdigest.tech/blog/ai-design-slop-and-how-to-spot-it
- vibecodekit, *AI Slop Design (Fix Guide 2026)* — https://vibecodekit.dev/ai-slop-design
- DEV, *The Purple Gradient Problem* — https://dev.to/james_anderson_h/the-purple-gradient-problem-why-ai-ui-all-looks-alike-and-how-to-fix-it-3j65
- prg.sh, *Why Your AI Keeps Building the Same Purple Gradient Website* — https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website
- Mohit Phogat, *AI Design Slop* (Medium, Aug 2026) — https://mohitphogat.medium.com/ai-design-slop-why-every-ai-built-interface-looks-the-same-and-how-to-fix-it-bf874e0b470c
- BrainGrid, *Design Systems for AI Coding: Stop Getting Purple Gradients* — https://www.braingrid.ai/blog/design-system-optimized-for-ai-coding
- The Adpharm, *Claude Design produces AI slop unless you tell it not to* — https://www.theadpharm.com/insights/claude-design-without-the-ai-slop-look

Local context comes from `research/11-history-culture.md` and `research/08-local-problems.md` in this scratchpad.
