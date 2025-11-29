import { useState } from 'react';
import { useAtom } from 'jotai';
import { storiesAtom, rolesAtom, labelsAtom, visionsAtom, settingsAtom } from '@/stores/appStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle, 
  Calendar, 
  User, 
  Star, 
  MapPin, 
  Tag, 
  Weight
} from 'lucide-react';
import { getWeightGradientColor } from '@/utils';

export function ReviewView() {
  const [stories] = useAtom(storiesAtom);
  const [roles] = useAtom(rolesAtom);
  const [labels] = useAtom(labelsAtom);
  const [visions] = useAtom(visionsAtom);
  const [settings] = useAtom(settingsAtom);
  
  const [searchTerm, setSearchTerm] = useState('');

  // Filter completed stories
  const completedStories = stories.filter(story => {
    // A story is considered completed if it's in the "done" column
    // or if all checklist items are completed
    const allChecklistDone = story.checklist.length > 0 && story.checklist.every(item => item.done);
    return allChecklistDone || story.sprintId; // For now, consider stories with sprintId as potentially completed
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
    const sizeConfig = settings.storySizes?.find(ss => ss.name === size);
    const sizeColor = sizeConfig?.color || '#6B7280';
    return {
      backgroundColor: `${sizeColor}20`,
      color: sizeColor,
      borderColor: `${sizeColor}40`
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            Review
          </h2>
          <p className="text-muted-foreground">
            Review completed stories
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search stories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Completed Stories</p>
                <p className="text-2xl font-bold">{completedStories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Completion Rate</p>
                <p className="text-2xl font-bold">
                  {stories.length > 0 ? Math.round((completedStories.length / stories.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
      </div>

      {/* Stories List */}
      <div className="space-y-4">
        {filteredStories.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No completed stories</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'No stories match your search.' : 'Complete some stories to see them here.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredStories.map((story) => {
            const role = roles.find(r => r.id === story.roleId);
            const vision = visions.find(v => v.id === story.visionId);
            const storyLabels = labels.filter(l => story.labels.includes(l.id));

            return (
              <Card key={story.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{story.title}</CardTitle>
                      {story.description && (
                        <p className="text-muted-foreground mt-1">{story.description}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                        style={getPriorityColor(story.priority)}
                      >
                        {story.priority}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="text-xs flex items-center gap-1"
                        style={{
                          backgroundColor: getWeightGradientColor(story.weight, settings.weightBaseColor),
                          color: 'white',
                          borderColor: getWeightGradientColor(story.weight, settings.weightBaseColor)
                        }}
                      >
                        <Weight className="h-3 w-3" />
                        {story.weight}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Story Details */}
                  <div className="flex flex-wrap gap-2">
                    <Badge 
                      variant="secondary" 
                      className="text-xs"
                      style={getStoryTypeColor(story.type)}
                    >
                      {story.type}
                    </Badge>
                    
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                      style={getStorySizeColor(story.size)}
                    >
                      {story.size}
                    </Badge>
                    
                    {story.taskCategories && story.taskCategories.map((category, index) => (
                      <Badge 
                        key={index}
                        variant="outline" 
                        className="text-xs"
                        style={getTaskCategoryColor(category)}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    {role && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{role.name}</span>
                      </div>
                    )}
                    
                    {vision && (
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        <span>{vision.title}</span>
                      </div>
                    )}
                    
                    {story.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{story.location}</span>
                      </div>
                    )}
                    
                    {story.scheduledDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(story.scheduledDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Labels */}
                  {storyLabels.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {storyLabels.map((label) => (
                        <Badge key={label.id} variant="outline" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {label.name}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Story completed successfully */}
                  <div className="border-t pt-4">
                    <div className="text-center py-4">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-green-600 font-medium">Story completed successfully</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
