import { useState } from 'react';
import { LogIn } from 'lucide-react';
import { detectInAppBrowser, useAuth } from '../hooks/useAuth';

export function SignInCard({ reason }: { reason: string }) {
  const { signIn, signingIn, error, signInTestAccount } = useAuth();
  const inApp = detectInAppBrowser();
  const externalUrl = (() => {
    const u = new URL(window.location.href);
    u.searchParams.set('openExternalBrowser', '1');
    return u.toString();
  })();

  return (
    <div className="signin">
      <p className="signin__text">{reason}</p>
      <button type="button" className="btn btn--primary btn--block" onClick={signIn} disabled={signingIn}>
        <LogIn size={18} aria-hidden />
        {signingIn ? 'กำลังเปิดหน้าเข้าสู่ระบบ…' : 'เข้าสู่ระบบด้วยบัญชี Google'}
      </button>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {inApp === 'line' && (
        <p className="hint">
          ถ้าเปิดจาก LINE แล้วเข้าสู่ระบบไม่ได้{' '}
          <a href={externalUrl}>เปิดหน้านี้ในเบราว์เซอร์ของเครื่อง</a>
        </p>
      )}
      {(inApp === 'facebook' || inApp === 'other') && (
        <p className="hint">ถ้าเข้าสู่ระบบไม่ได้ ให้กดเมนู ⋯ มุมขวาบน แล้วเลือก “เปิดในเบราว์เซอร์” (Chrome หรือ Safari)</p>
      )}
      {signInTestAccount && <TestAccountForm onSubmit={signInTestAccount} />}
      <ul className="trust-list">
        <li>ไม่ขอเลขบัตรประชาชน ไม่ขอข้อมูลบัญชีธนาคาร</li>
        <li>อีเมลและชื่อบัญชี Google จะไม่แสดงบนเว็บ บนเว็บจะเห็นเฉพาะชื่อที่กรอกเอง</li>
      </ul>
    </div>
  );
}

function TestAccountForm({ onSubmit }: { onSubmit: (email: string, name: string) => Promise<void> }) {
  const [email, setEmail] = useState('');
  return (
    <form
      className="dev-signin"
      onSubmit={(e) => {
        e.preventDefault();
        const v = email.trim() || 'tester@example.com';
        onSubmit(v, v.split('@')[0]);
      }}
    >
      <span className="small">โหมดพัฒนา: บัญชีทดสอบของ Emulator</span>
      <input
        className="input"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tester@example.com"
        aria-label="อีเมลบัญชีทดสอบ"
        data-testid="test-email"
      />
      <button type="submit" className="btn btn--secondary" data-testid="test-signin">
        เข้าสู่ระบบด้วยบัญชีทดสอบ
      </button>
    </form>
  );
}
