import React, { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Plus, Trash2, Edit2, ExternalLink } from 'lucide-react';
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

  // Auto-sort dates by date (ascending)
  const sortedDates = [...importantDates].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateMobile = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntil = (dateString: string) => {
    const today = new Date();
    const targetDate = new Date(dateString);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0) return `In ${diffDays} days`;
    return `${Math.abs(diffDays)} days ago`;
  };

  const getDateStatus = (dateString: string) => {
    const today = new Date();
    const targetDate = new Date(dateString);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'past';
    if (diffDays === 0) return 'today';
    if (diffDays <= 7) return 'upcoming';
    return 'future';
  };

  const addToGoogleCalendar = (title: string, date: string) => {
    // Format date for Google Calendar (YYYYMMDD for all-day events)
    const eventDate = new Date(date);
    const dateString = eventDate.toISOString().split('T')[0].replace(/-/g, '');
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dateString}/${dateString}`;
    
    window.open(googleCalendarUrl, '_blank');
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Important Dates</h2>
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

      {/* Important Dates List */}
      <div className="space-y-4">
        {sortedDates.length === 0 ? (
          <Card className="h-48 sm:h-64 flex items-center justify-center">
            <CardContent className="text-center p-4">
              <Calendar className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">No Important Dates</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Add your first important date below to get started
              </p>
            </CardContent>
          </Card>
        ) : (
          sortedDates.map((date) => {
            const status = getDateStatus(date.date);
            const statusColors = {
              past: `border-gray-200 bg-gray-50`,
              today: `border-red-200 bg-red-50`,
              upcoming: `border-yellow-200 bg-yellow-50`,
              future: `border-blue-200 bg-blue-50`
            };

            return (
              <Card key={date.id} className={`${statusColors[status]} transition-colors`}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg break-words">{date.title}</h3>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        <span className="hidden sm:inline">{formatDate(date.date)}</span>
                        <span className="sm:hidden">{formatDateMobile(date.date)}</span>
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {getDaysUntil(date.date)}
                      </p>
                    </div>
                    <div className="flex gap-1 sm:gap-2 justify-end sm:justify-start">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addToGoogleCalendar(date.title, date.date)}
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
              </Card>
            );
          })
        )}
      </div>

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
