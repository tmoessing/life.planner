import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { settingsAtom } from '@/stores/settingsStore';

/**
 * Hook to apply theme based on settings
 * Applies the 'dark' class to the document element based on the theme setting
 */
export function useTheme() {
  const [settings] = useAtom(settingsAtom);
  const theme = settings.ui?.theme || 'system';

  useEffect(() => {
    const root = document.documentElement;
    
    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    if (theme === 'system') {
      // Listen to system preference
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      // Apply initial theme
      applyTheme(mediaQuery.matches);
      
      // Listen for changes
      const handleChange = (e: MediaQueryListEvent) => {
        applyTheme(e.matches);
      };
      
      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      } 
      // Fallback for older browsers
      else if (mediaQuery.addListener) {
        const legacyHandler = (e: MediaQueryListEvent) => handleChange(e);
        mediaQuery.addListener(legacyHandler);
        return () => mediaQuery.removeListener(legacyHandler);
      }
    } else {
      // Apply explicit theme
      applyTheme(theme === 'dark');
    }
  }, [theme]);
}

