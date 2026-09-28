# UI-05 — Map UI patterns for the subdistrict problem map (Leaflet/OSM, mobile-first)

Researched 2026-09-28. Note: several primary sites (m3.material.io, nngroup.com, stadiamaps.com, osmfoundation.org, wiki.openstreetmap.org) were blocked by the egress proxy for direct fetch; facts from those are taken from search-result extracts of those pages (URLs cited) and should be re-checked before quoting in legal/attribution text. Items marked (practice) are established cartographic practice, not from a fetched source.

---

## Recommendations (14)

### 1. Bottom sheet: three detents — peek / half / full — with a real grabber
- **Peek (~96–120 px)**: title + status chip of the selected pin (or "N problems in view" when nothing selected). Map stays fully usable.
- **Half (~50% viewport)**: full summary, photo thumb, primary action. Apple calls this the *medium* detent — "about half of the fully expanded height", used for progressive disclosure; Maps/Find My keep such a sheet always visible so the map stays interactive. [Apple HIG – Sheets]
- **Full (~90%, leave a strip of map visible)**: full detail + timeline; content scrolls inside.
- **Grabber is required on a resizable sheet** and must be *tappable* to cycle detents, not drag-only (Apple HIG; Material 3: "selecting the drag handle should toggle through preset heights or close the sheet"; sheets must be able to "cycle through preset heights and close completely without dragging"). [Apple HIG, M3 guidelines]
- Implement grabber as a `<button aria-label="ขยาย/ย่อรายละเอียด">` (48×48 hit area, 32×4 px visual bar), plus an explicit close (X) button. Esc closes; focus moves into sheet on open and returns to pin on close.
- Use a **standard (non-modal) sheet** at peek/half — no scrim, map remains pannable. Only at full height behave modally (scrim tap closes, M3). Content scroll at top + downward drag → collapses (Apple: sheet resizes on scroll/drag).
- Snap with velocity (fast flick skips a detent); respect `prefers-reduced-motion` (no spring, instant snap). Use `100dvh`, and `env(safe-area-inset-bottom)` padding.
- Desktop (≥ 900 px): keep the floating card anchored left/right side panel (not over the selected pin), and pan the map so the pin isn't hidden (`map.panInside` / `fitBounds` with padding equal to card width).

### 2. Pins: shape + glyph + colour (never colour alone)
- Use a teardrop/rounded pin, ≥ 32 px tall, tap target ≥ 44 px (invisible padding via `iconSize` larger than the drawing).
- Encode status **redundantly**: colour + glyph (e.g. waiting = clock/"!", in progress = wrench/half-circle, resolved = check) — WCAG 1.4.1 Use of Color. Give pins a 2 px white stroke + subtle shadow so they hold 3:1 non-text contrast against any tile (WCAG 1.4.11). (practice/WCAG)
- Selected pin: scale 1.25×, raise z-index (`zIndexOffset`), thicker dark outline; dim non-matching pins when a filter chip is active rather than removing them abruptly (optional).
- Resolved pins can be smaller/lower-opacity so open problems dominate visually.

### 3. Colour-blind-safe status palette
Current amber / blue / green is risky for deuteranopes only in the amber↔green pair. Keep the semantics but pick hues from Okabe–Ito (designed for CVD safety):
| Status | Suggested | Notes |
|---|---|---|
| รอดำเนินการ (waiting) | `#E69F00` orange (Okabe-Ito) — or darker `#D55E00` vermillion for more urgency | Put dark glyph on it |
| กำลังดำเนินการ (in progress) | `#0072B2` blue | white glyph |
| แก้ไขแล้ว (resolved) | `#009E73` bluish green | white glyph; shape (check) disambiguates from orange |
Test with a CVD simulator (Chrome DevTools > Rendering > Emulate vision deficiencies). Reuse the *same* colours in stats tiles, filter chips and list badges so the legend is learned once. (Okabe & Ito 2008, "Color Universal Design"; practice)

### 4. Clustering: only when density demands it
- A single subdistrict with tens–low hundreds of reports rarely needs clustering at street zooms. Rule of thumb: cluster when > ~50–100 visible markers or pins overlap at the default zoom; otherwise prefer **no clustering + spiderfy for exact duplicates**.
- If using **Leaflet.markercluster** (MIT; handles 10k+ markers): `maxClusterRadius: 40` (default 80 px is too aggressive for a small area), `disableClusteringAtZoom: 16` (then set `spiderfyOnMaxZoom:false`), `showCoverageOnHover:false` (no hover on mobile), `zoomToBoundsOnClick:true`, `chunkedLoading:true`. [markercluster README]
- Custom `iconCreateFunction`: show count **and** a status mini-donut/segmented ring (so a cluster of 8 with 5 waiting still reads as "mostly amber") — use `cluster.getAllChildMarkers()` to tally. Don't use the default green/yellow/red size colours — they collide with status semantics.
- Keep filter chips applied to the cluster group (rebuild layers on filter change).

### 5. Legend: compact, collapsible, and doubles as the filter
- Best pattern for 3 categories: make the **filter chips the legend** — each chip shows the pin swatch+glyph, label and count (e.g. "● รอ 12"). No separate legend box needed on mobile.
- If a boundary/landmark layer is added, add a small "ⓘ" legend button (top-right, below zoom) opening a mini popover: boundary line style, village label style, landmark icons. (practice)

### 6. Show the subdistrict boundary and mask outside
- Draw the boundary as a 2–3 px dark line (e.g. `#334155`, dashed optional) with no fill inside.
- **Mask outside** with an inverted polygon: world rectangle as outer ring, subdistrict as hole, fill white/grey at 0.45–0.6 opacity (light theme) — plugin **Leaflet.snogylop** or build the GeoJSON with a hole manually (no plugin needed). Keeps context (neighbouring roads still faintly visible) while focusing attention. [Leaflet.snogylop; rstudio/leaflet#633]
- Restrict navigation: `maxBounds = boundary.getBounds().pad(0.15)`, `maxBoundsViscosity: 0.8–1.0`, `minZoom` = zoom that fits the boundary (compute via `map.getBoundsZoom`). Note: viscosity 1.0 can feel harsh with non-rectangular areas — pad the bounds. [Leaflet docs; react-leaflet#353]
- Initial view: `fitBounds(boundary, {padding:[16,16]})` and a "🏠 เห็นทั้งตำบล" (reset view) button.

### 7. Village and landmark labels without clutter
- Use a dedicated Leaflet pane above tiles but **below markers** (`map.createPane('labels')`, `pointerEvents:'none'`) so labels never steal taps.
- **Zoom-dependent hierarchy**: z ≤ 13 subdistrict name only; z 14 village (หมู่บ้าน / หมู่ที่ N) names; z ≥ 15 landmarks (วัด, โรงเรียน, รพ.สต., อบต., ตลาด). Toggle via `zoomend` CSS class on the map container. (practice; mirrors basemap label ramps)
- Style: halo text (white `text-shadow`/`paint-order: stroke`), 12–14 px, muted slate colour, *not* bold — pins must stay the loudest element. Villages in regular weight, landmarks in small icon + label.
- Collision: for ~10–30 labels, hand-place offsets in the data (`anchor: 'n'|'s'|...`). For more, use `L.tooltip({permanent:true, direction})` + a simple bounding-box collision pass on `zoomend`, or the Leaflet.LabelTextCollision plugin.
- Prefer a basemap with *few* labels (see #10) so custom labels don't fight base labels.

### 8. "Locate me"
- Button bottom-right above the sheet peek (thumb zone), standard crosshair/arrow icon, `aria-label="ตำแหน่งของฉัน"`.
- Request geolocation **only on tap** (never on load). Use **Leaflet.Locate** (MIT): `setView:'untilPanOrZoom'`, `keepCurrentZoomLevel:[15,18]`, show accuracy circle, `flyTo:true`. [leaflet-locatecontrol]
- If the user is **outside the subdistrict**, don't fly away past maxBounds: show a toast "คุณอยู่นอกพื้นที่ตำบล" and keep the view. Handle denied/timeout with a friendly message.
- Useful secondary action: "report a problem here" prefilled with current location (if reporting exists).

### 9. Map vs list
- NN/g: mobile users struggle when a map pushes the list below the fold and when page-scroll and map-pan gestures conflict; many prefer the list. Mitigate with side gutters so the page can be scrolled past a non-full-bleed map. [NN/g – Mobile maps & location finders]
- Recommended: map fixed height ~55–60 vh with 12–16 px gutters, list below — OR a segmented toggle **แผนที่ | รายการ** sticky at top (single view at a time, preserves filters). On desktop, show both side by side.
- Sync both ways: tap list row → pan to pin + open sheet; list default sort "nearest to map centre" or "newest", and list shows only items in current map view with a "แสดงทั้งหมด" option.
- Set `scrollWheelZoom:false` on desktop until map is clicked/focused and `dragging` via two-finger on mobile (Leaflet.GestureHandling) if the map is embedded in a scrolling page.

### 10. Calm tile styles (low-saturation base so status pins pop)
Best fits: **CARTO Voyager** (soft colour, good road hierarchy), **CARTO Positron** / **Stadia Alidade Smooth** (near-grey, very calm), **OpenFreeMap Positron/Liberty** (vector). OSM Standard and OSM-FR are busier/more saturated — acceptable but pins compete with POI icons. See licensing table below.

### 11. Label language — Thai names
- Raster tiles have the label language baked in. OSM Standard and OSM-FR render the local `name` tag → Thai script in Thailand (good). CARTO raster tiles also render local `name` (Thai in TH) — verify by viewing tiles for your area; some CARTO styles have used Latin transliteration fallback at low zooms. (practice — verify visually)
- For full control use **vector tiles** (OpenFreeMap / MapTiler via MapLibre GL + `@maplibre/maplibre-gl-leaflet`) and set text-field to `["coalesce",["get","name:th"],["get","name"]]`.
- Your own village/landmark labels (#7) should always be Thai first, optional romanised subtitle only if the site has an English mode. Use a Thai-capable font stack (Noto Sans Thai / Sarabun / IBM Plex Sans Thai) with line-height ≥ 1.5 for tone marks.
- Consider contributing missing village/landmark names to OSM (name, name:th) so the basemap improves too.

### 12. Controls placement for thumbs
- Zoom +/− can be hidden on touch (pinch is universal) or kept small top-right; locate + reset-view bottom-right, stacked above the sheet peek height and moving with it. Filter chips horizontally scrollable at top of map, with fade edge. Attribution bottom-left must stay visible (#13) — don't cover it with the sheet at peek (lift it with the sheet). (practice)

### 13. Attribution — mandatory, visible
- Leaflet's attribution control must show the provider's required string, e.g. `© OpenStreetMap contributors © CARTO`; OSM-FR additionally asks for style credit + donation link; OpenFreeMap: "OpenFreeMap © OpenMapTiles Data from OpenStreetMap". Link "OpenStreetMap" to https://www.openstreetmap.org/copyright. Keep it readable at peek state (don't hide behind the sheet).

### 14. Performance & resilience
- Configure a **fallback tile layer** (on `tileerror` spike switch provider) — community servers (OSM-FR/HOT) have had outages. [OSM community: humanitarian tile server down]
- Set `referrerPolicy` default (don't strip Referer — OSM tile policy requires it for web pages). Use `detectRetina` only if provider supports @2x (CARTO `{r}`), otherwise blurry vs 4× requests.

---

## Tile provider options (licence / usage / attribution)

| Provider & style | Key needed? | Free tier / terms | Commercial? | Attribution | Fit |
|---|---|---|---|---|---|
| **CARTO Voyager / Positron** (raster `basemaps.cartocdn.com`) | **Yes — API key now mandatory** (carto.com/basemaps/apikey) | Non-commercial: up to **5M tile requests/month**; commercial: up to 1M/month free; beyond → Basemaps Commercial US$500/mo or US$5,000/yr (≤10M/mo) | Yes within limits | "© OpenStreetMap contributors, © CARTO" | ★ Best calm raster; a community/government non-profit map is well within 5M |
| **Stadia Maps — Alidade Smooth, OSM Bright, Stamen Toner Lite** | Account; domain allow-listing (no key in URL for web) | Free plan **200,000 credits/month**, **non-commercial only**; Starter US$20/mo for commercial | Paid plans | "© Stadia Maps © OpenMapTiles © OpenStreetMap" (+ Stamen for Stamen styles) | Good calm alternative; hard cap = no surprise bill |
| **OpenStreetMap Standard** (`tile.openstreetmap.org`) | No | Best-effort, **no SLA**; must send valid Referer/User-Agent, visible attribution, no heavy use, may be blocked without notice; no bulk prefetch | Allowed if light | "© OpenStreetMap contributors" | OK for low traffic; busier look |
| **OSM France (`tile.openstreetmap.fr/osmfr`, `/hot`)** | No | Donation-funded; allowed for **free projects with moderate volume**; hourly updates; outages happen | Not intended | OSM contributors + style credit + donation link | Fallback only |
| **OpenFreeMap** (vector: Positron, Liberty, Bright) | No | **No limits, no registration**, MIT; public instance or self-host | Yes | "OpenFreeMap © OpenMapTiles Data from OpenStreetMap" | ★ Best if willing to add MapLibre (vector) — also gives `name:th` control |
| MapTiler / Thunderforest / Jawg | Key | Freemium, typically non-commercial free tier | Paid | Provider + OSM | Alternatives |

Recommendation: **CARTO Voyager (primary, API key) + OSM Standard as fallback**, or go vector with **OpenFreeMap Positron** if you want zero-key, unlimited, and control over Thai labels.

---

## Sources
- Apple HIG – Sheets (detents, grabber, Maps-style persistent sheet): https://developer.apple.com/design/human-interface-guidelines/sheets (via https://developers.apple.com/design/human-interface-guidelines/components/presentation/sheets/)
- Material 3 – Bottom sheets guidelines: https://m3.material.io/components/bottom-sheets/guidelines ; Android MDC BottomSheet docs: https://github.com/material-components/material-components-android/blob/master/docs/components/BottomSheet.md
- NN/g – Maps and Location Finders on Mobile Devices: https://www.nngroup.com/articles/mobile-maps-locations/
- Leaflet.markercluster README: https://github.com/Leaflet/Leaflet.markercluster/blob/master/README.md
- Leaflet.Locate: https://github.com/domoritz/leaflet-locatecontrol
- Leaflet.snogylop (inverted polygon mask): https://github.com/ebrelsford/Leaflet.snogylop ; https://github.com/rstudio/leaflet/issues/633 ; maxBoundsViscosity: https://github.com/PaulLeCam/react-leaflet/issues/353
- CARTO basemap styles & terms: https://github.com/CartoDB/basemap-styles ; https://carto.com/legal/basemap-terms/ ; https://carto.com/basemaps/apikey/
- Stadia Maps pricing/attribution/limits: https://stadiamaps.com/pricing/ ; https://docs.stadiamaps.com/attribution/ ; https://docs.stadiamaps.com/limits/
- OSMF Tile Usage Policy: https://operations.osmfoundation.org/policies/tiles/
- OSM France tile server: https://wiki.openstreetmap.org/wiki/FR:Serveurs/tile.openstreetmap.fr ; outage: https://community.openstreetmap.org/t/humanitarian-tile-server-currently-down/121928
- OpenFreeMap: https://github.com/hyperknot/openfreemap
- leaflet-providers (which providers need keys): https://github.com/leaflet-extras/leaflet-providers
- Okabe & Ito, Color Universal Design (CVD-safe palette): https://jfly.uni-koeln.de/color/ (not fetched this session)
- WCAG 2.2 SC 1.4.1 Use of Color, 1.4.11 Non-text Contrast: https://www.w3.org/TR/WCAG22/ (not fetched this session)
