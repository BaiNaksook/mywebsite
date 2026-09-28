# 02 - Alternate boundary source for ตำบลท่าแร้ง (TAMBON 760709, อ.บ้านแหลม, จ.เพชรบุรี)

## Result in one line
Found a second polygon with a **different, non-OCHA attribute schema** (opsifiz repo). Area **9.21 km²**, centroid **13.16150 N, 99.96809 E**. It overlaps the OCHA-lineage polygon with IoU **0.76**. Neither polygon matches the reported official area of **12.214 km²**. Saved to `boundary-alt.geojson`. Its license is **unknown**.

## Polygon found (saved: boundary-alt.geojson)
- URL: https://raw.githubusercontent.com/opsifiz/Dashboard-Khao_Phaeng_Ma/HEAD/border/tambon/tha_raeng.geojson (repo https://github.com/opsifiz/Dashboard-Khao_Phaeng_Ma)
- The file holds 2 features. The Bangkok one (TAMBON_IDN 100508) was dropped. I kept only `TAMBON_IDN 760709, TAM_NAM_T ท่าแร้ง, AMPHOE_T บ้านแหลม, PROV_NAM_T เพชรบุรี`.
- Schema: ObjectID, Name_ID, TAMBON_IDN, TAM_NAM_T/E, AMPHOE_IDN, PROV_CODE, P_CODE "PB", Region_THA. This is **not** the OCHA COD-AB schema (ADM3_PCODE "TH760709"), so it appears to come from a different Thai tambon shapefile. I could not determine where it came from upstream.
- **License: none stated.** The repo has no LICENSE or README (both return 404), and the GitHub API is blocked for this repo in this session. Use it only to cross-check. Do not publish it unless the provenance is cleared.
- Geometry: 1 Polygon, 1 ring, 445 vertices, CRS84.
- Computed with python3 (local equirectangular projection, shoelace formula):
  - Area: **9.206 km²** (about 5,754 rai)
  - Centroid: **lat 13.161499, lon 99.968090**
  - BBox (lon/lat): **99.946469, 13.132901 to 100.001500, 13.180149**
- Same source, neighbour ท่าแร้งออก (760710; file `border/tambon/tha_raeng_ok.geojson`): 7.684 km², centroid 13.154748, 99.977853.

## Cross-check vs OCHA lineage (for comparison only, not independent)
- watttab/watttab.github.io `data/processed/tambon/TH760709.json` (pcode TH760709, OCHA-style): area **10.460 km²**, centroid 13.162299, 99.969999, bbox 99.946586,13.132726 to 100.004575,13.180946. For Tha Raeng Ok (TH760710): 6.774 km².
- Grid overlap test (300x300 point-in-polygon grid):
  - Tha Raeng IoU between opsifiz and OCHA = **0.763**. About 8.47 km² is shared.
  - About 1.32 km² is counted as Tha Raeng in OCHA but as Tha Raeng Ok in opsifiz.
  - About 0.6 km² is found in only one of the two sources, on each side.
  - The main disagreement is the Tha Raeng / Tha Raeng Ok boundary. The combined area of the two tambons is similar in both sources (opsifiz 16.89 km², OCHA 17.23 km²).
- The watttab file also has 7 village points: คลองแหลม, ดอนเทพศักดิ์, นาโพธิ์, ป่าขวาง, วัดกุฏิ, หัวกระทุ่ม, ในพัฒนา. Their provenance is unknown. They are listed here as a lead only.

## Official area
- A WebSearch summary of the อบต.ท่าแร้ง page "สภาพทั่วไป" (http://www.taraeng.go.th/site/index.php?option=com_content&view=article&id=47&Itemid=60) says: **เนื้อที่ 12.214 ตร.กม. (7,633.57 ไร่)**.
- **I could not verify this.** taraeng.go.th is blocked by the egress proxy, and the figure comes from a search-engine summary, not from the page text.
- The rai figure does not match its own km² figure: 12.214 km² × 625 = 7,633.75 rai.
- Both polygons are smaller than 12.214 km² (OCHA 10.46, alt 9.21). The official figure may include water or mangrove, or use a different survey.

## Other GitHub datasets checked (all OCHA/RTSD 2019 lineage, so not independent)
- DevelopedbyWill/thailand-canonical-admin-names (CC BY 4.0): its polygons come from mapthai.
- piyayut-ch/mapthai: UNOCHA / Royal Thai Survey Department 2019, simplified.
- siwakorne/thailocate (Go): UN OCHA COD-AB, CC BY-IGO.
- watttab.github.io: OCHA pcodes.
- chinapedia/thai-provinces 7607.json: centroid points only.
- whosonfirst-data-admin-th: only GeoNames village points (e.g. "Ban Tha Raeng Tok" 13.15, 99.96667). No polygon.

## Sources tried and reachability
| Source | Result |
|---|---|
| overpass-api.de, overpass.kumi.systems, overpass.private.coffee, maps.mail.ru overpass | 403 (proxy blocked) |
| nominatim.openstreetmap.org, api.openstreetmap.org, www.openstreetmap.org, tile.openstreetmap.org, photon.komoot.io | 403 blocked |
| polygons.openstreetmap.fr, osm-boundaries.com, wambachers-osm.website, download.geofabrik.de, community.openstreetmap.org | 403 blocked |
| data.go.th, data.humdata.org, zenodo.org, cdn.jsdelivr.net | 403 blocked |
| taraeng.go.th, th.wikipedia.org (curl and WebFetch) | blocked |
| raw.githubusercontent.com | OK. All data came from here |
| GitHub code search (MCP) | OK. Found the opsifiz, watttab and WOF files |
| GitHub REST API or MCP get_file_contents for repos other than bainaksook/mywebsite | denied (not configured for the session) |
| pypi, npm registry, proxy.golang.org | reachable, not used |
| WebSearch | ran out of budget part-way through (200/200) |

- I found **no OSM-derived tambon polygon**. An OSM forum thread exists about importing Thai subdistrict (admin_level 8) boundaries (https://community.openstreetmap.org/t/subdistrict-tambon-level-8-boundaries-import/141390), but it was not reachable.
- GISTDA, DOPA and RTSD portals were not reached. The search budget ran out, and the .go.th and data portals tested so far were blocked.

## Recommendation
- The two datasets agree on location: centroid difference is about 0.14 km, and bboxes match within about 0.003°.
- They disagree mainly on the eastern border with ท่าแร้งออก. Village and landmark placement near that border should be checked on the ground or with the อบต.
- Prefer the OCHA polygon for publishing because its license is clear (CC BY-IGO). Use this alternate polygon only as a check.
