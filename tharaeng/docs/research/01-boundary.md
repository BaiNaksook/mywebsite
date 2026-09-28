# 01 — Boundary polygon: ตำบลท่าแร้ง อ.บ้านแหลม จ.เพชรบุรี

## Result
FOUND. A boundary polygon traceable to the official OCHA/HDX COD-AB Thailand dataset (source agency: Royal Thai Survey Department, RTSD).

Output: `boundary-tha-raeng.geojson` (FeatureCollection, 1 Polygon feature, original properties kept, coords rounded to 6 dp, WGS84 lon/lat).
Comparison file: `boundary-tha-raeng-ok.geojson` (ตำบลท่าแร้งออก, TH760710).

## Source
- File used: `tambon/geojson/Phetchaburi.geojson` in GitHub repo **prasertcbs/thailand_gis**
  - https://github.com/prasertcbs/thailand_gis/blob/master/tambon/geojson/Phetchaburi.geojson (fetched via `git clone`; commit `1926690c14851700ad517522a279b0248e3bbbc6`)
- Upstream dataset (per repo README): OCHA HDX "Thailand - Subnational Administrative Boundaries" (COD-AB), https://data.humdata.org/dataset/cod-ab-tha
  - README-cited download: `tha_adm_rtsd_itos_20210121_shp.zip`; the repo's simplified tambon folder is named `tha_admbnda_adm3_rtsd_20220121` (date label differs between README and file names: 2021-01-21 vs 2022-01-21 — upstream version date is therefore one of these; could not confirm because data.humdata.org is blocked by the egress proxy).
  - Property schema (ADM3_PCODE, ADM3_EN/TH, Shape_Leng, Shape_Area …) matches the HDX COD-AB `tha_admbnda_adm3_rtsd` layer.
- License: HDX COD-AB Thailand is published under CC BY-IGO (attribution: OCHA / Royal Thai Survey Department) — stated from knowledge of the HDX listing, NOT verified in-session (HDX blocked). The GitHub mirror has no LICENSE file.

## Feature properties
| key | value |
|---|---|
| ADM3_PCODE | TH760709 |
| ADM3_TH / EN | ท่าแร้ง / Tha Raeng |
| ADM2_PCODE | TH7607 (บ้านแหลม / Ban Laem) |
| ADM1_PCODE | TH76 (เพชรบุรี / Phetchaburi) |
| Shape_Area (deg²) | 0.000868754909574 |
| Shape_Leng (deg) | 0.198281437637 |

Tambon code = **760709** (not 760603). Tha Raeng Ok = 760710.

## Geometry metrics (computed)
- Type: Polygon, 1 ring (no holes), **45 vertices** (incl. closing vertex)
- BBox (lon/lat): [99.946597, 13.132726, 100.004185, 13.180610]
- Planar centroid: **13.162130 N, 99.969866 E**
- Area: **10.49 km²** (spherical); consistent with Shape_Area (0.000869 deg² ≈ 10.5 km² at 13°N)
- Point-in-polygon: 13.159, 99.960 → INSIDE. Tha Raeng Ok point 13.155, 99.976 → OUTSIDE.

Tha Raeng Ok (TH760710) for comparison: 34 vertices, bbox [99.955492, 13.136914, 99.997656, 13.169635], centroid 13.153044 N, 99.978289 E, 6.77 km²; contains 13.155, 99.976 and not 13.159, 99.960. The two tambons are adjacent; Tha Raeng Ok sits to the SE/E of the given Tha Raeng point, and Tha Raeng's bbox partly overlaps it (Tha Raeng wraps around it) — bbox overlap is expected, polygons do not overlap.

## Independent cross-check
chingchai/OpenGISData-Thailand `subdistricts.geojson` (commit 5b332fc, 2025-11-27; source not documented, likely DOPA/other): tam_code 760709 ท่าแร้ง, Ban Laem, Phetchaburi — bbox [99.946456, 13.133128, 100.001464, 13.180172], area_sqkm 9.745, 12 vertices (heavily generalised). Agrees with the HDX-derived polygon to within ~0.003° on every bbox edge. Tha Raeng Ok 760710: 7.77 km². Not used as output (unknown provenance, coarser).

## Caveats
- Not the official DOPA/RTSD cadastral-grade line; COD-AB is a generalised administrative layer (45 vertices ≈ a few hundred m resolution). Fine for a community map outline, not for legal/land use.
- Retrieved from a third-party GitHub mirror, not directly from HDX (blocked). The mirror states it only reformatted the HDX shapefile to per-province GeoJSON.
- geoBoundaries gbOpen has NO THA ADM3 layer (only ADM0–ADM2 in the repo), so it could not be used.
- Coastal edge (Gulf side, if any) follows the dataset's coastline, not current shoreline.
- Also in the Bangkok dataset: Tha Raeng khwaeng (100508, Bang Khen) — excluded.
