# 09 — ท่าแร้ง / ท่าแร้งออก: relationship, neighbours, codes, postal code

Researched 2026-09-28. Network limits: th.wikipedia.org, taraeng.go.th, tharaengok.go.th, wikicommunity.sac.or.th and thaitambon.com were all blocked for direct fetch. The code data comes from raw GitHub files I downloaded myself, and I checked it across three datasets. The rest comes from web-search snippets of the sources listed. Items marked **[snippet]** are paraphrases that a search engine gave of those pages, not text I read on the page. Confirm them before publishing.

## 1. Official codes (TIS-1099 / DOPA geocode) and postal code — VERIFIED (3 datasets agree)

| Level | Thai | English | Code | Postal |
|---|---|---|---|---|
| Province | เพชรบุรี | Phetchaburi | 76 | — |
| District | บ้านแหลม | Ban Laem | 7607 | — |
| **Subdistrict** | **ท่าแร้ง** | **Tha Raeng** | **760709** | **76110** |
| **Subdistrict** | **ท่าแร้งออก** | **Tha Raeng Ok** | **760710** | **76110** |

Approximate centroids from the kongvut dataset: ท่าแร้ง lat 13.159, long 99.96. ท่าแร้งออก lat 13.155, long 99.976. This puts ท่าแร้งออก just to the east of ท่าแร้ง, which fits the name ("ออก" = east).

All 10 tambon of Ban Laem, with codes and postcodes from the same datasets:
760701 บ้านแหลม 76110 · 760702 บางขุนไทร 76110 · 760703 ปากทะเล 76110 · 760704 บางแก้ว 76110 · 760705 แหลมผักเบี้ย **76100** · 760706 บางตะบูน 76110 · 760707 บางตะบูนออก 76110 · 760708 บางครก 76110 · 760709 ท่าแร้ง 76110 · 760710 ท่าแร้งออก 76110

Watch out for the name clash: **แขวงท่าแร้ง, เขตบางเขน, กรุงเทพฯ** has code 100508 and postcode 10220 (one dataset also gives 10230). It is a different place. Do not mix it up with ours.

Sources:
- https://raw.githubusercontent.com/kongvut/thai-province-data/master/api/latest/sub_district.json (ids 760709 and 760710, zip 76110)
- https://raw.githubusercontent.com/earthchie/jquery.Thailand.js/master/jquery.Thailand.js/database/raw_database/raw_database.json (district_code 760709 and 760710, zipcode 76110)
- https://raw.githubusercontent.com/thailand-geography-data/thailand-geography-json/main/src/geography.json (subdistrictCode 760709 "Tha Raeng" and 760710 "Tha Raeng Ok", postalCode 76110)

## 2. Relationship between ท่าแร้ง and ท่าแร้งออก

- They are **two separate tambon**, each with its own geocode (above).
- **Each tambon has its own อบต.** (no เทศบาล found for either):
  - องค์การบริหารส่วนตำบลท่าแร้ง (อบต.ท่าแร้ง), website http://www.taraeng.go.th/
  - องค์การบริหารส่วนตำบลท่าแร้งออก (อบต.ท่าแร้งออก), website http://www.tharaengok.go.th/, tel. 032-782141 [snippet]
  - The Thai Wikipedia page อำเภอบ้านแหลม lists both อบต.ท่าแร้ง and อบต.ท่าแร้งออก among the district's local governments. It says อบต.ท่าแร้งออก covers the whole of ตำบลท่าแร้งออก. [snippet] https://th.wikipedia.org/wiki/อำเภอบ้านแหลม
- **History [snippet]:** Both อบต. websites tell the same founding story. The place began as a small low-lying village settled by migrants from Malaya (มลายู). The name "คลองท่าแร้ง" comes from vultures (แร้ง) eating dead fish left behind when the Phetchaburi River flooded into the canal. In the reign of King Rama VI a แขวง was set up under the name "แขวงท่าแร้ง", headed by ขุนศรียา. **ตำบลท่าแร้งออก was later created as a separate tambon, split off from ตำบลท่าแร้ง, on the eastern side.** I could not find the year of the split or the Royal Gazette reference.
  - https://www.taraeng.go.th/site/index.php?option=com_content&view=article&id=46&Itemid=58
  - http://www.tharaengok.go.th/site/index.php?option=com_content&view=article&id=48&Itemid=73
- **Boundary between them [snippet]:** Search snippets say คลองท่าแร้ง (Khlong Tha Raeng) forms the boundary between ต.ท่าแร้ง and ต.ท่าแร้งออก. This is unverified. It fits the fact that ท่าแร้งออก records mention a road "คันคลองท่าแร้ง" in its หมู่ 2.
- **Villages:**
  - ต.ท่าแร้ง has **7 หมู่บ้าน**, an area of **12.214 km² (7,633.57 ไร่)**, and lies about **6 km south of the Ban Laem district office**. [snippet, taraeng.go.th สภาพทั่วไป] http://www.taraeng.go.th/site/index.php?option=com_content&view=article&id=47&Itemid=60
  - "บ้านท่าแร้ง" (the community on SAC วิกิชุมชน) is in **หมู่ 7 ต.ท่าแร้ง**. [snippet] https://wikicommunity.sac.or.th/community/1182
  - ต.ท่าแร้งออก has at least หมู่ 1 (places named ท่ากระแซ and ซอยบ้านบังแจ้) and หมู่ 2 (บ้านบังยี่ to สะพานหัวกระทุ่ม/บ้านมานับ, along คันคลองท่าแร้ง). These come from อบต.ท่าแร้งออก procurement notices. I did not find the total number of villages. [snippet]
  - I did **not** find a full list of village names for either tambon. Ban Laem district as a whole has 10 tambon and 73 หมู่บ้าน (Wikipedia, snippet).

## 3. Neighbours of ตำบลท่าแร้ง (Ban Laem) — [snippet, from taraeng.go.th สภาพทั่วไป / แผนพัฒนา PDF]

| Side | Neighbour(s) |
|---|---|
| North | ต.บ้านแหลม and ต.บางครก (อ.บ้านแหลม) |
| East | ต.ท่าแร้งออก and ต.บางขุนไทร (อ.บ้านแหลม) |
| South | ต.หนองโสน (อ.เมืองเพชรบุรี), run by เทศบาลตำบลหนองโสน |
| West | ต.บ้านกุ่ม (อ.เมืองเพชรบุรี) and ต.บางครก (อ.บ้านแหลม) |

Caveats: these entries are search-engine paraphrases of the อบต. page. บางครก shows up on both the north and the west side, which is plausible for a diagonal boundary but should be checked. The east entry (ท่าแร้งออก + บางขุนไทร) comes from one snippet only. Check all of this against the original page or PDF (links below) or a DOPA/Longdo boundary map before printing it on the community map.

Sources:
- http://www.taraeng.go.th/site/index.php?option=com_content&view=article&id=47&Itemid=60
- http://www.taraeng.go.th/attachments/article/341/ (ส่วนที่ 1–2 สภาพทั่วไปและข้อมูลพื้นฐาน, PDF)
- https://www.nongsanophet.go.th/site/index.php?option=com_content&view=article&id=48&Itemid=65 (เทศบาลตำบลหนองโสน)
- Longdo map of อบต.ท่าแร้งออก: https://map.longdo.com/main/p/A10244447

## Open gaps
- Year and Royal Gazette reference for when ท่าแร้งออก was split off.
- Full list of village names for ท่าแร้ง (7) and the village count for ท่าแร้งออก.
- Neighbours of ท่าแร้งออก on each side (not found).
