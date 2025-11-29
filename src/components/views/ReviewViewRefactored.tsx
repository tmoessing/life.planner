import { useAtom } from 'jotai';
import { storiesAtom, updateStoryAtom, rolesAtom, labelsAtom, visionsAtom, settingsAtom } from '@/stores/appStore';
import { useReviewLogic } from '@/hooks/useReviewLogic';
import { ReviewService } from '@/services/reviewService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CheckCircle, 
  Calendar, 
  User, 
  Star, 
  MapPin, 
  Tag, 
  Weight,
  TrendingUp,
  Clock,
  Target,
  Download,
  Search
} from 'lucide-react';
import { StoryCard } from '@/components/shared/StoryCard';
import { useStorySettings } from '@/utils/settingsMirror';
import { usePerformanceOptimization } from '@/utils/performanceUtils';
import type { Priority, StoryType } from '@/types';

export function ReviewViewRefactored() {
  const [stories] = useAtom(storiesAtom);
  const [, updateStory] = useAtom(updateStoryAtom);
  const [roles] = useAtom(rolesAtom);
  const [labels] = useAtom(labelsAtom);
  const [visions] = useAtom(visionsAtom);
  const [settings] = useAtom(settingsAtom);
  
  const storySettings = useStorySettings();
  
  // Use the review logic hook
  const {
    filters,
    updateFilter,
    resetFilters,
    filteredStories,
    stats,
    getTaskCategoryColor,
    getPriorityColor,
    getTypeColor,
    getCompletionPercentage,
    getStoryAge,
    getCompletionTime
  } = useReviewLogic(stories, settings);

  // Get review service data
  const reviewData = ReviewService.getDashboardData(stories);
  const insights = ReviewService.getAdvancedInsights(stories);
  const recommendations = ReviewService.getImprovementRecommendations(stories);

  // Performance optimization
  // Note: usePerformanceOptimization is a HOC, not a hook

  const priorities: Priority[] = ['Q1', 'Q2', 'Q3', 'Q4'];
  const types: StoryType[] = ['Spiritual', 'Physical', 'Intellectual', 'Social'];
  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'week', label: 'Last Week' },
    { value: 'month', label: 'Last Month' },
    { value: 'quarter', label: 'Last Quarter' },
    { value: 'year', label: 'Last Year' }
  ];

  const handleExport = () => {
    const data = ReviewService.exportData(stories, 'json');
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `review-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Review</h1>
          <p className="text-muted-foreground">
            Analyze your completed stories and productivity patterns
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
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
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold">{stats.completedStories}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Completion Rate</p>
                <p className="text-2xl font-bold">{stats.completionRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Avg. Time</p>
                <p className="text-2xl font-bold">{stats.averageCompletionTime.toFixed(1)}d</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search stories..."
                  value={filters.searchTerm}
                  onChange={(e) => updateFilter('searchTerm', e.target.value)}
                  className="pl-10"
                />
              </div>
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

            {/* Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select
                value={filters.type}
                onValueChange={(value) => updateFilter('type', value as StoryType | 'all')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {types.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Select
                value={filters.dateRange}
                onValueChange={(value) => updateFilter('dateRange', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dateRanges.map(range => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Completion Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.completionStatus}
                onValueChange={(value) => updateFilter('completionStatus', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stories</SelectItem>
                  <SelectItem value="completed">Completed Only</SelectItem>
                  <SelectItem value="incomplete">Incomplete Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Productivity Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    insight.severity === 'high' 
                      ? 'border-red-200 bg-red-50' 
                      : insight.severity === 'medium'
                      ? 'border-yellow-200 bg-yellow-50'
                      : 'border-green-200 bg-green-50'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      insight.severity === 'high' 
                        ? 'bg-red-500' 
                        : insight.severity === 'medium'
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium">{insight.message}</p>
                      {insight.recommendation && (
                        <p className="text-xs text-muted-foreground mt-1">{insight.recommendation}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Improvement Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <p className="text-sm">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stories List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Completed Stories ({filteredStories.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {filteredStories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No completed stories found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  showActions={false}
                  className="transition-all duration-200 hover:shadow-md"
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
