import { Info, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function Header({ onReport, showReport }: { onReport: () => void; showReport: boolean }) {
  const { user, signOut, isAdmin } = useAuth();
  return (
    <header className="topbar">
      <a href="#/" className="brand" aria-label="ท่าแร้งช่วยกัน หน้าแรก">
        <span className="brand__mark" aria-hidden>
          <svg viewBox="0 0 32 32" width="30" height="30">
            <rect width="32" height="32" rx="10" fill="var(--green)" />
            <path d="M16 7.5a6.5 6.5 0 0 0-6.5 6.5c0 4.8 6.5 10.5 6.5 10.5s6.5-5.7 6.5-10.5A6.5 6.5 0 0 0 16 7.5z" fill="var(--cream)" />
            <path d="M16 17.2l-2.3-2.2a1.45 1.45 0 0 1 2.05-2.05l.25.25.25-.25a1.45 1.45 0 0 1 2.05 2.05z" fill="var(--amber)" />
          </svg>
        </span>
        <span className="brand__text">
          <span className="brand__name">ท่าแร้งช่วยกัน</span>
          <span className="brand__sub">ต.ท่าแร้ง อ.บ้านแหลม จ.เพชรบุรี</span>
        </span>
      </a>
      <nav className="topbar__nav">
        <a href="#/about" className="nav-link">
          <Info size={18} aria-hidden />
          <span>ข้อมูลชุมชน</span>
        </a>
        {user && (
          <button type="button" className="nav-link" onClick={signOut} title={user.email ?? undefined}>
            <LogOut size={18} aria-hidden />
            <span>ออกจากระบบ{isAdmin ? ' (ผู้ดูแล)' : ''}</span>
          </button>
        )}
        {showReport && (
          <button type="button" className="btn btn--primary topbar__report" onClick={onReport}>
            + แจ้งปัญหา
          </button>
        )}
      </nav>
    </header>
  );
}
