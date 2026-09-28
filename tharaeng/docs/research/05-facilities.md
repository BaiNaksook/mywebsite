# 05 - Public facilities in ตำบลท่าแร้ง (อ.บ้านแหลม จ.เพชรบุรี)

Researched 2026-09-28. Scope: ตำบลท่าแร้ง only (not ท่าแร้งออก).

## Bottom line
- I could not verify a published coordinate for any facility. Every `lat`/`lng` below is `null`.
- Egress was almost totally blocked. WebFetch and curl were refused for every host I tried (see the list at the end). Only WebSearch result titles/snippets were readable, and the WebSearch budget (200 calls) ran out during this task.
- The addresses and หมู่ come from search snippets. They are consistent across sources but I could not open the source pages.

## Facilities table

| # | Name | Type | หมู่ | Address (as published) | lat | lng | Confidence (existence/address) | Sources |
|---|------|------|------|------------------------|-----|-----|------------|---------|
| 1 | องค์การบริหารส่วนตำบลท่าแร้ง (ที่ทำการ อบต.) | local government office | 7 (บ้านในพัฒนา) | หมู่ที่ 7 บ้านในพัฒนา ต.ท่าแร้ง อ.บ้านแหลม จ.เพชรบุรี 76110; โทร 032-782097 แฟกซ์ 032-782098 | null | null | high (address); coords none | taraeng.go.th (contact page, "แผนที่ดาวเทียม" page id=48) via search snippets |
| 2 | โรงเรียนบ้านท่าแร้ง (สหราษฎร์) (OBEC code 76010081; school ID 1076370178) | primary school, สพป.เพชรบุรี เขต 1 | 4 | 185 หมู่ 4 ต.ท่าแร้ง อ.บ้านแหลม จ.เพชรบุรี 76110 | null | null | high (address); coords none | pawano.net/details/1076370178; talang.myreadyweb.com (school site); promptpai.com/p/10327459 |
| 3 | โรงเรียนบ้านคลองมอญ (OBEC code 76010082) | primary school, สพป.เพชรบุรี เขต 1 | 3 | หมู่ที่ 3 ต.ท่าแร้ง อ.บ้านแหลม จ.เพชรบุรี 76110 (Longdo: ถนน รพช. 7045) | null | null | high (address); coords unverified (see note) | contact.page listing; map.longdo.com/main/p/A00072855; school.webactivity.net (76010082) |
| 4 | โรงเรียนวัดกุฏิ (นันทวิเทศประชาสรรค์) (OBEC code 76010084) | primary school | 6 (บ้านวัดกุฏิ) | หมู่ที่ 6 บ้านวัดกุฏิ ต.ท่าแร้ง อ.บ้านแหลม จ.เพชรบุรี 76110; โทร 032-473587 | null | null | high (address); coords none | watgud.ac.th/contact; facebook.com/watgudschool; school.webactivity.net (76010084) |
| 5 | รพ.สต.ท่าแร้ง | health promoting hospital (รพ.สต.) | unknown | ต.ท่าแร้ง อ.บ้านแหลม จ.เพชรบุรี (full address and hcode not found) | null | null | medium (exists); address unknown | Facebook page "รพ.สต.ท่าแร้ง" (facebook.com/pages/.../233460463448595); healthserv.net list of Phetchaburi รพ.สต. (not opened) |
| 6 | ศูนย์พัฒนาเด็กเล็ก อบต.ท่าแร้ง | child development centre | unknown | not published in anything I could read | null | null | medium (exists: อบต. procurement notices mention buying learning materials for it); location unknown | taraeng.go.th article id=110 (procurement contract, search snippet) |
| 7 | ศูนย์สาธิตพืชไร่และพืชสวนเพชรบุรี | government agricultural demonstration centre | 7 | หมู่ที่ 7 ต.ท่าแร้ง อ.บ้านแหลม จ.เพชรบุรี | null | null | medium (from a snippet of a taraeng.go.th plan document) | taraeng.go.th development-plan PDF (search snippet) |

### Not found
- Police posts, fire station, markets, community halls/ศาลาประชาคม: I found nothing specific to ต.ท่าแร้ง. The closest is สถานีตำรวจภูธรบ้านแหลม (Longdo A00033454, on ทล.3178), but it is not confirmed to be inside ต.ท่าแร้ง.

### Discrepancies and warnings
- **Ban Khlong Mon coordinate (unverified, left out of the data):** one WebSearch answer gave `13.20900158762984, 99.9814385175705` for โรงเรียนบ้านคลองมอญ. It did not say which result it came from, and an exact-string search for that value found no source page. I left it out of the data because the rules say to record only coordinates I can trace to a source. It is ~5.5 km north of the tambon reference point (13.159, 99.960). Check it against Longdo A00072855 before using it.
- **Ban Tha Raeng school address conflict:** PromptPai's geocoded address says "ทางหลวงแผ่นดิน 3178, ท่าแร้งออก", but the official address is 185 ม.4 ต.ท่าแร้ง. Treat the official address as correct. The school may sit near the ท่าแร้ง/ท่าแร้งออก boundary.
- Excluded, because it is in ท่าแร้งออก: โรงเรียนอิสลามดำรงธรรม (ม.4 ต.ท่าแร้งออก) and อบต.ท่าแร้งออก (Longdo A10244447).

## Suggested next steps (need network access)
1. Open Longdo POI pages for coordinates: A00072855 (บ้านคลองมอญ), and search Longdo for บ้านท่าแร้ง(สหราษฎร์), วัดกุฏิ, รพ.สต.ท่าแร้ง, อบต.ท่าแร้ง.
2. hcode.moph.go.th: search for "ท่าแร้ง" in จ.เพชรบุรี to get the รพ.สต. 5-digit code and address. Some hcode pages publish lat/long.
3. taraeng.go.th: the "ข้อมูลพื้นฐาน" PDFs (attachments/article/244 and /341) should list schools, ศพด., รพ.สต., and ศาลาประชาคม by หมู่.
4. OBEC data (data.go.th school dataset / bigdata tableSchoolID.php?id=76010081, 76010082, 76010084), which usually carries LAT/LONG.

## Blocked hosts (egress proxy 403 / EGRESS_BLOCKED)
taraeng.go.th (http and https), www.pawano.net, wikicommunity.sac.or.th, map.longdo.com, th.wikipedia.org, school.webactivity.net, *.contact.page, healthserv.net, chonlatit.com, watgud.ac.th, talang.myreadyweb.com, google.com, nominatim/api.openstreetmap.org, overpass-api.de, data.go.th, hcode.moph.go.th, trueplookpanya.com, schoolmap.obec.go.th, wikidata.org, thaitambon.com.

## JSON

```json
[
  {"name": "องค์การบริหารส่วนตำบลท่าแร้ง", "type": "sao_office", "moo": 7, "address": "หมู่ที่ 7 บ้านในพัฒนา ต.ท่าแร้ง อ.บ้านแหลม จ.เพชรบุรี 76110 (โทร 032-782097)", "lat": null, "lng": null, "sources": ["http://www.taraeng.go.th/site/index.php?option=com_contact&view=contact&id=2&Itemid=83", "http://www.taraeng.go.th/site/index.php?option=com_content&view=article&id=48&Itemid=84"], "confidence": "high-address/no-coords"},
  {"name": "โรงเรียนบ้านท่าแร้ง (สหราษฎร์)", "type": "school", "moo": 4, "address": "185 หมู่ 4 ต.ท่าแร้ง อ.บ้านแหลม จ.เพชรบุรี 76110", "lat": null, "lng": null, "sources": ["https://www.pawano.net/details/1076370178", "http://talang.myreadyweb.com/", "https://promptpai.com/p/10327459"], "confidence": "high-address/no-coords"},
  {"name": "โรงเรียนบ้านคลองมอญ", "type": "school", "moo": 3, "address": "หมู่ที่ 3 ต.ท่าแร้ง อ.บ้านแหลม จ.เพชรบุรี 76110 (ถนน รพช. 7045)", "lat": null, "lng": null, "sources": ["https://map.longdo.com/main/p/A00072855", "https://school.webactivity.net/primary/?page=school-detail&school_code=76010082&district_code=76010000&from=schools"], "confidence": "high-address/coords-unverified (untraced search value 13.20900158762984, 99.9814385175705)"},
  {"name": "โรงเรียนวัดกุฏิ (นันทวิเทศประชาสรรค์)", "type": "school", "moo": 6, "address": "หมู่ที่ 6 บ้านวัดกุฏิ ต.ท่าแร้ง อ.บ้านแหลม จ.เพชรบุรี 76110 (โทร 032-473587)", "lat": null, "lng": null, "sources": ["http://watgud.ac.th/contact", "https://www.facebook.com/watgudschool"], "confidence": "high-address/no-coords"},
  {"name": "โรงพยาบาลส่งเสริมสุขภาพตำบลท่าแร้ง", "type": "health_rpst", "moo": null, "address": "ต.ท่าแร้ง อ.บ้านแหลม จ.เพชรบุรี", "lat": null, "lng": null, "sources": ["https://www.facebook.com/pages/%C3%A0%C2%B8%C2%A3%C3%A0%C2%B8%C2%9E.%C3%A0%C2%B8%C2%AA%C3%A0%C2%B8%C2%95.%C3%A0%C2%B8%C2%97%C3%A0%C2%B9%C2%88%C3%A0%C2%B8%C2%B2%C3%A0%C2%B9%C2%81%C3%A0%C2%B8%C2%A3%C3%A0%C2%B9%C2%89%C3%A0%C2%B8%C2%87/233460463448595/"], "confidence": "medium-exists/no-address/no-coords"},
  {"name": "ศูนย์พัฒนาเด็กเล็ก อบต.ท่าแร้ง", "type": "child_dev_centre", "moo": null, "address": null, "lat": null, "lng": null, "sources": ["http://www.taraeng.go.th/site/index.php?option=com_content&view=article&id=110:2013-09-07-04-43-50&catid=35:2011-09-19-09-53-58&Itemid=82"], "confidence": "medium-exists/no-address/no-coords"},
  {"name": "ศูนย์สาธิตพืชไร่และพืชสวนเพชรบุรี", "type": "gov_agri_centre", "moo": 7, "address": "หมู่ที่ 7 ต.ท่าแร้ง อ.บ้านแหลม จ.เพชรบุรี", "lat": null, "lng": null, "sources": ["http://www.taraeng.go.th/attachments/article/244/ (ส่วนที่ 1 สภาพทั่วไปและข้อมูลพื้นฐาน PDF)"], "confidence": "medium/no-coords"}
]
```
