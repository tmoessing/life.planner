import React, { useState, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Snowflake, Layers, Circle, PlayCircle, Eye, CheckCircle2 } from 'lucide-react';
import type { Story } from '@/types';

// Status order for cycling
const STATUS_ORDER: Story['status'][] = ['icebox', 'backlog', 'todo', 'progress', 'review', 'done'];

// Helper function to get status icon
const getStatusIcon = (status: string, size: 'sm' | 'md' = 'sm') => {
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  switch (status) {
    case 'icebox':
      return <Snowflake className={iconSize} />;
    case 'backlog':
      return <Layers className={iconSize} />;
    case 'todo':
      return <Circle className={iconSize} />;
    case 'progress':
    case 'in-progress':
      return <PlayCircle className={iconSize} />;
    case 'review':
      return <Eye className={iconSize} />;
    case 'done':
      return <CheckCircle2 className={iconSize} />;
    default:
      return null;
  }
};

interface StatusSelectorProps {
  status: Story['status'];
  getStatusColor: (status: string) => string;
  onStatusChange: (newStatus: Story['status']) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusSelector({
  status,
  getStatusColor,
  onStatusChange,
  size = 'sm',
  className = ''
}: StatusSelectorProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [hoveredStatus, setHoveredStatus] = useState<Story['status'] | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatingToStatus, setAnimatingToStatus] = useState<Story['status'] | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartTime = useRef<number | null>(null);

  // Get next status in cycle
  const getNextStatus = (currentStatus: Story['status']): Story['status'] => {
    const currentIndex = STATUS_ORDER.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % STATUS_ORDER.length;
    return STATUS_ORDER[nextIndex];
  };

  // Handle click - toggle to next status with animation
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLongPressing) {
      const nextStatus = getNextStatus(status);
      // Use the same animation logic as handleStatusSelect
      handleStatusSelect(nextStatus);
    }
    setIsLongPressing(false);
  };

  // Handle touch start - detect long press
  const handleTouchStart = () => {
    touchStartTime.current = Date.now();
    longPressTimer.current = setTimeout(() => {
      setIsLongPressing(true);
      setIsPopoverOpen(true);
    }, 500); // 500ms for long press
  };

  // Handle touch end - cancel long press if it was a quick tap
  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (touchStartTime.current) {
      const pressDuration = Date.now() - touchStartTime.current;
      if (pressDuration < 500 && !isLongPressing) {
        // Quick tap - toggle status with animation
        const nextStatus = getNextStatus(status);
        handleStatusSelect(nextStatus);
      }
      touchStartTime.current = null;
    }

    if (!isPopoverOpen) {
      setIsLongPressing(false);
    }
  };

  // Handle mouse down - detect long press on desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left mouse button
    longPressTimer.current = setTimeout(() => {
      setIsLongPressing(true);
      setIsPopoverOpen(true);
    }, 500);
  };

  // Handle mouse up - cancel long press or handle click
  const handleMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (!isLongPressing && !isPopoverOpen) {
      // Quick click - toggle status with animation
      const nextStatus = getNextStatus(status);
      handleStatusSelect(nextStatus);
    }
  };

  // Handle mouse leave - cancel long press
  const handleMouseLeave = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (!isPopoverOpen) {
      setIsLongPressing(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  // Handle status selection from popover with animation
  const handleStatusSelect = (newStatus: Story['status']) => {
    if (newStatus === status) {
      setIsPopoverOpen(false);
      setIsLongPressing(false);
      return;
    }

    // Start animation
    setIsAnimating(true);
    setAnimatingToStatus(newStatus);
    setIsPopoverOpen(false);
    setIsLongPressing(false);

    // Find the story card element to animate it
    const storyCard = containerRef.current?.closest('[data-story-id]') ||
      containerRef.current?.closest('.glass-card');

    if (storyCard instanceof HTMLElement) {
      // Add animation class to story card
      storyCard.classList.add('story-moving');
      storyCard.setAttribute('data-moving-to', newStatus);

      // Add a subtle glow effect with the target status color
      const targetColor = getStatusColor(newStatus);
      storyCard.style.boxShadow = `0 0 20px ${targetColor}40, 0 0 40px ${targetColor}20`;
    }

    // Animate badge transition with smooth color change
    requestAnimationFrame(() => {
      // Change status after animation starts
      onStatusChange(newStatus);

      // Scroll to target column if in kanban view
      setTimeout(() => {
        const targetColumn = document.querySelector(`[data-column-id="${newStatus}"]`);
        if (targetColumn) {
          // Highlight the target column with animation
          targetColumn.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2', 'transition-all', 'duration-300', 'z-10');

          // Scroll to target column smoothly
          targetColumn.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          });

          // Remove highlight after animation
          setTimeout(() => {
            targetColumn.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2', 'z-10');
          }, 1500);
        }
      }, 150);

      // Remove story card animation class and end badge animation
      setTimeout(() => {
        if (storyCard instanceof HTMLElement) {
          storyCard.classList.remove('story-moving');
          storyCard.removeAttribute('data-moving-to');
          storyCard.style.boxShadow = '';
        }
        setIsAnimating(false);
        setAnimatingToStatus(null);
      }, 600);
    });
  };

  // Handle drag over status in popover
  const handleDragOver = (e: React.DragEvent, targetStatus: Story['status']) => {
    e.preventDefault();
    setHoveredStatus(targetStatus);
  };

  // Handle drop on status
  const handleDrop = (e: React.DragEvent, targetStatus: Story['status']) => {
    e.preventDefault();
    handleStatusSelect(targetStatus);
    setHoveredStatus(null);
  };

  const badgeSize = size === 'sm' ? 'text-[9px] px-1 py-0 h-4' : 'text-[10px] px-1 py-0 h-5';
  const badgeRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    if (!isPopoverOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsPopoverOpen(false);
        setIsLongPressing(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isPopoverOpen]);

  // Position popover centered above the badge
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isPopoverOpen && badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect();
      // Calculate popover width: 6 icons * 32px (w-8) + 5 gaps * 6px (gap-1.5) + 16px padding
      const popoverWidth = (STATUS_ORDER.length * 32) + ((STATUS_ORDER.length - 1) * 6) + 16;
      // Center the popover above the badge icon
      setPopoverPosition({
        top: rect.top,
        left: rect.left + (rect.width / 2) - (popoverWidth / 2)
      });
    }
  }, [isPopoverOpen]);

  return (
    <div ref={containerRef} className="relative inline-block">
      <div ref={badgeRef}>
        <Badge
          style={{
            backgroundColor: isAnimating && animatingToStatus
              ? getStatusColor(animatingToStatus)
              : getStatusColor(status),
            color: 'white',
            cursor: 'pointer',
            userSelect: 'none',
            touchAction: 'manipulation',
            transition: 'background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          className={`${badgeSize} flex items-center gap-0.5 transition-all hover:opacity-80 active:scale-95 ${isAnimating ? 'scale-110 shadow-lg' : ''
            } ${className}`}
          onClick={handleClick}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          title="Click to cycle status, hold for menu"
        >
          {isAnimating && animatingToStatus
            ? getStatusIcon(animatingToStatus, 'sm')
            : getStatusIcon(status, 'sm') || status.substring(0, 4)}
        </Badge>
      </div>

      {isPopoverOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setIsPopoverOpen(false);
              setIsLongPressing(false);
            }}
          />
          {/* Popover - Oval shape with icons only */}
          <div
            ref={popoverRef}
            className="fixed z-50 bg-background/95 backdrop-blur-sm border rounded-full shadow-xl p-2"
            style={{
              top: `${popoverPosition.top - 50}px`,
              left: `${popoverPosition.left}px`,
              transform: 'translateY(-100%)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-1.5">
              {STATUS_ORDER.map((statusOption) => {
                const isSelected = statusOption === status;
                const isHovered = statusOption === hoveredStatus;
                const statusColor = getStatusColor(statusOption);

                return (
                  <button
                    key={statusOption}
                    type="button"
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center
                      transition-all touch-target
                      ${isSelected
                        ? 'ring-2 ring-offset-2 scale-110'
                        : isHovered
                          ? 'scale-105 opacity-90'
                          : 'hover:scale-105 active:scale-95'
                      }
                    `}
                    style={{
                      backgroundColor: isSelected ? statusColor : `${statusColor}40`,
                      color: 'white',
                      borderColor: isSelected ? statusColor : 'transparent',
                      '--tw-ring-color': statusColor
                    } as React.CSSProperties}
                    onClick={() => handleStatusSelect(statusOption)}
                    onDragOver={(e) => handleDragOver(e, statusOption)}
                    onDrop={(e) => handleDrop(e, statusOption)}
                    onMouseEnter={() => setHoveredStatus(statusOption)}
                    onMouseLeave={() => setHoveredStatus(null)}
                    title={statusOption.replace('-', ' ')}
                  >
                    {getStatusIcon(statusOption, 'md')}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

