# 04 - Temples and religious sites in ตำบลท่าแร้ง (อ.บ้านแหลม จ.เพชรบุรี)

Researched 2026-09-28. Method: WebSearch only. Every direct fetch was blocked by the egress proxy: wat-thai.org, th.wikipedia.org, wikidata.org, cicot.or.th, masjidthai.com, map.longdo.com, gplace.com, wikicommunity.sac.or.th, m-culture.in.th, and taraeng.go.th PDFs (curl returned a 104-byte error body). Everything below comes from search-engine snippets. The web-search budget ran out (200/200) before I could finish looking for coordinates.

**Key finding:** Ban Tha Raeng is historically a **Muslim community**. Wikicommunity says the settlers migrated from Malaysia, and the Phetchaburi Provincial Islamic Committee office is in ม.7 ต.ท่าแร้ง. The ตำบล therefore has **more mosques than wat**. Mosques are included below as type "mosque".

## Summary table

| # | Name (Thai) | Type | หมู่ (address) | Lat | Lng | Coord source | Confidence |
|---|---|---|---|---|---|---|---|
| 1 | วัดกุฎิ (Wat Kuti) | temple | ม.5 (wat-thai.org) / ม.6 (wikicommunity, taraeng.go.th, search snippets); ต.ท่าแร้ง | 13.149722 | 99.948056 | Wikidata Q102184116, P625 = 13°8'59"N 99°56'53"E (reference: GNS). Seen only in a search snippet. | medium (address confirmed; the coordinate is GNS-derived and I could not open Wikidata to verify it) |
| 2 | วัดไทรทอง (Wat Sai Thong) | temple | ม.1 ต.ท่าแร้ง (wikicommunity / taraeng.go.th). **Conflict:** th.wikipedia and DMC.tv say ต.บางขุนไทร | - | - | none found | low (which ตำบล it is in is disputed) |
| 3 | มัสยิดยามิอุ้ลอิสลาม (มัสยิดกลาง) | mosque | ม.4 ต.ท่าแร้ง, 76110, tel 032-782125 (CICOT) | - | - | Longdo POI A00130058 "มัสยิดกลาง", address ทางหลวงจังหวัด 3178 ต.ท่าแร้ง. Coordinates not visible (page blocked). | address high / coords none |
| 4 | มัสยิดนัศรุ้ลบารีย์ | mosque | ม.4 ต.ท่าแร้ง (taraeng.go.th / wikicommunity) | - | - | none | address medium |
| 5 | มัสยิดมุฏีอะห์ตุ้ลอิสลามียะห์ (มู่ฏีอะตุ้ลอิสลามิยะห์) | mosque | ม.3 ต.ท่าแร้ง, 76110, tel 086-806-8575 (CICOT detail 2572/4 and 3/4). Rebuilt in concrete 5 May 2513. | - | - | none | address medium-high |
| 6 | มัสยิดซิรอยุดดีน (spelling unverified) | mosque | ม.2 ต.ท่าแร้ง, per a search-engine summary only | - | - | none | low (not confirmed; one search hit pointed to a different "บ้านเกาะ บัวขาว") |
| 7 | สำนักงานคณะกรรมการอิสลามประจำจังหวัดเพชรบุรี | religious office | 60 ม.7 ต.ท่าแร้ง | - | - | none | address medium |

Notes:
- Wat Kuti: this is a มหานิกาย temple on the **east bank of แม่น้ำเพชรบุรี**, founded พ.ศ. 2118, with วิสุงคามสีมา granted 4 ม.ค. 2529. Do not confuse it with วัดกุฎิ (ตำบลบ้านป้อม) in อ.เมือง or with "Wat Kuti Bang Khem" (Wikidata Q102184196). The GNS point is about 1.3 km WSW of the ตำบล centroid (13.159, 99.960). That fits a riverside site, but check it on a basemap before publishing.
- The หมู่ for Wat Kuti differs by source: wat-thai.org says ม.5 and the other sources say ม.6.
- Wat Sai Thong: the wikicommunity/อบต. listing puts it in ม.1 ท่าแร้ง, but th.wikipedia and DMC.tv say ต.บางขุนไทร. Check it on a map before including it. A school, โรงเรียนวัดไทรทอง (สาครราษฎร์สงเคราะห์), is attached to it.
- The อบต. document summary lists 2 wat (ไทรทอง ม.1 and กุฎิ ม.6) and 1 mosque (นัศรุ้ลบารีย์ ม.4). CICOT lists more mosques in ต.ท่าแร้ง, so that summary is probably incomplete.
- I estimated no coordinates. Only Wat Kuti has a published coordinate.

## JSON

```json
[
  {"name": "วัดกุฎิ", "name_en": "Wat Kuti", "type": "temple", "moo": "5 or 6 (sources conflict)", "lat": 13.149722, "lng": 99.948056,
   "sources": ["https://www.wikidata.org/wiki/Q102184116 (P625 13°8'59\"N 99°56'53\"E, ref GNS; via search snippet)",
               "https://th.wikipedia.org/wiki/วัดกุฎิ_(อำเภอบ้านแหลม)",
               "https://www.wat-thai.org/subdistrict/tha-raeng-760709/",
               "https://wikicommunity.sac.or.th/community/1182"],
   "confidence": "medium"},
  {"name": "วัดไทรทอง", "name_en": "Wat Sai Thong", "type": "temple", "moo": "1", "lat": null, "lng": null,
   "sources": ["https://wikicommunity.sac.or.th/community/1182",
               "http://www.taraeng.go.th/ (อบต. basic-data PDF, via snippet)",
               "https://th.wikipedia.org/wiki/วัดไทรทอง_(อำเภอบ้านแหลม) (says ต.บางขุนไทร - conflict)",
               "https://www.dmc.tv/wat/11586 (says ต.บางขุนไทร)"],
   "confidence": "low"},
  {"name": "มัสยิดยามิอุ้ลอิสลาม (มัสยิดกลาง)", "type": "mosque", "moo": "4", "lat": null, "lng": null,
   "sources": ["https://www.cicot.or.th/th/mosque/detail/2573/4",
               "https://map.longdo.com/main/p/A00130058/info (coords not retrievable)"],
   "confidence": "address-high, no coords"},
  {"name": "มัสยิดนัศรุ้ลบารีย์", "type": "mosque", "moo": "4", "lat": null, "lng": null,
   "sources": ["http://www.taraeng.go.th/ (via snippet)", "https://wikicommunity.sac.or.th/community/1182"],
   "confidence": "address-medium, no coords"},
  {"name": "มัสยิดมุฏีอะห์ตุ้ลอิสลามียะห์", "type": "mosque", "moo": "3", "lat": null, "lng": null,
   "sources": ["https://cicot.or.th/th/mosque/detail/2572/4", "https://www.cicot.or.th/th/mosque/detail/3/4"],
   "confidence": "address-medium, no coords"},
  {"name": "มัสยิดซิรอยุดดีน (unverified)", "type": "mosque", "moo": "2", "lat": null, "lng": null,
   "sources": ["search-engine summary only"], "confidence": "low"},
  {"name": "สำนักงานคณะกรรมการอิสลามประจำจังหวัดเพชรบุรี", "type": "religious_office", "moo": "7", "lat": null, "lng": null,
   "sources": ["https://masjidthai.com/pbi/contact/"], "confidence": "address-medium, no coords"}
]
```

## Suggested follow-up (needs unblocked access)
- Open Longdo POI A00130058 for the มัสยิดกลาง coordinates.
- Open the CICOT mosque pages, which often include a map pin.
- Open the Wikidata item for Wat Kuti to confirm P625.
- Settle which ตำบล Wat Sai Thong is in using a ตำบล boundary layer.
