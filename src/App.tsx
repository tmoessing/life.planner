import { Provider } from 'jotai';
import { AppProvider } from '@/contexts/AppContext';
import { GoogleAuthProvider } from '@/components/GoogleAuthProvider';
import { Header } from '@/components/Header';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { useSettingsMigration } from '@/hooks/useSettingsMigration';
import { useTheme } from '@/hooks/useTheme';
import { useViewManager } from '@/hooks/useViewManager';

function AppContent() {
  // Handle settings migration
  useSettingsMigration();
  
  // Apply theme
  useTheme();

  // Manage view state and rendering
  const { currentView, setCurrentView, renderView } = useViewManager();

  return (
    <div className="min-h-screen bg-background">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      <main className="container mx-auto px-2 sm:px-4 pt-4 pb-20 sm:pt-6 sm:pb-6 safe-area-left safe-area-right smooth-scroll mobile-scroll">
        <ErrorBoundary>
          {renderView()}
        </ErrorBoundary>
      </main>
      <MobileBottomNav currentView={currentView} setCurrentView={setCurrentView} />
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
