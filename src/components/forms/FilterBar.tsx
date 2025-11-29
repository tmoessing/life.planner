import { useAtom } from 'jotai';
import { useState, useMemo } from 'react';
import { filterTextAtom, filterKeywordsAtom, rolesAtom, settingsAtom } from '@/stores/appStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X, Filter, ChevronDown } from 'lucide-react';
import type { Priority } from '@/types';

interface FilterBarProps {
  showSearchOnly?: boolean;
  showFilterOnly?: boolean;
}

export function FilterBar({ showSearchOnly = false, showFilterOnly = false }: FilterBarProps) {
  const [filterText, setFilterText] = useAtom(filterTextAtom);
  const [filterKeywords, setFilterKeywords] = useAtom(filterKeywordsAtom);
  const [roles] = useAtom(rolesAtom);
  const [settings] = useAtom(settingsAtom);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Parse current keyword filters to populate dropdowns
  const parsedFilters = useMemo(() => {
    if (!filterKeywords.trim()) return {};
    const filters: Record<string, string[]> = {};
    const parts = filterKeywords.split(/\s+/);
    for (const part of parts) {
      const [key, value] = part.split('=');
      if (key && value) {
        filters[key] = value.split(',').map(v => v.trim());
      }
    }
    return filters;
  }, [filterKeywords]);

  // Update keyword filters when dropdowns change
  const updateKeywordFilter = (key: string, value: string | null) => {
    const newFilters = { ...parsedFilters };
    if (value) {
      newFilters[key] = [value];
    } else {
      delete newFilters[key];
    }
    
    const keywordString = Object.entries(newFilters)
      .map(([k, v]) => `${k}=${v.join(',')}`)
      .join(' ');
    setFilterKeywords(keywordString);
  };

  const clearFilters = () => {
    setFilterText('');
    setFilterKeywords('');
  };

  const hasActiveFilters = filterText || filterKeywords || Object.keys(parsedFilters).length > 0;

  const showSearch = !showFilterOnly;
  const showKeywords = !showSearchOnly;

  const priorities: Priority[] = ['Q1', 'Q2', 'Q3', 'Q4'];
  const weights = [1, 3, 5, 8, 13, 21];
  const statuses = ['icebox', 'backlog', 'todo', 'progress', 'review', 'done'];
  const storyTypes = settings?.storyTypes || [];
  const storySizes = settings?.storySizes || [];
  const availableRoles = roles || [];

  // Helper to get controlled value for Select (always returns a string)
  const getSelectValue = (filterValue: string[] | undefined): string => {
    return filterValue?.[0] || '';
  };

  return (
    <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          {/* Text Search */}
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stories by title or description..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="pl-10 text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
              />
            </div>
          )}

          {/* Quick Filters */}
          {showKeywords && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {/* Priority Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Priority
                  </label>
                  <Select
                    value={getSelectValue(parsedFilters.priority)}
                    onValueChange={(value) => {
                      if (value) {
                        updateKeywordFilter('priority', value);
                      }
                    }}
                  >
                    <SelectTrigger className="h-9 text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map(priority => (
                        <SelectItem key={priority} value={priority}>
                          {priority}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Weight Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Weight
                  </label>
                  <Select
                    value={getSelectValue(parsedFilters.weight)}
                    onValueChange={(value) => {
                      if (value) {
                        updateKeywordFilter('weight', value);
                      }
                    }}
                  >
                    <SelectTrigger className="h-9 text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      {weights.map(weight => (
                        <SelectItem key={weight} value={weight.toString()}>
                          {weight}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Role Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Role
                  </label>
                  <Select
                    value={getSelectValue(parsedFilters.role)}
                    onValueChange={(value) => {
                      if (value) {
                        updateKeywordFilter('role', value);
                      }
                    }}
                  >
                    <SelectTrigger className="h-9 text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map(role => (
                        <SelectItem key={role.id} value={role.name.toLowerCase()}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </label>
                  <Select
                    value={getSelectValue(parsedFilters.status)}
                    onValueChange={(value) => {
                      if (value) {
                        updateKeywordFilter('status', value);
                      }
                    }}
                  >
                    <SelectTrigger className="h-9 text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map(status => (
                        <SelectItem key={status} value={status}>
                          <span className="capitalize">{status}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Advanced Filters Toggle */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full justify-between text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                >
                  <span className="flex items-center gap-2">
                    <Filter className="h-3.5 w-3.5" />
                    Advanced Filters
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                </Button>

                {showAdvanced && (
                  <div className="mt-4 space-y-4">
                    {/* Type Filter */}
                    {storyTypes.length > 0 && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          Type
                        </label>
                        <Select
                          value={getSelectValue(parsedFilters.type)}
                          onValueChange={(value) => {
                            if (value) {
                              updateKeywordFilter('type', value);
                            }
                          }}
                        >
                          <SelectTrigger className="h-9 text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600">
                            <SelectValue placeholder="All Types" />
                          </SelectTrigger>
                          <SelectContent>
                            {storyTypes.map(type => (
                              <SelectItem key={type.name} value={type.name}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Size Filter */}
                    {storySizes.length > 0 && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          Size
                        </label>
                        <Select
                          value={getSelectValue(parsedFilters.size)}
                          onValueChange={(value) => {
                            if (value) {
                              updateKeywordFilter('size', value);
                            }
                          }}
                        >
                          <SelectTrigger className="h-9 text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600">
                            <SelectValue placeholder="All Sizes" />
                          </SelectTrigger>
                          <SelectContent>
                            {storySizes.map(size => (
                              <SelectItem key={size.name} value={size.name}>
                                {size.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Advanced Keyword Input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Advanced Keywords
                      </label>
                      <Input
                        placeholder="e.g., label=urgent, sprint=current"
                        value={filterKeywords}
                        onChange={(e) => setFilterKeywords(e.target.value)}
                        className="text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 font-mono text-xs"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Use format: key=value (e.g., label=urgent, sprint=current)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Active Filters & Clear Button */}
          {hasActiveFilters && (
            <div className="flex flex-col gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Active Filters:
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {filterText && (
                  <Badge 
                    variant="secondary" 
                    className="gap-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                  >
                    <Search className="h-3 w-3" />
                    {filterText}
                    <button
                      onClick={() => setFilterText('')}
                      className="ml-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full p-0.5 transition-colors"
                      aria-label="Remove text filter"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {Object.entries(parsedFilters).map(([key, values]) => (
                  <Badge
                    key={key}
                    variant="secondary"
                    className="gap-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                  >
                    <Filter className="h-3 w-3" />
                    <span className="font-medium">{key}:</span>
                    {values.join(', ')}
                    <button
                      onClick={() => updateKeywordFilter(key, null)}
                      className="ml-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full p-0.5 transition-colors"
                      aria-label={`Remove ${key} filter`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
