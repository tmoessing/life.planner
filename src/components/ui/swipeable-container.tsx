import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';

interface SwipeableContainerProps {
  children: React.ReactNode;
  className?: string;
  showNavigation?: boolean;
}

export function SwipeableContainer({ 
  children, 
  className = '', 
  showNavigation = true 
}: SwipeableContainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const childrenArray = React.Children.toArray(children);
  const totalSlides = childrenArray.length;
  
  // Use refs to store latest values for event handlers
  const isDraggingRef = useRef(isDragging);
  const startXRef = useRef(startX);
  const currentIndexRef = useRef(currentIndex);
  const translateXRef = useRef(translateX);
  
  // Keep refs in sync with state
  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);
  
  useEffect(() => {
    startXRef.current = startX;
  }, [startX]);
  
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);
  
  useEffect(() => {
    translateXRef.current = translateX;
  }, [translateX]);

  const goToSlide = (index: number) => {
    if (index >= 0 && index < totalSlides) {
      setCurrentIndex(index);
      setTranslateX(-index * 100);
    }
  };

  const nextSlide = () => {
    if (currentIndex < totalSlides - 1) {
      goToSlide(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      goToSlide(currentIndex - 1);
    }
  };

  const handleTouchStart = (e: TouchEvent) => {
    setIsDragging(true);
    isDraggingRef.current = true;
    const x = e.touches[0].clientX;
    setStartX(x);
    startXRef.current = x;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDraggingRef.current) return;
    
    e.preventDefault();
    const currentX = e.touches[0].clientX;
    const diff = startXRef.current - currentX;
    const currentTranslate = -currentIndexRef.current * 100;
    const newTranslate = currentTranslate + (diff / (containerRef.current?.offsetWidth || 1)) * 100;
    
    // Constrain the translation
    const minTranslate = -(totalSlides - 1) * 100;
    const maxTranslate = 0;
    const constrainedTranslate = Math.max(minTranslate, Math.min(maxTranslate, newTranslate));
    setTranslateX(constrainedTranslate);
    translateXRef.current = constrainedTranslate;
  };

  const handleTouchEnd = () => {
    if (!isDraggingRef.current) return;
    
    setIsDragging(false);
    isDraggingRef.current = false;
    const threshold = 50; // Minimum swipe distance
    const currentX = translateXRef.current;
    const currentIdx = currentIndexRef.current;
    
    if (Math.abs(currentX - (-currentIdx * 100)) > threshold) {
      if (currentX < -currentIdx * 100) {
        // Swiped left, go to next slide
        if (currentIdx < totalSlides - 1) {
          goToSlide(currentIdx + 1);
        }
      } else {
        // Swiped right, go to previous slide
        if (currentIdx > 0) {
          goToSlide(currentIdx - 1);
        }
      }
    } else {
      // Snap back to current slide
      setTranslateX(-currentIdx * 100);
      translateXRef.current = -currentIdx * 100;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const currentX = e.clientX;
    const diff = startX - currentX;
    const currentTranslate = -currentIndex * 100;
    const newTranslate = currentTranslate + (diff / (containerRef.current?.offsetWidth || 1)) * 100;
    
    // Constrain the translation
    const minTranslate = -(totalSlides - 1) * 100;
    const maxTranslate = 0;
    setTranslateX(Math.max(minTranslate, Math.min(maxTranslate, newTranslate)));
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    const threshold = 50; // Minimum swipe distance
    const currentX = translateX;
    
    if (Math.abs(currentX - (-currentIndex * 100)) > threshold) {
      if (currentX < -currentIndex * 100) {
        // Swiped left, go to next slide
        nextSlide();
      } else {
        // Swiped right, go to previous slide
        prevSlide();
      }
    } else {
      // Snap back to current slide
      setTranslateX(-currentIndex * 100);
    }
  };

  // Reset translateX when currentIndex changes
  useEffect(() => {
    setTranslateX(-currentIndex * 100);
  }, [currentIndex]);

  // Add native touch event listeners with passive: false to allow preventDefault
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalSlides]); // Only depend on totalSlides which shouldn't change

  return (
    <div className={`relative ${className}`}>
      {/* Navigation Buttons */}
      {showNavigation && totalSlides > 1 && (
        <>
          <Button
            variant="outline"
            size="sm"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/90 backdrop-blur-sm border-2 shadow-lg touch-target"
            onClick={prevSlide}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/90 backdrop-blur-sm border-2 shadow-lg touch-target"
            onClick={nextSlide}
            disabled={currentIndex === totalSlides - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Swipeable Container */}
      <div
        ref={containerRef}
        className="overflow-hidden h-full touch-pan-y"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(${translateX}%)`,
            width: `${totalSlides * 100}%`
          }}
        >
          {childrenArray.map((child, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-full"
              style={{ width: `${100 / totalSlides}%` }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Slide Indicators */}
      {totalSlides > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-colors touch-target ${
                index === currentIndex 
                  ? 'bg-primary' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
