import { useEffect } from 'react';
import type { Story } from '@/types';
import { openStoryInGoogleCalendar } from '@/utils/googleCalendar';

interface UseStoryKeyboardShortcutsProps {
  story: Story;
  isSelected: boolean;
  cardRef: React.RefObject<HTMLDivElement | null>;
  onEdit?: (story: Story) => void;
  onDelete?: (storyId: string) => void;
  onAddToCalendar?: () => void;
}

/**
 * Hook for handling keyboard shortcuts on story cards
 */
export function useStoryKeyboardShortcuts({
  story,
  isSelected,
  cardRef,
  onEdit,
  onDelete,
  onAddToCalendar
}: UseStoryKeyboardShortcutsProps) {
  /**
   * Check if the event target is an input element
   */
  const isInputElement = (target: EventTarget | null): boolean => {
    return (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      target instanceof HTMLButtonElement
    );
  };

  /**
   * Handle keyboard events on the card itself
   */
  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    if (isInputElement(event.target)) {
      return;
    }

    // Only handle shortcuts when card is focused or selected
    const isFocused = document.activeElement === cardRef.current ||
      (cardRef.current && cardRef.current.contains(document.activeElement));

    if (!isSelected && !isFocused) {
      return;
    }

    switch (event.key.toLowerCase()) {
      case 'c':
        if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
          event.preventDefault();
          event.stopPropagation();
          if (onAddToCalendar) {
            onAddToCalendar();
          } else {
            openStoryInGoogleCalendar(story);
          }
        }
        break;
      case 'e':
        if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
          event.preventDefault();
          event.stopPropagation();
          if (onEdit) {
            onEdit(story);
          }
        }
        break;
      case 'delete':
      case 'backspace':
        if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
          event.preventDefault();
          event.stopPropagation();
          if (onDelete) {
            onDelete(story.id);
          }
        }
        break;
    }
  };

  /**
   * Global keyboard shortcuts when story is selected
   */
  useEffect(() => {
    if (!isSelected) return;

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (isInputElement(event.target)) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case 'c':
          if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
            event.preventDefault();
            if (onAddToCalendar) {
              onAddToCalendar();
            } else {
              openStoryInGoogleCalendar(story);
            }
          }
          break;
        case 'e':
          if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
            event.preventDefault();
            if (onEdit) {
              onEdit(story);
            }
          }
          break;
        case 'delete':
        case 'backspace':
          if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
            event.preventDefault();
            if (onDelete) {
              onDelete(story.id);
            }
          }
          break;
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [isSelected, story, onEdit, onDelete, onAddToCalendar]);

  return { handleKeyDown };
}

