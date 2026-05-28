'use client';

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

/**
 * Pure-code PWA Install Prompt
 * Listens for the browser's beforeinstallprompt event.
 * Shows a nice banner/button — especially useful on staff phones for the admin.
 */
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show on mobile-ish screens
      if (window.innerWidth < 900) {
        setVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the PWA install');
    }
    setDeferredPrompt(null);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[60] md:left-auto md:right-4 md:w-80">
      <div className="rounded-3xl border border-border bg-surface p-4 shadow-xl flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-accent text-white flex-shrink-0">
          <Download className="h-5 w-5" />
        </div>
        <div className="flex-1 text-sm">
          <div className="font-medium">Install the Grille app</div>
          <div className="text-text-secondary text-xs mt-0.5">
            Add to your home screen for fast access to the admin and menu.
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleInstall}
              className="btn btn-primary text-xs px-4 py-2"
            >
              Install
            </button>
            <button
              onClick={() => setVisible(false)}
              className="btn btn-ghost text-xs px-4 py-2"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
