import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      // Check for standalone mode
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return;
      }
      
      // Check for iOS PWA
      if ((window.navigator as any).standalone === true) {
        setIsInstalled(true);
        return;
      }
    };

    checkInstalled();

    // Listen for the beforeinstallprompt event
        const handleBeforeInstallPrompt = (e: Event) => {
          e.preventDefault();
          setDeferredPrompt(e as BeforeInstallPromptEvent);
          setCanInstall(true);
        };

    // Listen for the appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setCanInstall(false);
      } else {
      }
      
      setDeferredPrompt(null);
    } catch (error) {
    }
  };

  return {
    isInstalled,
    canInstall,
    install
  };
}
