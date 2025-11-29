import { useState, useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { Home, Target, BookOpen, FolderOpen, Calendar, GraduationCap } from 'lucide-react';
import type { ViewType } from '@/constants/views';
import { settingsAtom } from '@/stores/settingsStore';
import { useViewPrefetch } from '@/hooks/useViewPrefetch';

interface MobileBottomNavProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
}

export function MobileBottomNav({ currentView, setCurrentView }: MobileBottomNavProps) {
  const [settings] = useAtom(settingsAtom);
  const { prefetchView } = useViewPrefetch();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const isVisibleRef = useRef(true);
  const navRef = useRef<HTMLDivElement>(null);
  
  // Keep ref in sync with state
  useEffect(() => {
    isVisibleRef.current = isVisible;
  }, [isVisible]);

  // Update glass effect styles based on dark mode
  useEffect(() => {
    const updateStyles = () => {
      if (!navRef.current) return;
      const isDark = document.documentElement.classList.contains('dark');
      
      if (isDark) {
        navRef.current.style.background = 'rgba(0, 0, 0, 0.2)';
        navRef.current.style.borderTop = '1px solid rgba(255, 255, 255, 0.1)';
        navRef.current.style.boxShadow = '0 -4px 24px rgba(0, 0, 0, 0.3)';
      } else {
        navRef.current.style.background = 'rgba(255, 255, 255, 0.1)';
        navRef.current.style.borderTop = '1px solid rgba(255, 255, 255, 0.2)';
        navRef.current.style.boxShadow = '0 -4px 24px rgba(0, 0, 0, 0.1)';
      }
    };

    // Initial update
    updateStyles();

    // Watch for dark mode changes
    const observer = new MutationObserver(updateStyles);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);
  
  const baseNavItems = [
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'sprint', label: 'Stories', icon: BookOpen },
    { id: 'today', label: 'Today', icon: Calendar },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
  ];
  
  const lastNavItem = settings.layout.sections.classes
    ? { id: 'classes', label: 'Class', icon: GraduationCap }
    : { id: 'bucketlist', label: 'Bucketlist', icon: Home };
  
  const mobileNavItems = [...baseNavItems, lastNavItem];
  
  useEffect(() => {
    // Only add listener on mobile (when bottom nav is visible)
    if (typeof window === 'undefined' || window.innerWidth >= 1024) {
      return;
    }

    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          let shouldBeVisible = isVisibleRef.current;
          
          // Show nav when scrolling up, hide when scrolling down
          // Also show if we're at the top of the page
          if (currentScrollY < 10) {
            shouldBeVisible = true;
          } else if (currentScrollY > lastScrollY.current) {
            // Scrolling down
            shouldBeVisible = false;
          } else if (currentScrollY < lastScrollY.current) {
            // Scrolling up
            shouldBeVisible = true;
          }
          
          // Only update state if visibility actually changed
          if (shouldBeVisible !== isVisibleRef.current) {
            setIsVisible(shouldBeVisible);
          }
          
          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });
        
        ticking.current = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const todayButtonRef = useRef<HTMLButtonElement>(null);

  // Update today button glass effect styles based on dark mode
  useEffect(() => {
    const updateTodayButtonStyles = () => {
      if (!todayButtonRef.current) return;
      const isDark = document.documentElement.classList.contains('dark');
      
      if (isDark) {
        todayButtonRef.current.style.background = 'rgba(0, 0, 0, 0.2)';
        todayButtonRef.current.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        todayButtonRef.current.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.3)';
      } else {
        todayButtonRef.current.style.background = 'rgba(255, 255, 255, 0.1)';
        todayButtonRef.current.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        todayButtonRef.current.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
      }
    };

    // Initial update
    updateTodayButtonStyles();

    // Watch for dark mode changes
    const observer = new MutationObserver(updateTodayButtonStyles);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const showTodayButton = !isVisible && currentView !== 'today';

  return (
    <>
      <div 
        className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden transition-transform duration-300 ease-in-out px-2 pb-2 safe-area-bottom ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div
          ref={navRef}
          className="rounded-t-2xl safe-area-left safe-area-right"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div className="flex items-center justify-around py-2">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const viewType = item.id as ViewType;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className="flex flex-col items-center gap-1 h-auto py-2 px-2 touch-target min-w-0 flex-1"
                onClick={() => setCurrentView(viewType)}
                onMouseEnter={() => prefetchView(viewType)}
                onFocus={() => prefetchView(viewType)}
                onTouchStart={() => prefetchView(viewType)}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs leading-tight">{item.label}</span>
              </Button>
            );
          })}
          </div>
        </div>
      </div>

      {/* Floating Today button - appears when nav is hidden and not on today view */}
      {showTodayButton && (
        <Button
          ref={todayButtonRef}
          onClick={() => {
            setCurrentView('today');
            prefetchView('today');
          }}
          className="fixed bottom-4 right-4 z-50 lg:hidden h-12 w-12 rounded-full p-0 touch-target transition-all duration-300 ease-out safe-area-right safe-area-bottom opacity-100 scale-100 pointer-events-auto"
          style={{
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            minWidth: '3rem',
            minHeight: '3rem',
          }}
          title="Today"
        >
          <Calendar className="h-5 w-5 dark:text-white" />
        </Button>
      )}
    </>
  );
}
