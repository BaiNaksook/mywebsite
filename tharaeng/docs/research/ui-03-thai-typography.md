# UI-03: Thai web typography, research and recommendations

Scope: `tharaeng/` (Vite + React). Current setup, taken from `tharaeng/src/main.tsx` and `tharaeng/src/styles.css`:
- Body: IBM Plex Sans Thai Looped 400/500/600 (thai + latin subsets). Fallbacks: Noto Sans Thai, Sarabun, system-ui.
- Headings: Mitr 500 (thai + latin). h1-h3 use line-height 1.35.
- `body { font-size: 16px; line-height: 1.6 }` and `<html lang="th">` (good).
- Weights in use: 400 x2, 500 x8, 600 x9. There is no letter-spacing anywhere (good).
- Font sizes are ad hoc: 22 distinct values from 0.72rem to 1.6rem, including 0.72, 0.76, 0.8, 0.82, 0.84, 0.85, 0.86, 0.88 and 0.9rem.
- Tight spots: `.stat__value` line-height 1.1, `.brand__name` and `.btn` 1.2, `.brand__sub` 0.72rem (11.5px), `.badge--sm` 0.76rem (12.2px).

> Research note: this sandbox's egress proxy blocked most WebFetch targets (typotheque.com, w3.org, MDN, thaigraph.com, standard.dga.or.th, fontpad.co.uk), and the web-search budget ran out partway through. Claims marked **[src]** come from the search results cited under Sources. Claims marked **[practice]** are established browser/typography behaviour from background knowledge, not re-verified this session. Brand font claims I could not verify are labelled as unverified.

---

## 1. Looped vs loopless: keep looped for body

- **Evidence [src]:** Typotheque ran a perceptual study with Chulalongkorn University in Bangkok (Feb 2024, >180 native readers). It used three experiments: decoding/visual acuity, continuous reading with eye-tracking, and an opinion survey.
  - Looped Thai gave faster and more accurate reading, and faster paragraph reading overall.
  - The effect was **especially strong among older readers**, who preferred looped text in every condition and struggled more with the loopless version.
  - Younger readers read loopless text somewhat more efficiently.
  - Readers rated looped text as more readable, especially for longer texts.
- **Government baseline [src]:** Sarabun, a looped humanist sans that grew out of TH Sarabun New, is the de facto standard for Thai government documents. Reports say DGA-aligned contracts still specify it.
- **Industry pattern [practice]:** Loopless faces (Kanit, Prompt, Anuphan, LINE Seed Sans TH, most bank and fintech apps) dominate branding, headlines, and UI chrome, where text is short and the "modern" signal matters. Looped faces dominate long reading and official or trusted contexts.

**Verdict for a community app with older users: keep a looped body face.** IBM Plex Sans Thai Looped is a strong choice:
- It has a large Thai x-height and open counters.
- It has real Latin harmony, since Plex Sans is its Latin partner.
- Its fontsource files are small (see section 7).
- It has a loopless sibling (IBM Plex Sans Thai) if you ever want a superfamily heading.

Alternatives considered for body:

| Font | Style | Notes |
|---|---|---|
| **IBM Plex Sans Thai Looped** (current) | looped, humanist-grotesk | Large x-height and crisp at 14-18px. Only 7 static weights and no variable font. **Keep.** |
| Sarabun | looped, humanist | The "official" feel, and it matches DGA-style gov sites. Slightly condensed and smaller-looking at equal px, so it needs about 1px more. A good fallback, already in the stack. |
| Noto Sans Thai Looped | looped | A neutral workhorse and a good fallback. More generic in character. |
| Anuphan / Noto Sans Thai / Kanit / Prompt | loopless | Fine for UI labels. Not recommended for paragraphs given the age profile. |

## 2. Headings: Mitr, and how to avoid a "generic" look

Mitr (Cadson Demak) is rounded, friendly, and fits the cream/green community look well. Its risk is ubiquity: Mitr, Kanit, and Prompt are the three most-used Google Fonts Thai display faces. Used with defaults, they read as a template.

Options, in order of recommendation:
1. **Keep Mitr, but set it with craft** (cheapest, and it keeps the identity):
   - Use one weight (500) for h1-h3. Separate the levels by size and colour (`--ink` for h1, `--green-dark` for section h2), not by weight.
   - Use `text-wrap: balance` on h1-h3 **[practice]**. It works with Thai because it relies on the browser's dictionary break opportunities, and it avoids orphan syllables on narrow phones.
   - Set a heading line-height of 1.3 (never below 1.25 for Thai, see section 3).
   - Pair it with a quiet overline or kicker in the *body* face (Plex Looped 600, 0.875rem, `--green`) instead of an uppercase tracked English eyebrow. Tracking Thai looks broken, and Thai has no case.
   - Use Mitr only for h1-h3, the brand name, and big stat numbers. Do not use it for buttons, badges, or tab labels, which should stay Plex 600. That restraint is what makes a display face look intentional.
2. **Superfamily heading:** IBM Plex Sans Thai (loopless) 600 for headings and Plex Looped for body. This is very coherent and "editorial", but less warm than Mitr.
3. **Anuphan 500-600** (Cadson Demak, loopless, variable): a fresher, less over-used alternative. Worth an A/B look if Mitr starts to feel dated.

Avoid Chakra Petch and Bai Jamjuree for this product: they are squared and techno, which is wrong for a warm community tone. Also avoid Kanit and Prompt: they are over-used and would not improve on Mitr.

Brand references, *unverified this session* **[practice]**:
- LINE uses its own LINE Seed Sans TH (loopless, free licence).
- Many Thai fintech and media brands use custom or loopless faces for UI and headlines.
- Gov and education sites lean on Sarabun or TH Sarabun New.

I could not fetch the DGA Website Standard 3.0 PDF to quote exact font and size clauses. It is published at standard.dga.or.th (see Sources).

## 3. Size scale and line-height

Why Thai needs more leading:
- Thai stacks up to three levels: consonant, above-vowel, and tone mark (e.g. `กี้`, `ปั๊ม`).
- Below-vowels (`ุ ู`) and the descenders of `ฎ ฏ ญ ฐ` go under the baseline.
- **[src]** Recommended body line-height is at least 1.55, about 10-15% more than Latin. Display text is fine at 1.1-1.25 only if the font's metrics allow it; some guides suggest 1.8 for dense mobile body text.
- **[src]** Never use negative letter-spacing on Thai, because it pulls marks off their consonants.
- **[practice]** Older readers benefit from 17-18px body text. Keep nothing Thai below about 13px.

Recommended tokens (mobile-first, ratio about 1.2; replaces the 22 ad hoc sizes):

```css
:root {
  --fs-xs: 0.8125rem;  /* 13px  - legal/attribution only, never primary info */
  --fs-sm: 0.875rem;   /* 14px  - meta, badges, helper text */
  --fs-md: 1rem;       /* 16px  - UI controls, buttons */
  --fs-body: 1.0625rem;/* 17px  - reading text (posts, descriptions) */
  --fs-lg: 1.1875rem;  /* 19px  - h3 / card titles */
  --fs-xl: 1.4375rem;  /* 23px  - h2 */
  --fs-2xl: 1.75rem;   /* 28px  - h1 / stat value */

  --lh-body: 1.65;     /* paragraphs */
  --lh-ui: 1.45;       /* buttons, badges, single-line labels */
  --lh-head: 1.3;      /* Mitr headings */
}
```

- Keep `body` at 16px so UI density is unchanged. Apply `--fs-body` / `--lh-body` to long-form content (post bodies, descriptions, `p` inside cards).
- **Raise** `.brand__sub` (0.72rem) and `.badge--sm` (0.76rem) to at least `--fs-sm` (14px). If a badge must be small, 13px at weight 600 is the floor.
- **Loosen** `.stat__value` (1.1), `.brand__name` and `.btn` (1.2) to at least 1.25-1.3 wherever the content can contain Thai. Otherwise tone marks on `ปั๊ม`/`ที่` and below-vowels on `ดู` clip or collide when the text wraps. A digits-only stat can stay at 1.1.
- Measure: cap paragraphs at about 36-40em (~60-70 Thai characters per line). On mobile this is automatic.

## 4. Weights and letter-spacing

- Body text uses 400, and emphasis and UI labels use 600. At 14-16px, **Plex 500 is barely distinguishable from 400**, and it is used in 8 rules. Consolidate: body 400, strong/labels/buttons 600, and drop the Plex 500 files, which saves 2 requests and about 33 KB.
- Headings use Mitr 500 only.
- `letter-spacing`: 0 everywhere for Thai. You may add +0.01em on Mitr at 28px or larger, but never go negative. Letter-spacing on mixed Thai+Latin tracks the Thai too, so don't add it to "look designed".
- Consider dropping `-webkit-font-smoothing: antialiased` on body **[practice]**. On macOS it thins strokes, and thin Thai strokes (hairline tone marks) lose contrast for older eyes. Keep it only on light-on-dark buttons if desired.

## 5. Numerals

- Use Arabic digits (0-9) in UI, counts, dates, and phone numbers. Thai digits (๐-๙) are legal and traditional but slower for most readers. Reserve them for decorative or official-document contexts.
- Use `font-variant-numeric: tabular-nums` for counters, stats, and times in lists so they do not jitter as they update **[practice]**. Check that the fontsource subset keeps `tnum`, since IBM Plex includes it. Mitr digits are proportional, so for stat values either accept that or set numbers in Plex 600.
- Format with `Intl.NumberFormat('th-TH')` and `Intl.DateTimeFormat('th-TH', {...})`. The Buddhist-era year (พ.ศ.) is the default for `th-TH`. Use `th-TH-u-ca-gregory` if you want ค.ศ.

## 6. Line breaking and `lang`

**[practice]** Thai has no spaces between words. Browsers find break opportunities with dictionary-based segmentation (ICU in Chromium and WebKit, and Firefox has its own). `lang="th"` (already set) makes sure the Thai rules and fonts are selected.

- **Do not use `word-break: break-all`** on Thai. It breaks anywhere, including between a consonant and its vowel.
- `word-break: break-word` (used twice in styles.css, lines ~839 and ~844) is deprecated. Replace it with `overflow-wrap: anywhere` (or `break-word`), which only kicks in for unbreakable long strings such as URLs or LINE IDs.
- `word-break: keep-all` and `auto-phrase` target CJK and do not help Thai.
- `hyphens` does not apply to Thai.
- Avoid `text-align: justify` for Thai. It can only stretch the rare spaces, which gives rivers and gaps.
- Dictionaries miss proper nouns, place names, and slang, so names can split badly (e.g. community or village names). Remedies:
  - Wrap them in `<span class="nobr">` with `white-space: nowrap`, for short names.
  - Insert `<wbr>` or U+200B (ZWSP) at intended points in user-generated display names.
  - Use `Intl.Segmenter('th', { granularity: 'word' })`, which is supported in all current browsers, to split a string into words. Use it to truncate at word boundaries ("…"), to count words, or to insert `<wbr>`. Don't run it on every paragraph at render time. Use it for titles, names, and truncation only.
- `text-wrap: balance` for headings and `text-wrap: pretty` for short paragraphs are both safe with Thai.
- Mark English fragments with `lang="en"` so screen readers switch voice. Screen readers read Thai better when `lang="th"` is correct.
- Underlines: Thai below-vowels collide with default underlines. Add `text-underline-offset: 0.3em; text-decoration-skip-ink: auto;` to links. styles.css line ~332 underlines a link.

## 7. Performance

Current woff2 sizes, measured in `node_modules/@fontsource`:

| File | Bytes |
|---|---|
| plex-looped thai 400 / 500 / 600 | 13.7K / 14.1K / 14.2K |
| plex-looped latin 400 / 500 / 600 | 17.8K / 18.7K / 19.0K |
| mitr thai 500 / latin 500 | 14.1K / 22.2K |

- Total is about 134 KB if every file loads. Fontsource `unicode-range` means only the subsets a page actually uses are downloaded. This is already lean: Thai subsets are small because the script is only about 90 codepoints.
- Wins:
  1. Drop Plex 500 (thai + latin), saving about 33 KB and 2 requests.
  2. `<link rel="preload" as="font" type="font/woff2" crossorigin>` **only** the Plex thai-400 file, which is the first-paint text.
  3. Fontsource defaults to `font-display: swap`. To cut layout shift when the fallback is Thonburi (iOS) or Noto Sans Thai (Android), add a fallback `@font-face` with `size-adjust`/`ascent-override` tuned to Plex Looped (optional, measure first).
  4. If the Mitr Latin subset is never used in headings (the headings are Thai), consider removing `mitr/latin-500.css`. Digits and punctuation come from the latin subset, though, so check stat numbers before removing it.
- Don't switch to Google Fonts CDN. Self-hosting is faster (no extra origin) and privacy-friendly.

## 8. Concrete recommendation summary

| Item | Now | Recommend |
|---|---|---|
| Body font | IBM Plex Sans Thai Looped | **Keep** (looped suits older readers, backed by the Typotheque/Chula study) |
| Heading font | Mitr 500 | **Keep**, restricted to h1-h3/brand/stats, with balance wrapping. Optional A/B with Anuphan or Plex Sans Thai. |
| Body size | 16px | 16px UI, **17px reading text** |
| Min size | 11.5px | **14px** (13px floor for badges/legal) |
| Line-height | 1.6 body, 1.1-1.2 in places | **1.65** reading, 1.45 UI, **1.3** headings, 1.25 minimum wherever Thai appears |
| Weights | 400/500/600 + Mitr 500 | **400/600** + Mitr 500 |
| Letter-spacing | none | keep none, never negative |
| Scale | 22 ad hoc sizes | 7 tokens (section 3) |
| Breaking | `word-break: break-word` | `overflow-wrap: anywhere`, `text-wrap: balance` on headings, `Intl.Segmenter` for truncation |
| Numerals | default | Arabic digits, `tabular-nums` for counters |

Starter CSS:

```css
body { font-size: 1rem; line-height: 1.6; }
.prose, .post__body, .card p { font-size: var(--fs-body); line-height: var(--lh-body); max-width: 38em; }
h1, h2, h3 { font-family: var(--font-head); font-weight: 500; line-height: var(--lh-head); text-wrap: balance; letter-spacing: 0; }
h1 { font-size: var(--fs-2xl); }
h2 { font-size: var(--fs-xl); color: var(--green-dark); }
h3 { font-size: var(--fs-lg); }
.kicker { font-family: var(--font); font-weight: 600; font-size: var(--fs-sm); color: var(--green); }
.num { font-variant-numeric: tabular-nums; }
a { text-underline-offset: 0.3em; text-decoration-skip-ink: auto; }
.wrap-any { overflow-wrap: anywhere; }
.nobr { white-space: nowrap; }
```

## Sources

- Typotheque, "The Contemporary Effects of Thai Loops" (perceptual study, Chulalongkorn, 2024): https://www.typotheque.com/research/effects-of-loops-in-thai
- ATypI presentation of the same study: https://atypi.org/presentation/the-contemporary-effects-of-thai-loops-a-perceptual-study/
- Typotheque, "New Thai Type: Bridging Tradition and Modernity": https://www.typotheque.com/blog/new-thai-type
- Granshan, Typotheque's typographic journey in Thailand: https://granshan.com/insights/bridging-cultures-through-letters-typotheques-typographic-journey-in-thailand
- The Fontpad, "On loops and Latinisation" and "Thai press typography": https://www.fontpad.co.uk/loops-and-latinisation/ , https://www.fontpad.co.uk/thai-press-typography/
- ThaiGraph, "The Loopless Revolution" and FAQ (line-height at least 1.55, no negative tracking, Sarabun/DGA): https://thaigraph.com/learn/typography/loopless-revolution/ , https://thaigraph.com/faq/ , https://thaigraph.com/fonts/sarabun/
- Sarabun (Cadson Demak): https://github.com/cadsondemak/Sarabun , https://fonts.google.com/specimen/Sarabun
- National Fonts (Thai government fonts): https://en.wikipedia.org/wiki/National_Fonts
- DGA Government Website Standard 3.0 / 2.0: https://www.dga.or.th/policy-standard/standard/dga-007/dga-008/ , https://standard.dga.or.th/category/standard/
- W3C Thai script resources (layout requirements): https://www.w3.org/International/sealreq/thai/
- Samui Infotech, Thai typography in web design (line-height of 1.8 or more for mobile): https://www.samui-infotech.com/the-importance-of-thai-typography-in-web-design/
- Example Thai typography fix PR (tone-mark clipping): https://github.com/Chosaque/kubo-classroom/pull/5
