# UI research 02: Designing for older adults and low-literacy users
Context: a community problem-reporting map for ตำบลท่าแร้ง, Phetchaburi. Users are mobile-first, mostly on Android, many aged 60+, and they often open the app from a LINE link.

**How this was researched:** WebFetch was blocked by the egress proxy for nngroup.com, w3.org and frontiersin.org, and the WebSearch budget ran out partway through. Findings marked **[S]** come from search-result snippets of the sources cited. Findings marked **[K]** come from established background knowledge (WCAG, platform guidelines, well-known NN/g findings) and were not re-verified this session. Check the [K] items before quoting exact figures externally.

---

## 1. Findings

### 1.1 Older adults and the web in general
- **[S]** NN/g says older users face "illegible text, tiny targets, startling sounds" and similar problems. Dropdowns and sliders are harder for people with declining motor skills, especially on touch screens. — [NN/g: Usability for Older Adults](https://www.nngroup.com/articles/usability-for-senior-citizens/)
- **[S]** NN/g recommends body text of at least 12 pt on sites that target seniors, and letting users enlarge text. Links and buttons should be large, and links should not be packed tightly together; white space between them reduces mis-clicks. — same source; [NN/g Accessible Web Design guidelines (PDF)](https://media.nngroup.com/media/reports/free/Usability_Guidelines_for_Accessible_Web_Design.pdf)
- **[K]** In NN/g studies, older users complete fewer tasks and are much slower than users aged 21–55. The gap narrowed between the 2002 and 2013 rounds but did not close ([NN/g: Improved, But Still Lacking](https://www.nngroup.com/articles/usability-seniors-improvements/)). Older users also blame themselves for errors, give up sooner, and avoid exploring by trial and error.
- **[S]** Hidden gestures, such as swiping from the screen edge or swiping to reveal actions, are rarely discovered, so users stick to what is visible. Gesture navigation is especially hard for older adults and people with motor impairments. — [NN/g: Mobile navigation patterns](https://www.nngroup.com/articles/mobile-navigation-patterns/)

### 1.2 Standards (W3C WAI / WCAG 2.2)
- **[S]** Many older people need larger text, including inside form controls. Relevant criteria: 1.4.4 Resize Text (AA, text must work at 200%), 1.4.8 Visual Presentation, 1.4.3 Contrast Minimum (4.5:1), 1.4.6 Contrast Enhanced (AAA, 7:1), and 1.4.1 Use of Color. WCAG counts "large text" as 24 px, or 18.67 px bold, and allows 3:1 contrast for it. — [WAI-AGE comparative](https://www.w3.org/WAI/WAI-AGE/comparative.html), [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [SC 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- **[K]** Touch target size: 2.5.8 Target Size Minimum (AA) is 24×24 CSS px, and 2.5.5 Target Size Enhanced (AAA) is 44×44 CSS px. Android Material recommends 48×48 dp and Apple recommends 44×44 pt. Other relevant criteria: 2.2.1 Timing Adjustable, 3.3.1–3.3.4 (error identification, labels, suggestions, error prevention), 3.3.7 Redundant Entry, 3.3.8 Accessible Authentication, and 2.5.7 Dragging Movements (every drag needs a single-tap alternative).

### 1.3 Touch-target studies with older adults
- **[S]** Jin, Plocher & Kiff (2007) tested button size and spacing with older adults. Performance improved as buttons grew up to about 16–19 mm, and the recommended spacing was 3–6 mm. — [Springer](https://link.springer.com/chapter/10.1007/978-3-540-73279-2_104), [ResearchGate](https://www.researchgate.net/publication/225367546_Touch_Screen_User_Interfaces_for_Older_Adults_Button_Size_and_Spacing)
- **[S]** Kobayashi et al. (2011) tested people in their 60s and 70s. Targets of 30 px often caused errors and slowed people down, and larger targets (50–70 px) reduced errors. — cited in [Leitão & Silva, PLoP 2012](https://plopcon.org/proceedings/plop/2012/papers/05-leitao.pdf)
- **[S]** Leitão & Silva (2012) found that smartphone targets smaller than 14 mm hurt older adults' performance. They recommend about 14 mm (roughly 80 CSS px on typical phones) for primary targets, with spacing between them. — [core.ac.uk PDF](https://files01.core.ac.uk/download/pdf/297018872.pdf), [ACM](https://dl.acm.org/doi/abs/10.5555/2821679.2831275)
- **[S]** A smart-home button study found that older users preferred large 20 mm buttons with larger text and realistic (skeuomorphic) icons. — [PMC8872557](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8872557/)
- For scale: 1 CSS px ≈ 0.16 mm on most Android phones (160 dpi baseline), so 48 px ≈ 7.6 mm, 56 px ≈ 9 mm and 64 px ≈ 10 mm.

### 1.4 Thailand and Southeast Asia
- **[S]** ETDA's Thailand Internet User Behavior survey (2022; 46,348 respondents, 4,652 of them older adults) found that Baby Boomers are online about 3 h 21 min a day, far less than younger groups. About 10.8% of older adults use the internet for health purposes. — [MDPI Informatics 11(3):55](https://www.mdpi.com/2227-9709/11/3/55), [ETDA profile (SlideShare)](https://www.slideshare.net/ETDAofficialRegist/thailand-internet-userprofile2017final)
- **[S]** Among Thai older adults, the main barriers to digital health technology are fear of online fraud (29.9%) and lack of devices (15.8%). Other barriers are low technology literacy, physical impairments, cost, weak rural connectivity, and gaps in digital education. — [Frontiers Digital Health 2026](https://www.frontiersin.org/journals/digital-health/articles/10.3389/fdgth.2026.1696118/full), [PubMed 42022502](https://pubmed.ncbi.nlm.nih.gov/42022502/)
- **[S]** In rural Thailand, only 14.0% of older adults could find health information on a smartphone proficiently. — [PMC12529737](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12529737/)
- **[S]** Digital competence among Thai older adults depends on income, education and personal device access. Those who use a wider mix of media score higher on online safety. — [Jantavongso 2022, EJISDC](https://onlinelibrary.wiley.com/doi/full/10.1002/isd2.12207), [Springer: Digital media repertoires, Thai older adults](https://link.springer.com/chapter/10.1007/978-3-032-17272-3_23), [T&F: Digital divide among vulnerable older adults in Thailand](https://www.tandfonline.com/doi/abs/10.1080/08959420.2026.2630920)
- **[S]** A study of older people in Bangkok links health-IT use to perceived ease of use and social support. — [TJONC](https://he02.tci-thaijo.org/index.php/TJONC/article/view/263587)
- **[K]** Background on how Thai older adults use phones:
  - LINE is the main app for this group. They typically use voice messages, stickers, photos, video calls, and forwarded links in family and village groups.
  - Many learn from their children or grandchildren, or from อสม. (village health volunteers) and village heads.
  - Typing Thai on the on-screen keyboard is slow and error-prone, so voice and photo input are preferred.
  - Links opened from LINE load in LINE's in-app browser. That browser has its own permission prompts, and geolocation can fail there.
  - Well-publicised scams using fake government links, such as bogus "ขั้นตอนรับเงิน" pages, have made this group wary of links that ask for personal data or permissions.

### 1.5 Thai script legibility
- **[K]** At the same CSS size, Thai glyphs look smaller than Latin ones: the x-height is small, and vowels and tone marks stack above and below the line. Line spacing below about 1.5 clips or crowds these marks.
- **[K]** Looped fonts (มีหัว, e.g. Sarabun, Noto Sans Thai Looped, IBM Plex Sans Thai Looped) are generally more legible for older and less-literate readers than loopless "modern" fonts (ไม่มีหัว). Loopless fonts are fine for large headings.

### 1.6 Low literacy
- **[K]** Readers with low literacy read word by word and skip long paragraphs. Short sentences, common words, one idea per screen, pictures, and audio or voice alternatives all help (NN/g "Writing for lower-literacy users"; plainlanguage.gov). For older adults, icons without a label are ambiguous. Icon plus text beats either one alone.
- **[K]** Error recovery: older users often don't notice inline errors placed far from the field, and they struggle with messages that blame them. Undo and clear "back" paths reduce anxiety. A confirmation screen with a reference number builds trust ("was it really sent?").

---

## 2. Recommendations (with numbers)

1. **Base font size 18 px for Thai body text** (never below 16 px, including helper text). Use 20–22 px for primary button labels and 24–28 px for screen titles. Set line-height to 1.6–1.7 for Thai. Use `rem` units so Android's system font size scales the UI, and test at 200% (WCAG 1.4.4). Set inputs to at least 16 px so browsers don't auto-zoom.
2. **Font:** a looped Thai font (Sarabun or Noto Sans Thai Looped) for body text, weights 400 and 600. Avoid thin (300) weights and all-caps Latin.
3. **Contrast:** aim for at least 7:1 on body text (AAA 1.4.6), with 4.5:1 as the hard floor, and at least 3:1 for icons, borders and map markers. Never use gray-on-gray placeholder text as a label. Never show status by color alone: pair it with an icon and a word (e.g. ✓ "แก้ไขแล้ว").
4. **Touch targets:** primary actions at least 56 px tall and full width (the ~9 mm+ range; the research sweet spot is 14–19 mm, so use 64 px for the main "แจ้งปัญหา" button). Every other tappable element at least 48×48 px, with at least 8 px between neighbouring targets (the research recommends 3–6 mm). Put the primary CTA at the bottom within thumb reach.
5. **Always use icon + text label.** No icon-only buttons except universally known ones, and even those should have a visible label (e.g. "← กลับ", "📷 ถ่ายรูป"). Category pickers should be large tiles (at least 2 columns × 96 px) showing a picture and a word, such as ถนนชำรุด, ไฟดับ, ขยะ or น้ำท่วม.
6. **No required gestures:** no swipe-to-reveal, long-press, pinch or drag (WCAG 2.5.7). Add on-screen + and − buttons of at least 48 px to the map, plus a big "📍 ตำแหน่งของฉัน" button. To place a pin, let the user tap the map or keep the pin centered and move the map, with a "ใช้ตำแหน่งนี้" button. Avoid dropdowns and sliders; use radio tiles instead.
7. **Keep reporting to 3–4 steps**, one question per screen, with a progress indicator ("ขั้นที่ 2 จาก 4"): (1) choose the problem type, (2) take a photo (optional, skippable), (3) confirm the location, (4) add an optional description or voice note, then submit. Show at most one primary and one secondary action per screen. Ask for phone or name only if it is truly needed, and mark it optional.
8. **Minimise typing:** make text optional and offer voice input (the mic button on Gboard, or a recorded voice note). Use `inputmode="tel"` for phone numbers. Offer quick-pick phrases instead of free text. No passwords or OTPs just to report (WCAG 3.3.8). Remember name and phone in localStorage so returning users don't retype them (3.3.7).
9. **Explain permissions first.** Before calling the browser's location or camera prompt, show a full-screen explainer with a large illustration and one sentence, for example: "เพื่อปักหมุดจุดที่มีปัญหาบนแผนที่ ระบบจะขอดูตำแหน่งของคุณ **เฉพาะตอนแจ้งเรื่อง** — กด 'อนุญาต' ในหน้าต่างถัดไป". Add a mock-up of the Android "Allow" dialog. Always offer a fallback ("ไม่อนุญาตก็ได้ — เลือกจุดบนแผนที่เอง"). For photos, use `<input type="file" accept="image/*" capture="environment">` rather than a getUserMedia camera. It is more reliable inside LINE's in-app browser, and the user can choose gallery or camera.
10. **Handle the LINE in-app browser.** Detect it and, if geolocation fails, show plain-language steps plus an "เปิดใน Chrome" option (e.g. an `openExternalBrowser=1` query on the LINE link). Never dead-end: manual pin placement must always work.
11. **Errors and recovery:** show errors next to the field and in a banner at the top, with an icon, red and a word. Use non-blaming Thai that says what to do: "ยังไม่ได้เลือกประเภทปัญหา — กรุณาแตะเลือก 1 อย่าง", not "Invalid input". Keep entered data when the user goes back or the network drops; save drafts locally and retry uploads automatically. Have a visible "ย้อนกลับ" on every step, and no session timeouts (WCAG 2.2.1).
12. **Confirm before and after submitting.** Show a summary screen with photo, type, map thumbnail and one big "ส่งเรื่อง" button. Then show a success screen with a large ✓, a short reference number (e.g. "TR-0142", 4–6 characters), what happens next and when ("เจ้าหน้าที่ อบต. จะตรวจสอบภายใน 3 วันทำการ"), and one-tap "แชร์ให้ลูกหลาน/ส่งเข้า LINE" and "ดูสถานะเรื่องของฉัน" buttons.
13. **Plain Thai copy:** sentences of 15 words or fewer, everyday words (use "แจ้งเรื่อง", not "ยื่นคำร้อง"; "รูปถ่าย", not "ไฟล์แนบ"), no English jargon ("submit", "upload", "GPS"). Address users politely with "คุณ" or "ท่าน" and end with ค่ะ/ครับ. Aim for primary-school (ป.6) reading level. Add optional read-aloud (Web Speech API, `th-TH`) on key instructions.
14. **Trust cues** to counter fraud fear (the top barrier, 29.9%):
    - Show the official อบต.ท่าแร้ง name and seal only if the app is officially authorised. Otherwise name the real operator honestly.
    - Show a contact phone number and office hours.
    - Say plainly "ไม่ขอเลขบัตรประชาชน ไม่ขอรหัส ไม่ขอเลขบัญชี".
    - Use HTTPS on a stable, readable domain.
    - Show real photos of recently fixed problems as social proof.
    - Never ask for money, ID numbers, or unnecessary personal data.
15. **Performance and layout for rural Android phones:** first screen interactive in under 3 s on 3G/4G. Compress photos on the device to about 1600 px / under 500 KB before upload. Show upload progress in words ("กำลังส่ง… 60%"). Use a single-column layout, no horizontal scroll, and a light theme by default (dark mode optional). Avoid auto-playing sounds and pop-ups.

**Validation:** test with 5 or more residents aged 60+ on their own Android phones, starting from a LINE link. Count task success for "report a broken streetlight" (target at least 80%, completed in under 2 minutes without help) and log every point where they hesitate or ask for help.
