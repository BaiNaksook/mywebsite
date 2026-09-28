# UI-07 — Accessibility & status color research (Tha Raeng community map)

Scope: status palette under colour-vision deficiency (CVD), WCAG 2.2 AA items that matter here, Thai screen-reader realities, Leaflet map accessibility.
Code read (read-only): `tharaeng/src/styles.css`, `components/StatusBadge.tsx`, `MapView.tsx`, `LocationPicker.tsx`, `SignInCard.tsx`, `node_modules/leaflet` (v1.9.4).

> Method note: all colour numbers were computed locally in python3 (script: `scratchpad/cvd.py`). CVD simulation uses the **Machado, Oliveira & Fernandes 2009** matrices at severity 1.0 (dichromacy), applied in linear sRGB; ΔE is **CIEDE2000** on CIELAB (D65). Contrast is the WCAG 2.x relative-luminance formula. Web access (w3.org, leafletjs.com) was blocked by the egress proxy and the search budget was spent, so the sources below are canonical URLs cited from knowledge — not re-fetched in this session. Verify before quoting in public docs.

---

## 1. Status palette under CVD

### 1.1 Current tokens
| Status | Pin fill | Glyph | Badge text / bg |
|---|---|---|---|
| open (รอดำเนินการ) | `--amber #e0a526` | "!" `#4a3200` | `#7a5406` on `#fcf2d6` |
| in_progress | `--blue #3a75b0` | wrench, white | `#1f4f80` on `#e6eff8` |
| resolved | `--ok #327a4f` | check, white | `#22603a` on `#e3f2e7` |

### 1.2 Simulated appearance (Machado sev 1.0)
| | open | in_progress | resolved |
|---|---|---|---|
| normal | #e0a526 | #3a75b0 | #327a4f |
| protan | #bca600 | #5b78b3 | #7a714c |
| deutan | #cab52d | #4b6daf | #706a52 |
| tritan | #f4948e | #00838a | #1b796f |

### 1.3 Pairwise ΔE2000 between statuses (current)
| Pair | normal | protan | deutan | tritan |
|---|---|---|---|---|
| open–in_progress | 53.1 | 54.5 | 59.0 | 49.6 |
| open–resolved | 41.2 | **24.7** | 31.7 | 53.1 |
| in_progress–resolved | 37.5 | 37.4 | 34.9 | **8.2** |

Rule of thumb: ΔE00 > ~20 is easily told apart at pin size; 10–20 is "noticeable side by side", < 10 is unreliable for small map glyphs.

Findings:
- **Protan/deutan (≈8 % of Thai men, ≈0.5 % women; red–green is by far the most common CVD):** OK. Amber becomes olive-yellow, green becomes khaki-grey, but lightness (L* 71.5 vs 45.9) keeps open vs resolved apart (ΔE 24.7 / 31.7). Blue stays blue.
- **Tritan (rare, ~0.01 %):** blue and green both collapse to teal — **ΔE 8.2, effectively the same colour.** Only the glyph (wrench vs check) separates them.
- **Greyscale / low vision / sunlight glare:** in_progress L* 47.9 vs resolved L* 45.9 — nearly identical lightness. On a phone outdoors in Thai midday sun this is the realistic failure mode, more than tritanopia.
- The glyphs are the saving grace: WCAG 1.4.1 (Use of Color) is **already met** because each status has a distinct shape glyph (!, wrench, check) and a text label in badges / marker `title`. Keep them — never ship colour-only dots (e.g. in clustering or the stats bar).

### 1.4 Against OSM standard tile colours
Worst-case (smallest) ΔE00 from each pin fill to common OSM Carto fills (land #f2efe9, residential #e0dfdf, farmland #eef0d5, grass #cdebb0, forest #add19e, water #aad3df, building #d9d0c9, primary road #fcd6a4, trunk #f9b29c, secondary #f7fabf):

| Pin | normal | protan | deutan | tritan |
|---|---|---|---|---|
| amber | 16.5 (primary road) | 17.5 (forest) | 15.0 (trunk) | **6.4 (trunk)** |
| blue | 31.6 (water) | 29.5 | 31.7 | 27.1 |
| green | 29.8 (forest) | 24.2 (trunk) | 30.0 | 30.5 |

Contrast of pin fill vs tile (WCAG 1.4.11 wants 3:1 for graphics needed to understand content):
- amber: **1.24–2.02:1 against every tile** (worst: trunk road 1.24, forest 1.29, water 1.37). White pin stroke vs amber is only 2.19:1.
- blue: 2.73 (trunk) – 4.45; green: 2.95 (trunk) – 4.81.

The amber pin is only rescued by the existing `drop-shadow(0 0 0.6px rgba(30,25,10,.9))` dark hairline — keep it, and strengthen it (see 1.6). Amber is the most important status ("needs attention") and is the least visible on the map; it sits right on top of orange/yellow OSM road colours in the rural Tha Raeng area.

### 1.5 Proposed palette (keeps warm cream/green branding)
Candidates tested (all with amber unchanged):

| Set | in_progress | resolved | prog–done ΔE tritan | open–done ΔE protan | L* prog / done |
|---|---|---|---|---|---|
| current | #3a75b0 | #327a4f | 8.2 | 24.7 | 47.9 / 45.9 |
| A darker blue + lighter green | #2c5aa0 | #3d8b55 | 14.4 | 18.6 ✗ | 38.5 / 52.0 |
| B indigo | #4b58b0 | #2f7a4a | 12.3 | 24.0 | 40.6 / 45.7 |
| F indigo | #3f4fa6 | #2e7d4f | 14.3 | 23.5 | 36.7 / 46.7 |
| E deep violet | #4a44a0 | #2e7d4f | 18.5 | 23.5 | 34.2 / 46.7 |
| **G (recommended)** | **#5b4aa6** | **#2a7447** | **19.5** | **26.3** | 37.6 / 43.4 |

**Recommendation: G** — in_progress becomes a muted indigo‑violet ("คราม" indigo reads naturally as a Thai craft/indigo-dye colour and sits well next to cream + forest green); resolved gets a touch deeper so it is clearly distinct from the brand `--green #437a50` (brand vs status confusion is itself a problem: a "resolved" pin currently looks like a brand button).

Set G full numbers:
| Pair ΔE00 | normal | protan | deutan | tritan |
|---|---|---|---|---|
| open–in_progress | 65.6 | 64.2 | 66.6 | 46.4 |
| open–resolved | 42.8 | 26.3 | 33.5 | 54.4 |
| in_progress–resolved | 43.8 | 42.9 | 38.5 | 19.5 (was 8.2) |

Min ΔE to OSM tiles: in_progress ≥ 39.5 in all four views (was 27.1), resolved ≥ 26.8 (was 24.2).
Glyph contrast: white on #5b4aa6 = **7.06:1**, white on #2a7447 = **5.69:1** (was 4.83 / 5.21). Dark "!" `#4a3200` on amber = 5.48:1 (keep).

If the team refuses violet: fall back to **F** (`#3f4fa6` indigo‑blue, `#2e7d4f`), tritan ΔE 14.3, still a clear improvement and "blue enough" for people who expect blue = working.

### 1.6 Concrete CSS changes
```css
:root{
  /* in progress: indigo */
  --blue: #5b4aa6;       /* rename later to --prog */
  --blue-ink: #3a3380;   /* 9.05:1 on --blue-50 */
  --blue-50: #ecebf7;
  /* resolved */
  --ok: #2a7447;
  --ok-ink: #1f5d36;     /* 6.77:1 on --ok-50 */
  /* amber text slightly darker for small 0.76rem badges */
  --amber-ink: #6e4b00;  /* 7.05:1 on --amber-50 (was 6.07) */
}
/* amber pin: give the white stroke a dark outer ring so the shape reaches ≥3:1 on any tile */
.pin--open .pin__shape path { stroke: #fff; }
.pin { filter: drop-shadow(0 0 0.8px rgba(30,25,10,1)) drop-shadow(0 0 0.8px rgba(30,25,10,.9)) drop-shadow(0 2px 2px rgba(40,30,10,.3)); }
/* or better: draw a second path under the shape with stroke:#4a3200; stroke-width:4.5 */
```
Keep glyphs. Also give the three statuses **different pin silhouettes or a lightness step** if clustering is added later (cluster bubbles must show counts per status with glyphs, not a single blended colour).

### 1.7 Other contrast checks in styles.css
| Item | Ratio | Verdict |
|---|---|---|
| Badge text current: amber-ink/amber-50, blue-ink/blue-50, ok-ink/ok-50 | 6.07 / 7.26 / 6.47 | AA pass (4.5) |
| `--ink` on cream | 11.76 | pass |
| `--muted #5f685c` on cream | 5.37 | pass (don't lighten further) |
| white on `--green #437a50` (primary btn) | 5.07 | pass |
| white on `--danger` | 5.28 | pass |
| `--control-border #948b73` vs cream / white | 3.14 / 3.39 | pass 1.4.11 (just) |
| **`.cat-option:has(input:focus-visible){outline:3px solid var(--amber)}`** | **2.03 vs cream, 2.19 vs white** | **fails 1.4.11** for the focus indicator — change to `var(--ink)` like the global `:focus-visible` |
| Badge tint backgrounds vs cream | 1.03–1.08 | fine: badge boundary isn't needed, text carries meaning |

---

## 2. WCAG 2.2 AA — items relevant to this app

New in 2.2 at A/AA: 2.4.11 Focus Not Obscured (Minimum), 2.5.7 Dragging Movements, 2.5.8 Target Size (Minimum), 3.2.6 Consistent Help (A), 3.3.7 Redundant Entry (A), 3.3.8 Accessible Authentication (Minimum). 2.4.13 Focus Appearance is **AAA** (not required, but a good target). 4.1.1 Parsing was removed.

| SC | Requirement | Status in code | Action |
|---|---|---|---|
| **2.5.8 Target Size (Min)** | Pointer targets ≥ 24×24 CSS px, or 24px spacing circle not overlapping others; exceptions: inline text, equivalent control, UA default, essential (map pins are arguably not "essential" since the list offers an equivalent). | Buttons 44–58px, zoom 44px, pins 36×46 ✓. | Overlapping pins in dense clusters fail the spacing test — the **report list is the "equivalent"** exception, so keep list ⇄ map parity. Check small chips/filters and the attribution links (11px text; inline exception probably applies). Popup close button in Leaflet is 24×24 default — enlarge to 44. |
| **2.5.7 Dragging Movements** | Any drag action needs a single‑pointer alternative. | LocationPicker: marker `draggable:true` **but** also tap‑to‑place (`map.on('click')`) and "ปักหมุดที่กึ่งกลางแผนที่" button + GPS ✓. Map panning is exempt (panning via drag is… not exempt per se, but zoom buttons + list + "home" button + keyboard arrows provide alternatives). | Keep the centre‑pin button prominent; announce the chosen coordinates/address in a live region after placement. |
| **2.4.11 Focus Not Obscured (Min)** | Focused element not entirely hidden by author content (sticky header 60px, bottom sheets, map overlays). | `scroll-margin-top` exists on `.flow/.page` only. | Add `html{scroll-padding-top:calc(var(--topbar-h) + 8px); scroll-padding-bottom:<sheet height>}` so any focused control scrolls clear of the sticky top bar and any bottom sheet over the map. |
| 2.4.7 Focus Visible / 2.4.13 (AAA) | Visible indicator; AAA wants ≥2px perimeter at 3:1 change. | Global `:focus-visible 3px solid ink, offset 2px` ✓ (meets even 2.4.13). | Fix the amber `.cat-option` outline (2.03:1). Leaflet sets `outline:none`-ish styles on `.leaflet-container`; verify marker focus ring is visible — add `.leaflet-marker-icon:focus-visible{outline:3px solid var(--ink);outline-offset:2px;border-radius:50%}`. |
| **3.3.8 Accessible Authentication (Min)** | No cognitive function test (remembering passwords, transcribing codes, puzzles) unless alternative/mechanism exists. | Google OAuth only ✓ (password managers/passkeys handled by Google). | Don't add CAPTCHAs for anti‑spam reporting; if needed use invisible/risk‑based (Turnstile) or object‑recognition only. If OTP by SMS is ever added, allow paste and `autocomplete="one-time-code"`. |
| 3.3.7 Redundant Entry (A) | Don't make users re‑enter info in the same process. | Report flow is 3 steps. | Preserve category/photo/location when going back; prefill contact/name from account. |
| 3.2.6 Consistent Help (A) | Help link in same relative place. | — | Put "เกี่ยวกับ/ติดต่อ อบต." in the same place (header or footer) on every page. |
| 1.4.1 Use of Color | Not colour alone. | glyphs + labels ✓ | Keep. |
| 1.4.11 Non‑text Contrast | 3:1 for UI and meaningful graphics. | amber pin 1.24–2.02 vs tiles ✗ (mitigated by hairline) | See 1.6. |
| 1.4.10 Reflow / 1.4.4 Resize | 320px, 200 % text. | Mobile‑first ✓ | Thai stacked vowels/tone marks need `line-height ≥1.5` for body (badge uses 1.4 — OK for one line but clips at 200 % zoom on some fonts; test Mitr headings). |
| 2.1.1 Keyboard / 2.1.2 No trap | Map must not trap focus. | Leaflet container is `tabindex=0`; markers focusable ✓ | Add skip link (sec. 4). |
| 3.1.1 Language of Page | `lang` set. | `<html lang="th">` ✓ | Mark English fragments (e.g. "Google", "OpenStreetMap") with `lang="en"` only for longer phrases; brand names alone are fine. |
| 4.1.3 Status Messages | Announce async results. | — | "ส่งรายงานแล้ว", "กำลังค้นหาตำแหน่ง…", filter result counts → `role="status"` / `aria-live="polite"`. |

---

## 3. Thai screen‑reader realities

(From practitioner knowledge; not re‑verified live in this session.)

- **Who uses what:** In Thailand, blind users are overwhelmingly on **Android + TalkBack** (price), with Google's Thai TTS voice (Speech Services by Google, voice `th-TH`). iPhone users use **VoiceOver** with the built‑in Thai voices (Kanya; newer "enhanced/premium" voices). Desktop: **NVDA** with a Thai SAPI voice (e.g. Vaja from NECTEC, or Microsoft "Pattara"/"Achara" OneCore voices); eSpeak‑NG's Thai is poor. The Thai Association of the Blind (TAB) and NECTEC run training — test with at least TalkBack + Google TTS Thai and VoiceOver iOS.
- **No spaces between Thai words.** Screen readers read continuous Thai fine when the text node is Thai, but **word‑by‑word navigation relies on the platform's dictionary segmenter** (ICU on Android/Chrome, CoreFoundation on iOS). Rare words, place names (ท่าแร้ง, บ้านแหลม) and abbreviations may be split oddly. Mitigation: nothing in markup is needed for full-sentence reading; avoid inserting zero‑width spaces (ZWSP) to "help" layout — some TTS engines read them as pauses or break words.
- **Language switching:** VoiceOver and TalkBack auto‑detect script per text run fairly well, but only if a Thai voice is installed. `lang="th"` on `<html>` is required so English‑default devices choose the Thai voice; aria-labels inherit the element's language — so **Thai aria-labels are correct and preferred** (the current `aria-label="แผนที่ปัญหาในตำบลท่าแร้ง"`, zoom titles "ซูมเข้า/ซูมออก" are right).
- **Punctuation & symbols:** The marker title uses `"… — สถานะ"`. Google Thai TTS typically pauses or says nothing for an em dash; VoiceOver with high punctuation verbosity may read "ขีดยาว". Prefer a comma or Thai word: `"${title}, สถานะ: ${label}"`, or `"${title} (${label})"`. Avoid "!" glyph text in labels, emoji, and Thai abbreviations with "ฯ"/"." (อบต. is usually read as letters "ออ-บอ-ตอ" — acceptable; ต. / อ. short forms may be read oddly — write "ตำบล", "อำเภอ" in accessible names).
- **Numbers & dates:** Use Arabic digits (TTS reads them in Thai); Thai digits (๑๒๓) are read by Google TTS but less reliably by NVDA voices. Buddhist‑era dates: render with `Intl.DateTimeFormat('th-TH', …)` and put a machine date in `<time datetime>`; relative times ("3 วันที่แล้ว") read well.
- **Icons:** keep `aria-hidden` on SVG glyphs (done) and ensure the accessible name always contains the status word.
- **Tone marks / combining characters in `aria-label`:** fine; just ensure strings are NFC‑normalised (a copy‑pasted "ำ" as "ํ + า" sometimes breaks TTS). Normalise user‑generated report titles with `.normalize('NFC')` before display.
- **TalkBack + Leaflet:** TalkBack explore‑by‑touch on a map tile layer announces nothing useful and swipe navigation will step through every marker in DOM order (potentially hundreds). This is why the list view must be the primary non‑visual route (sec. 4).

---

## 4. Leaflet accessibility

What Leaflet 1.9.4 already does (verified in `node_modules/leaflet/src/layer/marker/Marker.js` L226–238):
- `title` option → `title` attribute on the icon element (for a `divIcon` this becomes the accessible name).
- `alt` is only applied when the icon element is an `<img>` — **`alt` does nothing for the app's `divIcon` pins.** The accessible name comes solely from `title` (weakly supported on mobile; `title` is not always exposed as name by TalkBack/VoiceOver on non‑focusable content, but on a `role=button` element Chrome/Safari do use it as name fallback).
- `keyboard:true` (default) → `tabindex="0"` and `role="button"` on the marker.
- Map container gets `tabindex=0`; the Keyboard handler supports arrows (pan) and +/- (zoom) when the map has focus.
- No built‑in Enter/Space activation on markers → the app's custom `keypress` Enter handler is needed.

Concrete changes for `MapView.tsx` / `LocationPicker.tsx`:
1. **Explicit accessible name on the pin element**: after creating the marker, `el.setAttribute('aria-label', title)` (and update it in the "else" branch — currently only `title` is updated, so a status change leaves stale name for AT that cached it). Drop `alt` or keep as harmless.
2. **Space activation** for `role=button`: listen to `keydown` on `marker.getElement()` for `Enter` and `' '` (preventDefault on Space to stop page scroll); `keypress` is deprecated and does not fire for Space in all browsers.
3. **Selected state**: set `aria-pressed="true"` (or `aria-current="true"`) on the selected pin so SR users know which report the detail panel shows.
4. **Skip link / bypass (2.4.1)**: place before the map `<a class="skip" href="#report-list">ข้ามแผนที่ ไปที่รายการปัญหา</a>` (visually hidden until focused). Also consider `aria-describedby` on the map region: "ใช้ปุ่มลูกศรเพื่อเลื่อนแผนที่ ปุ่ม + / − เพื่อซูม หรือดูรายการปัญหาด้านล่าง".
5. **Marker tab order explosion**: with many reports, dozens of tab stops inside the map block keyboard users. Options: (a) set `keyboard:false` on markers and make the list the keyboard path, with the map only reacting to list selection (current `focus` effect already flies to the pin) — simplest and recommended for mobile; or (b) roving tabindex: only the selected/first visible marker `tabindex=0`, arrow keys move between markers (more work).
6. **Announce map changes**: after list selection flies the map, announce "แสดง <title> บนแผนที่" in a polite live region; after filters, "พบ 12 รายการ".
7. **Popups/detail**: when a pin opens the detail sheet, move focus to its heading and return focus to the pin/list item on close.
8. **LocationPicker**: the draggable marker gets `role=button` but dragging is mouse/touch only; keyboard users rely on "ปักหมุดที่กึ่งกลางแผนที่" + arrow‑key panning of the focused map — good. Add live‑region text after placement ("ปักหมุดแล้ว ใกล้ <nearest place/road>") because a blind user cannot verify the position visually; a text address field or landmark select as an alternative location input is the real accessible path.
9. **Attribution**: keep © OpenStreetMap links reachable and ≥ 24px tall target area (or rely on inline exception).
10. **Reduced motion**: `flyTo` duration 0.6 — honour `prefers-reduced-motion` with `setView` (moveMap likely already branches — verify).

Useful plugins/references: Leaflet accessibility guide; `Leaflet.a11y`‑style patterns; `leaflet.markercluster` has keyboard support for clusters but its cluster bubbles need custom `aria-label` ("12 รายการ: รอ 5, กำลังทำ 4, เสร็จ 3").

---

## 5. Priority list (do in this order)
1. Fix `.cat-option` focus outline → `var(--ink)` (2.03:1 fail).
2. Add skip link to list + `aria-label` on pins + Space key + `aria-pressed` on selected pin.
3. Swap status palette to set **G** (`#5b4aa6` / `#2a7447`, inks `#3a3380` / `#1f5d36`, amber‑ink `#6e4b00`).
4. Strengthen amber pin outline (dark outer ring) for 3:1 against OSM tiles.
5. `scroll-padding-top` for sticky header (2.4.11); live regions for submit/filter/locate (4.1.3).
6. Replace "—" in marker names with ", สถานะ: "; NFC‑normalise user text.
7. Test matrix: Android Chrome + TalkBack (Google TTS Thai), iOS Safari + VoiceOver (Thai voice), NVDA + Firefox; sunlight/greyscale check of pins.

## Sources (canonical; not re‑fetched this session — proxy blocked)
- Machado, Oliveira, Fernandes (2009), "A Physiologically-based Model for Simulation of Color Vision Deficiency", IEEE TVCG 15(6) — https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html
- Sharma, Wu, Dalal (2005), "The CIEDE2000 Color-Difference Formula" — https://hajim.rochester.edu/ece/sites/gsharma/ciede2000/
- WCAG 2.2 — https://www.w3.org/TR/WCAG22/ ; What's new — https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/
- Understanding 2.5.8 Target Size (Minimum) — https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- Understanding 2.5.7 Dragging Movements — https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html
- Understanding 2.4.11 Focus Not Obscured — https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html
- Understanding 2.4.13 Focus Appearance — https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html
- Understanding 3.3.8 Accessible Authentication — https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html
- Understanding 1.4.11 Non-text Contrast — https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
- Leaflet accessibility guide — https://leafletjs.com/examples/accessibility/ ; Marker source (local) `node_modules/leaflet/src/layer/marker/Marker.js` v1.9.4
- OSM Carto colour definitions — https://github.com/gravitystorm/openstreetmap-carto/blob/master/style/landcover.mss and `roads.mss`
- Google TalkBack help — https://support.google.com/accessibility/android/answer/6283677 ; Apple VoiceOver languages — https://support.apple.com/guide/iphone/change-voiceover-settings-iph3e2e2329/ios
- NECTEC Vaja Thai TTS — https://www.nectec.or.th/ (Vaja); Thai Association of the Blind — https://www.tab.or.th/
