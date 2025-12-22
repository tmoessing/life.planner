import { useState, useCallback } from 'react';

interface UseStorySwipeProps {
  kanbanMode: boolean;
  currentColumnId?: string;
  allColumnIds?: string[];
  onMoveToColumn?: (storyId: string, targetColumnId: string) => void;
  onDelete?: (storyId: string) => void;
  enableSwipeToDelete?: boolean;
}

interface TouchStart {
  x: number;
  y: number;
  time: number;
}

/**
 * Hook for handling swipe gestures on story cards in kanban mode
 * Supports swipe left to delete and swipe right/left to move between columns
 */
export function useStorySwipe({
  kanbanMode,
  currentColumnId,
  allColumnIds = [],
  onMoveToColumn,
  onDelete,
  enableSwipeToDelete = true
}: UseStorySwipeProps) {
  const [touchStart, setTouchStart] = useState<TouchStart | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    });
    setSwipeDirection(null);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return;
    
    // Only handle swipes in kanban mode
    if (!kanbanMode) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    
    // Only consider horizontal swipes (more horizontal than vertical)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      if (deltaX > 0) {
        setSwipeDirection('right');
      } else {
        setSwipeDirection('left');
      }
    }
  }, [touchStart, kanbanMode]);

  const handleTouchEnd = useCallback((e: React.TouchEvent, storyId: string) => {
    if (!touchStart) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const deltaTime = Date.now() - touchStart.time;
    
    // Swipe threshold: at least 50px horizontal movement, less than 300ms, and more horizontal than vertical
    const minSwipeDistance = 50;
    const maxSwipeTime = 300;
    
    if (
      Math.abs(deltaX) > minSwipeDistance &&
      Math.abs(deltaX) > Math.abs(deltaY) &&
      deltaTime < maxSwipeTime
    ) {
      // Swipe left to delete (if enabled)
      if (deltaX < 0 && enableSwipeToDelete && onDelete) {
        e.preventDefault();
        e.stopPropagation();
        onDelete(storyId);
        setTouchStart(null);
        setSwipeDirection(null);
        return;
      }
      
      // Kanban mode: swipe to move between columns
      if (kanbanMode && currentColumnId && allColumnIds.length && onMoveToColumn) {
        const currentIndex = allColumnIds.indexOf(currentColumnId);
        
        if (deltaX > 0 && currentIndex > 0) {
          // Swipe right - Move to previous column (left in the board)
          e.preventDefault();
          e.stopPropagation();
          const targetColumnId = allColumnIds[currentIndex - 1];
          onMoveToColumn(storyId, targetColumnId);
        } else if (deltaX < 0 && currentIndex < allColumnIds.length - 1 && !enableSwipeToDelete) {
          // Swipe left - Move to next column (only if swipe-to-delete is disabled)
          e.preventDefault();
          e.stopPropagation();
          const targetColumnId = allColumnIds[currentIndex + 1];
          onMoveToColumn(storyId, targetColumnId);
        }
      }
    }
    
    setTouchStart(null);
    setSwipeDirection(null);
  }, [touchStart, kanbanMode, currentColumnId, allColumnIds, onMoveToColumn, onDelete, enableSwipeToDelete]);

  return {
    swipeDirection,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
}

