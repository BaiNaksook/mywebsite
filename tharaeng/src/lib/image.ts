/** ขนาดสูงสุดของรูปหลังย่อ (ไบต์) — เก็บใน Firestore ซึ่งจำกัดเอกสารละ 1 MB */
export const MAX_PHOTO_BYTES = 450_000;

/** ย่อรูปเป็น JPEG ให้เล็กพอสำหรับเก็บในฐานข้อมูลฟรี ลดขนาดลงเรื่อย ๆ จนไม่เกิน MAX_PHOTO_BYTES */
export async function compressImage(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/')) throw new Error('not-image');
  let bitmap: ImageBitmap | HTMLImageElement;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    bitmap = await loadImage(file);
  }
  const attempts: [number, number][] = [
    [1280, 0.72],
    [1024, 0.65],
    [800, 0.6],
    [640, 0.55],
  ];
  try {
    for (const [maxSide, quality] of attempts) {
      const blob = await encode(bitmap, maxSide, quality);
      if (blob.size <= MAX_PHOTO_BYTES) return blob;
    }
    throw new Error('too-large');
  } finally {
    if ('close' in bitmap) bitmap.close();
  }
}

async function encode(bitmap: ImageBitmap | HTMLImageElement, maxSide: number, quality: number) {
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('no-canvas');
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', quality));
  if (!blob) throw new Error('encode-failed');
  return blob;
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('decode-failed'));
    };
    img.src = url;
  });
}
