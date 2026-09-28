import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, CheckCircle2, MapPin, RotateCcw } from 'lucide-react';
import { CATEGORIES, categoryLabel, isInAllowedArea, LIMITS } from '../config';
import { useAuth } from '../hooks/useAuth';
import { createReport, newReportId, thaiError, uploadPhoto } from '../lib/reports';
import { getSavedName, saveName } from '../lib/storage';
import { reportTitle } from '../lib/title';
import type { CategoryId, Report } from '../types';
import { CategoryIcon } from './icons';
import { LocationPicker } from './LocationPicker';
import { PhotoPicker } from './PhotoPicker';
import { SignInCard } from './SignInCard';

interface Props {
  existing: Report[];
  onCancel: () => void;
  onViewReport: (id: string) => void;
}

interface Draft {
  pos: { lat: number; lng: number } | null;
  category: CategoryId | null;
  placeName: string;
  description: string;
  reporterName: string;
  photo: Blob | null;
}

type Errors = Partial<Record<'pos' | 'category' | 'placeName' | 'description' | 'reporterName', string>>;

type Submit =
  | { state: 'idle' }
  | { state: 'uploading'; pct: number }
  | { state: 'saving'; slow: boolean }
  | { state: 'success' }
  | { state: 'error'; message: string };

const STEPS = ['เลือกตำแหน่ง', 'กรอกข้อมูล', 'ตรวจสอบและส่ง'];

export function ReportFlow({ existing, onCancel, onViewReport }: Props) {
  const { user, ready } = useAuth();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(() => ({
    pos: null,
    category: null,
    placeName: '',
    description: '',
    reporterName: getSavedName(),
    photo: null,
  }));
  const [errors, setErrors] = useState<Errors>({});
  const [summaryNonce, setSummaryNonce] = useState(0);
  const summaryRef = useRef<HTMLDivElement>(null);
  const [submit, setSubmit] = useState<Submit>({ state: 'idle' });
  const reportIdRef = useRef<string | null>(null);
  const uploadedRef = useRef<{ blob: Blob; url: string } | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && !draft.reporterName) setDraft((d) => ({ ...d, reporterName: user.displayName ?? '' }));
  }, [user, draft.reporterName]);

  useEffect(() => {
    topRef.current?.scrollIntoView({ block: 'start' });
    topRef.current?.querySelector<HTMLElement>('h1')?.focus();
  }, [step]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setDraft((d) => ({ ...d, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  function validateStep(s: number): boolean {
    const e: Errors = {};
    if (s === 0) {
      if (!draft.pos) e.pos = 'กรุณาปักหมุดตำแหน่งที่พบปัญหา';
      else if (!isInAllowedArea(draft.pos.lat, draft.pos.lng)) e.pos = 'หมุดอยู่นอกพื้นที่ที่รับแจ้ง';
    }
    if (s === 1) {
      if (!draft.category) e.category = 'กรุณาเลือกประเภทปัญหา';
      if (!draft.placeName.trim()) e.placeName = 'กรุณาระบุชื่อจุดหรือสถานที่';
      if (!draft.description.trim()) e.description = 'กรุณาเล่ารายละเอียดของปัญหา';
      else if (draft.description.trim().length < 5) e.description = 'รายละเอียดสั้นเกินไป เล่าเพิ่มอีกนิด';
      if (!draft.reporterName.trim()) e.reporterName = 'กรุณากรอกชื่อผู้แจ้ง';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next(e?: FormEvent) {
    e?.preventDefault();
    if (!validateStep(step)) {
      if (step === 1) {
        // ส่งไม่ผ่าน: ย้ายโฟกัสไปที่สรุปข้อผิดพลาดด้านบน (ข้อความใต้แต่ละช่องยังอยู่)
        setSummaryNonce((n) => n + 1);
      } else {
        requestAnimationFrame(() =>
          topRef.current?.querySelector<HTMLElement>('.form-error')?.scrollIntoView({ block: 'center' }),
        );
      }
      return;
    }
    setSummaryNonce(0);
    setStep((s) => Math.min(2, s + 1));
  }

  useEffect(() => {
    if (summaryNonce > 0) summaryRef.current?.focus();
  }, [summaryNonce]);

  const FIELD_IDS: Record<keyof Errors, string> = {
    pos: 'field-pos',
    category: 'field-category',
    placeName: 'field-placeName',
    description: 'field-description',
    reporterName: 'field-reporterName',
  };
  const summaryItems = (Object.keys(errors) as (keyof Errors)[]).filter((k) => errors[k]);

  async function send() {
    if (!user || !draft.pos || !draft.category) return;
    if (!navigator.onLine) {
      setSubmit({ state: 'error', message: 'ไม่มีการเชื่อมต่ออินเทอร์เน็ต ตรวจสอบสัญญาณแล้วลองอีกครั้ง' });
      return;
    }
    const id = (reportIdRef.current ??= newReportId());
    let slowTimer: number | undefined;
    try {
      let photoUrl: string | null = null;
      if (draft.photo) {
        if (uploadedRef.current?.blob === draft.photo) {
          photoUrl = uploadedRef.current.url;
        } else {
          setSubmit({ state: 'uploading', pct: 0 });
          photoUrl = await uploadPhoto('reports', user.uid, id, draft.photo, (pct) => setSubmit({ state: 'uploading', pct }));
          uploadedRef.current = { blob: draft.photo, url: photoUrl };
        }
      }
      setSubmit({ state: 'saving', slow: false });
      slowTimer = window.setTimeout(() => setSubmit({ state: 'saving', slow: true }), 8000);
      const name = draft.reporterName.trim();
      await createReport({
        id,
        uid: user.uid,
        reporterName: name,
        category: draft.category,
        placeName: draft.placeName.trim(),
        description: draft.description.trim(),
        lat: Number(draft.pos.lat.toFixed(6)),
        lng: Number(draft.pos.lng.toFixed(6)),
        photoUrl,
      });
      saveName(name);
      setSubmit({ state: 'success' });
    } catch (e) {
      console.error(e);
      setSubmit({ state: 'error', message: thaiError(e) });
    } finally {
      window.clearTimeout(slowTimer);
    }
  }

  const busy = submit.state === 'uploading' || submit.state === 'saving';

  if (submit.state === 'success') {
    const id = reportIdRef.current!;
    return (
      <div className="flow" ref={topRef}>
        <div className="flow__done" role="status">
          <CheckCircle2 size={48} className="flow__done-icon" aria-hidden />
          <h1 tabIndex={-1}>ส่งเรื่องเรียบร้อย</h1>
          <p>หมุดของคุณขึ้นบนแผนที่แล้ว เพื่อนบ้านและจิตอาสาจะเห็นทันที</p>
          <p className="muted small">
            เว็บนี้เป็นโครงงานของนักเรียน ข้อมูลไม่ได้ส่งถึง อบต.ท่าแร้ง โดยอัตโนมัติ หากเป็นเรื่องเร่งด่วนควรติดต่อหน่วยงานโดยตรง
          </p>
          <div className="btn-col">
            <button type="button" className="btn btn--primary btn--block" onClick={() => onViewReport(id)}>
              <MapPin size={18} aria-hidden /> ดูหมุดบนแผนที่
            </button>
            <button type="button" className="btn btn--ghost btn--block" onClick={onCancel}>
              กลับหน้าแผนที่
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flow" ref={topRef}>
      <div className="flow__top">
        <button
          type="button"
          className="icon-btn"
          onClick={() => (step === 0 || busy ? onCancel() : setStep(step - 1))}
          aria-label={step === 0 ? 'ยกเลิกและกลับหน้าแผนที่' : 'ย้อนกลับ'}
          disabled={busy}
        >
          <ArrowLeft size={22} />
        </button>
        <h1 tabIndex={-1}>แจ้งปัญหา</h1>
      </div>

      <ol className="stepper" aria-label="ขั้นตอน">
        {STEPS.map((s, i) => (
          <li key={s} className={i === step ? 'is-current' : i < step ? 'is-done' : ''} aria-current={i === step ? 'step' : undefined}>
            <span className="stepper__num">{i + 1}</span>
            <span className="stepper__label">{s}</span>
          </li>
        ))}
      </ol>

      {!ready ? (
        <p className="muted">กำลังตรวจสอบการเข้าสู่ระบบ…</p>
      ) : !user ? (
        <div className="card">
          <SignInCard reason="เข้าสู่ระบบก่อนแจ้งปัญหา เพื่อยืนยันว่าผู้แจ้งเป็นคนจริงและป้องกันการแก้ไขข้อมูลโดยผู้อื่น" />
        </div>
      ) : step === 0 ? (
        <form onSubmit={next} noValidate>
          <LocationPicker value={draft.pos} onChange={(v) => set('pos', v)} existing={existing} />
          {errors.pos && (
            <p className="form-error" role="alert">
              {errors.pos}
            </p>
          )}
          <div className="flow__nav">
            <button type="submit" className="btn btn--primary btn--block">
              ถัดไป: กรอกข้อมูล
            </button>
          </div>
        </form>
      ) : step === 1 ? (
        <form onSubmit={next} noValidate className="form">
          {summaryNonce > 0 && summaryItems.length > 0 && (
            <div className="error-summary" ref={summaryRef} tabIndex={-1} role="alert" aria-labelledby="error-summary-title">
              <h2 id="error-summary-title">มีข้อมูลที่ต้องแก้ไข {summaryItems.length} ช่อง</h2>
              <ul>
                {summaryItems.map((k) => (
                  <li key={k}>
                    <a
                      href={`#${FIELD_IDS[k]}`}
                      onClick={(e) => {
                        e.preventDefault();
                        const el = document.getElementById(FIELD_IDS[k]);
                        el?.scrollIntoView({ block: 'center' });
                        el?.focus();
                      }}
                    >
                      {errors[k]}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <fieldset className="field">
            <legend className="field__label">ประเภทปัญหา</legend>
            <div className={`cat-grid${errors.category ? ' has-error' : ''}`}>
              {CATEGORIES.map((c) => (
                <label key={c.id} className={`cat-option${draft.category === c.id ? ' is-checked' : ''}`}>
                  <input
                    type="radio"
                    name="category"
                    id={c.id === CATEGORIES[0].id ? 'field-category' : undefined}
                    value={c.id}
                    checked={draft.category === c.id}
                    onChange={() => set('category', c.id)}
                    className="sr-only"
                  />
                  <CategoryIcon id={c.id} size={24} aria-hidden />
                  <span>{c.label}</span>
                </label>
              ))}
            </div>
            {errors.category && <span className="form-error">{errors.category}</span>}
          </fieldset>

          <label className="field">
            <span className="field__label">ชื่อจุดหรือสถานที่</span>
            <input
              className={`input${errors.placeName ? ' has-error' : ''}`}
              value={draft.placeName}
              maxLength={LIMITS.placeName}
              onChange={(e) => set('placeName', e.target.value)}
              placeholder="เช่น ทางแยกท่าแร้ง, หน้าวัด, ซอย 3"
              name="placeName"
              id="field-placeName"
              aria-invalid={!!errors.placeName}
              aria-describedby={errors.placeName ? 'err-placeName' : undefined}
            />
            {errors.placeName && <span className="form-error" id="err-placeName">{errors.placeName}</span>}
          </label>

          <label className="field">
            <span className="field__label">รายละเอียด</span>
            <textarea
              className={`input${errors.description ? ' has-error' : ''}`}
              rows={4}
              value={draft.description}
              maxLength={LIMITS.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="เช่น น้ำท่วมขังสูงประมาณครึ่งล้อรถ ตั้งแต่ฝนตกเมื่อวาน รถเล็กผ่านลำบาก"
              name="description"
              id="field-description"
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? 'err-description' : undefined}
            />
            <span className="field__count">
              {draft.description.length}/{LIMITS.description}
            </span>
            {errors.description && <span className="form-error" id="err-description">{errors.description}</span>}
          </label>

          <label className="field">
            <span className="field__label">ชื่อผู้แจ้ง</span>
            <input
              className={`input${errors.reporterName ? ' has-error' : ''}`}
              value={draft.reporterName}
              maxLength={LIMITS.name}
              onChange={(e) => set('reporterName', e.target.value)}
              placeholder="เช่น นาย ก"
              autoComplete="name"
              name="reporterName"
              id="field-reporterName"
              aria-invalid={!!errors.reporterName}
              aria-describedby={errors.reporterName ? 'err-reporterName' : 'hint-reporterName'}
            />
            <span className="field__hint" id="hint-reporterName">ชื่อนี้จะแสดงต่อสาธารณะ ใช้ชื่อเล่นได้</span>
            {errors.reporterName && <span className="form-error" id="err-reporterName">{errors.reporterName}</span>}
          </label>

          <PhotoPicker label="รูปภาพประกอบ" value={draft.photo} onChange={(b) => set('photo', b)} />

          <div className="flow__nav">
            <button type="submit" className="btn btn--primary btn--block">
              ถัดไป: ตรวจสอบข้อมูล
            </button>
          </div>
        </form>
      ) : (
        <div className="form">
          <div className="review">
            <p className="review__title">{reportTitle({ category: draft.category!, placeName: draft.placeName })}</p>
            <dl className="facts">
              <div>
                <dt>ประเภท</dt>
                <dd>{categoryLabel(draft.category!)}</dd>
              </div>
              <div>
                <dt>สถานที่</dt>
                <dd>{draft.placeName.trim()}</dd>
              </div>
              <div>
                <dt>พิกัด</dt>
                <dd>
                  {draft.pos!.lat.toFixed(5)}, {draft.pos!.lng.toFixed(5)}{' '}
                  <button type="button" className="btn-link" onClick={() => setStep(0)} disabled={busy}>
                    แก้ตำแหน่ง
                  </button>
                </dd>
              </div>
              <div>
                <dt>ผู้แจ้ง</dt>
                <dd>{draft.reporterName.trim()}</dd>
              </div>
            </dl>
            <p className="detail__desc">{draft.description.trim()}</p>
            {draft.photo && <ReviewPhoto blob={draft.photo} />}
            <button type="button" className="btn-link" onClick={() => setStep(1)} disabled={busy}>
              แก้ข้อมูล
            </button>
          </div>

          {submit.state === 'error' && (
            <div className="notice notice--error" role="alert">
              <p>
                <strong>ส่งไม่สำเร็จ</strong> — {submit.message}
              </p>
            </div>
          )}

          <div className="flow__nav">
            <button type="button" className="btn btn--primary btn--block btn--lg" onClick={send} disabled={busy} data-testid="submit-report">
              {submit.state === 'uploading'
                ? `กำลังอัปโหลดรูป… ${submit.pct}%`
                : submit.state === 'saving'
                  ? 'กำลังส่ง…'
                  : submit.state === 'error'
                    ? (
                      <>
                        <RotateCcw size={18} aria-hidden /> ลองส่งอีกครั้ง
                      </>
                    )
                    : 'ยืนยันและส่งเรื่อง'}
            </button>
            {submit.state === 'saving' && submit.slow && (
              <p className="hint" role="status">
                อินเทอร์เน็ตค่อนข้างช้า ระบบกำลังส่งอยู่ กรุณาอย่าปิดหน้านี้
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewPhoto({ blob }: { blob: Blob }) {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  return url ? (
    <div className="detail__photo">
      <img src={url} alt="รูปประกอบที่จะส่ง" />
    </div>
  ) : null;
}
