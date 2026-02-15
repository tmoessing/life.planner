/**
 * Accessibility utilities for improved user experience
 */

// ARIA attributes helpers
export const getAriaLabel = (label: string, description?: string): string => {
  return description ? `${label}, ${description}` : label;
};

export const getAriaDescribedBy = (id: string): string => {
  return `${id}-description`;
};

// Focus management
export const focusElement = (element: HTMLElement | null): void => {
  if (element) {
    element.focus();
  }
};

export const focusFirstElement = (container: HTMLElement): void => {
  const focusableElements = getFocusableElements(container);
  if (focusableElements.length > 0) {
    focusElement(focusableElements[0]);
  }
};

export const focusLastElement = (container: HTMLElement): void => {
  const focusableElements = getFocusableElements(container);
  if (focusableElements.length > 0) {
    focusElement(focusableElements[focusableElements.length - 1]);
  }
};

export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ');

  return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
};

// Keyboard navigation
export const handleKeyboardNavigation = (
  event: KeyboardEvent,
  options: {
    onEnter?: () => void;
    onEscape?: () => void;
    onArrowUp?: () => void;
    onArrowDown?: () => void;
    onArrowLeft?: () => void;
    onArrowRight?: () => void;
    onHome?: () => void;
    onEnd?: () => void;
    onTab?: () => void;
    onShiftTab?: () => void;
  }
): void => {
  switch (event.key) {
    case 'Enter':
      event.preventDefault();
      options.onEnter?.();
      break;
    case 'Escape':
      event.preventDefault();
      options.onEscape?.();
      break;
    case 'ArrowUp':
      event.preventDefault();
      options.onArrowUp?.();
      break;
    case 'ArrowDown':
      event.preventDefault();
      options.onArrowDown?.();
      break;
    case 'ArrowLeft':
      event.preventDefault();
      options.onArrowLeft?.();
      break;
    case 'ArrowRight':
      event.preventDefault();
      options.onArrowRight?.();
      break;
    case 'Home':
      event.preventDefault();
      options.onHome?.();
      break;
    case 'End':
      event.preventDefault();
      options.onEnd?.();
      break;
    case 'Tab':
      if (event.shiftKey) {
        options.onShiftTab?.();
      } else {
        options.onTab?.();
      }
      break;
  }
};

// Screen reader announcements
export const announceToScreenReader = (message: string): void => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Color contrast utilities
export const getContrastRatio = (color1: string, color2: string): number => {
  const getLuminance = (color: string): number => {
    const rgb = hexToRgb(color);
    if (!rgb) return 0;

    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
};

export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const isAccessibleColor = (foreground: string, background: string): boolean => {
  const ratio = getContrastRatio(foreground, background);
  return ratio >= 4.5; // WCAG AA standard
};

// Form accessibility
export const createFormFieldProps = (
  id: string,
  label: string,
  description?: string,
  error?: string
) => ({
  id,
  'aria-label': getAriaLabel(label, description),
  'aria-describedby': description ? getAriaDescribedBy(id) : undefined,
  'aria-invalid': error ? true : false,
  'aria-errormessage': error ? `${id}-error` : undefined
});

export const createFormFieldDescription = (id: string, _description: string) => ({
  id: getAriaDescribedBy(id),
  className: 'text-sm text-muted-foreground'
});

export const createFormFieldError = (id: string, _error: string) => ({
  id: `${id}-error`,
  role: 'alert',
  'aria-live': 'polite' as const
});

// Modal accessibility
export const createModalProps = (id: string, _title: string) => ({
  id,
  role: 'dialog',
  'aria-modal': 'true',
  'aria-labelledby': `${id}-title`,
  'aria-describedby': `${id}-description`
});

export const createModalTitle = (id: string, _title: string) => ({
  id: `${id}-title`,
  className: 'text-lg font-semibold'
});

export const createModalDescription = (id: string, _description: string) => ({
  id: `${id}-description`,
  className: 'text-sm text-muted-foreground'
});

// List accessibility
export const createListProps = (id: string, label: string) => ({
  id,
  role: 'list',
  'aria-label': label
});

export const createListItemProps = (id: string, index: number, total: number) => ({
  id: `${id}-item-${index}`,
  role: 'listitem',
  'aria-posinset': index + 1,
  'aria-setsize': total
});

// Button accessibility
export const createButtonProps = (
  label: string,
  _description?: string,
  pressed?: boolean,
  expanded?: boolean
) => ({
  'aria-label': getAriaLabel(label, _description),
  'aria-pressed': pressed !== undefined ? pressed : undefined,
  'aria-expanded': expanded !== undefined ? expanded : undefined
});

// Table accessibility
export const createTableProps = (id: string, caption: string) => ({
  id,
  role: 'table',
  'aria-label': caption
});

export const createTableHeaderProps = (id: string, columnId: string) => ({
  id: `${id}-header-${columnId}`,
  scope: 'col',
  role: 'columnheader'
});

export const createTableRowProps = (id: string, rowIndex: number) => ({
  id: `${id}-row-${rowIndex}`,
  role: 'row'
});

export const createTableCellProps = (id: string, columnId: string, rowIndex: number) => ({
  id: `${id}-cell-${rowIndex}-${columnId}`,
  role: 'gridcell',
  'aria-describedby': `${id}-header-${columnId}`
});

// Skip links
export const createSkipLink = (href: string, text: string) => ({
  href,
  className: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md',
  children: text
});

// Live regions
export const createLiveRegion = (id: string, polite: boolean = true) => ({
  id,
  'aria-live': polite ? 'polite' : 'assertive',
  'aria-atomic': 'true',
  className: 'sr-only'
});

// High contrast mode detection
export const isHighContrastMode = (): boolean => {
  return window.matchMedia('(prefers-contrast: high)').matches;
};

// Reduced motion detection
export const isReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Color scheme detection
export const isDarkMode = (): boolean => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

// Accessibility testing helpers
export const validateAccessibility = (element: HTMLElement): string[] => {
  const issues: string[] = [];

  // Check for missing alt text on images
  const images = element.querySelectorAll('img');
  images.forEach((img, index) => {
    if (!img.alt && !img.getAttribute('aria-label')) {
      issues.push(`Image ${index + 1} is missing alt text`);
    }
  });

  // Check for missing labels on form inputs
  const inputs = element.querySelectorAll('input, select, textarea');
  inputs.forEach((input, index) => {
    const id = input.getAttribute('id');
    if (id) {
      const label = element.querySelector(`label[for="${id}"]`);
      if (!label && !input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
        issues.push(`Input ${index + 1} is missing a label`);
      }
    }
  });

  // Check for missing headings
  const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
  if (headings.length === 0) {
    issues.push('No headings found - consider adding heading structure');
  }

  // Check for missing landmarks
  const landmarks = element.querySelectorAll('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]');
  if (landmarks.length === 0) {
    issues.push('No landmark roles found - consider adding semantic landmarks');
  }

  return issues;
};

// Accessibility score calculation
export const calculateAccessibilityScore = (element: HTMLElement): number => {
  const issues = validateAccessibility(element);
  const totalChecks = 4; // Number of accessibility checks performed
  const passedChecks = totalChecks - issues.length;
  return Math.round((passedChecks / totalChecks) * 100);
};
