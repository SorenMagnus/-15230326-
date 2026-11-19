import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ignore third-party browser extension errors (e.g. video sniffers probing cross-origin iframes)
window.addEventListener(
  'error',
  (event) => {
    const src = event.filename || '';
    if (src.startsWith('chrome-extension://') || src.startsWith('moz-extension://')) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  },
  true
);

createRoot(document.getElementById('root')!).render(<App />);
