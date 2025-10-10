import { useState, useEffect } from 'react';

interface LoadingScreenProps {
  isLoading: boolean;
  onComplete?: () => void;
}

export function LoadingScreen({ isLoading, onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [loadingText, setLoadingText] = useState('Initializing...');

  useEffect(() => {
    if (!isLoading) return;

    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.min(prev + Math.random() * 15, 100);
        
        // Update loading text based on progress
        if (newProgress < 30) {
          setLoadingText('Initializing...');
        } else if (newProgress < 60) {
          setLoadingText('Loading components...');
        } else if (newProgress < 90) {
          setLoadingText('Preparing interface...');
        } else if (newProgress < 100) {
          setLoadingText('Almost ready...');
        } else {
          setLoadingText('Welcome!');
        }

        if (newProgress >= 100) {
          clearInterval(interval);
          // Delay before hiding to show completion
          setTimeout(() => {
            setIsVisible(false);
            onComplete?.();
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isLoading, onComplete]);

  // Add keyboard shortcut to force load
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Press 'Escape' or 'Enter' to force load
      if (e.key === 'Escape' || e.key === 'Enter') {
        console.log('Force loading app...');
        setIsVisible(false);
        onComplete?.();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center animate-fade-in">
      <div className="text-center">
        {/* Logo Animation */}
        <div className="mb-8 animate-logo-enter">
          <div className="relative">
            {/* Main Logo Circle */}
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-2xl">
              <img 
                src="/lsb.png" 
                alt="Life Planner Logo" 
                className="w-16 h-16 animate-logo-pulse"
                onError={(e) => {
                  // Fallback to text if image fails to load
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                  const nextElement = target.nextElementSibling as HTMLElement;
                  if (nextElement) {
                    nextElement.style.display = 'block';
                  }
                }}
              />
              <div className="text-white text-2xl font-bold animate-logo-pulse hidden">
                LP
              </div>
            </div>
            
            {/* Orbiting Elements */}
            <div className="absolute inset-0 animate-orbit">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-3 h-3 bg-blue-400 rounded-full"></div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2 w-2 h-2 bg-blue-300 rounded-full"></div>
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 w-2 h-2 bg-blue-300 rounded-full"></div>
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2 w-2 h-2 bg-blue-300 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* App Title */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2 animate-title-enter">
          Life Planner
        </h1>
        
        <p className="text-gray-600 mb-8 animate-subtitle-enter">
          Organizing your life, one goal at a time
        </p>

        {/* Progress Bar */}
        <div className="w-64 mx-auto mb-4 animate-progress-enter">
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-sm text-gray-500 animate-text-enter">
          {loadingText}
        </div>

        {/* Force load hint */}
        <div className="text-xs text-gray-400 mt-4 animate-text-enter">
          Press Escape or Enter to force load
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-300 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
