import { PLACES, type Place } from '../data/places';

function distanceM(aLat: number, aLng: number, bLat: number, bLng: number) {
  const kx = 111320 * Math.cos((aLat * Math.PI) / 180);
  return Math.hypot((bLng - aLng) * kx, (bLat - aLat) * 110540);
}

/** สถานที่สำคัญที่ใกล้ที่สุด (ภายใน maxM เมตร) ใช้บอกตำแหน่งเป็นภาษาคนแทนพิกัด */
export function nearestPlace(lat: number, lng: number, maxM = 700): { place: Place; meters: number } | null {
  let best: { place: Place; meters: number } | null = null;
  for (const place of PLACES) {
    const meters = distanceM(lat, lng, place.lat, place.lng);
    if (meters <= maxM && (!best || meters < best.meters)) best = { place, meters };
  }
  return best;
}

export function nearText(lat: number, lng: number): string | null {
  const n = nearestPlace(lat, lng);
  if (!n) return null;
  if (n.meters < 60) return `ติดกับ${n.place.name}`;
  const rounded = n.meters < 200 ? Math.round(n.meters / 10) * 10 : Math.round(n.meters / 50) * 50;
  return `ใกล้${n.place.name} (ห่างราว ${rounded.toLocaleString('th-TH')} ม.)`;
}
