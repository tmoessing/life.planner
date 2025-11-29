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
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-gradient-shift"></div>
      
      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        animation: 'grid-move 20s linear infinite'
      }}></div>

      {/* Floating Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl animate-float-orb"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-float-orb-delayed"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-float-orb-slow"></div>
      </div>

      {/* Particle System */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white dark:bg-gray-300 rounded-full animate-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              opacity: Math.random() * 0.5 + 0.2,
            }}
          />
        ))}
      </div>

      <div className="text-center relative z-10">
        {/* Main Logo with Glow Effect */}
        <div className="mb-8 relative">
          <div className="relative inline-block">
            {/* Outer Glow Ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 blur-2xl opacity-60 animate-pulse-glow"></div>
            
            {/* Middle Ring */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-spin-slow" style={{
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'exclude',
              WebkitMaskComposite: 'xor',
              padding: '4px'
            }}></div>
            
            {/* Main Logo Circle */}
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-2xl transform transition-all duration-300 hover:scale-110">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 opacity-50 blur-xl animate-pulse-glow"></div>
              <img 
                src="/lsb.png" 
                alt="Life Planner Logo" 
                className="w-20 h-20 relative z-10 animate-logo-bounce"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                  const nextElement = target.nextElementSibling as HTMLElement;
                  if (nextElement) {
                    nextElement.style.display = 'flex';
                  }
                }}
              />
              {/* Animated Logo Fallback */}
              <div className="text-white relative z-10 animate-logo-bounce hidden items-center justify-center w-full h-full">
                <svg 
                  width="80" 
                  height="80" 
                  viewBox="0 0 100 100" 
                  className="animate-logo-svg"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Animated Circle Background */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    stroke="url(#gradient1)" 
                    strokeWidth="3" 
                    fill="none"
                    className="animate-circle-draw"
                  />
                  
                  {/* Calendar/Planner Icon */}
                  <rect 
                    x="25" 
                    y="30" 
                    width="50" 
                    height="45" 
                    rx="4" 
                    fill="url(#gradient2)"
                    className="animate-icon-fade"
                  />
                  
                  {/* Calendar Spiral Binding */}
                  <circle 
                    cx="50" 
                    cy="30" 
                    r="3" 
                    fill="white"
                    className="animate-icon-fade"
                  />
                  <circle 
                    cx="50" 
                    cy="35" 
                    r="2" 
                    fill="white"
                    className="animate-icon-fade"
                    style={{ animationDelay: '0.1s' }}
                  />
                  
                  {/* Calendar Lines (days) */}
                  <line 
                    x1="35" 
                    y1="45" 
                    x2="65" 
                    y2="45" 
                    stroke="white" 
                    strokeWidth="2" 
                    strokeLinecap="round"
                    className="animate-line-draw"
                    style={{ animationDelay: '0.2s' }}
                  />
                  <line 
                    x1="35" 
                    y1="55" 
                    x2="65" 
                    y2="55" 
                    stroke="white" 
                    strokeWidth="2" 
                    strokeLinecap="round"
                    className="animate-line-draw"
                    style={{ animationDelay: '0.3s' }}
                  />
                  <line 
                    x1="35" 
                    y1="65" 
                    x2="55" 
                    y2="65" 
                    stroke="white" 
                    strokeWidth="2" 
                    strokeLinecap="round"
                    className="animate-line-draw"
                    style={{ animationDelay: '0.4s' }}
                  />
                  
                  {/* Sparkle/Star Effects */}
                  <g className="animate-sparkle">
                    <path 
                      d="M50 20 L52 26 L58 26 L53 30 L55 36 L50 32 L45 36 L47 30 L42 26 L48 26 Z" 
                      fill="white"
                      opacity="0.8"
                    />
                    <path 
                      d="M70 40 L71 43 L74 43 L72 45 L73 48 L70 46 L67 48 L68 45 L66 43 L69 43 Z" 
                      fill="white"
                      opacity="0.6"
                      style={{ animationDelay: '0.5s' }}
                    />
                    <path 
                      d="M30 50 L31 53 L34 53 L32 55 L33 58 L30 56 L27 58 L28 55 L26 53 L29 53 Z" 
                      fill="white"
                      opacity="0.6"
                      style={{ animationDelay: '0.7s' }}
                    />
                  </g>
                  
                  {/* Gradient Definitions */}
                  <defs>
                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#60A5FA" stopOpacity="1">
                        <animate attributeName="stop-opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
                      </stop>
                      <stop offset="50%" stopColor="#A78BFA" stopOpacity="1">
                        <animate attributeName="stop-opacity" values="0.5;1;0.5" dur="2s" begin="0.5s" repeatCount="indefinite" />
                      </stop>
                      <stop offset="100%" stopColor="#EC4899" stopOpacity="1">
                        <animate attributeName="stop-opacity" values="0.5;1;0.5" dur="2s" begin="1s" repeatCount="indefinite" />
                      </stop>
                    </linearGradient>
                    <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="50%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#EC4899" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Orbiting Elements */}
            <div className="absolute inset-0 animate-orbit">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-gradient-to-r from-blue-400 to-purple-400"
                  style={{
                    width: `${8 + i * 2}px`,
                    height: `${8 + i * 2}px`,
                    left: '50%',
                    top: '50%',
                    transform: `rotate(${i * 60}deg) translateY(-80px)`,
                    transformOrigin: '0 80px',
                    boxShadow: '0 0 10px rgba(147, 51, 234, 0.5)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* App Title with Gradient Text */}
        <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-title-glow">
          Life Planner
        </h1>
        
        <p className="text-gray-300 mb-12 text-lg animate-fade-in-delayed">
          Organizing your life, one goal at a time
        </p>

        {/* Modern Progress Bar */}
        <div className="w-80 mx-auto mb-6">
          <div className="relative h-3 bg-gray-800/50 dark:bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-sm border border-gray-700/50 dark:border-gray-600/50">
            {/* Animated Shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            
            {/* Progress Fill */}
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              {/* Inner Glow */}
              <div className="absolute inset-0 bg-white/30 blur-sm"></div>
              
              {/* Progress Shine */}
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-white/40 animate-progress-shine"></div>
            </div>
          </div>
          
          {/* Progress Percentage */}
          <div className="text-center mt-2 text-sm text-gray-400 font-mono">
            {Math.round(progress)}%
          </div>
        </div>

        {/* Loading Text with Typing Effect */}
        <div className="text-base text-gray-300 mb-4 font-medium animate-fade-in-delayed">
          <span className="inline-block animate-bounce-dot">●</span>
          <span className="ml-2">{loadingText}</span>
        </div>

        {/* Force load hint */}
        <div className="text-xs text-gray-500 mt-6 animate-fade-in-delayed">
          Press Escape or Enter to skip
        </div>
      </div>

      <style>{`
        @keyframes gradient-shift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        
        @keyframes float-orb {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(50px, -50px) scale(1.2); }
        }
        
        @keyframes float-orb-delayed {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-50px, 50px) scale(1.1); }
        }
        
        @keyframes float-orb-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, 30px) scale(1.15); }
        }
        
        @keyframes particle {
          0% { transform: translate(0, 0) scale(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translate(var(--tx, 100px), var(--ty, 100px)) scale(1); opacity: 0; }
        }
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes logo-bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.05); }
        }
        
        @keyframes orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes title-glow {
          0%, 100% { filter: drop-shadow(0 0 10px rgba(147, 51, 234, 0.5)); }
          50% { filter: drop-shadow(0 0 20px rgba(147, 51, 234, 0.8)); }
        }
        
        @keyframes fade-in-delayed {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes progress-shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        
        @keyframes bounce-dot {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(-5px); opacity: 0.7; }
        }
        
        @keyframes circle-draw {
          0% { stroke-dasharray: 0, 283; }
          100% { stroke-dasharray: 283, 283; }
        }
        
        @keyframes icon-fade {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
        
        @keyframes line-draw {
          0% { stroke-dasharray: 0, 30; opacity: 0; }
          50% { opacity: 1; }
          100% { stroke-dasharray: 30, 30; opacity: 1; }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0.6; transform: scale(1) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.2) rotate(180deg); }
        }
        
        @keyframes logo-svg {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.05) rotate(5deg); }
        }
        
        .animate-gradient-shift {
          animation: gradient-shift 15s ease-in-out infinite;
        }
        
        .animate-float-orb {
          animation: float-orb 8s ease-in-out infinite;
        }
        
        .animate-float-orb-delayed {
          animation: float-orb-delayed 10s ease-in-out infinite 2s;
        }
        
        .animate-float-orb-slow {
          animation: float-orb-slow 12s ease-in-out infinite 1s;
        }
        
        .animate-particle {
          animation: particle var(--duration, 3s) ease-in-out infinite;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        .animate-logo-bounce {
          animation: logo-bounce 2s ease-in-out infinite;
        }
        
        .animate-orbit {
          animation: orbit 10s linear infinite;
        }
        
        .animate-title-glow {
          animation: title-glow 3s ease-in-out infinite;
        }
        
        .animate-fade-in-delayed {
          animation: fade-in-delayed 1s ease-out forwards;
          animation-delay: 0.5s;
          opacity: 0;
        }
        
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
        
        .animate-progress-shine {
          animation: progress-shine 2s ease-in-out infinite;
        }
        
        .animate-bounce-dot {
          animation: bounce-dot 1s ease-in-out infinite;
        }
        
        .animate-circle-draw {
          animation: circle-draw 2s ease-out forwards;
        }
        
        .animate-icon-fade {
          animation: icon-fade 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .animate-line-draw {
          animation: line-draw 0.6s ease-out forwards;
          stroke-dasharray: 0, 30;
        }
        
        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }
        
        .animate-logo-svg {
          animation: logo-svg 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
