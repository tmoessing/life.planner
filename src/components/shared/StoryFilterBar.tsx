import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Filter, X, RotateCcw } from 'lucide-react';
import type { StoryFilters, Priority, StoryType } from '@/types';

interface StoryFilterBarProps {
  filters: StoryFilters;
  onFilterChange: <K extends keyof StoryFilters>(key: K, value: StoryFilters[K]) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  showFilters: boolean;
  onToggleFilters: () => void;
  roles: Array<{ id: string; name: string }>;
  visions: Array<{ id: string; name: string }>;
  goals: Array<{ id: string; name: string }>;
  projects: Array<{ id: string; name: string }>;
  labels: Array<{ id: string; name: string }>;
  settings: any;
  className?: string;
}

export function StoryFilterBar({
  filters,
  onFilterChange,
  onResetFilters,
  hasActiveFilters,
  showFilters,
  onToggleFilters,
  roles,
  visions,
  goals,
  projects,
  settings,
  className = ''
}: StoryFilterBarProps) {
  const priorities: Priority[] = ['Q1', 'Q2', 'Q3', 'Q4'];
  const weights = [1, 3, 5, 8, 13, 21];
  const sizes = settings.storySizes || [];
  const statuses = ['icebox', 'backlog', 'todo', 'progress', 'review', 'done'];

  const getActiveFilterCount = () => {
    return Object.entries(filters).filter(([key, value]) => 
      key !== 'sprintId' && value !== 'all'
    ).length;
  };

  return (
    <Card className={`mb-4 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <Badge variant="secondary" className="text-xs">
                {getActiveFilterCount()}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onResetFilters}
                className="text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={onToggleFilters}
              className="text-xs"
            >
              {showFilters ? (
                <>
                  <X className="h-3 w-3 mr-1" />
                  Hide
                </>
              ) : (
                <>
                  <Filter className="h-3 w-3 mr-1" />
                  Show
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {showFilters && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Priority Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Priority
              </label>
              <Select
                value={filters.priority}
                onValueChange={(value) => onFilterChange('priority', value as Priority | 'all')}
              >
                <SelectTrigger className="h-8">
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
              <label className="text-xs font-medium text-muted-foreground">
                Type
              </label>
              <Select
                value={filters.type}
                onValueChange={(value) => onFilterChange('type', value as StoryType | 'all')}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {settings.storyTypes?.map((type: any) => (
                    <SelectItem key={type.name} value={type.name}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Role Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Role
              </label>
              <Select
                value={filters.roleId}
                onValueChange={(value) => onFilterChange('roleId', value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Vision Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Vision
              </label>
              <Select
                value={filters.visionId}
                onValueChange={(value) => onFilterChange('visionId', value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Visions</SelectItem>
                  {visions.map(vision => (
                    <SelectItem key={vision.id} value={vision.id}>
                      {vision.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Goal Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Goal
              </label>
              <Select
                value={filters.goalId}
                onValueChange={(value) => onFilterChange('goalId', value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Goals</SelectItem>
                  {goals.map(goal => (
                    <SelectItem key={goal.id} value={goal.id}>
                      {goal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Project Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Project
              </label>
              <Select
                value={filters.projectId}
                onValueChange={(value) => onFilterChange('projectId', value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Weight Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Weight
              </label>
              <Select
                value={filters.weight.toString()}
                onValueChange={(value) => onFilterChange('weight', value === 'all' ? 'all' : parseInt(value))}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Weights</SelectItem>
                  {weights.map(weight => (
                    <SelectItem key={weight} value={weight.toString()}>
                      {weight}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Size Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Size
              </label>
              <Select
                value={filters.size}
                onValueChange={(value) => onFilterChange('size', value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sizes</SelectItem>
                  {sizes.map((size: any) => (
                    <SelectItem key={size.name} value={size.name}>
                      {size.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Status
              </label>
              <Select
                value={filters.status}
                onValueChange={(value) => onFilterChange('status', value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Location
              </label>
              <Select
                value={filters.location}
                onValueChange={(value) => onFilterChange('location', value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {/* This would need to be populated with actual locations from stories */}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
