import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ChevronDown, Clock, EyeOff, HandHeart, Link2, MapPin, Navigation, RotateCcw, UserRound, Users, X } from 'lucide-react';
import { LIMITS, statusLabel } from '../config';
import { useAuth } from '../hooks/useAuth';
import {
  hideReport,
  joinReport,
  leaveReport,
  reopenReport,
  resolveReport,
  subscribeHistory,
  thaiError,
  uploadPhoto,
} from '../lib/reports';
import { getSavedName, saveName } from '../lib/storage';
import { formatDateTime, timeAgo } from '../lib/time';
import { reportTitle } from '../lib/title';
import { nearText } from '../lib/nearby';
import type { HistoryEvent, Report } from '../types';
import { CategoryIcon } from './icons';
import { PhotoPicker } from './PhotoPicker';
import { SignInCard } from './SignInCard';
import { StatusBadge } from './StatusBadge';

type Mode = 'view' | 'join' | 'resolve' | 'reopen' | 'hide' | 'leave';

interface Props {
  report: Report;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export function ReportDetail({ report, onClose, onToast }: Props) {
  const { user, isAdmin } = useAuth();
  const [mode, setMode] = useState<Mode>('view');
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    setMode('view');
    headingRef.current?.focus();
  }, [report.id]);

  const me = user?.uid ?? null;
  const isVolunteer = !!me && report.volunteers.some((v) => v.uid === me);
  const isReporter = !!me && report.reporterUid === me;
  const near = nearText(report.lat, report.lng);

  return (
    <article className="detail" aria-labelledby="detail-title" data-report-id={report.id}>
      <header className="detail__head">
        <span className={`cat-icon cat-icon--${report.status} cat-icon--lg`} aria-hidden>
          <CategoryIcon id={report.category} size={24} />
        </span>
        <div className="detail__head-text">
          <h2 id="detail-title" ref={headingRef} tabIndex={-1}>
            {reportTitle(report)}
          </h2>
          <StatusBadge status={report.status} />
        </div>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="ปิดรายละเอียด">
          <X size={22} />
        </button>
      </header>

      <div className="detail__meta">
        <p>
          แจ้งโดย <strong>{report.reporterName}</strong>{' '}
          <time dateTime={report.createdAt?.toISOString()} title={formatDateTime(report.createdAt)}>
            {timeAgo(report.createdAt)}
          </time>
        </p>
        <p className="detail__near">
          <MapPin size={15} aria-hidden /> {near ?? report.placeName}
        </p>
      </div>

      <p className="detail__desc">{report.description}</p>

      <section className="detail__section">
        <h3>
          <Users size={16} aria-hidden /> จิตอาสาที่ร่วมช่วย
        </h3>
        {report.volunteers.length > 0 ? (
          <p className="volunteers" data-testid="volunteers">
            {report.volunteers.map((v) => v.name).join(', ')}
          </p>
        ) : (
          <p className="muted">ยังไม่มีผู้รับช่วยเหลือ</p>
        )}
      </section>

      {report.status === 'resolved' && report.resolution && (
        <section className="detail__section resolution">
          <h3>ผลการแก้ไข</h3>
          <p>{report.resolution.note}</p>
          {report.resolution.photoUrl && (
            <a href={report.resolution.photoUrl} target="_blank" rel="noopener" className="detail__photo">
              <img src={report.resolution.photoUrl} alt="รูปหลังแก้ไข" loading="lazy" />
            </a>
          )}
          <p className="muted small">
            {report.resolution.byName} แจ้งว่าแก้แล้ว เมื่อ {formatDateTime(report.resolution.at)}
          </p>
        </section>
      )}

      <div className="detail__actions">
        {!user ? (
          report.status !== 'resolved' ? (
            <SignInCard reason="เข้าสู่ระบบก่อน เพื่อรับช่วยเหลือหรืออัปเดตสถานะของจุดนี้" />
          ) : null
        ) : mode === 'join' ? (
          <JoinForm report={report} onCancel={() => setMode('view')} onDone={(m) => { setMode('view'); onToast(m); }} />
        ) : mode === 'resolve' ? (
          <ResolveForm report={report} isAdmin={isAdmin} onCancel={() => setMode('view')} onDone={(m) => { setMode('view'); onToast(m); }} />
        ) : mode === 'reopen' ? (
          <ReasonForm
            title="เปิดปัญหานี้อีกครั้ง"
            label="เหตุผล เช่น ไปดูแล้วยังไม่ได้แก้ไขจริง"
            required
            submitLabel="เปิดปัญหาอีกครั้ง"
            onCancel={() => setMode('view')}
            onSubmit={(reason, name) => reopenReport(report.id, user.uid, name, reason, isAdmin)}
            onDone={() => { setMode('view'); onToast('เปิดปัญหาอีกครั้งแล้ว สถานะกลับเป็น “รอความช่วยเหลือ”'); }}
          />
        ) : mode === 'hide' ? (
          <ReasonForm
            title="ซ่อนรายงานนี้"
            label="เหตุผล เช่น แจ้งซ้ำ หรือแจ้งผิดจุด"
            required={false}
            submitLabel="ซ่อนรายงาน"
            danger
            onCancel={() => setMode('view')}
            onSubmit={(reason, name) => hideReport(report.id, user.uid, name, reason || null, isAdmin)}
            onDone={() => { onToast('ซ่อนรายงานแล้ว'); onClose(); }}
          />
        ) : mode === 'leave' ? (
          <ConfirmLeave report={report} onCancel={() => setMode('view')} onDone={(m) => { setMode('view'); onToast(m); }} />
        ) : (
          <div className="action-stack">
            {report.status === 'open' && (
              <button type="button" className="btn btn--primary btn--block" onClick={() => setMode('join')}>
                <HandHeart size={20} aria-hidden /> รับช่วยเหลือ
              </button>
            )}
            {report.status === 'in_progress' && isVolunteer && (
              <>
                <button type="button" className="btn btn--success btn--block" onClick={() => setMode('resolve')}>
                  แจ้งว่าแก้ไขแล้ว
                </button>
                <button type="button" className="btn btn--ghost btn--block" onClick={() => setMode('leave')}>
                  ถอนตัวจากจุดนี้
                </button>
              </>
            )}
            {report.status === 'in_progress' && !isVolunteer && (
              <>
                <button type="button" className="btn btn--primary btn--block" onClick={() => setMode('join')}>
                  <HandHeart size={20} aria-hidden /> ร่วมช่วยอีกคน
                </button>
                {isAdmin && (
                  <button type="button" className="btn btn--ghost btn--block" onClick={() => setMode('resolve')}>
                    แจ้งว่าแก้ไขแล้ว (ผู้ดูแล)
                  </button>
                )}
              </>
            )}
            {report.status === 'open' && isAdmin && (
              <button type="button" className="btn btn--ghost btn--block" onClick={() => setMode('resolve')}>
                แจ้งว่าแก้ไขแล้ว (ผู้ดูแล)
              </button>
            )}
            {report.status === 'resolved' && (isReporter || isAdmin) && (
              <button type="button" className="btn btn--secondary btn--block" onClick={() => setMode('reopen')}>
                <RotateCcw size={18} aria-hidden /> ยังไม่แก้ไขจริง — เปิดปัญหาอีกครั้ง
              </button>
            )}
            {report.status === 'resolved' && !isReporter && !isAdmin && (
              <p className="hint">ถ้าพบว่ายังไม่ได้แก้ไขจริง ผู้แจ้งหรือผู้ดูแลสามารถเปิดปัญหาอีกครั้งได้ หรือแจ้งปัญหาใหม่ที่จุดนี้</p>
            )}
            {(isAdmin || (isReporter && report.status === 'open' && report.volunteers.length === 0)) && (
              <button type="button" className="btn-link btn-link--muted" onClick={() => setMode('hide')}>
                <EyeOff size={15} aria-hidden /> {isAdmin ? 'ซ่อนรายงาน (ผู้ดูแล)' : 'ซ่อนรายงานนี้ (แจ้งผิด/ซ้ำ)'}
              </button>
            )}
          </div>
        )}
      </div>

      {report.photoUrl && (
        <a href={report.photoUrl} target="_blank" rel="noopener" className="detail__photo">
          <img src={report.photoUrl} alt={`รูปประกอบ: ${reportTitle(report)}`} loading="lazy" />
        </a>
      )}

      <div className="detail__links">
        <a
          className="btn-link"
          href={`https://www.google.com/maps/search/?api=1&query=${report.lat},${report.lng}`}
          target="_blank"
          rel="noopener"
        >
          <Navigation size={15} aria-hidden /> นำทางไปจุดนี้
        </a>
        <CopyLink id={report.id} onToast={onToast} />
      </div>

      <History reportId={report.id} />

    </article>
  );
}

function useName() {
  const { user } = useAuth();
  return useState(() => getSavedName() || user?.displayName || '');
}

function NameField({ value, onChange, error, label = 'ชื่อที่จะแสดง' }: { value: string; onChange: (v: string) => void; error?: string; label?: string }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <input
        className={`input${error ? ' has-error' : ''}`}
        value={value}
        maxLength={LIMITS.name}
        onChange={(e) => onChange(e.target.value)}
        placeholder="เช่น พี่ต้อย หรือ ป้าแดง"
        autoComplete="name"
        name="helperName"
      />
      {error && <span className="form-error">{error}</span>}
    </label>
  );
}

function JoinForm({ report, onCancel, onDone }: { report: Report; onCancel: () => void; onDone: (msg: string) => void }) {
  const { user } = useAuth();
  const [name, setName] = useName();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [nameErr, setNameErr] = useState<string>();

  async function submit(e: FormEvent) {
    e.preventDefault();
    const n = name.trim();
    if (!n) return setNameErr('ใส่ชื่อที่จะให้คนอื่นเห็นว่าใครมาช่วย');
    setNameErr(undefined);
    setBusy(true);
    setErr(null);
    try {
      await joinReport(report.id, user!.uid, n);
      saveName(n);
      onDone('รับช่วยเหลือแล้ว ขอบคุณที่ช่วยชุมชน');
    } catch (e2) {
      setErr(thaiError(e2));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="inline-form" onSubmit={submit} noValidate>
      <p className="inline-form__title">รับช่วยเหลือจุดนี้</p>
      <NameField value={name} onChange={setName} error={nameErr} label="ชื่อผู้ช่วย" />
      {err && <p className="form-error" role="alert">{err}</p>}
      <div className="btn-row">
        <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={busy}>
          ยกเลิก
        </button>
        <button type="submit" className="btn btn--primary" disabled={busy}>
          {busy ? 'กำลังบันทึก…' : 'ยืนยันรับช่วยเหลือ'}
        </button>
      </div>
    </form>
  );
}

function ConfirmLeave({ report, onCancel, onDone }: { report: Report; onCancel: () => void; onDone: (msg: string) => void }) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const myName = report.volunteers.find((v) => v.uid === user?.uid)?.name ?? '';
  async function go() {
    setBusy(true);
    setErr(null);
    try {
      await leaveReport(report.id, user!.uid, myName || 'จิตอาสา');
      onDone('ถอนตัวแล้ว');
    } catch (e) {
      setErr(thaiError(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="inline-form">
      <p className="inline-form__title">ถอนตัวจากจุดนี้?</p>
      <p className="hint">ถ้าไม่มีจิตอาสาเหลืออยู่ สถานะจะกลับเป็น “รอความช่วยเหลือ”</p>
      {err && <p className="form-error" role="alert">{err}</p>}
      <div className="btn-row">
        <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={busy}>
          ไม่ใช่ตอนนี้
        </button>
        <button type="button" className="btn btn--secondary" onClick={go} disabled={busy}>
          {busy ? 'กำลังบันทึก…' : 'ยืนยันถอนตัว'}
        </button>
      </div>
    </div>
  );
}

function ResolveForm({ report, isAdmin, onCancel, onDone }: { report: Report; isAdmin: boolean; onCancel: () => void; onDone: (msg: string) => void }) {
  const { user } = useAuth();
  const myName = report.volunteers.find((v) => v.uid === user?.uid)?.name;
  const [savedName, setSavedName] = useName();
  const name = myName ?? savedName;
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [fieldErr, setFieldErr] = useState<{ note?: string; name?: string }>({});
  const uploadedRef = useRef<{ blob: Blob; url: string } | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const n = note.trim();
    const errs: typeof fieldErr = {};
    if (!n) errs.note = 'เล่าสั้น ๆ ว่าทำอะไรไปแล้ว เช่น “ลอกท่อระบายน้ำ น้ำลดแล้ว”';
    if (!name.trim()) errs.name = 'ใส่ชื่อที่จะแสดงบนเว็บ';
    setFieldErr(errs);
    if (Object.keys(errs).length) return;
    setErr(null);
    try {
      let photoUrl: string | null = null;
      if (photo) {
        if (uploadedRef.current?.blob === photo) {
          photoUrl = uploadedRef.current.url;
        } else {
          setBusy('กำลังอัปโหลดรูป… 0%');
          photoUrl = await uploadPhoto('resolutions', user!.uid, report.id, photo, (p) => setBusy(`กำลังอัปโหลดรูป… ${p}%`));
          uploadedRef.current = { blob: photo, url: photoUrl };
        }
      }
      setBusy('กำลังบันทึก…');
      await resolveReport(report.id, user!.uid, name.trim(), n, photoUrl, isAdmin);
      if (!myName) saveName(name.trim());
      onDone('บันทึกผลแล้ว สถานะเปลี่ยนเป็น “แก้ไขแล้ว”');
    } catch (e2) {
      setErr(thaiError(e2));
    } finally {
      setBusy(null);
    }
  }

  return (
    <form className="inline-form" onSubmit={submit} noValidate>
      <p className="inline-form__title">แจ้งว่าแก้ไขแล้ว</p>
      {!myName && <NameField value={savedName} onChange={setSavedName} error={fieldErr.name} />}
      <label className="field">
        <span className="field__label">สิ่งที่ทำ</span>
        <textarea
          className={`input${fieldErr.note ? ' has-error' : ''}`}
          rows={3}
          value={note}
          maxLength={LIMITS.note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="เช่น เก็บขยะและแยกขวดพลาสติกเรียบร้อย"
          name="resolutionNote"
        />
        {fieldErr.note && <span className="form-error">{fieldErr.note}</span>}
      </label>
      <PhotoPicker label="รูปหลังแก้ไข" value={photo} onChange={setPhoto} />
      {err && <p className="form-error" role="alert">{err}</p>}
      <div className="btn-row">
        <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={!!busy}>
          ยกเลิก
        </button>
        <button type="submit" className="btn btn--success" disabled={!!busy}>
          {busy ?? (err ? 'ลองอีกครั้ง' : 'บันทึกผล')}
        </button>
      </div>
    </form>
  );
}

function ReasonForm(props: {
  title: string;
  label: string;
  required: boolean;
  submitLabel: string;
  danger?: boolean;
  onCancel: () => void;
  onSubmit: (reason: string, name: string) => Promise<void>;
  onDone: () => void;
}) {
  const [name, setName] = useName();
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [fieldErr, setFieldErr] = useState<{ reason?: string; name?: string }>({});

  async function submit(e: FormEvent) {
    e.preventDefault();
    const errs: typeof fieldErr = {};
    if (props.required && !reason.trim()) errs.reason = 'บอกเหตุผลสั้น ๆ ให้คนอื่นเข้าใจ';
    if (!name.trim()) errs.name = 'ใส่ชื่อที่จะแสดงบนเว็บ';
    setFieldErr(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    setErr(null);
    try {
      await props.onSubmit(reason.trim(), name.trim());
      saveName(name.trim());
      props.onDone();
    } catch (e2) {
      setErr(thaiError(e2));
      setBusy(false);
    }
  }

  return (
    <form className="inline-form" onSubmit={submit} noValidate>
      <p className="inline-form__title">{props.title}</p>
      <NameField value={name} onChange={setName} error={fieldErr.name} />
      <label className="field">
        <span className="field__label">
          {props.label} {!props.required && <span className="field__optional">(ไม่บังคับ)</span>}
        </span>
        <textarea
          className={`input${fieldErr.reason ? ' has-error' : ''}`}
          rows={2}
          value={reason}
          maxLength={LIMITS.note}
          onChange={(e) => setReason(e.target.value)}
          name="reason"
        />
        {fieldErr.reason && <span className="form-error">{fieldErr.reason}</span>}
      </label>
      {err && <p className="form-error" role="alert">{err}</p>}
      <div className="btn-row">
        <button type="button" className="btn btn--ghost" onClick={props.onCancel} disabled={busy}>
          ยกเลิก
        </button>
        <button type="submit" className={`btn ${props.danger ? 'btn--danger' : 'btn--primary'}`} disabled={busy}>
          {busy ? 'กำลังบันทึก…' : props.submitLabel}
        </button>
      </div>
    </form>
  );
}

function CopyLink({ id, onToast }: { id: string; onToast: (m: string) => void }) {
  async function copy() {
    const url = `${window.location.origin}${window.location.pathname}#/r/${id}`;
    try {
      if (navigator.share && matchMedia('(pointer: coarse)').matches) {
        await navigator.share({ title: 'ท่าแร้งช่วยกัน', url });
        return;
      }
      await navigator.clipboard.writeText(url);
      onToast('คัดลอกลิงก์แล้ว');
    } catch {
      /* ผู้ใช้ยกเลิกการแชร์ */
    }
  }
  return (
    <button type="button" className="btn-link" onClick={copy}>
      <Link2 size={15} aria-hidden /> แชร์ลิงก์จุดนี้
    </button>
  );
}

const HISTORY_TEXT: Record<HistoryEvent['type'], string> = {
  created: 'แจ้งปัญหา',
  joined: 'รับช่วยเหลือ',
  left: 'ถอนตัว',
  resolved: 'แจ้งว่าแก้ไขแล้ว',
  reopened: 'เปิดปัญหาอีกครั้ง',
  hidden: 'ซ่อนรายงาน',
  unhidden: 'แสดงรายงานอีกครั้ง',
};

function History({ reportId }: { reportId: string }) {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<HistoryEvent[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setEvents(null);
    return subscribeHistory(reportId, setEvents, (e) => setErr(thaiError(e)));
  }, [open, reportId]);

  return (
    <section className="history">
      <button type="button" className="history__toggle" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Clock size={15} aria-hidden /> ประวัติการเปลี่ยนสถานะ
        <ChevronDown size={16} className={open ? 'rot' : ''} aria-hidden />
      </button>
      {open && (
        <div className="history__body">
          {err ? (
            <p className="form-error">{err}</p>
          ) : !events ? (
            <p className="muted small">กำลังโหลด…</p>
          ) : (
            <ol className="timeline">
              {events.map((ev) => (
                <li key={ev.id}>
                  <span className={`dot dot--${ev.toStatus}`} aria-hidden />
                  <div>
                    <p>
                      <UserRound size={13} aria-hidden /> <strong>{ev.byName}</strong> {HISTORY_TEXT[ev.type]}
                      {ev.fromStatus && ev.fromStatus !== ev.toStatus && (
                        <span className="muted"> · {statusLabel(ev.fromStatus)} → {statusLabel(ev.toStatus)}</span>
                      )}
                    </p>
                    {ev.note && <p className="timeline__note">“{ev.note}”</p>}
                    <p className="muted small">{formatDateTime(ev.at)}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </section>
  );
}
