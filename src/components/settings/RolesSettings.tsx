import { useState, useRef, useEffect } from 'react';
import { useAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorPicker } from '@/components/ui/color-picker';
import { settingsAtom } from '@/stores/appStore';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';

export function RolesSettings() {
  const [settings, setSettings] = useAtom(settingsAtom);
  
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState({ name: '', color: '#6B7280' });
  const [editRole, setEditRole] = useState({ name: '', color: '#6B7280' });
  const [isLoading, setIsLoading] = useState(false);
  
  const addInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus effects
  useEffect(() => {
    if (isAdding && addInputRef.current) {
      addInputRef.current.focus();
    }
  }, [isAdding]);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  const handleAdd = async () => {
    if (!newRole.name.trim()) return;
    
    setIsLoading(true);
    try {
      const newRoleItem = {
        id: `role-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: newRole.name.trim(),
        color: newRole.color
      };
      setSettings({ ...settings, roles: [...settings.roles, newRoleItem] });
      setNewRole({ name: '', color: '#6B7280' });
      setIsAdding(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (role: any) => {
    setEditingId(role.name);
    setEditRole({ name: role.name, color: role.color });
  };

  const handleUpdate = async (roleName: string) => {
    if (!editRole.name.trim()) return;
    
    setIsLoading(true);
    try {
      const updatedRoles = settings.roles.map(r => 
        r.name === roleName ? { ...r, name: editRole.name.trim(), color: editRole.color } : r
      );
      setSettings({ ...settings, roles: updatedRoles });
      setEditingId(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (roleName: string) => {
    setIsLoading(true);
    try {
      const filteredRoles = settings.roles.filter(r => r.name !== roleName);
      setSettings({ ...settings, roles: filteredRoles });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditRole({ name: '', color: '#6B7280' });
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Roles</CardTitle>
        <CardDescription>
          Manage roles that can be assigned to stories and other items.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Role */}
        {isAdding ? (
          <div className="space-y-3 p-3 border rounded-lg">
            <div className="space-y-2">
              <Input
                ref={addInputRef}
                placeholder="Role name"
                value={newRole.name}
                onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                onKeyPress={(e) => handleKeyPress(e, handleAdd)}
                className="w-full"
                disabled={isLoading}
              />
              <div className="flex items-center gap-2">
                <ColorPicker
                  value={newRole.color}
                  onChange={(color) => setNewRole({ ...newRole, color })}
                />
                <span className="text-sm text-muted-foreground">Color</span>
              </div>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <Button 
                size="sm" 
                onClick={handleAdd}
                disabled={isLoading || !newRole.name.trim()}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setIsAdding(false)}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <Button 
            onClick={() => setIsAdding(true)} 
            className="gap-2"
            disabled={isLoading}
          >
            <Plus className="h-4 w-4" />
            Add Role
          </Button>
        )}

        {/* Roles List */}
        <div className="space-y-2">
          {settings.roles.map((role) => (
            <div key={role.name} className="flex items-center gap-2 p-3 border rounded-lg">
              {editingId === role.name ? (
                <div className="space-y-3 w-full">
                  <div className="space-y-2">
                    <Input
                      ref={editInputRef}
                      value={editRole.name}
                      onChange={(e) => setEditRole({ ...editRole, name: e.target.value })}
                      onKeyPress={(e) => handleKeyPress(e, () => handleUpdate(role.name))}
                      className="w-full"
                      disabled={isLoading}
                    />
                    <div className="flex items-center gap-2">
                      <ColorPicker
                        value={editRole.color}
                        onChange={(color) => setEditRole({ ...editRole, color })}
                      />
                      <span className="text-sm text-muted-foreground">Color</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <Button 
                      size="sm" 
                      onClick={() => handleUpdate(role.name)}
                      disabled={isLoading || !editRole.name.trim()}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleCancelEdit}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: role.color }}
                  />
                  <span className="flex-1">{role.name}</span>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleEdit(role)}
                    disabled={isLoading}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleDelete(role.name)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
