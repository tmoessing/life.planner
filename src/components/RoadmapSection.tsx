
import { useState } from 'react';
import { useAtom } from 'jotai';
import { currentSprintAtom, storiesAtom, selectedSprintIdAtom, safeSprintsAtom, updateStoryAtom, rolesAtom } from '@/stores/appStore';
import { useStorySettings } from '@/utils/settingsMirror';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AddStoryModal } from '@/components/modals/AddStoryModal';
import { EditStoryModal } from '@/components/modals/EditStoryModal';
import { Calendar, Plus, Eye, MapPin, User, Weight, Target, CheckCircle, Edit } from 'lucide-react';
import { format, eachDayOfInterval, parseISO } from 'date-fns';
import type { Story } from '@/types';

export function RoadmapSection() {
  const [currentSprint] = useAtom(currentSprintAtom);
  const [stories] = useAtom(storiesAtom);
  const [selectedSprintId] = useAtom(selectedSprintIdAtom);
  const [sprints] = useAtom(safeSprintsAtom);
  const [, updateStory] = useAtom(updateStoryAtom);
  const storySettings = useStorySettings();
  const [roles] = useAtom(rolesAtom);
  const [showAddStoryModal, setShowAddStoryModal] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [showEditStoryModal, setShowEditStoryModal] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);

  // Use selected sprint or fall back to current sprint
  const selectedSprint = sprints.find(sprint => sprint.id === selectedSprintId) || currentSprint;

  const generateRoadmapData = () => {
    if (!selectedSprint) return { days: [], stories: [] };

    const startDate = parseISO(selectedSprint.startDate);
    const endDate = parseISO(selectedSprint.endDate);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    // Get stories for this sprint
    const sprintStories = stories.filter(story => story.sprintId === selectedSprint.id);

    return {
      days: days.map(day => ({
        date: format(day, 'yyyy-MM-dd'),
        dayName: format(day, 'EEE'),
        dayNumber: format(day, 'd')
      })),
      stories: sprintStories
    };
  };

  const { days, stories: sprintStories } = generateRoadmapData();
  
  // Calculate scheduling stats
  const scheduledStories = sprintStories.filter(story => story.scheduled);
  const unscheduledStories = sprintStories.filter(story => !story.scheduled);

  const handleCellClick = (storyId: string, date: string) => {
    const story = sprintStories.find(s => s.id === storyId);
    if (!story) return;

    // Toggle scheduling: if already scheduled on this date, unschedule it
    // If scheduled on a different date, move it to this date
    // If not scheduled, schedule it on this date
    const newScheduledDate = story.scheduled === date ? undefined : date;
    
    updateStory(storyId, { scheduled: newScheduledDate });
  };

  const isStoryScheduledOnDate = (storyId: string, date: string) => {
    const story = sprintStories.find(s => s.id === storyId);
    return story?.scheduled === date;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Roadmap
          </CardTitle>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setShowAddStoryModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Story
          </Button>
        </div>
        
        {/* Stats and Legend - Responsive */}
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          {/* Stats */}
          <div className="flex gap-4 text-xs sm:text-sm">
            <span className="text-green-600 font-medium">
              {scheduledStories.length} scheduled
            </span>
            <span className="text-gray-500">
              {unscheduledStories.length} unscheduled
            </span>
          </div>
          
          {/* Legend - Responsive */}
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: storySettings.roadmapScheduledColor || '#10b981' }}
              ></div>
              <span>Scheduled</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded opacity-50"></div>
              <span className="hidden sm:inline">Story scheduled elsewhere</span>
              <span className="sm:hidden">Elsewhere</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Mobile Instructions */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg sm:hidden">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Scroll horizontally to see all days. Tap cells to schedule stories.
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Header with days - Responsive */}
            <div className="grid grid-cols-8 gap-1 sm:gap-2 mb-2 min-w-[600px] sm:min-w-[800px]">
              <div className="p-1 sm:p-2 text-xs sm:text-sm font-medium text-muted-foreground min-w-[120px] sm:min-w-[150px]">Story</div>
              {days.map((day) => (
                <div key={day.date} className="p-1 sm:p-2 text-center min-w-[60px] sm:min-w-[80px]">
                  <div className="text-xs text-muted-foreground">{day.dayName}</div>
                  <div className="text-xs font-medium">{day.dayNumber}</div>
                </div>
              ))}
            </div>

            {/* Story rows - Responsive */}
            {sprintStories.map((story) => (
              <div key={story.id} className="grid grid-cols-8 gap-1 sm:gap-2 mb-1 min-w-[600px] sm:min-w-[800px]">
                <div className={`p-1 sm:p-2 text-xs sm:text-sm truncate border rounded min-w-[120px] sm:min-w-[150px] group ${
                  story.scheduled 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
                      <span className="truncate text-xs sm:text-sm">{story.title}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 w-5 sm:h-6 sm:w-6 p-0 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setSelectedStory(story)}
                        title="View story details"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                    {story.scheduled && (
                      <span className="text-xs bg-green-100 text-green-700 px-1 py-0.5 rounded whitespace-nowrap ml-1 sm:ml-2">
                        {format(parseISO(story.scheduled), 'MMM d')}
                      </span>
                    )}
                  </div>
                </div>
                {days.map((day) => (
                  <div
                    key={`${story.id}-${day.date}`}
                    className={`p-1 sm:p-2 border rounded cursor-pointer hover:bg-muted transition-colors min-w-[60px] sm:min-w-[80px] min-h-[32px] sm:min-h-[40px] touch-manipulation ${
                      isStoryScheduledOnDate(story.id, day.date)
                        ? 'text-white'
                        : story.scheduled && story.scheduled !== day.date
                        ? 'bg-gray-100 border-gray-300 opacity-50'
                        : 'bg-background border-gray-200'
                    }`}
                    style={isStoryScheduledOnDate(story.id, day.date) ? {
                      backgroundColor: storySettings.roadmapScheduledColor || '#10b981',
                      borderColor: storySettings.roadmapScheduledColor || '#10b981'
                    } : {}}
                    onClick={() => handleCellClick(story.id, day.date)}
                    title={isStoryScheduledOnDate(story.id, day.date) 
                      ? `Scheduled for ${format(parseISO(day.date), 'MMM d, yyyy')}` 
                      : `Click to schedule for ${format(parseISO(day.date), 'MMM d, yyyy')}`
                    }
                  >
                    {isStoryScheduledOnDate(story.id, day.date) ? (
                      <div className="flex items-center justify-center">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white dark:bg-gray-300 rounded-full"></div>
                      </div>
                    ) : (
                      <div className="w-2 h-2 sm:w-3 sm:h-3"></div>
                    )}
                  </div>
                ))}
              </div>
            ))}

            {/* Empty state */}
            {sprintStories.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No stories in this sprint</p>
                <p className="text-sm">Add stories to see them in the roadmap</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <AddStoryModal 
        open={showAddStoryModal} 
        onOpenChange={setShowAddStoryModal}
        initialData={{ sprintId: selectedSprint?.id }}
      />

      <EditStoryModal 
        open={showEditStoryModal} 
        onOpenChange={setShowEditStoryModal}
        story={editingStory}
      />

      {/* Story View Modal */}
      {selectedStory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
              <div className="space-y-1">
                <CardTitle className="text-lg">{selectedStory.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{selectedStory.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingStory(selectedStory);
                    setShowEditStoryModal(true);
                    setSelectedStory(null);
                  }}
                  className="gap-1"
                >
                  <Edit className="h-3 w-3" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedStory(null)}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Story Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Priority:</span>
                    <Badge 
                      style={{
                        backgroundColor: `${storySettings.getPriorityColor(selectedStory.priority)}20`,
                        color: storySettings.getPriorityColor(selectedStory.priority),
                        borderColor: `${storySettings.getPriorityColor(selectedStory.priority)}40`
                      }}
                    >
                      {selectedStory.priority}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Weight className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Weight:</span>
                    <span className="text-sm">{selectedStory.weight}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Type:</span>
                    <Badge 
                      style={{
                        backgroundColor: `${storySettings.getTypeColor(selectedStory.type)}20`,
                        color: storySettings.getTypeColor(selectedStory.type),
                        borderColor: `${storySettings.getTypeColor(selectedStory.type)}40`
                      }}
                    >
                      {selectedStory.type}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Size:</span>
                    <Badge 
                      style={{
                        backgroundColor: `${storySettings.getSizeColor(selectedStory.size)}20`,
                        color: storySettings.getSizeColor(selectedStory.size),
                        borderColor: `${storySettings.getSizeColor(selectedStory.size)}40`
                      }}
                    >
                      {selectedStory.size}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {selectedStory.roleId && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Role:</span>
                      <span className="text-sm">{roles.find(r => r.id === selectedStory.roleId)?.name || 'Unknown'}</span>
                    </div>
                  )}
                  
                  {selectedStory.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Location:</span>
                      <span className="text-sm">{selectedStory.location}</span>
                    </div>
                  )}
                  
                  {selectedStory.scheduled && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Scheduled:</span>
                      <span className="text-sm">{format(parseISO(selectedStory.scheduled), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge 
                      style={{
                        backgroundColor: `${storySettings.getStatusColor(selectedStory.status)}20`,
                        color: storySettings.getStatusColor(selectedStory.status),
                        borderColor: `${storySettings.getStatusColor(selectedStory.status)}40`
                      }}
                    >
                      {selectedStory.status}
                    </Badge>
                  </div>
                </div>
              </div>


              {/* Checklist */}
              {selectedStory.checklist && selectedStory.checklist.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Checklist:</h4>
                  <div className="space-y-1">
                    {selectedStory.checklist.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className={`h-4 w-4 ${item.done ? 'text-green-600' : 'text-gray-400'}`} />
                        <span className={`text-sm ${item.done ? 'line-through text-muted-foreground' : ''}`}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  );
}
