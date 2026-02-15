import { Suspense, lazy, useState } from 'react';
import { useAtom } from 'jotai';
import { currentSprintAtom, storiesAtom, selectedSprintIdAtom, safeSprintsAtom } from '@/stores/appStore';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, Loader2 } from 'lucide-react';

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
  const [burndownExpanded, setBurndownExpanded] = useState(false);
  const [burnupExpanded, setBurnupExpanded] = useState(false);
  const [currentSprint] = useAtom(currentSprintAtom);
  const [stories] = useAtom(storiesAtom);
  const [selectedSprintId] = useAtom(selectedSprintIdAtom);
  const [sprints] = useAtom(safeSprintsAtom);

  // Use selected sprint or fall back to current sprint
  const selectedSprint = sprints.find(sprint => sprint.id === selectedSprintId) || currentSprint;

  // Calculate progress for compact view
  const calculateProgress = () => {
    if (!selectedSprint) {
      return { burndownProgress: 0, burnupProgress: 0 };
    }

    const sprintStories = stories.filter(story => story.sprintId === selectedSprint.id);
    const totalWeight = sprintStories.reduce((sum, story) => sum + story.weight, 0);
    const completedWeight = sprintStories
      .filter(story => story.status === 'done')
      .reduce((sum, story) => sum + story.weight, 0);

    // Burndown progress: percentage of work remaining (inverse of completion)
    const burndownProgress = totalWeight > 0 ? ((totalWeight - completedWeight) / totalWeight) * 100 : 0;

    // Burnup progress: percentage of work completed
    const burnupProgress = totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0;

    return { burndownProgress, burnupProgress };
  };

  const { burndownProgress, burnupProgress } = calculateProgress();

  return (
    <div className="w-full flex flex-col items-center gap-3 sm:gap-4">
      {/* Compact Card - Only show when both charts are collapsed */}
      {!burndownExpanded && !burnupExpanded && (
        <Card className="border w-full max-w-md">
          <CardContent className="px-2 sm:px-3 py-3 sm:py-4">
            <div className="space-y-3 sm:space-y-4">
              {/* Burndown Chart - Compact */}
              <div
                className="space-y-1 sm:space-y-1.5 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setBurndownExpanded(true)}
              >
                <div className="flex justify-between items-center text-[10px] sm:text-xs">
                  <div className="flex items-center gap-1.5">
                    <BarChart3 className="h-3 w-3" />
                    <span>Burndown Chart</span>
                  </div>
                  <span className="text-muted-foreground">
                    {Math.round(burndownProgress)}% remaining
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 sm:h-1.5">
                  <div
                    className="bg-blue-600 h-1 sm:h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${burndownProgress}%` }}
                  />
                </div>
              </div>

              {/* Burnup Chart - Compact */}
              <div
                className="space-y-1 sm:space-y-1.5 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setBurnupExpanded(true)}
              >
                <div className="flex justify-between items-center text-[10px] sm:text-xs">
                  <div className="flex items-center gap-1.5">
                    <BarChart3 className="h-3 w-3" />
                    <span>Burnup Chart</span>
                  </div>
                  <span className="text-muted-foreground">
                    {Math.round(burnupProgress)}% complete
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 sm:h-1.5">
                  <div
                    className="bg-green-600 h-1 sm:h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${burnupProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expanded Charts */}
      {burndownExpanded && (
        <Card className="border w-full max-w-4xl">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Burndown Chart</h3>
              </div>
              <button
                onClick={() => setBurndownExpanded(false)}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                Close
              </button>
            </div>
            <Suspense fallback={<ChartLoadingFallback />}>
              <BurndownChart />
            </Suspense>
          </CardContent>
        </Card>
      )}

      {burnupExpanded && (
        <Card className="border w-full max-w-4xl">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Burnup Chart</h3>
              </div>
              <button
                onClick={() => setBurnupExpanded(false)}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                Close
              </button>
            </div>
            <Suspense fallback={<ChartLoadingFallback />}>
              <BurnupChart />
            </Suspense>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
