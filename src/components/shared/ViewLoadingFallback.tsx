import { Loader2 } from 'lucide-react';

/**
 * Loading fallback component for lazy-loaded views
 * Shows a simple spinner while the view component is being loaded
 */
export function ViewLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading view...</p>
      </div>
    </div>
  );
}

