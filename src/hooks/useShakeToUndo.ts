import { useEffect, useRef } from 'react';

interface UseShakeToUndoProps {
  onUndo: () => void;
  enabled?: boolean;
  threshold?: number; // Acceleration threshold for shake detection
  debounceTime?: number; // Time in ms to debounce shake events
}

/**
 * Hook for detecting device shake on mobile devices to trigger undo
 */
export function useShakeToUndo({
  onUndo,
  enabled = true,
  threshold = 15, // Default threshold for shake detection
  debounceTime = 1000 // Default 1 second debounce
}: UseShakeToUndoProps) {
  const lastShakeTime = useRef<number>(0);
  const isProcessing = useRef<boolean>(false);
  const onUndoRef = useRef(onUndo);
  
  // Keep the ref updated with the latest onUndo callback
  useEffect(() => {
    onUndoRef.current = onUndo;
  }, [onUndo]);

  useEffect(() => {
    // Only enable on mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    if (!enabled || !isMobile) {
      return;
    }

    // Check if DeviceMotionEvent is available
    if (typeof DeviceMotionEvent === 'undefined') {
      return;
    }

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      if (!event.accelerationIncludingGravity) return;

      const { x, y, z } = event.accelerationIncludingGravity;
      
      // Calculate total acceleration
      const acceleration = Math.sqrt(
        (x || 0) ** 2 + (y || 0) ** 2 + (z || 0) ** 2
      );

      // Check if acceleration exceeds threshold (indicating a shake)
      if (acceleration > threshold) {
        const now = Date.now();
        
          // Debounce: only trigger if enough time has passed since last shake
          if (now - lastShakeTime.current > debounceTime && !isProcessing.current) {
            isProcessing.current = true;
            lastShakeTime.current = now;
            
            // Trigger undo using the ref to get the latest callback
            onUndoRef.current();
            
            // Reset processing flag after a short delay
            setTimeout(() => {
              isProcessing.current = false;
            }, debounceTime);
          }
      }
    };

    // Request permission for iOS 13+ (if required)
    if (typeof DeviceMotionEvent !== 'undefined' && typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      (DeviceMotionEvent as any).requestPermission()
        .then((permission: string) => {
          if (permission === 'granted') {
            window.addEventListener('devicemotion', handleDeviceMotion);
          }
        })
        .catch(() => {
          // Permission denied or not available, silently fail
        });
    } else {
      // For devices that don't require permission
      window.addEventListener('devicemotion', handleDeviceMotion);
    }

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
    };
  }, [enabled, threshold, debounceTime]);
}

