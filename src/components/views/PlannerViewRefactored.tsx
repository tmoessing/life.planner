import { useAtom } from 'jotai';
import { storiesAtom, rolesAtom, visionsAtom, settingsAtom } from '@/stores/appStore';
import { usePlannerLogic } from '@/hooks/usePlannerLogic';
import { PlannerService } from '@/services/plannerService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Brain, Clock, Target, TrendingUp, Lightbulb, AlertTriangle } from 'lucide-react';
import { StoryCard } from '@/components/shared/StoryCard';
import { useStorySettings } from '@/utils/settingsMirror';
import { usePerformanceOptimization } from '@/utils/performanceUtils';
import type { BrainLevel, TimeBucket, Priority } from '@/types';

export function PlannerViewRefactored() {
  const [stories] = useAtom(storiesAtom);
  const [roles] = useAtom(rolesAtom);
  const [visions] = useAtom(visionsAtom);
  const [settings] = useAtom(settingsAtom);
  
  const storySettings = useStorySettings();
  
  // Use the planner logic hook
  const {
    filters,
    updateFilter,
    resetFilters,
    filteredStories,
    storiesByPriority,
    stats,
    getStoryColor,
    getPriorityColor,
    getBrainLevelDescription,
    getTimeBucketDescription
  } = usePlannerLogic(stories, settings);

  // Get planner service data
  const plannerData = PlannerService.getDashboardData(stories);
  const recommendations = PlannerService.getRecommendations(stories);

  // Performance optimization
  // Note: usePerformanceOptimization is a HOC, not a hook

  const brainLevels: BrainLevel[] = ['low', 'moderate', 'high'];
  const timeBuckets: TimeBucket[] = ['XS', 'S', 'M', 'L', 'XL'];
  const priorities: Priority[] = ['Q1', 'Q2', 'Q3', 'Q4'];

  return (
    <div className="space-y-6">
      {/* Filter controls row */}
      <div className="flex flex-wrap items-end gap-2 sm:gap-3 md:gap-4">
        {/* Brain Level Filter */}
        <div className="space-y-1 text-xs sm:text-sm">
          <label className="font-medium">Brain Level</label>
          <Select
            value={filters.brainLevel}
            onValueChange={(value) => updateFilter('brainLevel', value as BrainLevel)}
          >
            <SelectTrigger className="h-8 px-2 text-xs sm:text-sm min-w-[120px] sm:min-w-[150px] md:min-w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {brainLevels.map(level => (
                <SelectItem key={level} value={level}>
                  <div className="flex items-center space-x-2">
                    <span className="capitalize">{level}</span>
                    <span className="text-xs text-muted-foreground">
                      {getBrainLevelDescription(level)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Time Bucket Filter */}
        <div className="space-y-1 text-xs sm:text-sm">
          <label className="font-medium">Time Bucket</label>
          <Select
            value={filters.timeBucket}
            onValueChange={(value) => updateFilter('timeBucket', value as TimeBucket)}
          >
            <SelectTrigger className="h-8 px-2 text-xs sm:text-sm min-w-[100px] sm:min-w-[130px] md:min-w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeBuckets.map(bucket => (
                <SelectItem key={bucket} value={bucket}>
                  <div className="flex items-center space-x-2">
                    <span>{bucket}</span>
                    <span className="text-xs text-muted-foreground">
                      {getTimeBucketDescription(bucket)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Priority Filter */}
        <div className="space-y-1 text-xs sm:text-sm">
          <label className="font-medium">Priority</label>
          <Select
            value={filters.priority}
            onValueChange={(value) => updateFilter('priority', value as Priority | 'all')}
          >
            <SelectTrigger className="h-8 px-2 text-xs sm:text-sm min-w-[110px] sm:min-w-[140px] md:min-w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              {priorities.map(priority => (
                <SelectItem key={priority} value={priority}>
                  {priority}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Lightbulb className="h-5 w-5" />
              <span>Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    rec.severity === 'high' 
                      ? 'border-red-200 bg-red-50' 
                      : rec.severity === 'medium'
                      ? 'border-yellow-200 bg-yellow-50'
                      : 'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                      rec.severity === 'high' 
                        ? 'text-red-600' 
                        : rec.severity === 'medium'
                        ? 'text-yellow-600'
                        : 'text-blue-600'
                    }`} />
                    <div>
                      <p className="text-sm font-medium">{rec.message}</p>
                      {rec.action && (
                        <p className="text-xs text-muted-foreground mt-1">{rec.action}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stories by Priority */}
      <div className="space-y-6">
        {Object.entries(storiesByPriority).map(([priority, priorityStories]) => (
          <Card key={priority}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Badge 
                    style={{ 
                      backgroundColor: getPriorityColor(priority as Priority),
                      color: 'white'
                    }}
                  >
                    {priority}
                  </Badge>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {priorityStories.map((story) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    showActions={false}
                    className="transition-all duration-200 hover:shadow-md"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  );
}
