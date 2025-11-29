import { useState } from 'react';
import { useAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorPicker } from '@/components/ui/color-picker';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { 
  storyStatusesAtom, 
  projectStatusesAtom,
  bucketlistStatusesAtom,
  updateStoryStatusesAtom,
  updateProjectStatusesAtom,
  updateBucketlistStatusesAtom
} from '@/stores/appStore';
import { settingsAtom } from '@/stores/settingsStore';

interface StatusSettingsProps {
  category: 'stories' | 'goals' | 'projects' | 'bucketlist';
}

export function StatusSettings({ category }: StatusSettingsProps) {
  const [storyStatuses] = useAtom(storyStatusesAtom);
  const [projectStatuses] = useAtom(projectStatusesAtom);
  const [bucketlistStatuses] = useAtom(bucketlistStatusesAtom);
  const [, updateStoryStatuses] = useAtom(updateStoryStatusesAtom);
  const [, updateProjectStatuses] = useAtom(updateProjectStatusesAtom);
  const [, updateBucketlistStatuses] = useAtom(updateBucketlistStatusesAtom);
  const [settings, setSettings] = useAtom(settingsAtom);

  const getStatuses = () => {
    switch (category) {
      case 'stories': return storyStatuses;
      case 'goals': return (settings.goalStatuses || []).map(status => ({
        id: status.name.toLowerCase().replace(' ', '-'),
        name: status.name,
        color: status.color,
        description: ''
      }));
      case 'projects': return projectStatuses;
      case 'bucketlist': return bucketlistStatuses;
      default: return [];
    }
  };

  const getUpdateFunction = () => {
    switch (category) {
      case 'stories': return updateStoryStatuses;
      case 'goals': return (newStatuses: any[]) => {
        const goalStatuses = newStatuses.map(status => ({
          name: status.name,
          color: status.color
        }));
        setSettings({ ...settings, goalStatuses });
      };
      case 'projects': return updateProjectStatuses;
      case 'bucketlist': return updateBucketlistStatuses;
      default: return () => {};
    }
  };

  const statuses = getStatuses();
  const updateStatuses = getUpdateFunction();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState({ name: '', color: '#6B7280', description: '' });
  const [editStatus, setEditStatus] = useState({ name: '', color: '#6B7280', description: '' });

  const handleAdd = () => {
    if (newStatus.name.trim()) {
      const status = {
        id: Math.random().toString(36).substr(2, 9),
        name: newStatus.name.trim(),
        color: newStatus.color,
        description: newStatus.description.trim()
      };
      updateStatuses([...statuses, status]);
      setNewStatus({ name: '', color: '#6B7280', description: '' });
      setIsAdding(false);
    }
  };

  const handleEdit = (status: any) => {
    setEditingId(status.id);
    setEditStatus({ name: status.name, color: status.color, description: status.description || '' });
  };

  const handleUpdate = (statusId: string) => {
    if (editStatus.name.trim()) {
      const updatedStatuses = statuses.map(s => 
        s.id === statusId 
          ? { ...s, name: editStatus.name.trim(), color: editStatus.color, description: editStatus.description.trim() }
          : s
      );
      updateStatuses(updatedStatuses);
      setEditingId(null);
    }
  };

  const handleDelete = (statusId: string) => {
    const updatedStatuses = statuses.filter(s => s.id !== statusId);
    updateStatuses(updatedStatuses);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditStatus({ name: '', color: '#6B7280', description: '' });
  };

  const getTitle = () => {
    switch (category) {
      case 'stories': return 'Story Statuses';
      case 'goals': return 'Goal Statuses';
      case 'projects': return 'Project Statuses';
      case 'bucketlist': return 'Bucketlist Statuses';
      default: return 'Statuses';
    }
  };

  const getDescription = () => {
    switch (category) {
      case 'stories': return 'Manage workflow statuses for stories (Icebox, Backlog, To Do, etc.).';
      case 'goals': return 'Manage statuses for goals (Not Started, In Progress, Completed, etc.).';
      case 'projects': return 'Manage statuses for projects (Planning, Active, On Hold, etc.).';
      case 'bucketlist': return 'Manage statuses for bucketlist items (Not Started, In Progress, Completed, etc.).';
      default: return 'Manage workflow statuses.';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{getTitle()}</CardTitle>
        <CardDescription>
          {getDescription()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Status */}
        {isAdding ? (
          <div className="space-y-3 p-3 border rounded-lg">
            <div className="space-y-2">
              <Input
                placeholder="Status name (e.g., In Progress)"
                value={newStatus.name}
                onChange={(e) => setNewStatus({ ...newStatus, name: e.target.value })}
                className="w-full"
              />
              <ColorPicker
                value={newStatus.color}
                onChange={(color) => setNewStatus({ ...newStatus, color })}
                className="w-full"
              />
            </div>
            <Input
              placeholder="Description (e.g., Currently being worked on)"
              value={newStatus.description}
              onChange={(e) => setNewStatus({ ...newStatus, description: e.target.value })}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd}>
                <Check className="h-4 w-4" />
                Add
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsAdding(false)}>
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button onClick={() => setIsAdding(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Status
          </Button>
        )}

        {/* Statuses List */}
        <div className="space-y-2">
          {statuses.map((status) => (
            <div key={status.id} className="p-3 border rounded-lg">
              {editingId === status.id ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Input
                      value={editStatus.name}
                      onChange={(e) => setEditStatus({ ...editStatus, name: e.target.value })}
                      className="w-full"
                    />
                    <ColorPicker
                      value={editStatus.color}
                      onChange={(color) => setEditStatus({ ...editStatus, color })}
                      className="w-full"
                    />
                  </div>
                  <Input
                    value={editStatus.description}
                    onChange={(e) => setEditStatus({ ...editStatus, description: e.target.value })}
                    placeholder="Description"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleUpdate(status.id)}>
                      <Check className="h-4 w-4" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: status.color }}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{status.name}</div>
                    {status.description && (
                      <div className="text-sm text-muted-foreground">{status.description}</div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(status)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(status.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
