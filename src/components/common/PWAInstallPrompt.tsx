import React, { useState, useEffect } from 'react';
import { Download, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSTip, setShowIOSTip] = useState(false);

  useEffect(() => {
    // Check if already launched in standalone mode (installed PWA)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for beforeinstallprompt event (Chromium desktop & Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      console.log('[PWA] ADT application was successfully installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          console.log('[PWA] User accepted the ADT install prompt');
          setIsInstalled(true);
        } else {
          console.log('[PWA] User dismissed the ADT install prompt');
        }
      } catch (err) {
        console.warn('[PWA] Error showing install prompt:', err);
      } finally {
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSTip(prev => !prev);
    }
  };

  // If already installed, don't show prompt
  if (isInstalled) {
    return null;
  }

  // Show if prompt is available (Android / Desktop Chrome) or on iOS Safari
  if (!deferredPrompt && !isIOS) {
    return null;
  }

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button
        onClick={handleInstallClick}
        className="pwa-install-btn"
        title="Install ADT App to Home Screen / Desktop"
        aria-label="Install ADT App"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.4rem 0.75rem',
          fontSize: '0.78rem',
          fontWeight: 700,
          color: '#ffffff',
          background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '9999px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(99, 102, 241, 0.35)',
          transition: 'all 0.2s ease',
          whiteSpace: 'nowrap'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.35)';
        }}
      >
        <Download size={14} strokeWidth={2.5} />
        <span>Install App</span>
      </button>

      {/* iOS Safari Helper Tooltip */}
      {showIOSTip && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '240px',
            padding: '0.75rem',
            background: 'var(--bg-card, #1e293b)',
            color: 'var(--text-primary, #ffffff)',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.35)',
            border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
            fontSize: '0.75rem',
            zIndex: 1000,
            lineHeight: 1.4
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckCircle2 size={14} color="#6366f1" />
            Install ADT on iOS
          </div>
          <p style={{ margin: 0, color: 'var(--text-secondary, #94a3b8)' }}>
            Tap the <strong>Share</strong> button in Safari, then scroll down and select <strong>&quot;Add to Home Screen&quot;</strong>.
          </p>
        </div>
      )}
    </div>
  );
};
