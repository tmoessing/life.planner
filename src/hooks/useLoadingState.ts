import { useState, useCallback } from 'react';

export interface LoadingState {
  isLoading: boolean;
  loadingMessage: string | null;
  progress: number | null;
}

export interface LoadingOptions {
  message?: string;
  progress?: number;
  duration?: number;
}

export function useLoadingState() {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    loadingMessage: null,
    progress: null
  });

  const startLoading = useCallback((options: LoadingOptions = {}) => {
    setLoadingState({
      isLoading: true,
      loadingMessage: options.message || null,
      progress: options.progress || null
    });
  }, []);

  const updateLoading = useCallback((options: LoadingOptions) => {
    setLoadingState(prev => ({
      ...prev,
      loadingMessage: options.message || prev.loadingMessage,
      progress: options.progress !== undefined ? options.progress : prev.progress
    }));
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingState({
      isLoading: false,
      loadingMessage: null,
      progress: null
    });
  }, []);

  const setProgress = useCallback((progress: number) => {
    setLoadingState(prev => ({
      ...prev,
      progress: Math.max(0, Math.min(100, progress))
    }));
  }, []);

  const setMessage = useCallback((message: string) => {
    setLoadingState(prev => ({
      ...prev,
      loadingMessage: message
    }));
  }, []);

  return {
    loadingState,
    startLoading,
    updateLoading,
    stopLoading,
    setProgress,
    setMessage
  };
}
