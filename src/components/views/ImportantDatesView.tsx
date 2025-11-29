import { useState } from 'react';
import { useAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Calendar, Plus, Trash2, Edit2, ExternalLink, Search } from 'lucide-react';
import { importantDatesAtom } from '@/stores/appStore';
import { useImportantDateSettings } from '@/utils/settingsMirror';
import { ImportantDateModal } from '@/components/modals/ImportantDateModal';
import type { ImportantDate } from '@/types';

export function ImportantDatesView() {
  const [importantDates, setImportantDates] = useAtom(importantDatesAtom);
  
  // Use settings mirror system for important date settings
  const importantDateSettings = useImportantDateSettings();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingDate, setEditingDate] = useState<ImportantDate | null>(null);
  const [showAllDates, setShowAllDates] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'required' | 'optional' | 'all'>('required');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());

  // Auto-sort dates by date (ascending)
  const sortedDates = [...importantDates].sort((a, b) => {
    // Handle date strings in YYYY-MM-DD format (local dates)
    const dateA = a.date.includes('T') ? new Date(a.date) : new Date(a.date + 'T00:00:00');
    const dateB = b.date.includes('T') ? new Date(b.date) : new Date(b.date + 'T00:00:00');
    return dateA.getTime() - dateB.getTime();
  });

  // Filter dates to show only next 6 months by default and apply search
  const getFilteredDates = () => {
    let filtered = sortedDates;
    
    // Apply required/optional filter
    if (filterType === 'required') {
      filtered = filtered.filter(date => date.isRequired !== false);
    } else if (filterType === 'optional') {
      filtered = filtered.filter(date => date.isRequired === false);
    }
    // 'all' shows everything
    
    // Apply category filter
    if (selectedCategories.size > 0) {
      filtered = filtered.filter(date => 
        date.category && selectedCategories.has(date.category)
      );
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(date => 
        date.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      // When searching, show all matching dates regardless of 6-month filter
      return filtered;
    }
    
    // Apply 6-month filter if not showing all dates and not searching
    if (!showAllDates) {
      const today = new Date();
      const sixMonthsFromNow = new Date();
      sixMonthsFromNow.setMonth(today.getMonth() + 6);
      
      filtered = filtered.filter(date => {
        const dateObj = date.date.includes('T') ? new Date(date.date) : new Date(date.date + 'T00:00:00');
        return dateObj >= today && dateObj <= sixMonthsFromNow;
      });
    }
    
    return filtered;
  };

  const filteredDates = getFilteredDates();
  
  // Calculate if there are more dates beyond the current filters
  const getUnfilteredDates = () => {
    let filtered = sortedDates;
    
    // Apply required/optional filter
    if (filterType === 'required') {
      filtered = filtered.filter(date => date.isRequired !== false);
    } else if (filterType === 'optional') {
      filtered = filtered.filter(date => date.isRequired === false);
    }
    
    // Apply category filter
    if (selectedCategories.size > 0) {
      filtered = filtered.filter(date => 
        date.category && selectedCategories.has(date.category)
      );
    }
    
    return filtered;
  };
  
  const unfilteredDates = getUnfilteredDates();
  const hasMoreDates = !showAllDates && unfilteredDates.length > 6;

  const handleAddDate = () => {
    setModalMode('add');
    setEditingDate(null);
    setIsModalOpen(true);
  };

  const handleEditDate = (date: ImportantDate) => {
    setModalMode('edit');
    setEditingDate(date);
    setIsModalOpen(true);
  };

  const handleDeleteDate = (id: string) => {
    setImportantDates(prev => prev.filter(date => date.id !== id));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDate(null);
  };

  const formatDate = (dateString: string, endDateString?: string) => {
    // Handle date strings in YYYY-MM-DD format (local dates)
    const date = dateString.includes('T') ? new Date(dateString) : new Date(dateString + 'T00:00:00');
    const formattedStart = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    if (endDateString) {
      const endDate = endDateString.includes('T') ? new Date(endDateString) : new Date(endDateString + 'T00:00:00');
      const formattedEnd = endDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      return `${formattedStart} - ${formattedEnd}`;
    }
    
    return formattedStart;
  };

  const formatDateMobile = (dateString: string, endDateString?: string) => {
    // Handle date strings in YYYY-MM-DD format (local dates)
    const date = dateString.includes('T') ? new Date(dateString) : new Date(dateString + 'T00:00:00');
    const formattedStart = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    if (endDateString) {
      const endDate = endDateString.includes('T') ? new Date(endDateString) : new Date(endDateString + 'T00:00:00');
      const formattedEnd = endDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      return `${formattedStart} - ${formattedEnd}`;
    }
    
    return formattedStart;
  };

  const getDaysUntil = (dateString: string, endDateString?: string) => {
    const today = new Date();
    // Handle date strings in YYYY-MM-DD format (local dates)
    const startDate = dateString.includes('T') ? new Date(dateString) : new Date(dateString + 'T00:00:00');
    
    if (endDateString) {
      const endDate = endDateString.includes('T') ? new Date(endDateString) : new Date(endDateString + 'T00:00:00');
      
      // If current date is within the range
      if (today >= startDate && today <= endDate) {
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Ends today';
        if (diffDays === 1) return 'Ends tomorrow';
        return `Ends in ${diffDays} days`;
      }
      
      // If current date is before the range
      if (today < startDate) {
        const diffTime = startDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Starts today';
        if (diffDays === 1) return 'Starts tomorrow';
        return `Starts in ${diffDays} days`;
      }
      
      // If current date is after the range
      const diffTime = today.getTime() - endDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} days ago`;
    }
    
    // Single date logic (existing)
    const diffTime = startDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0) return `In ${diffDays} days`;
    return `${Math.abs(diffDays)} days ago`;
  };

  const getDateStatus = (dateString: string) => {
    const today = new Date();
    // Handle date strings in YYYY-MM-DD format (local dates)
    const targetDate = dateString.includes('T') ? new Date(dateString) : new Date(dateString + 'T00:00:00');
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'past';
    if (diffDays === 0) return 'today';
    if (diffDays <= 7) return 'upcoming';
    return 'future';
  };

  const addToGoogleCalendar = (title: string, date: string, endDate?: string) => {
    // Format date for Google Calendar (YYYYMMDD for all-day events)
    // Handle date strings in YYYY-MM-DD format (local dates)
    const startDate = date.includes('T') ? new Date(date) : new Date(date + 'T00:00:00');
    const startDateString = startDate.toISOString().split('T')[0].replace(/-/g, '');
    
    let endDateString = startDateString;
    if (endDate) {
      const eventEndDate = endDate.includes('T') ? new Date(endDate) : new Date(endDate + 'T00:00:00');
      // Add one day to end date for Google Calendar (exclusive end date)
      eventEndDate.setDate(eventEndDate.getDate() + 1);
      endDateString = eventEndDate.toISOString().split('T')[0].replace(/-/g, '');
    }
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDateString}/${endDateString}`;
    
    window.open(googleCalendarUrl, '_blank');
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Track your important dates and events
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={handleAddDate}
              className="gap-2 w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Add Important Date
            </Button>
          </div>
        </div>
      </div>

      {/* Search Box */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Search dates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex gap-2">
          <Button
            variant={filterType === 'required' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('required')}
          >
            Required
          </Button>
          <Button
            variant={filterType === 'optional' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('optional')}
          >
            Optional
          </Button>
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('all')}
          >
            All
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={selectedCategories.size === 0 ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategories(new Set())}
          >
            All Categories
          </Button>
          {importantDateSettings.importantDateTypes.map((type) => (
            <Button
              key={type.name}
              variant={selectedCategories.has(type.name) ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                const newSelected = new Set(selectedCategories);
                if (newSelected.has(type.name)) {
                  newSelected.delete(type.name);
                } else {
                  newSelected.add(type.name);
                }
                setSelectedCategories(newSelected);
              }}
              className="flex items-center gap-1"
            >
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: type.color }}
              />
              {type.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Important Dates List */}
      <div className="space-y-4">
        {filteredDates.length === 0 ? (
          <Card className="h-48 sm:h-64 flex items-center justify-center">
            <CardContent className="text-center p-4">
              <Calendar className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">
                {searchQuery.trim() 
                  ? 'No dates found' 
                  : importantDates.length === 0 
                    ? 'No Important Dates' 
                    : 'No Dates in Next 6 Months'
                }
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                {searchQuery.trim()
                  ? `No dates match "${searchQuery}". Try a different search term.`
                  : importantDates.length === 0 
                    ? 'Add your first important date below to get started'
                    : 'No important dates in the next 6 months. Click "See More" to view all dates.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredDates.map((date) => {
            const status = getDateStatus(date.date);
            const statusColors = {
              past: `border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50`,
              today: `border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20`,
              upcoming: `border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20`,
              future: `border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20`
            };

            // Get category color
            const categoryColor = date.category 
              ? importantDateSettings.getDateTypeColor(date.category)
              : '#6B7280';

            return (
              <Card 
                key={date.id} 
                className={`${statusColors[status]} transition-colors`}
                style={{
                  borderLeftColor: categoryColor,
                  borderLeftWidth: '4px',
                  backgroundColor: `${categoryColor}10`
                }}
              >
                {/* Mobile: Single row layout */}
                <div className="sm:hidden p-1.5 flex items-center gap-1.5 min-h-[44px]">
                  <div 
                    className="w-1 h-6 rounded-full flex-shrink-0"
                    style={{ backgroundColor: categoryColor }}
                  />
                  <span className="text-xs font-medium truncate flex-1 min-w-0">
                    {date.title}
                  </span>
                  <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                    <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                      {formatDateMobile(date.date, date.endDate)}
                    </span>
                    <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                      {getDaysUntil(date.date, date.endDate)}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditDate(date)}
                    className="h-11 w-11 sm:h-7 sm:w-7 p-0 flex-shrink-0"
                  >
                    <Edit2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                  </Button>
                </div>

                {/* Desktop: Compact card layout */}
                <div className="hidden sm:block">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg break-words">{date.title}</h3>
                        <p className="text-sm sm:text-base text-muted-foreground">
                          {formatDate(date.date, date.endDate)}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {getDaysUntil(date.date, date.endDate)}
                        </p>
                      </div>
                      <div className="flex gap-1 sm:gap-2 justify-end sm:justify-start">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addToGoogleCalendar(date.title, date.date, date.endDate)}
                          className="text-blue-600 hover:text-blue-700 h-8 w-8 p-0 touch-manipulation"
                          title="Add to Google Calendar"
                        >
                          <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditDate(date)}
                          className="h-8 w-8 p-0 touch-manipulation"
                        >
                          <Edit2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteDate(date.id)}
                          className="text-red-600 hover:text-red-700 h-8 w-8 p-0 touch-manipulation"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* See More Button */}
      {hasMoreDates && !searchQuery.trim() && (
        <div className="flex justify-center">
          <Button
            onClick={() => setShowAllDates(!showAllDates)}
            variant="outline"
            className="gap-2"
          >
            {showAllDates ? 'Show Less' : `See More (${unfilteredDates.length - 6} more)`}
          </Button>
        </div>
      )}

      {/* Add Important Date Button at Bottom */}
      <Card className="border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors cursor-pointer">
        <CardContent 
          className="p-3 sm:p-4 flex items-center justify-center min-h-[60px]"
          onClick={handleAddDate}
        >
          <div className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
            <Plus className="h-4 w-4" />
            <span className="text-sm sm:text-base font-medium">Add Important Date</span>
          </div>
        </CardContent>
      </Card>

      {/* Important Date Modal */}
      <ImportantDateModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        importantDate={editingDate}
      />
    </div>
  );
}
