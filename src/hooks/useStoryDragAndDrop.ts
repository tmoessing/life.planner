import { useState, useCallback } from 'react';
// import type { Story } from '@/types';

export interface DragState {
  draggedStoryId: string | null;
  dragOverTargetId: string | null;
  dragOverTargetType: 'sprint' | 'board' | 'column' | null;
}

export function useStoryDragAndDrop() {
  const [dragState, setDragState] = useState<DragState>({
    draggedStoryId: null,
    dragOverTargetId: null,
    dragOverTargetType: null
  });

  const startDrag = useCallback((storyId: string) => {
    setDragState(prev => ({
      ...prev,
      draggedStoryId: storyId
    }));
  }, []);

  const handleDragOver = useCallback((
    targetId: string,
    targetType: 'sprint' | 'board' | 'column'
  ) => {
    setDragState(prev => ({
      ...prev,
      dragOverTargetId: targetId,
      dragOverTargetType: targetType
    }));
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragState(prev => ({
      ...prev,
      dragOverTargetId: null,
      dragOverTargetType: null
    }));
  }, []);

  const endDrag = useCallback(() => {
    setDragState({
      draggedStoryId: null,
      dragOverTargetId: null,
      dragOverTargetType: null
    });
  }, []);

  const isDragging = useCallback((storyId: string) => {
    return dragState.draggedStoryId === storyId;
  }, [dragState.draggedStoryId]);

  const isDragOver = useCallback((targetId: string, targetType: 'sprint' | 'board' | 'column') => {
    return dragState.dragOverTargetId === targetId &&
      dragState.dragOverTargetType === targetType;
  }, [dragState.dragOverTargetId, dragState.dragOverTargetType]);

  const getDragOverClasses = useCallback((targetId: string, targetType: 'sprint' | 'board' | 'column') => {
    if (isDragOver(targetId, targetType)) {
      return 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
    return '';
  }, [isDragOver]);

  return {
    dragState,
    startDrag,
    handleDragOver,
    handleDragLeave,
    endDrag,
    isDragging,
    isDragOver,
    getDragOverClasses
  };
}
