import { Provider, useAtom } from 'jotai';
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { LoadingScreen } from '@/components/LoadingScreen';
import { currentViewAtom } from '@/stores/appStore';
import { useSettingsMigration } from '@/hooks/useSettingsMigration';
import { VIEW_COMPONENTS } from '@/constants/views';

function AppContent() {
  const [currentView] = useAtom(currentViewAtom);
  const [isLoading, setIsLoading] = useState(true);
  const [, setIsInitialized] = useState(false);
  
  // Handle settings migration
  useSettingsMigration();

  // Check if app is actually loading
  useEffect(() => {
    // Check if we're in a PWA environment or if it's the first load
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                  (window.navigator as any).standalone === true;
    
    // Only show loading screen for PWA or first load
    if (isPWA || !sessionStorage.getItem('app-initialized')) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        setIsInitialized(true);
        sessionStorage.setItem('app-initialized', 'true');
      }, 2000); // Show loading screen for 2 seconds

      return () => clearTimeout(timer);
    } else {
      // Skip loading screen for subsequent loads
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, []);

  // Force loading state to false if it gets stuck
  useEffect(() => {
    const forceLoadingTimeout = setTimeout(() => {
      if (isLoading) {
        console.warn('Loading state stuck, forcing app to load');
        setIsLoading(false);
        setIsInitialized(true);
      }
    }, 5000); // Force load after 5 seconds

    return () => clearTimeout(forceLoadingTimeout);
  }, [isLoading]);

  const renderView = () => {
    const ViewComponent = VIEW_COMPONENTS[currentView] || VIEW_COMPONENTS['today'];
    return <ViewComponent />;
  };

  return (
    <div className="min-h-screen bg-background">
      {isLoading && (
        <LoadingScreen 
          isLoading={isLoading} 
          onComplete={() => setIsLoading(false)} 
        />
      )}
      {!isLoading && (
        <>
          <Header />
          <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
            {renderView()}
          </main>
          <PWAInstallPrompt />
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <Provider>
      <AppContent />
    </Provider>
  );
}

export default App;
