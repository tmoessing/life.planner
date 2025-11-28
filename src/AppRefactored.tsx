import React from 'react';
import { Provider, useAtom } from 'jotai';
import { AppProvider } from '@/contexts/AppContext';
import { GoogleAuthProvider } from '@/components/GoogleAuthProvider';
import { Header } from '@/components/Header';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { currentViewAtom } from '@/stores/appStore';
import { useSettingsMigration } from '@/hooks/useSettingsMigration';
import { VIEW_COMPONENTS } from '@/constants/views';

function AppContent() {
  const [currentView, setCurrentView] = useAtom(currentViewAtom);
  
  // Handle settings migration
  useSettingsMigration();

  const renderView = () => {
    const ViewComponent = VIEW_COMPONENTS[currentView] || VIEW_COMPONENTS['today'];
    return <ViewComponent />;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <ErrorBoundary>
          {renderView()}
        </ErrorBoundary>
      </main>
    </div>
  );
}

function App() {
  return (
    <Provider>
      <AppProvider>
        <GoogleAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          <AppContent />
        </GoogleAuthProvider>
      </AppProvider>
    </Provider>
  );
}

export default App;
