import { Suspense, lazy } from 'react';
import { useAtom } from 'jotai';
import { burndownCollapsedAtom, burnupCollapsedAtom } from '@/stores/appStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp, BarChart3, Loader2 } from 'lucide-react';

// Lazy load chart components to reduce initial bundle size
const BurndownChart = lazy(() => import('@/components/charts/BurndownChart').then(m => ({ default: m.BurndownChart })));
const BurnupChart = lazy(() => import('@/components/charts/BurnupChart').then(m => ({ default: m.BurnupChart })));

// Loading fallback for charts
const ChartLoadingFallback = () => (
  <div className="h-64 flex items-center justify-center">
    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
  </div>
);

export function ChartsSection() {
  const [burndownCollapsed, setBurndownCollapsed] = useAtom(burndownCollapsedAtom);
  const [burnupCollapsed, setBurnupCollapsed] = useAtom(burnupCollapsedAtom);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Charts</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Burndown Chart */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Burndown Chart</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBurndownCollapsed(!burndownCollapsed)}
                className="h-6 w-6 p-0"
              >
                {burndownCollapsed ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          {!burndownCollapsed && (
            <CardContent>
              <Suspense fallback={<ChartLoadingFallback />}>
                <BurndownChart />
              </Suspense>
            </CardContent>
          )}
        </Card>

        {/* Burnup Chart */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Burnup Chart</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBurnupCollapsed(!burnupCollapsed)}
                className="h-6 w-6 p-0"
              >
                {burnupCollapsed ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          {!burnupCollapsed && (
            <CardContent>
              <Suspense fallback={<ChartLoadingFallback />}>
                <BurnupChart />
              </Suspense>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
