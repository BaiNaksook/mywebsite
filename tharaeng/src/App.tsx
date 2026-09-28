import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { AboutPage } from './components/AboutPage';
import { Footer } from './components/Community';
import { Filters } from './components/Filters';
import { Header } from './components/Header';
import { MapView } from './components/MapView';
import { ReportDetail } from './components/ReportDetail';
import { ReportFlow } from './components/ReportFlow';
import { ReportList } from './components/ReportList';
import { StatsBar } from './components/StatsBar';
import { USE_EMULATORS } from './firebase';
import { useReports } from './hooks/useReports';
import { navigate, useMediaQuery, useRoute } from './hooks/useRoute';
import type { CategoryId, ReportStatus } from './types';

export default function App() {
  const route = useRoute();
  const { reports, loading, error, retry } = useReports();
  const isDesktop = useMediaQuery('(min-width: 900px)');
  const [status, setStatus] = useState<ReportStatus | 'all'>('all');
  const [category, setCategory] = useState<CategoryId | 'all'>('all');
  const [focus, setFocus] = useState<{ id: string; nonce: number } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const mapAnchorRef = useRef<HTMLDivElement>(null);

  const selectedId = route.name === 'map' ? route.reportId : null;
  const selected = useMemo(() => reports.find((r) => r.id === selectedId) ?? null, [reports, selectedId]);

  const filtered = useMemo(
    () => reports.filter((r) => (status === 'all' || r.status === status) && (category === 'all' || r.category === category)),
    [reports, status, category],
  );

  const showToast = useCallback((m: string) => setToast(m), []);
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(t);
  }, [toast]);

  // เปิดลิงก์ #/r/{id} ตรง ๆ → เลื่อนแผนที่ไปที่หมุดเมื่อข้อมูลมาถึง
  const focusedOnce = useRef<string | null>(null);
  useEffect(() => {
    if (selected && focusedOnce.current !== selected.id) {
      focusedOnce.current = selected.id;
      setFocus({ id: selected.id, nonce: Date.now() });
    }
    if (!selectedId) focusedOnce.current = null;
  }, [selected, selectedId]);

  const select = useCallback(
    (id: string, fromList = false) => {
      focusedOnce.current = id;
      setFocus({ id, nonce: Date.now() });
      navigate(`/r/${id}`);
      if (fromList && !isDesktop) {
        mapAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    [isDesktop],
  );

  const closeDetail = useCallback(() => navigate('/'), []);

  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeDetail();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId, closeDetail]);

  const openReport = () => navigate('/report');

  const banner = USE_EMULATORS && (
    <div className="dev-banner" role="note">
      โหมดพัฒนา: เชื่อมต่อ Firebase Emulator ในเครื่อง — ข้อมูลทั้งหมดเป็นข้อมูลทดสอบ ไม่ใช่ข้อมูลจริง
    </div>
  );

  if (route.name === 'report') {
    return (
      <>
        {banner}
        <Header onReport={openReport} showReport={false} />
        <main className="narrow">
          <ReportFlow existing={reports} onCancel={() => navigate('/')} onViewReport={(id) => select(id)} />
        </main>
        {toastEl(toast)}
      </>
    );
  }

  if (route.name === 'about') {
    return (
      <>
        {banner}
        <Header onReport={openReport} showReport={isDesktop} />
        <main className="narrow">
          <AboutPage onBack={() => navigate('/')} />
        </main>
      </>
    );
  }

  const listSection = (
    <section className="list-section" aria-labelledby="list-title">
      <div className="list-section__head">
        <h2 id="list-title">ปัญหาล่าสุด</h2>
        {!loading && !error && (
          <span className="muted small">
            แสดง {filtered.length} จาก {reports.length} รายการ
          </span>
        )}
      </div>
      <ReportList
        reports={filtered}
        totalCount={reports.length}
        loading={loading}
        error={error}
        selectedId={selectedId}
        onSelect={(id) => select(id, true)}
        onRetry={retry}
        onClearFilters={() => {
          setStatus('all');
          setCategory('all');
        }}
        onReport={openReport}
      />
    </section>
  );

  const detail = selected && <ReportDetail report={selected} onClose={closeDetail} onToast={showToast} />;
  const missingSelected = selectedId && !selected && !loading && (
    <div className="state">
      <p className="state__title">ไม่พบรายงานนี้</p>
      <p className="state__text">อาจถูกซ่อนหรือลิงก์ไม่ถูกต้อง</p>
      <button type="button" className="btn btn--secondary" onClick={closeDetail}>
        กลับหน้าแผนที่
      </button>
    </div>
  );

  return (
    <>
      {banner}
      <Header onReport={openReport} showReport={isDesktop} />
      <main className="layout">
        <aside className="side">
          <StatsBar reports={reports} loading={loading} status={status} onStatus={setStatus} />
          {!isDesktop && (
            <div ref={mapAnchorRef} className="map-anchor">
              <MapView reports={filtered} selectedId={selectedId} onSelect={(id) => select(id)} focus={focus} inset={{ bottomFraction: 0.5 }} />
            </div>
          )}
          <Filters status={status} category={category} onStatus={setStatus} onCategory={setCategory} />
          {listSection}
          <Footer />
        </aside>
        {isDesktop && (
          <div className="map-area">
            <MapView reports={filtered} selectedId={selectedId} onSelect={(id) => select(id)} focus={focus} inset={{ left: 432 }} />
            {(detail || missingSelected) && <div className="float-card">{detail || missingSelected}</div>}
          </div>
        )}
      </main>

      {!isDesktop && (
        <>
          {(detail || missingSelected) && (
            <div className="sheet-layer">
              <button type="button" className="sheet-backdrop" aria-label="ปิดรายละเอียด" onClick={closeDetail} />
              <div className="sheet" role="dialog" aria-modal="true" aria-label="รายละเอียดปัญหา">
                <div className="sheet__grip" aria-hidden />
                {detail || missingSelected}
              </div>
            </div>
          )}
          {!selectedId && (
            <button type="button" className="fab" onClick={openReport}>
              <Plus size={22} strokeWidth={2.6} aria-hidden /> แจ้งปัญหา
            </button>
          )}
        </>
      )}
      {toastEl(toast)}
    </>
  );
}

function toastEl(toast: string | null) {
  return (
    <div className="toast-region" aria-live="polite">
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
