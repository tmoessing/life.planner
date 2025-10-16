import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { goalsAtom, addGoalAtom, updateGoalAtom, visionsAtom, rolesAtom, settingsAtom } from '@/stores/appStore';
import { useGoalSettings } from '@/utils/settingsMirror';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Goal, StoryType, Priority } from '@/types';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  goal?: Goal | null;
}

export function GoalModal({ isOpen, onClose, mode, goal }: GoalModalProps) {
  const [goals] = useAtom(goalsAtom);
  const [visions] = useAtom(visionsAtom);
  const [roles] = useAtom(rolesAtom);
  const [settings] = useAtom(settingsAtom);
  const [, addGoal] = useAtom(addGoalAtom);
  const [, updateGoal] = useAtom(updateGoalAtom);

  // Use settings mirror system for goal settings
  const goalSettings = useGoalSettings();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    visionId: 'none',
    category: 'target' as 'target' | 'lifestyle-value',
    goalType: '' as string,
    roleId: 'none',
    priority: undefined as Priority | undefined,
    status: 'icebox' as 'icebox' | 'backlog' | 'todo' | 'in-progress' | 'review' | 'done'
  });

  useEffect(() => {
    if (mode === 'edit' && goal) {
      setFormData({
        title: goal.title,
        description: goal.description || '',
        visionId: goal.visionId || 'none',
        category: goal.category === 'target' || goal.category === 'lifestyle-value' ? goal.category : 'target',
        goalType: goal.goalType || 'target',
        roleId: goal.roleId || 'none',
        priority: goal.priority || 'medium',
        status: goal.status || 'icebox'
      });
    } else {
      setFormData({
        title: '',
        description: '',
        visionId: 'none',
        category: 'target',
        goalType: 'target',
        roleId: 'none',
        priority: undefined,
        status: 'icebox'
      });
    }
  }, [mode, goal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;

    const goalData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      visionId: formData.visionId === 'none' ? undefined : formData.visionId,
      category: formData.category as 'target' | 'lifestyle-value',
      goalType: formData.goalType || 'Spiritual',
      roleId: formData.roleId === 'none' ? undefined : formData.roleId,
      priority: formData.priority,
      status: formData.status,
      order: goals.length
    };

    if (mode === 'add') {
      addGoal(goalData);
    } else if (mode === 'edit' && goal) {
      updateGoal(goal.id, goalData);
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add New Goal' : 'Edit Goal'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add' 
              ? 'Create a new goal to track your progress and achievements.'
              : 'Edit the goal details and manage its properties.'
            }
          </DialogDescription>
        </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter goal title..."
                className="mt-1"
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter goal description..."
                className="mt-1"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Vision</label>
                <Select
                  value={formData.visionId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, visionId: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a vision..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No vision selected</SelectItem>
                    {visions.map((vision) => (
                      <SelectItem key={vision.id} value={vision.id}>
                        {vision.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Goal Category</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as 'target' | 'lifestyle-value' }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {settings.goalCategories?.map((category) => (
                      <SelectItem key={category.name} value={category.name.toLowerCase().replace('/', '-')}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    )) || (
                      <>
                        <SelectItem value="target">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            Target
                          </div>
                        </SelectItem>
                        <SelectItem value="lifestyle-value">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            Lifestyle/Value
                          </div>
                        </SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Goal Type</label>
                <Select
                  value={formData.goalType}
                  onValueChange={(value: string) => setFormData(prev => ({ ...prev, goalType: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select goal type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {goalSettings.goalTypes?.map((goalType) => (
                      <SelectItem key={goalType.name} value={goalType.name}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: goalType.color }}
                          />
                          {goalType.name}
                        </div>
                      </SelectItem>
                    )) || (
                      <>
                        <SelectItem value="target">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            Target
                          </div>
                        </SelectItem>
                        <SelectItem value="lifestyle-value">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            Lifestyle/Value
                          </div>
                        </SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Goal Priority</label>
                <Select
                  value={formData.priority || ""}
                  onValueChange={(value: Priority) => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select Priority..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: goalSettings.getPriorityColor('low') }}></div>
                        <span>Low Priority</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: goalSettings.getPriorityColor('medium') }}></div>
                        <span>Medium Priority</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: goalSettings.getPriorityColor('high') }}></div>
                        <span>High Priority</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Role</label>
              <Select
                value={formData.roleId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, roleId: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a role..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No role selected</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: role.color }}
                        />
                        {role.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select
                value={formData.status}
                onValueChange={(value: 'icebox' | 'backlog' | 'todo' | 'in-progress' | 'review' | 'done') => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {settings.goalStatuses?.map((status) => {
                    const statusId = status.name.toLowerCase().replace(' ', '-');
                    return (
                      <SelectItem key={statusId} value={statusId}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: status.color }}
                          />
                          {status.name}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={!formData.title.trim()}>
                {mode === 'add' ? 'Add Goal' : 'Update Goal'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
      </DialogContent>
    </Dialog>
  );
}
