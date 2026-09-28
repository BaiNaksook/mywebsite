# UI-08 — Performance and resilience UX for ท่าแร้งช่วยกัน

Scope: React 19 + Vite 8 + Firebase JS SDK 12.19 + Leaflet 1.9 on Firebase Hosting. Users are in rural Phetchaburi on low-end Android phones with weak 3G/4G, often inside the LINE in-app browser.

> **Method note.** Outbound web access from this session was blocked by the egress proxy: WebSearch hit its quota, and WebFetch to opensignal.com, firebase.google.com, developers.line.biz and osmfoundation.org was refused. So all **measurements in this file come from local builds** (reproducible; commands in the Appendix). The **external facts come from the cited public docs as I know them, but I could not re-open those docs this session.** Rows marked "(verify)" should be checked against the live page before anyone quotes them.

---

## 0. TL;DR — top 8 actions, ranked by impact per unit of effort

| # | Action | Where | Expected saving / effect | Effort |
|---|--------|-------|--------------------------|--------|
| 1 | **Fix the font loading.** Build CSS has 8 `@font-face` rules with **no `unicode-range`**, so every Thai page pulls all 8 woff2 files (~134 KB). Import the fontsource per-weight CSS (`400.css` etc., which has `unicode-range`) or add ranges by hand. Drop weight 600 (map it to 500). Preload `thai-400`. | `src/main.tsx`, `styles.css` (9 uses of 600), `index.html` | **−33 KB** from dropping 600. **−18 to −40 KB** more when Latin subsets are not needed. First text renders about 0.3–0.6 s sooner on Slow-4G. | S |
| 2 | **Take Storage out of the critical path.** Load `firebase/storage` with `import()` inside `uploadPhoto()`. | `src/firebase.ts`, `src/lib/reports.ts` | **−17.5 KB gz / −15.7 KB br** from the main chunk | S |
| 3 | **Defer Auth.** Reports are publicly readable (`firestore.rules`), so viewers never need Auth at first paint. Start Auth on `requestIdleCallback`, or when the user taps "แจ้งปัญหา" or the header, and use `initializeAuth` with explicit persistence. | `src/firebase.ts`, `useAuth.tsx` | **−24 to −29 KB gz** off the critical path | M |
| 4 | **Remove the JS waterfall.** `App` is loaded with a dynamic `import()` after the 240 KB main chunk has executed. That adds a full extra round trip plus 66 KB. Add `<link rel="modulepreload">` for the App chunk, or import App statically in production. Also `preconnect` to `tile.openstreetmap.org` and `firestore.googleapis.com`. | `main.tsx`, `index.html` / Vite plugin | **−1 RTT + parallel download**, about −300 to −900 ms on 150–300 ms RTT links | S |
| 5 | **Turn on Firestore persistent cache** (`persistentLocalCache`). Repeat visits then show the pins at once, offline or on a weak signal. | `src/firebase.ts` | **+18 KB gz** (single-tab) or +21.5 KB (multi-tab). This is the one addition worth paying for: repeat-visit time to data drops to about 0. | S |
| 6 | **Make photos smaller and cacheable.** Upload at 1280 px, quality 0.72 (WebP where the encoder supports it, JPEG otherwise), plus a 480 px thumbnail. Set `cacheControl: 'public,max-age=31536000,immutable'` on upload. | `src/lib/image.ts`, `uploadPhoto` | Upload **~350 KB → ~150 KB** (about 2× faster on 750 kbps uplink). Detail-view photo **~350 KB → ~35 KB** thumbnail. Repeat views come from cache. | S–M |
| 7 | **Keep drafts and show pending writes.** Autosave the ReportFlow draft (text in localStorage, photo blob in IndexedDB). Don't block the UI on `await batch.commit()` while offline; show "รอส่ง" from `hasPendingWrites`. | `ReportFlow.tsx`, `reports.ts` | Prevents lost reports on a dropped signal or a LINE webview reload, which is the biggest resilience win. | M |
| 8 | **Add a service worker, carefully.** Use Workbox via `vite-plugin-pwa`: precache the shell, runtime-cache tiles (bounded), and **exclude `/__/`** from navigation fallback. It is progressive: it does not run in LINE on iOS. | new `vite.config.ts` plugin, `firebase.json` headers | Repeat-visit shell ~0 bytes and works offline. Worth doing **only after 1–7**. | M |

After 1–4, the first-visit critical path goes from roughly **240 + 66 + 12 + 134 KB (gz) ≈ 452 KB** to about **195 + 66 + 12 + 70–100 KB ≈ 345–375 KB**. That is **~20–25 % fewer bytes and one fewer serial round trip.** With #5 added, the second visit shows data with no network at all.

---

## 1. What the current build ships (measured)

`npx vite build` (output written to the scratchpad; source untouched):

| Chunk | Raw | gzip -9 | brotli |
|---|---:|---:|---:|
| `index-*.js` (main: React + all Firebase) | 798.6 KB | **237–240 KB** | 202 KB |
| `App-*.js` (UI + Leaflet + lucide) | 229.8 KB | **65.6 KB** | 56 KB |
| `useAuth-*.js` | 2.1 KB | 1.2 KB | 1.0 KB |
| `index-*.css` (includes leaflet.css) | 38.9 KB | 11.8 KB | 10.5 KB |
| Fonts, woff2, **all 8 downloaded** (see §5) | — | **~134 KB** | — |

Cost of each SDK part, measured by building a minimal entry that uses the same API surface the app uses (gzip -9 / brotli, each including `firebase/app`):

| Module / variant | gzip | brotli | Notes |
|---|---:|---:|---|
| `firebase/app` alone | 7.5 KB | 6.8 KB | |
| `firebase/firestore` (onSnapshot, query, where, orderBy, runTransaction, writeBatch, serverTimestamp, deleteField, FieldPath) | **136 KB** | 117 KB | Bundles `re2js` (a regex engine pulled in by Firestore 12 pipelines code) |
| firestore + `persistentLocalCache(singleTab)` | 154 KB | 132 KB | **+18 KB** |
| firestore + `persistentLocalCache(multiTab)` | 157.6 KB | — | +21.5 KB |
| `firebase/firestore/lite` (getDocs, no realtime) | **36 KB** | 31 KB | −100 KB, but **no `onSnapshot`**, no cache, no offline queue |
| `firebase/auth` `getAuth` + popup/redirect | 28.8 KB | 25.5 KB | |
| `firebase/auth` `initializeAuth` + indexedDB persistence, no resolver | 24.1 KB | 21.5 KB | Add `browserPopupRedirectResolver` lazily at sign-in |
| `firebase/storage` (ref, uploadBytesResumable, getDownloadURL) | 17.5 KB | 15.7 KB | Needed only when uploading |
| React 19 + react-dom client | 67 KB | 58 KB | Fixed cost |
| Leaflet | 43 KB | 37.6 KB | In the App chunk |

Firebase Hosting serves brotli to clients that accept it, so real transfer is about 15 % below the gzip numbers.

### Current load waterfall (first visit)

```
HTML (0.6 KB)
 └─ index.js 240 KB gz ─ parse/exec (Firebase init: Auth + Firestore + Storage)
     └─ import('./App') 66 KB + useAuth  ← starts only after index.js has executed (serial)
         └─ Leaflet map init → ~12–20 OSM tiles (new TLS connection to tile.openstreetmap.org)
         └─ Firestore WebChannel handshake (new TLS to firestore.googleapis.com) → reports
CSS → 8 font files (all downloaded, see §5)
```

---

## 2. Device and network profile for rural Phetchaburi

**What to design for (my recommendation, taken from the sources below):**

| Profile | Down / Up | RTT | CPU | Use for |
|---|---|---|---|---|
| **"Tha Raeng weak-signal"** (primary target) | 1.0 Mbps / 0.4 Mbps | 300 ms | 4–6× slowdown (Lighthouse "mobile"), 2–3 GB RAM Android Go / low-end Helio or Unisoc | Budgets and manual testing |
| Lighthouse default mobile ("Slow 4G") | 1.6 Mbps / 0.75 Mbps | 150 ms | 4× | CI regression gate |
| Offline / flapping | 0, toggling every 10–30 s | — | — | Resilience QA (DevTools offline toggle) |

Why these numbers:

- **National averages are misleading.** Opensignal's Thailand reports (2024–2025) put national 4G/5G download averages in the tens of Mbps, with AIS and TRUE close to each other *(verify current figures)*. But those averages come mostly from Bangkok and cities. Opensignal's regional and "Consistent Quality" metrics show a much lower share of sessions that can reliably handle HD video or group calls outside cities, and 4G "availability" (time connected) is not the same as signal quality at the edge of a cell. Coastal and agricultural edges of Ban Laem district are exactly that edge case. https://www.opensignal.com/reports (Thailand Mobile Network Experience reports)
- **NBTC (กสทช.)** coverage reports and its USO programme ("เน็ตประชารัฐ" / USO Net) describe villages that were served first by 3G/4G USO sites and village Wi-Fi hotspots, which usually have limited backhaul. Some users will be on shared hotspot Wi-Fi rather than LTE. https://www.nbtc.go.th *(verify the specific report)*
- **ETDA "Thailand Internet User Behavior"** (annual, ETDA / สพธอ.) consistently finds that the smartphone is the main device for almost all users, that LINE is the most-used app, and that older users (Gen X / Baby Boomers, i.e. the typical village headman or อสม. volunteer) spend many hours a day on LINE and Facebook. Links shared in LINE groups are the primary distribution channel, so the **LINE in-app browser is the primary runtime**, not Chrome. https://www.etda.or.th (สำรวจพฤติกรรมผู้ใช้อินเทอร์เน็ตในประเทศไทย) *(verify the latest year's numbers)*
- **Lighthouse throttling presets:** Slow 4G = 150 ms RTT, 1.6 Mbps down, 750 kbps up, 4× CPU. https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md

Time arithmetic on the primary profile (1 Mbps ≈ 120 KB/s effective, RTT 300 ms):
- DNS + TCP + TLS to each **new** origin costs about 3 RTT ≈ 0.9 s. The page opens four origins: hosting, Firestore, OSM tiles, Storage.
- The current ~450 KB critical path (gz; ~400 KB br) takes about **3.3–3.7 s of transfer alone.** Add the serial App-chunk round trip and roughly 1.5–2.5 s of JS parse and execute on a 4× CPU (Firestore and react-dom dominate), and **LCP lands at about 6–8 s** on first visit. After items 1–4 it drops to about **4–5 s**. After item 5, repeat visits show pins in **under 2 s**, most of it tile loading.

---

## 3. Core Web Vitals targets

Official "good" thresholds at the 75th percentile: **LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1** (https://web.dev/articles/vitals, https://web.dev/articles/defining-core-web-vitals-thresholds). This site will not have enough traffic for CrUX field data, so set **lab budgets** on the profiles above:

| Metric | Budget on "Slow 4G" (Lighthouse CI) | Budget on "weak-signal" profile | Notes |
|---|---|---|---|
| LCP | ≤ 3.0 s | ≤ 5.0 s first visit, ≤ 2.5 s repeat | LCP element is probably the StatsBar/heading text or the first map tile. Make it the **text**: render the header and StatsBar skeleton before the map. |
| INP | ≤ 200 ms | ≤ 300 ms | Risks: filter changes re-rendering all markers, and `compressImage` on the main thread (see §6) |
| CLS | ≤ 0.05 | ≤ 0.1 | Reserve heights for the map, stats tiles, photo `<img>` (`width`/`height` or `aspect-ratio`), and the offline banner (overlay it, don't push content down) |
| TBT | ≤ 600 ms | — | |
| JS budget (critical, br) | ≤ 200 KB | | Current ~259 KB br (main + App) |
| Font budget | ≤ 60 KB | | Current ~134 KB |

Optional field monitoring: `web-vitals` (~2 KB br) with `navigator.sendBeacon`, sampled at 10 %, into a Firestore `vitals` collection that has write-only rules. **Avoid Firebase Performance Monitoring**: it adds tens of KB and pulls in Installations.

---

## 4. Firebase SDK bundle reduction

The project already uses modular imports, so tree-shaking is working. The remaining wins are **what loads when**:

### 4.1 Storage → lazy (−17.5 KB gz; S)
```ts
// src/lib/reports.ts
export async function uploadPhoto(/* … */) {
  const { getStorage, ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage');
  const storage = getStorage(app);            // connectStorageEmulator here when USE_EMULATORS
  // …
}
```
Remove `getStorage` and the storage import from `src/firebase.ts`. Photo `<img>` tags use plain HTTPS download URLs and do not need the SDK. Optionally prefetch the chunk when ReportFlow mounts (`import('firebase/storage')` without awaiting it) so it is warm before the user submits.

### 4.2 Auth → deferred (−24–29 KB gz from the critical path; M)
- `firestore.rules` allows public reads of unhidden reports, so a first-time viewer never needs Auth.
- Plan: `src/firebase.ts` exports `getAuthLazy(): Promise<Auth>`, which dynamically imports `firebase/auth` and calls `initializeAuth(app, { persistence: [indexedDBLocalPersistence, browserLocalPersistence] })`. Pass **no** `popupRedirectResolver` at init; pass `browserPopupRedirectResolver` only in `signIn()` (`signInWithPopup(auth, provider, browserPopupRedirectResolver)`). The resolver loads iframe code (gapi / `__/auth/iframe`), which is the costly part.
- `AuthProvider` calls `getAuthLazy()` on `requestIdleCallback` (with a `setTimeout(…, 2000)` fallback, because older WebViews lack rIC), or immediately if `localStorage` shows a prior sign-in, so returning signed-in users see their state quickly.
- **Caveat:** the Firestore SDK attaches Auth tokens only if Auth is registered before the first request that needs them. Public reads are fine. Make sure writes (`createReport` and similar) `await getAuthLazy()` first. The admin check (`getDoc(admins/uid)`) already runs after `onAuthStateChanged`.
- **Redirect caveat:** when a user comes back from `signInWithRedirect`, `getRedirectResult` must run on load. Detect a pending redirect with a `sessionStorage` flag set just before redirecting, and init Auth eagerly in that case.

### 4.3 Firestore: keep the full SDK, don't switch to `lite`
- `firestore/lite` would save ~100 KB gz, but the app needs `onSnapshot` (live map), the offline write queue, latency compensation (`hasPendingWrites`) and the persistent cache. All four are exactly the resilience features this audience needs. **Not recommended** for the main listener.
- A possible hybrid (only if the budget still fails after 1–5): paint the first render from `firestore/lite` `getDocs`, or from a **static JSON snapshot on Hosting**, then lazy-load the full SDK for realtime. The two SDKs don't share a cache, so this adds complexity. Low priority.
- **Enable the persistent cache (+18 KB, S):**
```ts
db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentSingleTabManager(undefined) }),
});
```
  `persistentSingleTabManager` is lighter; a second tab falls back to memory cache and shows a console warning. Use `persistentMultipleTabManager()` (+3.5 KB) if users often open several tabs, which is unlikely from LINE. Wrap in try/catch and fall back to `memoryLocalCache()`, because IndexedDB can be unavailable in some private modes and WebViews. Docs: https://firebase.google.com/docs/firestore/manage-data/enable-offline
- Firestore auto-detects long-polling on the web (`experimentalAutoDetectLongPolling` has been on by default since SDK v10). That matters for carrier proxies and in-app browsers that break WebChannel streaming. Leave it on; don't force `experimentalForceLongPolling`.
- Limit the listener: `where('hidden','==',false), orderBy('createdAt','desc')` has **no `limit()`**. When there are hundreds of reports, add `limit(300)` or filter out resolved reports older than N months. This bounds first-load bytes and IndexedDB size.

### 4.4 Remove the App-chunk waterfall (S)
`main.tsx` only does `import('./App')` after the main chunk runs, and Vite does not inject a `modulepreload` for it into the HTML. Options:
- (a) Statically import `App` and `AuthProvider` in production, and keep the `SetupNeeded` branch as a lazy import instead (it is the rare path).
- (b) Keep it dynamic but add a small Vite `transformIndexHtml` plugin that emits `<link rel="modulepreload" href="/assets/App-[hash].js">`.
Also add to `index.html`:
```html
<link rel="preconnect" href="https://firestore.googleapis.com" crossorigin>
<link rel="preconnect" href="https://tile.openstreetmap.org" crossorigin>
<link rel="dns-prefetch" href="https://firebasestorage.googleapis.com">
```
Saving: one serial round trip (≥ 300 ms) plus overlapping TLS setup (about 0.6–0.9 s on the weak profile).

### 4.5 Minor
- `lucide-react` adds 30 KB of source to the App chunk. Named imports tree-shake per icon; confirm that no `icons` barrel or dynamic icon map is used. Negligible otherwise.
- Code-split `ReportFlow` + `LocationPicker` + `PhotoPicker` + `image.ts` (~25 KB source) and `AboutPage` with `React.lazy`. Viewers who never report don't pay for them. About −6 to −8 KB gz.

---

## 5. Fonts: a real bug (S, high impact)

`main.tsx` imports `@fontsource/ibm-plex-sans-thai-looped/thai-400.css`, `latin-400.css` and so on. These **single-subset** files have **no `unicode-range`**. I confirmed this: the built CSS has 0 occurrences of `unicode-range`. With identical family and weight descriptors and no ranges, the browser treats each Thai/Latin pair as one composite face and checks the last-declared (Latin) face first. **All 8 files get downloaded for any page containing Thai text**, and every glyph lookup falls through the Latin file.

| File (woff2) | KB |
|---|---:|
| Plex Thai 400 / 500 / 600 | 13.7 / 14.1 / 14.2 |
| Plex Latin 400 / 500 / 600 | 17.8 / 18.7 / 19.0 |
| Mitr Thai 500 / Latin 500 | 14.1 / 22.2 |
| **Total** | **~134 KB** |

Fix:
1. Import `@fontsource/ibm-plex-sans-thai-looped/400.css` and `500.css`, and `@fontsource/mitr/500.css`. These include `unicode-range` for all subsets, so cyrillic and latin-ext are never fetched. Latin loads only when Latin characters or digits actually appear. Digits (U+0030–0039) are in the Latin range, so Latin 400 will still load if numbers are shown. That is acceptable.
2. **Drop weight 600** (9 uses in `styles.css`): use 500, or Mitr for emphasis. Saves 14.2 + 19.0 = **33 KB**.
3. Consider rendering numbers with Thai-script-friendly fallbacks, or accept Latin 400 only.
4. `<link rel="preload" as="font" type="font/woff2" crossorigin href="/assets/…thai-400….woff2">` for the body face only (needs a Vite plugin to resolve the hashed name). `font-display: swap` is already set by fontsource, which is good: text shows at once in the system Thai font (Noto Sans Thai / Sarabun on Android).
5. Optional: set `size-adjust` / `ascent-override` on a local fallback `@font-face` to cut the CLS from the swap.

Expected: ~134 KB → **~46–64 KB** (Thai 400 + Thai 500 + Mitr Thai 500, plus Latin 400 when digits show).

---

## 6. Images

Current: `compressImage(file, maxSide = 1600, quality = 0.82)` → JPEG. A typical phone photo at 1600 px q0.82 is about **300–500 KB**. The same file is shown in `ReportDetail` at about 360–420 CSS px (≈ 720–840 device px at DPR 2).

Recommendation:
| Variant | Size | Encoding | Target bytes |
|---|---|---|---|
| Full (tap to zoom) | long side **1280 px** | WebP q0.75 if `canvas.toBlob('image/webp')` returns `blob.type === 'image/webp'`, otherwise JPEG q0.72 | **120–200 KB** |
| Thumbnail (list, detail card, LINE preview) | long side **480 px** | same | **25–45 KB** |

- **Check the returned `blob.type`.** Safari/WebKit (LINE on iOS) silently returns PNG for unsupported WebP encoding. PNG is several times larger.
- Run the resize in `OffscreenCanvas` in a Worker when available. Decoding a 12 MP photo on the main thread can block for 300–800 ms on low-end phones, which hurts INP and leaves the UI frozen with no feedback. Show "กำลังย่อรูป…" immediately.
- **Cache headers:** Firebase Storage objects are served with a short cache lifetime unless metadata is set. Photos are immutable (the path has `Date.now()`), so pass `{ contentType, cacheControl: 'public, max-age=31536000, immutable' }` to `uploadBytesResumable`. https://firebase.google.com/docs/storage/web/file-metadata
- `<img>` gets `width`/`height` (or CSS `aspect-ratio`) plus `decoding="async"`. `loading="lazy"` is already in place. Keep it for below-the-fold images, but **not** for the photo at the top of the detail sheet; use `fetchpriority="high"` there.
- Upload resilience: `uploadBytesResumable` already retries. Set `storage.maxUploadRetryTime` to about 10–20 min and show "สัญญาณอ่อน กำลังส่งต่อ… 45%" rather than an error. Offer "ส่งโดยไม่มีรูป" after 60 s stalled.

Savings per report view: **~300 KB → ~35 KB** (−88 %). Per upload on a 400–750 kbps uplink: **~5–8 s → ~2–3 s**.

---

## 7. Map tiles (Leaflet + OSM)

Current: `L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 })` at zoom 14. A phone viewport of 360×640 needs about 2×3 visible tiles, plus Leaflet's default `keepBuffer: 2` rings once the user pans. An OSM raster tile of rural or coastal land is typically 5–25 KB, so the first view costs **~100–300 KB and 12–20 requests.**

Recommendations:
1. `preconnect` to the tile host (§4.4).
2. Tile layer options:
   ```ts
   L.tileLayer(url, {
     maxZoom: 19, minZoom: 12,
     updateWhenIdle: true,      // default on mobile; keep explicit
     keepBuffer: 1,             // default 2 → fewer off-screen tiles
     detectRetina: false,       // default; never enable (4× tiles)
     crossOrigin: true,         // needed if a service worker caches tiles (non-opaque responses)
   })
   ```
   and on the map: `maxBounds` = the tambon bbox padded ~2 km, `maxBoundsViscosity: 1`, so users can't pan away and pull unrelated tiles.
3. **OSM tile usage policy** (https://operations.osmfoundation.org/policies/tiles/): you must send a valid Referer (browsers do), show attribution (done), **not bulk-download or prefetch tiles** (no pre-seeding the area for offline), and cache according to HTTP headers. A small community site is well within fair use. **Do not** build an "offline area download" on tile.openstreetmap.org.
4. **Show the tile placeholder.** Set the `.leaflet-container` background to a map-like neutral tint (`#e8e4d8`) with a subtle grid, so a slow tile load looks like "map loading" rather than a broken grey box. Pins and the boundary render **before** tiles arrive; they don't depend on them.
5. When tiles fail (`tileerror` event counts > N): show a small chip "แผนที่พื้นหลังโหลดช้า — หมุดยังใช้งานได้" and keep the list usable.
6. Future option if bandwidth becomes the top issue: self-host a **small** pre-rendered raster tile set (z12–17) of Tha Raeng generated from OSM data you render yourself (e.g. a Protomaps/PMTiles extract rendered offline, or TileMill-style), served from Firebase Hosting with immutable caching. For a ~5×5 km area that is roughly 1–2 k tiles and 15–30 MB. Watch Hosting's Spark-plan transfer quota (~360 MB/day, *verify*). Vector tiles (MapLibre, ~200 KB+ JS) are **not** a good trade for this audience.

---

## 8. Skeletons vs spinners, and loading copy

- **Skeletons for content whose layout is known**: the report list (already has `report-item--skeleton` ×3), StatsBar numbers (currently `–`; fine, but use a shimmer-free grey pill of fixed width to avoid CLS), and the detail sheet (title bar, photo box at a fixed aspect ratio, 3 text lines).
- **Determinate progress, not spinners, for user-initiated long tasks**: photo compressing (indeterminate but labelled "กำลังย่อรูป…"), uploading (already % based, good), saving.
- **Spinner only for < 1 s unknown waits** (sign-in button). After 3 s, swap in reassurance text: "สัญญาณอ่อน กำลังเชื่อมต่อ…". After 10 s, offer an action ("ลองใหม่", "ใช้งานแบบออฟไลน์").
- **Reduce animation cost:** shimmer skeletons repaint every frame on low-end GPUs and drain battery. Use a static grey, or a slow (1.5 s) opacity pulse, and honour `prefers-reduced-motion` (already used for map motion).
- Nielsen's response-time limits (0.1 s / 1 s / 10 s) are a good guide for when to escalate the messaging: https://www.nngroup.com/articles/response-times-3-important-limits/

---

## 9. Offline and poor-network messaging

The current banner, "ไม่มีการเชื่อมต่ออินเทอร์เน็ต — ข้อมูลบนแผนที่อาจไม่ใช่ล่าสุด และยังส่งเรื่องไม่ได้", depends only on `navigator.onLine`. That value is **true on "connected but no data"** (weak 3G, captive hotspot), which is the most common failure here.

Improve it:
1. **Three states, not two.** `ออนไลน์` (no UI) / `สัญญาณอ่อน` (amber: "สัญญาณอ่อน ข้อมูลอาจช้า") / `ออฟไลน์` (grey: "ออฟไลน์ — แสดงข้อมูลที่บันทึกไว้เมื่อ {เวลา}").
   - Detect "weak" from Firestore snapshot metadata: `onSnapshot(q, { includeMetadataChanges: true })`. If `metadata.fromCache === true` for more than 5 s after mount, show "weak". Also use `navigator.connection.effectiveType` (`'2g'`/`'slow-2g'`/`'3g'`) where supported (Chrome/Android WebView).
   - Show **"ข้อมูลล่าสุดเมื่อ 14:32"**. People trust stale data more when they are told how old it is.
2. **With the persistent cache on, reword "ยังส่งเรื่องไม่ได้"** to "ส่งได้ — จะส่งอัตโนมัติเมื่อมีสัญญาณ" for text-only reports. Firestore queues writes offline. `await batch.commit()` does **not** resolve until the server acknowledges it, so don't block the UI on it. Show the report immediately with a "รอส่ง" badge (from `doc.metadata.hasPendingWrites`), and resolve the flow when the local write is applied.
   - Caveat: **`runTransaction` fails offline** (join/leave/resolve). For those actions, disable the button with an explanation ("ต้องมีสัญญาณเพื่อยืนยัน") rather than letting it spin.
   - Photo uploads do not queue across reloads. Keep the photo blob in IndexedDB (draft) and resume on the next open.
3. **Draft autosave** in ReportFlow: debounce 500 ms into localStorage (text fields, pin location) and IndexedDB (photo blob). LINE's webview is often killed when the user switches to the camera or another chat, and the Android low-memory killer does the same on 2–3 GB phones. On return, show "มีเรื่องที่ยังไม่ได้ส่ง — ทำต่อ / ทิ้ง".
4. Banner placement: overlay it at the top (position sticky, no layout shift), set `role="status"`, and don't repeat the announcement on flaps (debounce state changes 2 s).
5. Error copy already maps `unavailable`/`network` to Thai (`thaiError`). Pair every error with **one action** (ลองใหม่), and **keep the entered data**.

---

## 10. PWA / service worker with Firebase Hosting

**Benefits:** the repeat-visit shell (JS, CSS, fonts ≈ 350 KB) comes from the SW with no network, the app opens offline, and a runtime cache holds viewed tiles and photos.
**Costs and risks:** stale-deploy bugs, extra complexity, and **no effect inside LINE on iOS**: WKWebView in third-party apps only supports service workers for App-Bound Domains, which LINE doesn't configure. On Android, LINE uses the system WebView, which does support service workers.

If you do it (after items 1–7):
- `vite-plugin-pwa` with `strategies: 'generateSW'`, `registerType: 'prompt'`. Show a toast "มีเวอร์ชันใหม่ — แตะเพื่ออัปเดต" instead of a silent `skipWaiting`, because a silent swap mid-report could break the flow.
- **Critical:** `navigateFallbackDenylist: [/^\/__\//]`. Firebase Hosting serves the Auth handler at `/__/auth/handler` and `/__/auth/iframe` and config at `/__/firebase/init.json`. If the SW answers those navigations with `index.html`, **Google sign-in via redirect breaks**.
- `firebase.json`: add `{"source": "/sw.js", "headers": [{"key":"Cache-Control","value":"no-cache"}]}` and the same for `manifest.webmanifest`. The existing `/assets/**` immutable and `index.html` no-cache headers are already correct.
- Runtime caching:
  - OSM tiles: `StaleWhileRevalidate`, `cacheName: 'osm-tiles'`, `expiration: { maxEntries: 200, maxAgeSeconds: 7 * 24 * 3600 }`. This only caches tiles the user actually viewed, which fits the policy. Needs `crossOrigin: true` on the tile layer so responses aren't opaque (OSM sends `Access-Control-Allow-Origin: *`; *verify*). Opaque responses count ~7 MB each against quota in Chrome.
  - Storage photos (`firebasestorage.googleapis.com`): `CacheFirst`, maxEntries 60, 30 days.
  - **Never** cache `firestore.googleapis.com` (a streaming channel; the Firestore cache handles data).
- Manifest: `name: "ท่าแร้งช่วยกัน"`, `display: "standalone"`, `theme_color` and `background_color: #faf6ec`, icons at 192 and 512 plus maskable.
- **Install prompt:** `beforeinstallprompt` doesn't fire in LINE or Facebook in-app browsers. Show an "ติดตั้งบนหน้าจอ" button only when that event has fired (real Chrome), or after the user has opened the site in the external browser. Never show it inside LINE. On iOS Safari, show a one-time hint "แชร์ → เพิ่มลงในหน้าจอโฮม".
- Docs: https://vite-pwa-org.netlify.app/ , https://developer.chrome.com/docs/workbox/ , https://firebase.google.com/docs/hosting/reserved-urls

---

## 11. LINE in-app browser quirks

| Quirk | Status in code | Recommendation |
|---|---|---|
| **Google blocks OAuth in embedded webviews** (`403 disallowed_useragent`, Google policy since 2021) | `detectInAppBrowser()` exists and `SignInCard` builds an `openExternalBrowser=1` URL. Good. | Show the "เปิดในเบราว์เซอร์" CTA **before** the user taps Google sign-in, not after a failure. Also detect the popup failing silently in LINE Android. https://developers.googleblog.com/2021/06/upcoming-security-changes-to-googles-oauth-2.0-authorization-endpoint.html |
| **`?openExternalBrowser=1`** makes LINE open the URL in the default browser (on iOS and Android, when the link is opened *from within LINE*) | Used | Put the parameter **in the links you share into LINE groups** (e.g. `https://…web.app/?openExternalBrowser=1#/r/abc`), so users land in Chrome from the start. The hash route survives. Keep the in-app CTA as a fallback. LINE docs: https://developers.line.biz/en/docs/line-login/using-line-url-scheme/ ("Opening a URL in an external browser") *(verify)* |
| Facebook / Messenger / Instagram webviews have **no** equivalent parameter | Detected as `'facebook'` | On Android, offer an `intent://` link: `intent://HOST/PATH#Intent;scheme=https;package=com.android.chrome;end`. On iOS, show "แตะ ⋯ → เปิดใน Safari" with a screenshot. |
| **Third-party storage partitioning** breaks `signInWithRedirect` when `authDomain` ≠ the app's domain (Chrome 115+, Safari, Firefox) | `authDomain` comes from env | Because the site is on Firebase Hosting, set `VITE_FIREBASE_AUTH_DOMAIN` to **the same domain users visit** (`<project>.web.app` or the custom domain). Hosting serves `/__/auth/handler` there. https://firebase.google.com/docs/auth/web/redirect-best-practices |
| LINE webview may **reload the page when returning from the camera or file picker** on low-RAM phones | Draft not persisted | Draft autosave (§9.3) |
| `window.open` popups are often blocked or open in-place | Popup → redirect fallback exists | Good. Prefer redirect directly when `detectInAppBrowser()` is non-null. |
| LINE on iOS: no service worker, no install prompt, IndexedDB available (with eviction) | — | Treat PWA features as progressive. Firestore cache still works. |
| Share-link preview (OG tags) is what users see in LINE chats | Only `description` in `index.html` | Add `og:title`, `og:description`, `og:image` (a static 1200×630 JPEG ≤ 100 KB). Per-report previews need SSR or a Cloud Function, which is out of scope. |
| The LINE webview User-Agent contains `Line/` | Regex `/Line\//i` | Fine. The generic `; wv)` check also catches other Android webviews. |

---

## 12. Testing checklist

- Chrome DevTools → Performance, CPU 4× (or 6×), Network custom profile "Tha Raeng weak" (1000/400 kbps, 300 ms). Record a first visit and a repeat visit.
- Lighthouse CI budget file with the values from §3, run on each PR (`@lhci/cli`).
- Real device: any Android phone with ≤ 3 GB RAM, the link opened **from a LINE chat**. Test sign-in, report with photo, airplane-mode toggle mid-upload, switching to the camera and back.
- Resilience script: DevTools offline → create a text report → reload → back online. Expect the report to appear with "รอส่ง" and then sync. This needs the persistent cache.

---

## Appendix A — Reproduce the measurements

```bash
cd tharaeng
npx vite build --outDir "$SCRATCH/build-out" --emptyOutDir         # chunk sizes
npx vite build --outDir "$SCRATCH/build-sm" --sourcemap              # per-package attribution
# Per-SDK subsets: tiny entries in $SCRATCH/exp/*.js built with
#   E=<name> npx vite build -c $SCRATCH/exp/vite.exp.config.mjs
grep -c unicode-range "$SCRATCH/build-out/assets/index-*.css"         # → 0 (font bug)
```
Scripts are in the scratchpad (`exp/`, `attr.mjs`). Source files were not modified.

## Appendix B — Sources

*I could not re-fetch these this session (egress blocked). URLs are the canonical locations; check any number marked "verify" against them.*
- web.dev — Web Vitals and thresholds: https://web.dev/articles/vitals · https://web.dev/articles/defining-core-web-vitals-thresholds · INP: https://web.dev/articles/inp
- Lighthouse throttling presets: https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md
- Opensignal Thailand Mobile Network Experience reports: https://www.opensignal.com/reports
- NBTC (กสทช.) coverage and USO programme: https://www.nbtc.go.th
- ETDA Thailand Internet User Behavior survey: https://www.etda.or.th
- Firebase — offline persistence: https://firebase.google.com/docs/firestore/manage-data/enable-offline
- Firebase — Firestore Lite: https://firebase.google.com/docs/firestore/solutions/firestore-lite
- Firebase — redirect sign-in best practices (third-party storage): https://firebase.google.com/docs/auth/web/redirect-best-practices
- Firebase — custom Auth dependencies (`initializeAuth`, resolvers): https://firebase.google.com/docs/auth/web/custom-dependencies
- Firebase — Storage file metadata (cacheControl): https://firebase.google.com/docs/storage/web/file-metadata
- Firebase Hosting reserved URLs (`/__/auth`, `/__/firebase/init.json`): https://firebase.google.com/docs/hosting/reserved-urls
- Google OAuth embedded-webview block: https://developers.googleblog.com/2021/06/upcoming-security-changes-to-googles-oauth-2.0-authorization-endpoint.html
- LINE URL scheme / `openExternalBrowser`: https://developers.line.biz/en/docs/line-login/using-line-url-scheme/
- OSM Foundation Tile Usage Policy: https://operations.osmfoundation.org/policies/tiles/
- Leaflet TileLayer options: https://leafletjs.com/reference.html#tilelayer
- WebKit service workers in WKWebView (App-Bound Domains): https://webkit.org/blog/10882/app-bound-domains/
- Workbox / vite-plugin-pwa: https://developer.chrome.com/docs/workbox/ · https://vite-pwa-org.netlify.app/
- Fontsource subsetting / unicode-range: https://fontsource.org/docs/getting-started/subsets
- NN/g response-time limits: https://www.nngroup.com/articles/response-times-3-important-limits/
