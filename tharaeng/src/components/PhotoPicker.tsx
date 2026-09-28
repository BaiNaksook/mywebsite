import { useEffect, useId, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { compressImage } from '../lib/image';

interface Props {
  value: Blob | null;
  onChange: (b: Blob | null) => void;
  label: string;
}

export function PhotoPicker({ value, onChange, label }: Props) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  async function pick(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('ไฟล์นี้ไม่ใช่รูปภาพ เลือกไฟล์รูป เช่น JPG หรือ PNG');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError('รูปใหญ่เกินไป (เกิน 25 MB) ลองเลือกรูปอื่น');
      return;
    }
    setBusy(true);
    try {
      onChange(await compressImage(file));
    } catch {
      setError('อ่านไฟล์รูปนี้ไม่ได้ ลองถ่ายใหม่หรือเลือกรูปอื่น');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="field">
      <span className="field__label">
        {label} <span className="field__optional">(ไม่บังคับ)</span>
      </span>
      {preview ? (
        <div className="photo-preview">
          <img src={preview} alt="รูปที่เลือก" />
          <button type="button" className="icon-btn photo-preview__remove" onClick={() => onChange(null)} aria-label="เอารูปออก">
            <X size={18} />
          </button>
        </div>
      ) : (
        <label htmlFor={id} className={`photo-drop${busy ? ' is-busy' : ''}`}>
          <ImagePlus size={24} aria-hidden />
          <span>{busy ? 'กำลังเตรียมรูป…' : 'ถ่ายรูปหรือเลือกจากเครื่อง'}</span>
        </label>
      )}
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => pick(e.target.files?.[0])}
        data-testid="photo-input"
      />
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
