import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize performance monitoring in development
if (import.meta.env.MODE === 'development') {
  import('./utils/performance/WebVitals').then(({ webVitals }) => {
    // Log performance report after 3 seconds
    setTimeout(() => {
      webVitals.logReport();
    }, 3000);
  });
}

// Register service worker
if ('serviceWorker' in navigator && import.meta.env.MODE === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
