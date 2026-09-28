# 10 — OSM named features, box lat 13.12–13.20 / lng 99.92–100.00 (Tambon Tha Raeng area)

**Attribution:** © OpenStreetMap contributors (ODbL 1.0), via Overture Maps Foundation. Retrieved 2026-09-28.

## Source

- Direct OSM sources are blocked by the egress proxy (403 on CONNECT): overpass-api.de and mirrors (kumi, mail.ru, private.coffee), nominatim, api.openstreetmap.org, download.geofabrik.de (so no Thailand shp or pbf), planet.openstreetmap.org, download.openstreetmap.fr, data.humdata.org, api-prod.raw-data.hotosm.org, photon.komoot.io, tile.openstreetmap.org, and extensions.duckdb.org. The HOT export S3 bucket `production-raw-data-api0` returns NoSuchBucket.
- The source that worked is **Overture Maps release `2026-09-23.1`** on public S3 (`s3://overturemaps-us-west-2/release/2026-09-23.1/`). I read it with s3fs and pyarrow, using bbox predicate pushdown, so nothing large was downloaded. Its OSM-derived layers are divisions/division (place=village nodes), base/land_use, base/infrastructure, base/water and transportation/segment. Each record keeps its OSM id (n/w/r) and last-edit time.
- OSM snapshot dates as Overture ingested them: base 2026-09-06, transportation 2026-09-09, divisions 2026-09-16.
- **Limitation:** Overture carries only a subset of OSM. Point amenities such as `amenity=place_of_worship` (wat nodes), clinic, townhall and marketplace are **not** in these layers. Schools only appear when they were mapped as polygons. To fill that gap, the JSON has a separate list, `overture_places_non_osm`, with 141 community-relevant POIs from Overture Places. Those come from Meta and are licensed **CDLA-Permissive-2.0, NOT OSM**. They are filtered to confidence ≥ 0.5 and need manual checking, because some categories are wrong (e.g. 'โรงพักบ้านแหลม' is tagged as buddhist, 'วัดบุญทวี' as jewish).
- No tambon (admin_level 8) polygon is present in Overture division_area for this area. Only the amphoe (ADM2) and changwat polygons are there.

## OSM features: counts by type (33 total)

- division:village: 4
- infrastructure:bridge: 3
- infrastructure:viewpoint: 1
- land_use:golf_course: 1
- land_use:park: 1
- land_use:pitch: 4
- land_use:school: 3
- land_use:stadium: 1
- rail:standard_gauge: 1
- road:residential: 6
- road:secondary: 1
- road:service/tertiary: 1
- road:tertiary: 3
- road:unclassified: 2
- water:river: 1

## OSM feature list

| type | name | name:en | lat | lng | OSM id | note |
|---|---|---|---|---|---|---|
| division:village | บ้านคลองมอญ | Ban Khlong Mon | 13.164498 | 99.987575 | n4840703341 |  |
| division:village | บ้านเหนือวัดปากคลอง |  | 13.186893 | 99.946481 | n12995299457 |  |
| division:village | บ้านเหมืองไทร | Ban Mueang Sai | 13.152844 | 99.96397 | n4840703336 |  |
| division:village | บ้านโพธิ์ | Ban Pho | 13.136696 | 99.948223 | n13425579886 |  |
| infrastructure:bridge | Ratchadamnoen | Ratchadamnoen | 13.191426 | 99.947558 | w406492358 |  |
| infrastructure:bridge | สายใต้ | Southern Line | 13.131329 | 99.926582 | w193610165 |  |
| infrastructure:bridge | สายใต้ | Southern Line | 13.131306 | 99.926683 | w1443176806 |  |
| infrastructure:viewpoint | small cave | small cave | 13.13728 | 99.932133 | n6251237586 |  |
| land_use:golf_course | เพชรบุรีกอล์ฟ ไดร์วิ่งเรนจ์ | Phetchaburi Golf Driving Range | 13.125661 | 99.930222 | w1463601992 |  |
| land_use:park | สวนสาธารณะดอนคาน |  | 13.125594 | 99.935553 | r19346125 |  |
| land_use:pitch | สนามบาสเกตบอลเพชรบุรี |  | 13.123917 | 99.935574 | w1414214588 |  |
| land_use:pitch | สนามบาสเกตบอลเพชรบุรี |  | 13.124273 | 99.935587 | w1414214586 |  |
| land_use:pitch | สนามฟุตซอลเพชรบุรี |  | 13.124012 | 99.936175 | w308525008 |  |
| land_use:pitch | สนามฟุตซอลเพชรบุรี |  | 13.124077 | 99.936653 | w308525009 |  |
| land_use:school | โรงเรียนบ้านคลองมอญ | Ban Khlong Mon School | 13.16584 | 99.989496 | w491986382 |  |
| land_use:school | โรงเรียนบ้านเหมืองไทร |  | 13.153392 | 99.965742 | w491986381 |  |
| land_use:school | โรงเรียนราษฎร์วิทยา(กวงตง) แผนกมัธยมศึกษา | Ratsawittaya School (Kwangtung) Middle School | 13.127784 | 99.957809 | w1458052065 |  |
| land_use:stadium | สนามกีฬาจังหวัดเพชรบุรี | Phetchaburi Province Stadium | 13.125037 | 99.936268 | w308525006 |  |
| rail:standard_gauge | สายใต้ | Southern Line | 13.129301 | 99.928591 | w1272687418, w1272687419, w1272687424… | 5.48 km in box |
| road:residential | จส.ซอย 1 |  | 13.120429 | 99.93844 | w244678840 | 0.13 km in box |
| road:residential | จส.ซอย 2 |  | 13.120195 | 99.939669 | w244678842 | 0.06 km in box |
| road:residential | จส.ซอย 3 |  | 13.121017 | 99.939891 | w244678834 | 0.35 km in box |
| road:residential | จส.ซอย 4 |  | 13.122536 | 99.939483 | w244678835 | 0.44 km in box |
| road:residential | ซอยดอนคาน 1 |  | 13.128571 | 99.934761 | w244678810 | 0.12 km in box |
| road:residential | ซอยโดนัท |  | 13.120264 | 99.946991 | w244680763 | 0.17 km in box |
| road:secondary | Ratchadamnoen | Ratchadamnoen | 13.19272 | 99.949298 | w341130543, w406492358, w406492359 | 2.23 km in box |
| road:service/tertiary | ถนนคีรีรัถยา | Khiri Ratthaya Road | 13.131845 | 99.932696 | w551231992, w576904087 | 1.77 km in box |
| road:tertiary | ถนนดอนคาน |  | 13.126147 | 99.939732 | w244678797 | 1.62 km in box |
| road:tertiary | ถนนถมสมาน |  | 13.134537 | 99.929536 | w244678794 | 1.33 km in box |
| road:tertiary | ถนนไชยสุรินทร์ | Chaisurin Road | 13.120455 | 99.950819 | w237060318 | 0.2 km in box |
| road:unclassified | ถนนรอบเขาหลวง |  | 13.140128 | 99.935134 | w514604536 | 2.48 km in box |
| road:unclassified | ถนนวัดบรรไดทอง-วัดวิหารโบสถ์ |  | 13.136857 | 99.938668 | w514617010 | 1.05 km in box |
| water:river | แม่น้ำเพชรบุรี | Phetchaburi River | 13.162849 | 99.951129 | w120451772 | partly outside box |

The four OSM `place=village` nodes are บ้านคลองมอญ, บ้านเหมืองไทร, บ้านโพธิ์ and บ้านเหนือวัดปากคลอง. OSM has no named canal (`waterway=canal`) in the box as Overture exposes it. The only named waterway is แม่น้ำเพชรบุรี.

## Non-OSM supplement: Overture Places (Meta, CDLA-Permissive-2.0), 141 items

- government_office: 33
- buddhist_place_of_worship: 21
- place_of_learning: 15
- hospital: 14
- education: 8
- community_and_government: 7
- muslim_place_of_worship: 7
- elementary_school: 6
- college_university: 4
- park: 4
- social_or_community_service: 4
- christian_place_of_worship: 2
- community_center: 2
- health_care: 2
- educational_facility: 1
- farmers_market: 1
- food_and_beverage_store: 1
- government_department: 1
- jewish_place_of_worship: 1
- military_site: 1
- national_park: 1
- preschool: 1
- second_hand_store: 1
- shipping_or_delivery_service: 1
- specialty_school: 1
- tutoring_service: 1

Items whose name contains 'ท่าแร้ง':

- วัดกุฏิ ท่าแร้ง (buddhist_place_of_worship) 13.151362, 99.947905, conf 0.85
- อบต.ท่าแร้ง จ.เพชรบุรี (community_and_government) 13.153058, 99.957547, conf 0.88
- ศูนย์การเรียนรู้ระดับตำบลท่าแร้ง (education) 13.159021, 99.970983, conf 0.91
- รพ.สต.ท่าแร้ง (government_department) 13.150396, 99.949749, conf 0.87
- อบต.ท่าแร้งออก (government_office) 13.153637, 99.96531, conf 0.91
- สถานีอนามัยบ้านท่าแร้ง (hospital) 13.150325, 99.949604, conf 0.82
- อนามัย ท่าแร้ง ออก (hospital) 13.156744, 99.972828, conf 0.76
- โรงพยาบาลส่งเสริมสุขภาพตำบลท่าแร้ง (hospital) 13.150116, 99.949436, conf 0.82
- โรงพยาบาลส่งเสริมสุขภาพตำบลท่าแร้ง (hospital) 13.140025, 99.955676, conf 0.8

The full list, with coordinates, is in `osm-pois.json` under `overture_places_non_osm.items`.
