import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Crosshair, LocateFixed } from 'lucide-react';
import { isInTambon } from '../lib/geo';
import type { Report } from '../types';
import { addTambonLayers, createBaseMap, moveMap } from './MapView';

interface Props {
  value: { lat: number; lng: number } | null;
  onChange: (v: { lat: number; lng: number }) => void;
  existing: Report[];
}

const pickIcon = L.divIcon({
  className: 'pin-wrap',
  iconSize: [44, 56],
  iconAnchor: [22, 55],
  html: `<div class="pin pin--pick">
    <svg class="pin__shape" viewBox="0 0 36 46" aria-hidden="true"><path d="M18 44.5S33 29.5 33 18A15 15 0 0 0 3 18c0 11.5 15 26.5 15 26.5z"/></svg>
    <span class="pin__dot"></span>
  </div>`,
});

type GeoState = 'idle' | 'asking' | 'locating' | 'denied' | 'error' | 'outside';

export function LocationPicker({ value, onChange, existing }: Props) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [geo, setGeo] = useState<GeoState>('idle');

  useEffect(() => {
    if (!elRef.current) return;
    const map = createBaseMap(elRef.current);
    L.control.zoom({ position: 'topright', zoomInTitle: 'ซูมเข้า', zoomOutTitle: 'ซูมออก' }).addTo(map);
    addTambonLayers(map, { labels: true });
    // หมุดที่มีอยู่แล้ว แสดงจาง ๆ ช่วยกันแจ้งซ้ำ
    for (const r of existing) {
      L.circleMarker([r.lat, r.lng], {
        radius: 6,
        weight: 2,
        color: '#ffffff',
        fillColor: r.status === 'open' ? '#d9971c' : r.status === 'in_progress' ? '#3a75b0' : '#3b8f5c',
        fillOpacity: 0.85,
        interactive: false,
      }).addTo(map);
    }
    map.on('click', (e: L.LeafletMouseEvent) => place(e.latlng.lat, e.latlng.lng, false));
    mapRef.current = map;
    if (value) place(value.lat, value.lng, true, 17);
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(elRef.current);
    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  function place(lat: number, lng: number, pan: boolean, zoom?: number) {
    const map = mapRef.current;
    if (!map) return;
    if (!markerRef.current) {
      markerRef.current = L.marker([lat, lng], {
        icon: pickIcon,
        draggable: true,
        autoPan: true,
        title: 'ตำแหน่งที่แจ้ง (ลากเพื่อปรับ)',
        alt: 'ตำแหน่งที่แจ้ง',
      })
        .on('dragend', () => {
          const ll = markerRef.current!.getLatLng();
          onChangeRef.current({ lat: ll.lat, lng: ll.lng });
        })
        .addTo(map);
    } else {
      markerRef.current.setLatLng([lat, lng]);
    }
    if (pan) moveMap(map, [lat, lng], zoom ?? Math.max(map.getZoom(), 17));
    onChangeRef.current({ lat, lng });
  }

  function locate() {
    if (!('geolocation' in navigator)) {
      setGeo('error');
      return;
    }
    setGeo('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (!isInTambon(latitude, longitude)) {
          setGeo('outside');
          return;
        }
        setGeo('idle');
        place(latitude, longitude, true, 18);
      },
      (err) => setGeo(err.code === err.PERMISSION_DENIED ? 'denied' : 'error'),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 },
    );
  }

  const outside = value && !isInTambon(value.lat, value.lng);

  return (
    <div className="picker">
      <p className="picker__help">
        แตะบนแผนที่เพื่อปักหมุด แล้ว<strong>ลากหมุด</strong>หรือแตะจุดใหม่เพื่อปรับตำแหน่งให้ตรงจุด
      </p>
      <div className="picker__map-wrap">
        <div ref={elRef} className="picker__map" role="region" aria-label="แผนที่สำหรับเลือกตำแหน่ง" data-testid="picker-map" />
        {!value && <span className="picker__crosshair" aria-hidden />}
        {!value && <div className="picker__overlay">แตะแผนที่ตรงจุดที่พบปัญหา</div>}
      </div>
      {/* ทางเลือกแทนการแตะ/ลาก: เลื่อนแผนที่ด้วยปุ่มลูกศรหรือนิ้ว แล้วปักหมุดที่กึ่งกลาง */}
      <button
        type="button"
        className="btn-link picker__keyboard"
        onClick={() => {
          const c = mapRef.current?.getCenter();
          if (c) place(c.lat, c.lng, false);
        }}
      >
        <Crosshair size={16} aria-hidden /> ปักหมุดที่กึ่งกลางแผนที่
      </button>

      {geo === 'asking' ? (
        <div className="notice">
          <p>
            โทรศัพท์จะถามว่าอนุญาตให้ใช้ตำแหน่งไหม เราใช้เพื่อวางหมุดครั้งนี้เท่านั้น
            <strong>จุดที่ปักจะแสดงต่อสาธารณะ</strong> ถ้าตอนนี้อยู่ที่บ้าน ลากหมุดไปที่ถนนหรือจุดที่พบปัญหาแทนได้
          </p>
          <div className="btn-row">
            <button type="button" className="btn btn--ghost" onClick={() => setGeo('idle')}>
              ไม่ใช่ตอนนี้
            </button>
            <button type="button" className="btn btn--primary" onClick={locate}>
              อนุญาตและค้นหา
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="btn btn--secondary btn--block"
          onClick={() => setGeo('asking')}
          disabled={geo === 'locating'}
        >
          <LocateFixed size={18} aria-hidden />
          {geo === 'locating' ? 'กำลังหาตำแหน่ง…' : 'ใช้ตำแหน่งปัจจุบันของฉัน'}
        </button>
      )}
      {geo === 'denied' && (
        <p className="form-error" role="alert">
          ไม่ได้รับอนุญาตให้ใช้ตำแหน่ง ปักหมุดบนแผนที่เองได้ หรือเปิดสิทธิ์ตำแหน่งในการตั้งค่าเบราว์เซอร์
        </p>
      )}
      {geo === 'error' && (
        <p className="form-error" role="alert">
          หาตำแหน่งไม่สำเร็จ ลองอีกครั้ง หรือแตะบนแผนที่เพื่อปักหมุดเอง
        </p>
      )}
      {geo === 'outside' && (
        <p className="form-error" role="alert">
          ตำแหน่งของคุณอยู่นอกตำบลท่าแร้ง ให้แตะแผนที่ตรงจุดที่พบปัญหาในเขตตำบล (ในเส้นประ) แทน
        </p>
      )}
      {outside && (
        <p className="form-error" role="alert">
          หมุดอยู่นอกตำบลท่าแร้ง เลื่อนหมุดให้อยู่ในเส้นประที่เป็นเขตตำบล
        </p>
      )}
      {value && !outside && (
        <p className="muted small">
          พิกัดที่เลือก {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
        </p>
      )}
    </div>
  );
}
