import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeTheme } from './lib/theme'
import { BulletproofApp } from './components/production/BulletproofApp'

// Initialize theme on app startup
initializeTheme();

createRoot(document.getElementById("root")!).render(
  <BulletproofApp>
    <App />
  </BulletproofApp>
);
