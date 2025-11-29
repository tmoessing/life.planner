import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Download, Smartphone } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export function PWAInstallPrompt() {
  const { isInstalled, canInstall, install } = usePWA();
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Show install prompt after a delay if not already shown and not dismissed
    const timer = setTimeout(() => {
      sessionStorage.getItem('pwa-install-dismissed');
      
      // Check if we're on mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      
      // Show on mobile browsers (always show, ignore dismissal) or when canInstall is true
      if (!isInstalled && (canInstall || isMobile)) {
        setShowInstallPrompt(true);
      }
    }, 2000); // Show after 2 seconds (even faster for mobile)

    return () => {
      clearTimeout(timer);
    };
  }, [isInstalled, canInstall]);

  const handleInstallClick = async () => {
    try {
      // Check if we're on mobile and don't have the install prompt
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile && !canInstall) {
        // For mobile browsers, show instructions instead of trying to install
        alert('To install this app:\n\n' +
          'iOS Safari: Tap the Share button, then "Add to Home Screen"\n' +
          'Android Chrome: Tap the menu (⋮) and select "Add to Home Screen" or "Install App"');
        setShowInstallPrompt(false);
        return;
      }
      
      await install();
      setShowInstallPrompt(false);
    } catch (error) {
      setShowInstallPrompt(false);
    }
  };

  const handleDismiss = () => {
    // Check if we're on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // On mobile, only dismiss for current session (don't persist)
      // This ensures it shows again on next page load
      setShowInstallPrompt(false);
    } else {
      // On desktop, persist dismissal for the session
      setShowInstallPrompt(false);
      sessionStorage.setItem('pwa-install-dismissed', 'true');
    }
  };

  // Don't show if already installed
  if (isInstalled) {
    return null;
  }
  
  // Don't show if not showing
  if (!showInstallPrompt) {
    return null;
  }
  
  // Check dismissal only for desktop users - mobile should always show
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isDismissed = sessionStorage.getItem('pwa-install-dismissed');
  
  // Only check dismissal for desktop users
  if (!isMobile && isDismissed) {
    return null;
  }

  return (
    <Card className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-200 shadow-xl rounded-none safe-area-bottom">
      <CardContent className="p-4 safe-area-left safe-area-right">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <img 
                src="/lsb.png" 
                alt="Life Planner Logo" 
                className="h-8 w-8 rounded-lg"
                onError={(e) => {
                  // Fallback to icon if logo fails to load
                  e.currentTarget.style.display = 'none';
                  const nextEl = e.currentTarget.nextElementSibling as HTMLElement;
                  if (nextEl) nextEl.style.display = 'flex';
                }}
              />
              <div className="h-8 w-8 flex items-center justify-center hidden">
                <Smartphone className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="mb-1">
              <h3 className="font-bold text-base text-blue-900">
                Install Life Planner
              </h3>
            </div>
            <p className="text-sm text-blue-700 mb-3 leading-relaxed">
              🚀 Get the full experience! Add to your home screen for instant access and offline use.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleInstallClick}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 w-full sm:w-auto touch-target min-h-[44px] sm:min-h-0"
              >
                <Download className="h-4 w-4 mr-2" />
                Install Now
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 text-sm px-3 py-2 rounded-lg transition-all duration-200 h-11 w-11 sm:h-auto sm:w-auto touch-target"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
