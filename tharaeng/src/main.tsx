import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// ไฟล์รวมที่มี unicode-range: เบราว์เซอร์โหลดเฉพาะชุดอักษรที่หน้าใช้จริง (ไทย/ละติน)
import '@fontsource/ibm-plex-sans-thai-looped/400.css';
import '@fontsource/ibm-plex-sans-thai-looped/600.css';
import '@fontsource/mitr/500.css';
import 'leaflet/dist/leaflet.css';
import './styles.css';
import { firebaseReady, missingConfigKeys } from './firebase';
import { SetupNeeded } from './components/SetupNeeded';

const root = createRoot(document.getElementById('root')!);

if (!firebaseReady) {
  root.render(<SetupNeeded missing={missingConfigKeys} />);
} else {
  Promise.all([import('./App'), import('./hooks/useAuth')]).then(([{ default: App }, { AuthProvider }]) => {
    root.render(
      <StrictMode>
        <AuthProvider>
          <App />
        </AuthProvider>
      </StrictMode>,
    );
  });
}
