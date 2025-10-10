import React from 'react';
import { useStorySettings } from '@/utils/settingsMirror';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Settings Mirror Test Component
 * 
 * This component tests that the settings mirror system is working correctly
 * and shows all available story types from settings.
 */

export const SettingsMirrorTest: React.FC = () => {
  const storySettings = useStorySettings();

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Settings Mirror System Test</CardTitle>
        <CardDescription>
          This component shows all story types from the settings mirror system.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Available Story Types (from settings):</h4>
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
          <h4 className="font-semibold mb-2">Color Helper Test:</h4>
          <div className="space-y-2">
            <p>
              <strong>Spiritual type color:</strong>{' '}
              <Badge style={{ backgroundColor: storySettings.getTypeColor('Spiritual') }} className="text-white">
                {storySettings.getTypeColor('Spiritual')}
              </Badge>
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Status Colors Test:</h4>
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
          <h4 className="font-semibold mb-2">Priority Colors Test:</h4>
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
  );
};
