import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithCredential,
  signInWithRedirect,
  signOut as fbSignOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, USE_EMULATORS } from '../firebase';

interface AuthState {
  user: User | null;
  ready: boolean;
  isAdmin: boolean;
  signingIn: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  /** เฉพาะโหมด Emulator: เข้าสู่ระบบด้วยบัญชี Google จำลอง (ไม่ต้องต่ออินเทอร์เน็ต) */
  signInTestAccount: ((email: string, name: string) => Promise<void>) | null;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRedirectResult(auth).catch((e) => setError(authErrorText(e)));
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setReady(true);
      setIsAdmin(false);
      if (u) {
        try {
          const snap = await getDoc(doc(db, 'admins', u.uid));
          setIsAdmin(snap.exists());
        } catch {
          setIsAdmin(false);
        }
      }
    });
  }, []);

  const signIn = useCallback(async () => {
    setError(null);
    setSigningIn(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error(e);
      const code = (e as { code?: string }).code ?? '';
      if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
        await signInWithRedirect(auth, provider);
        return;
      }
      if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        setError(authErrorText(e));
      }
    } finally {
      setSigningIn(false);
    }
  }, []);

  const signOut = useCallback(() => fbSignOut(auth), []);

  const signInTestAccount = useMemo(
    () =>
      USE_EMULATORS
        ? async (email: string, name: string) => {
            setError(null);
            const fakeIdToken = JSON.stringify({ sub: email, email, name, email_verified: true });
            await signInWithCredential(auth, GoogleAuthProvider.credential(fakeIdToken));
          }
        : null,
    [],
  );

  const value = useMemo(
    () => ({ user, ready, isAdmin, signingIn, error, signIn, signOut, signInTestAccount }),
    [user, ready, isAdmin, signingIn, error, signIn, signOut, signInTestAccount],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth outside provider');
  return v;
}

function authErrorText(e: unknown) {
  const code = (e as { code?: string }).code ?? '';
  if (code.includes('network')) return 'เชื่อมต่ออินเทอร์เน็ตไม่ได้ ลองอีกครั้ง';
  if (code.includes('unauthorized-domain')) return 'โดเมนนี้ยังไม่ได้รับอนุญาตใน Firebase Authentication (ผู้ดูแลเว็บต้องเพิ่มใน Authorized domains)';
  if (code.includes('operation-not-allowed')) return 'ยังไม่ได้เปิดการเข้าสู่ระบบด้วย Google ใน Firebase Console';
  return 'เข้าสู่ระบบไม่สำเร็จ ลองอีกครั้ง';
}

/** เบราว์เซอร์ในแอป (LINE/Facebook/Instagram) มักเข้าสู่ระบบด้วย Google ไม่ได้ */
export function detectInAppBrowser(): 'line' | 'facebook' | 'other' | null {
  const ua = navigator.userAgent || '';
  if (/Line\//i.test(ua)) return 'line';
  if (/FBAN|FBAV|FB_IAB|Instagram/i.test(ua)) return 'facebook';
  if (/; wv\)/.test(ua)) return 'other';
  return null;
}
