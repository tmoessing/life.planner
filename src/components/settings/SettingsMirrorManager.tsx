import { useAtom } from 'jotai';
import { settingsAtom } from '@/stores/settingsStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ColorPicker } from '@/components/ui/color-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Save, RotateCcw } from 'lucide-react';
import type { StoryTypeConfig, Role } from '@/types';

/**
 * Settings Mirror Manager - Complete Settings Management System
 * 
 * This component provides a comprehensive interface for managing all settings
 * that control the mirror system across all components in the app.
 */

interface SettingsMirrorManagerProps {
  onClose?: () => void;
}

export function SettingsMirrorManager({ onClose }: SettingsMirrorManagerProps) {
  const [settings, setSettings] = useAtom(settingsAtom);

  const handleSave = () => {
    // Settings are automatically saved via atomWithStorage
    if (onClose) onClose();
  };

  const handleReset = () => {
    // Reset to default settings - this will trigger the migration function
    setSettings({} as any);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings Mirror System</h1>
          <p className="text-muted-foreground mt-2">
            Configure all settings that control colors, types, and attributes across the entire application.
            Changes are reflected immediately in all components.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="roles" className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="labels">Labels</TabsTrigger>
          <TabsTrigger value="types">Types</TabsTrigger>
          <TabsTrigger value="priorities">Priorities</TabsTrigger>
          <TabsTrigger value="statuses">Statuses</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="ui">UI</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Roles</CardTitle>
              <CardDescription>
                Manage user roles and their associated colors. These are used across all components.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settings.roles.map((role, index) => (
                  <div key={role.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <Label htmlFor={`role-name-${index}`}>Name</Label>
                      <Input
                        id={`role-name-${index}`}
                        value={role.name}
                        onChange={(e) => {
                          const newRoles = [...settings.roles];
                          newRoles[index] = { ...role, name: e.target.value };
                          setSettings({ ...settings, roles: newRoles });
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor={`role-color-${index}`}>Color</Label>
                      <ColorPicker
                        value={role.color}
                        onChange={(color) => {
                          const newRoles = [...settings.roles];
                          newRoles[index] = { ...role, color };
                          setSettings({ ...settings, roles: newRoles });
                        }}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newRoles = settings.roles.filter((_, i) => i !== index);
                        setSettings({ ...settings, roles: newRoles });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    const newRole: Role = {
                      id: `role-${Date.now()}`,
                      name: 'New Role',
                      color: '#6B7280'
                    };
                    setSettings({ ...settings, roles: [...settings.roles, newRole] });
                  }}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Role
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="labels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Labels</CardTitle>
              <CardDescription>
                Manage labels and their associated colors. These are used for tagging items.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settings.labels.map((label, index) => (
                  <div key={label.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <Label htmlFor={`label-name-${index}`}>Name</Label>
                      <Input
                        id={`label-name-${index}`}
                        value={label.name}
                        onChange={(e) => {
                          const newLabels = [...settings.labels];
                          newLabels[index] = { ...label, name: e.target.value };
                          setSettings({ ...settings, labels: newLabels });
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor={`label-color-${index}`}>Color</Label>
                      <ColorPicker
                        value={label.color}
                        onChange={(color) => {
                          const newLabels = [...settings.labels];
                          newLabels[index] = { ...label, color };
                          setSettings({ ...settings, labels: newLabels });
                        }}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newLabels = settings.labels.filter((_, i) => i !== index);
                        setSettings({ ...settings, labels: newLabels });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    const newLabel = {
                      id: `label-${Date.now()}`,
                      name: 'New Label',
                      color: '#6B7280'
                    };
                    setSettings({ ...settings, labels: [...settings.labels, newLabel] });
                  }}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Label
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Story Types</CardTitle>
              <CardDescription>
                Manage story types and their associated colors.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settings.storyTypes.map((type, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <Label htmlFor={`type-name-${index}`}>Name</Label>
                      <Input
                        id={`type-name-${index}`}
                        value={type.name}
                        onChange={(e) => {
                          const newTypes = [...settings.storyTypes];
                          newTypes[index] = { ...type, name: e.target.value };
                          setSettings({ ...settings, storyTypes: newTypes });
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor={`type-color-${index}`}>Color</Label>
                      <ColorPicker
                        value={type.color}
                        onChange={(color) => {
                          const newTypes = [...settings.storyTypes];
                          newTypes[index] = { ...type, color };
                          setSettings({ ...settings, storyTypes: newTypes });
                        }}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newTypes = settings.storyTypes.filter((_, i) => i !== index);
                        setSettings({ ...settings, storyTypes: newTypes });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    const newType: StoryTypeConfig = {
                      name: 'New Type',
                      color: '#6B7280'
                    };
                    setSettings({ ...settings, storyTypes: [...settings.storyTypes, newType] });
                  }}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Type
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="priorities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Priority Colors</CardTitle>
              <CardDescription>
                Configure colors for different priority levels.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(settings.priorityColors).map(([priority, color]) => (
                  <div key={priority} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <Label htmlFor={`priority-${priority}`}>{priority}</Label>
                    </div>
                    <div className="flex-1">
                      <ColorPicker
                        value={color}
                        onChange={(newColor) => {
                          setSettings({
                            ...settings,
                            priorityColors: {
                              ...settings.priorityColors,
                              [priority]: newColor
                            }
                          });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statuses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status Colors</CardTitle>
              <CardDescription>
                Configure colors for different status levels.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(settings.statusColors).map(([status, color]) => (
                  <div key={status} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <Label htmlFor={`status-${status}`}>{status}</Label>
                    </div>
                    <div className="flex-1">
                      <ColorPicker
                        value={color}
                        onChange={(newColor) => {
                          setSettings({
                            ...settings,
                            statusColors: {
                              ...settings.statusColors,
                              [status]: newColor
                            }
                          });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="colors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Chart Colors</CardTitle>
              <CardDescription>
                Configure colors for charts and visualizations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <Label htmlFor="chart-ideal">Ideal Line</Label>
                  </div>
                  <div className="flex-1">
                    <ColorPicker
                      value={settings.chartColors?.ideal || '#8884d8'}
                      onChange={(color) => {
                        setSettings({
                          ...settings,
                          chartColors: {
                            ...settings.chartColors,
                            ideal: color
                          }
                        });
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <Label htmlFor="chart-actual">Actual Line</Label>
                  </div>
                  <div className="flex-1">
                    <ColorPicker
                      value={settings.chartColors?.actual || '#82ca9d'}
                      onChange={(color) => {
                        setSettings({
                          ...settings,
                          chartColors: {
                            ...settings.chartColors,
                            actual: color
                          }
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ui" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>UI Settings</CardTitle>
              <CardDescription>
                Configure UI-related settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <Label htmlFor="theme">Theme</Label>
                  </div>
                  <div className="flex-1">
                    <select
                      id="theme"
                      value={settings.ui?.theme || 'system'}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          ui: {
                            ...settings.ui,
                            theme: e.target.value as 'light' | 'dark' | 'system'
                          }
                        });
                      }}
                      className="w-full p-2 border rounded"
                    >
                      <option value="system">System</option>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>
                Advanced configuration options.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <Label htmlFor="roadmap-color">Roadmap Scheduled Color</Label>
                  </div>
                  <div className="flex-1">
                    <ColorPicker
                      value={settings.roadmapScheduledColor || '#8B5CF6'}
                      onChange={(color) => {
                        setSettings({
                          ...settings,
                          roadmapScheduledColor: color
                        });
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <Label htmlFor="weight-color">Weight Base Color</Label>
                  </div>
                  <div className="flex-1">
                    <ColorPicker
                      value={settings.weightBaseColor || '#3B82F6'}
                      onChange={(color) => {
                        setSettings({
                          ...settings,
                          weightBaseColor: color
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}