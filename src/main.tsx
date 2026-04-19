import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"

import { Capacitor } from '@capacitor/core';
import { registerSW } from 'virtual:pwa-register';

if ('serviceWorker' in navigator) {
  if (Capacitor.isNativePlatform?.()) {
    // NATIVE APP BEHAVIOR
    // Service workers are unnecessary and cause double-open bugs across OTA app updates.
    // We actively unregister them and clear CacheStorage so it immediately loads fresh files.
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      if (registrations.length > 0) {
        Promise.all(registrations.map(r => r.unregister())).then(() => {
          if ('caches' in window) {
            caches.keys()
              .then(keys => Promise.all(keys.map(key => caches.delete(key))))
              .then(() => window.location.reload());
          } else {
            window.location.reload();
          }
        });
      }
    });
  } else {
    // WEB PWA BEHAVIOR
    // Explicitly register the service worker since we disabled auto-inject
    registerSW({ immediate: true });

    // Wait for the service worker to be updated and control the page.
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider>
      <App />
    </TooltipProvider>
    <Toaster duration={2000} />
  </StrictMode>,
)
