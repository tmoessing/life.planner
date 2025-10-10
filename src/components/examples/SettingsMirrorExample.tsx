import React from 'react';
import { useStorySettings, useGoalSettings, useProjectSettings } from '@/utils/settingsMirror';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Settings Mirror Example Component
 * 
 * This component demonstrates how to use the settings mirror system
 * to get colors and configurations from settings instead of hardcoded values.
 * 
 * When settings change, this component automatically reflects those changes.
 */

export const SettingsMirrorExample: React.FC = () => {
  // Get story settings
  const storySettings = useStorySettings();
  
  // Get goal settings  
  const goalSettings = useGoalSettings();
  
  // Get project settings
  const projectSettings = useProjectSettings();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Settings Mirror System Example</h2>
        <p className="text-muted-foreground">
          This component demonstrates how all colors and configurations come from settings.
          Change settings and watch this component update automatically!
        </p>
      </div>

      {/* Story Settings Example */}
      <Card>
        <CardHeader>
          <CardTitle>Story Settings Mirror</CardTitle>
          <CardDescription>
            All colors and types come from settings, not hardcoded values
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Story Types (from settings):</h4>
            <div className="flex flex-wrap gap-2">
              {storySettings.storyTypes.map((type, index) => (
                <Badge
                  key={index}
                  style={{ backgroundColor: type.color }}
                  className="text-white"
                >
                  {type.name}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Story Sizes (from settings):</h4>
            <div className="flex flex-wrap gap-2">
              {storySettings.storySizes.map((size, index) => (
                <Badge
                  key={index}
                  style={{ backgroundColor: size.color }}
                  className="text-white"
                >
                  {size.name} ({size.timeEstimate})
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Status Colors (from settings):</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(storySettings.statusColors).map(([status, color]) => (
                <Badge
                  key={status}
                  style={{ backgroundColor: color }}
                  className="text-white"
                >
                  {status}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Priority Colors (from settings):</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(storySettings.priorityColors).map(([priority, color]) => (
                <Badge
                  key={priority}
                  style={{ backgroundColor: color }}
                  className="text-white"
                >
                  {priority}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goal Settings Example */}
      <Card>
        <CardHeader>
          <CardTitle>Goal Settings Mirror</CardTitle>
          <CardDescription>
            Goal colors and types from settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Goal Types (from settings):</h4>
            <div className="flex flex-wrap gap-2">
              {goalSettings.goalTypes.map((type, index) => (
                <Badge
                  key={index}
                  style={{ backgroundColor: type.color }}
                  className="text-white"
                >
                  {type.name}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Goal Categories (from settings):</h4>
            <div className="flex flex-wrap gap-2">
              {goalSettings.goalCategories.map((category, index) => (
                <Badge
                  key={index}
                  style={{ backgroundColor: category.color }}
                  className="text-white"
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Settings Example */}
      <Card>
        <CardHeader>
          <CardTitle>Project Settings Mirror</CardTitle>
          <CardDescription>
            Project colors and types from settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Project Types (from settings):</h4>
            <div className="flex flex-wrap gap-2">
              {projectSettings.projectTypes.map((type, index) => (
                <Badge
                  key={index}
                  style={{ backgroundColor: type.color }}
                  className="text-white"
                >
                  {type.name}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Project Status Colors (from settings):</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(projectSettings.statusColors).map(([status, color]) => (
                <Badge
                  key={status}
                  style={{ backgroundColor: color }}
                  className="text-white"
                >
                  {status}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Color Helper Example */}
      <Card>
        <CardHeader>
          <CardTitle>Dynamic Color Helper</CardTitle>
          <CardDescription>
            Using the color helper to get colors dynamically
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>
              <strong>Story Type "Spiritual" color:</strong>{' '}
              <Badge style={{ backgroundColor: storySettings.getTypeColor('Spiritual') }} className="text-white">
                {storySettings.getTypeColor('Spiritual')}
              </Badge>
            </p>
            <p>
              <strong>Story Status "done" color:</strong>{' '}
              <Badge style={{ backgroundColor: storySettings.getStatusColor('done') }} className="text-white">
                {storySettings.getStatusColor('done')}
              </Badge>
            </p>
            <p>
              <strong>Story Priority "Q1" color:</strong>{' '}
              <Badge style={{ backgroundColor: storySettings.getPriorityColor('Q1') }} className="text-white">
                {storySettings.getPriorityColor('Q1')}
              </Badge>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
