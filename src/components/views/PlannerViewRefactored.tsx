import React from 'react';
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
  const insights = PlannerService.getProductivityInsights(stories);

  // Performance optimization
  // Note: usePerformanceOptimization is a HOC, not a hook

  const brainLevels: BrainLevel[] = ['low', 'moderate', 'high'];
  const timeBuckets: TimeBucket[] = ['XS', 'S', 'M', 'L', 'XL'];
  const priorities: Priority[] = ['Q1', 'Q2', 'Q3', 'Q4'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Planner</h1>
          <p className="text-muted-foreground">
            Plan your tasks based on cognitive load and time availability
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={resetFilters} variant="outline" size="sm">
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Stories</p>
                <p className="text-2xl font-bold">{stats.totalStories}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Average Weight</p>
                <p className="text-2xl font-bold">{stats.averageWeight.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Brain className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Brain Level</p>
                <p className="text-sm text-muted-foreground capitalize">{filters.brainLevel}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Time Bucket</p>
                <p className="text-sm text-muted-foreground">{filters.timeBucket}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Brain Level Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Brain Level</label>
              <Select
                value={filters.brainLevel}
                onValueChange={(value) => updateFilter('brainLevel', value as BrainLevel)}
              >
                <SelectTrigger>
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Bucket</label>
              <Select
                value={filters.timeBucket}
                onValueChange={(value) => updateFilter('timeBucket', value as TimeBucket)}
              >
                <SelectTrigger>
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select
                value={filters.priority}
                onValueChange={(value) => updateFilter('priority', value as Priority | 'all')}
              >
                <SelectTrigger>
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
        </CardContent>
      </Card>

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

      {/* Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Productivity Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <p className="text-sm">{insight}</p>
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
                  <span>{priorityStories.length} stories</span>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {priorityStories.map((story) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    roles={roles}
                    labels={storySettings.labels}
                    visions={visions}
                    goals={[]}
                    projects={[]}
                    settings={settings}
                    showActions={false}
                    className="transition-all duration-200 hover:shadow-md"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Debug (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-xs text-muted-foreground">
              Performance: {filteredStories.length} filtered stories
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
