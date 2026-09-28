import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { AREA_CENTER, AREA_ZOOM, statusLabel } from '../config';
import { PLACES } from '../data/places';
import { BOUNDARY_RING } from '../lib/geo';
import { reportTitle } from '../lib/title';
import { prefersReducedMotion } from '../hooks/useRoute';
import type { Report, ReportStatus } from '../types';
import { PIN_GLYPH } from './icons';

export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">ผู้ร่วมพัฒนา OpenStreetMap</a>';

export function createBaseMap(el: HTMLElement, opts: L.MapOptions = {}) {
  const map = L.map(el, { zoomControl: false, ...opts }).setView(AREA_CENTER, AREA_ZOOM);
  map.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>');
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: OSM_ATTRIBUTION,
  }).addTo(map);
  return map;
}

/**
 * แผนที่เฉพาะตำบลท่าแร้ง: ทำให้พื้นที่นอกตำบลจาง, วาดเส้นขอบเขต, จำกัดการเลื่อนแผนที่
 * และใส่ป้ายชื่อสถานที่สำคัญ (ชื่อจะแสดงเมื่อซูมเข้าใกล้พอ)
 */
export function addTambonLayers(map: L.Map, { labels = true }: { labels?: boolean } = {}) {
  const ring = BOUNDARY_RING.map(([lng, lat]) => [lat, lng] as [number, number]);
  const world: [number, number][] = [
    [-89, -179],
    [-89, 179],
    [89, 179],
    [89, -179],
  ];
  L.polygon([world, ring], {
    interactive: false,
    stroke: false,
    fillColor: '#faf6ec',
    fillOpacity: 0.72,
  }).addTo(map);
  const outline = L.polygon(ring, {
    interactive: false,
    color: '#35623f',
    weight: 2.5,
    dashArray: '7 6',
    fill: false,
  }).addTo(map);

  const bounds = outline.getBounds();
  map.setMaxBounds(bounds.pad(0.35));
  map.options.maxBoundsViscosity = 0.9;
  map.fitBounds(bounds, { padding: [12, 12] });
  map.setMinZoom(Math.max(12, map.getZoom() - 1));

  if (!labels) return;
  const layer = L.layerGroup().addTo(map);
  for (const p of PLACES) {
    L.marker([p.lat, p.lng], {
      interactive: false,
      keyboard: false,
      zIndexOffset: -1000,
      icon: L.divIcon({
        className: `place place--${p.kind}`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
        html: `<span class="place__dot" aria-hidden="true"></span><span class="place__label">${p.name}</span>`,
      }),
    }).addTo(layer);
  }
  const container = map.getContainer();
  const update = () => {
    const z = map.getZoom();
    container.classList.toggle('show-village-labels', z >= 14);
    container.classList.toggle('show-place-labels', z >= 15);
  };
  map.on('zoomend', update);
  update();
}

/** เลื่อนแผนที่ — ถ้าผู้ใช้ตั้งค่าลดการเคลื่อนไหว จะย้ายทันทีโดยไม่มีแอนิเมชัน */
export function moveMap(map: L.Map, center: L.LatLngExpression, zoom: number) {
  if (prefersReducedMotion()) map.setView(center, zoom, { animate: false });
  else map.flyTo(center, zoom, { duration: 0.6 });
}

export function pinIcon(status: ReportStatus, selected = false) {
  const w = selected ? 46 : 36;
  const h = selected ? 58 : 46;
  return L.divIcon({
    className: 'pin-wrap',
    iconSize: [w, h],
    iconAnchor: [w / 2, h - 1],
    html: `<div class="pin pin--${status}${selected ? ' pin--selected' : ''}">
      <svg class="pin__shape" viewBox="0 0 36 46" aria-hidden="true"><path d="M18 44.5S33 29.5 33 18A15 15 0 0 0 3 18c0 11.5 15 26.5 15 26.5z"/></svg>
      <svg class="pin__glyph" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${PIN_GLYPH[status]}</svg>
    </div>`,
  });
}

interface Props {
  reports: Report[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** เปลี่ยนค่า nonce เพื่อสั่งให้แผนที่เลื่อนไปยังหมุด */
  focus: { id: string; nonce: number } | null;
  /** พื้นที่ของแผนที่ที่ถูกการ์ดรายละเอียดบัง เพื่อเลื่อนหมุดไปอยู่ในส่วนที่มองเห็น */
  inset?: { left?: number; bottomFraction?: number };
}

export function MapView({ reports, selectedId, onSelect, focus, inset }: Props) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef(new Map<string, { marker: L.Marker; status: ReportStatus; selected: boolean }>());
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!elRef.current) return;
    const map = createBaseMap(elRef.current);
    L.control.zoom({ position: 'topright', zoomInTitle: 'ซูมเข้า', zoomOutTitle: 'ซูมออก' }).addTo(map);
    addTambonLayers(map);
    mapRef.current = map;
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(elRef.current);
    const markers = markersRef.current;
    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      markers.clear();
    };
  }, []);

  // อัปเดตหมุดตามข้อมูลเรียลไทม์
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const existing = markersRef.current;
    const seen = new Set<string>();
    for (const r of reports) {
      seen.add(r.id);
      const selected = r.id === selectedId;
      const title = `${reportTitle(r)} — ${statusLabel(r.status)}`;
      const cur = existing.get(r.id);
      if (!cur) {
        const marker = L.marker([r.lat, r.lng], {
          icon: pinIcon(r.status, selected),
          title,
          alt: title,
          riseOnHover: true,
          zIndexOffset: selected ? 1000 : 0,
        })
          .on('click', () => onSelectRef.current(r.id))
          .on('keypress', (e: L.LeafletKeyboardEvent) => {
            if (e.originalEvent.key === 'Enter') onSelectRef.current(r.id);
          })
          .addTo(map);
        marker.getElement()?.setAttribute('data-report-id', r.id);
        marker.getElement()?.setAttribute('data-status', r.status);
        existing.set(r.id, { marker, status: r.status, selected });
      } else {
        if (cur.status !== r.status || cur.selected !== selected) {
          cur.marker.setIcon(pinIcon(r.status, selected));
          cur.marker.setZIndexOffset(selected ? 1000 : 0);
          cur.marker.getElement()?.setAttribute('data-report-id', r.id);
          cur.marker.getElement()?.setAttribute('data-status', r.status);
          cur.marker.getElement()?.setAttribute('title', title);
          cur.status = r.status;
          cur.selected = selected;
        }
        const ll = cur.marker.getLatLng();
        if (ll.lat !== r.lat || ll.lng !== r.lng) cur.marker.setLatLng([r.lat, r.lng]);
      }
    }
    for (const [id, m] of existing) {
      if (!seen.has(id)) {
        m.marker.remove();
        existing.delete(id);
      }
    }
  }, [reports, selectedId]);

  // เลื่อนแผนที่ไปยังหมุดที่เลือกจากรายการ
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focus) return;
    const r = reports.find((x) => x.id === focus.id);
    if (!r) return;
    const zoom = Math.max(map.getZoom(), 16);
    const size = map.getSize();
    const dx = -(inset?.left ?? 0) / 2;
    const dy = (size.y * (inset?.bottomFraction ?? 0)) / 2;
    const point = map.project([r.lat, r.lng], zoom).add([dx, dy]);
    moveMap(map, map.unproject(point, zoom), zoom);
  }, [focus?.nonce]);

  return (
    <div className="map-shell">
      <div ref={elRef} className="map" role="region" aria-label="แผนที่ปัญหาในตำบลท่าแร้ง" />
      <button
        type="button"
        className="map-home"
        onClick={() => mapRef.current && moveMap(mapRef.current, AREA_CENTER, AREA_ZOOM)}
        aria-label="ดูทั้งตำบลท่าแร้ง"
      >
        ดูทั้งตำบล
      </button>
    </div>
  );
}
