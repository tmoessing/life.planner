import { useState, useCallback } from 'react';

export interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
}

export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    errorId: null
  });

  const handleError = useCallback((
    error: Error | string,
    context?: string,
    options?: ErrorHandlerOptions
  ) => {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Log error if enabled
    if (options?.logError !== false) {
      console.error(`[${context || 'Unknown'}] ${errorObj.message}`, errorObj);
    }
    
    // Update error state
    setErrorState({
      hasError: true,
      error: errorObj,
      errorId
    });
    
    // Show toast if enabled
    if (options?.showToast !== false) {
      // This would integrate with a toast notification system
      console.warn(`Error: ${errorObj.message}`);
    }
    
    return errorId;
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      errorId: null
    });
  }, []);

  const resetError = useCallback(() => {
    clearError();
  }, [clearError]);

  return {
    errorState,
    handleError,
    clearError,
    resetError
  };
}
