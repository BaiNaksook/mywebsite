import boundary from '../data/tha-raeng-boundary.json';

/** วงรอบเขตตำบลท่าแร้ง [lng, lat][] */
export const BOUNDARY_RING = boundary.features[0].geometry.coordinates[0] as [number, number][];
export const BOUNDARY_GEOJSON = boundary;
export const BOUNDARY_SOURCE = boundary.features[0].properties.source;

function pointInRing(lng: number, lat: number, ring: [number, number][]) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** ระยะ (เมตร) จากจุดถึงขอบเขตที่ใกล้ที่สุด แบบประมาณบนพื้นราบ */
function distanceToRingM(lng: number, lat: number, ring: [number, number][]) {
  const kx = 111320 * Math.cos((lat * Math.PI) / 180);
  const ky = 110540;
  let best = Infinity;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const ax = (ring[j][0] - lng) * kx;
    const ay = (ring[j][1] - lat) * ky;
    const bx = (ring[i][0] - lng) * kx;
    const by = (ring[i][1] - lat) * ky;
    const dx = bx - ax;
    const dy = by - ay;
    const t = Math.max(0, Math.min(1, -(ax * dx + ay * dy) / (dx * dx + dy * dy || 1)));
    best = Math.min(best, Math.hypot(ax + t * dx, ay + t * dy));
  }
  return best;
}

/**
 * เส้นขอบเขตเป็นข้อมูลแบบย่อ (ไม่ใช่ระดับรังวัด) จึงยอมให้เลยขอบออกไปได้เล็กน้อย
 * สำหรับจุดที่อยู่ริมเขตตำบล เช่น ริมคลองท่าแร้ง
 */
export const EDGE_TOLERANCE_M = 250;

export function isInTambon(lat: number, lng: number) {
  return pointInRing(lng, lat, BOUNDARY_RING) || distanceToRingM(lng, lat, BOUNDARY_RING) <= EDGE_TOLERANCE_M;
}
