const NAME_KEY = 'tharaeng:name';

export function getSavedName(): string {
  try {
    return localStorage.getItem(NAME_KEY) ?? '';
  } catch {
    return '';
  }
}

export function saveName(name: string) {
  try {
    localStorage.setItem(NAME_KEY, name);
  } catch {
    /* ไม่เป็นไรถ้าบันทึกไม่ได้ */
  }
}
