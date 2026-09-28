import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/ibm-plex-sans-thai-looped/thai-400.css';
import '@fontsource/ibm-plex-sans-thai-looped/thai-500.css';
import '@fontsource/ibm-plex-sans-thai-looped/thai-600.css';
import '@fontsource/ibm-plex-sans-thai-looped/latin-400.css';
import '@fontsource/ibm-plex-sans-thai-looped/latin-500.css';
import '@fontsource/ibm-plex-sans-thai-looped/latin-600.css';
import '@fontsource/mitr/thai-500.css';
import '@fontsource/mitr/latin-500.css';
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
