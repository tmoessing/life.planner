import { useAtom } from 'jotai';
import { 
  currentSprintAtom, 
  safeSprintsAtom,
  selectedSprintIdAtom,
  storiesAtom,
  updateStoryAtom,
  rolesAtom,
  labelsAtom,
  visionsAtom,
  settingsAtom
} from '@/stores/appStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle, 
  User, 
  MapPin, 
  Weight
} from 'lucide-react';
import { getWeightGradientColor } from '@/utils';
import type { Story } from '@/types';
import { useState } from 'react';

export function SprintReviewView() {
  const [currentSprint] = useAtom(currentSprintAtom);
  const [sprints] = useAtom(safeSprintsAtom);
  const [selectedSprintId] = useAtom(selectedSprintIdAtom);
  const [stories] = useAtom(storiesAtom);
  const [, updateStory] = useAtom(updateStoryAtom);
  const [roles] = useAtom(rolesAtom);
  const [labels] = useAtom(labelsAtom);
  const [visions] = useAtom(visionsAtom);
  const [settings] = useAtom(settingsAtom);
  
  // Get the selected sprint or fall back to current sprint
  const selectedSprint = sprints.find(sprint => sprint.id === selectedSprintId) || currentSprint;
  
  const [searchTerm, setSearchTerm] = useState('');

  // Filter completed stories for the selected sprint
  const completedStories = stories.filter(story => {
    // A story is considered completed if it's in the "done" status and belongs to the selected sprint
    const allChecklistDone = story.checklist.length > 0 && story.checklist.every(item => item.done);
    return (allChecklistDone || story.status === 'done') && story.sprintId === selectedSprint?.id;
  });

  // Filter by search term
  const filteredStories = completedStories.filter(story =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    story.description.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const getTaskCategoryColor = (category: string) => {
    const taskCategory = settings.taskCategories?.find(tc => tc.name === category);
    const color = taskCategory?.color || '#6B7280';
    return {
      backgroundColor: color,
      color: 'white',
      borderColor: color
    };
  };

  const getPriorityColor = (priority: string) => {
    const priorityColors = settings.priorityColors || {};
    return {
      backgroundColor: `${priorityColors[priority as keyof typeof priorityColors] || '#6B7280'}20`,
      color: priorityColors[priority as keyof typeof priorityColors] || '#6B7280',
      borderColor: `${priorityColors[priority as keyof typeof priorityColors] || '#6B7280'}40`
    };
  };

  const getStoryTypeColor = (type: string) => {
    const storyType = settings.storyTypes?.find(st => st.name === type);
    const typeColor = storyType?.color || '#6B7280';
    return {
      backgroundColor: `${typeColor}20`,
      color: typeColor,
      borderColor: `${typeColor}40`
    };
  };

  const getStorySizeColor = (size: string) => {
    const sizeColors = settings.sizeColors || {};
    return {
      backgroundColor: `${sizeColors[size as keyof typeof sizeColors] || '#6B7280'}20`,
      color: sizeColors[size as keyof typeof sizeColors] || '#6B7280',
      borderColor: `${sizeColors[size as keyof typeof sizeColors] || '#6B7280'}40`
    };
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Sprint Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="flex-1">
            <h2 className="text-lg sm:text-2xl font-bold">
              {selectedSprint ? `Week ${selectedSprint.isoWeek} - ${selectedSprint.year} Review` : 'Select Sprint'}
            </h2>
            {selectedSprint && (
              <p className="text-sm text-muted-foreground">
                {new Date(selectedSprint.startDate).toLocaleDateString()} - {new Date(selectedSprint.endDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-4 text-sm">
          <span className="text-green-600 font-medium">
            {completedStories.length} completed stories
          </span>
          <span className="text-gray-500">
            {filteredStories.length} shown
          </span>
        </div>
        
        <div className="w-full sm:w-64">
          <Input
            placeholder="Search stories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* Stories List */}
      <div className="space-y-4">
        {filteredStories.map((story) => (
          <Card key={story.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{story.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mb-3">{story.description}</p>
                  
                  {/* Story metadata */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge style={getPriorityColor(story.priority)}>
                      {story.priority}
                    </Badge>
                    <Badge style={getStoryTypeColor(story.type)}>
                      {story.type}
                    </Badge>
                    <Badge style={getStorySizeColor(story.size)}>
                      {story.size}
                    </Badge>
                    <Badge variant="outline">
                      <Weight className="h-3 w-3 mr-1" />
                      {story.weight}
                    </Badge>
                    {story.roleId && (
                      <Badge variant="outline">
                        <User className="h-3 w-3 mr-1" />
                        {roles.find(r => r.id === story.roleId)?.name || 'Unknown Role'}
                      </Badge>
                    )}
                    {story.location && (
                      <Badge variant="outline">
                        <MapPin className="h-3 w-3 mr-1" />
                        {story.location}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Story completed successfully */}
              <div className="text-center py-4">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-green-600 font-medium">Story completed successfully</p>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredStories.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">
              {searchTerm ? 'No stories match your search' : 'No completed stories in this sprint'}
            </p>
            <p className="text-sm">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Complete some stories to see them here'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
