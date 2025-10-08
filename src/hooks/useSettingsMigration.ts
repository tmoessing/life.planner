import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { settingsAtom, rolesAtom } from '@/stores/appStore';

/**
 * Hook to handle settings migration and ensure required settings exist
 */
export function useSettingsMigration() {
  const [settings, setSettings] = useAtom(settingsAtom);
  const [roles, setRoles] = useAtom(rolesAtom);

  useEffect(() => {
    const settingsUpdates: Partial<typeof settings> = {};
    
    if (!settings.storySizes) {
      settingsUpdates.storySizes = [
        { name: 'XS', color: '#10B981', timeEstimate: '15 min' },
        { name: 'S', color: '#3B82F6', timeEstimate: '30 min' },
        { name: 'M', color: '#F59E0B', timeEstimate: '1 hour' },
        { name: 'L', color: '#EF4444', timeEstimate: '2-4 hours' },
        { name: 'XL', color: '#8B5CF6', timeEstimate: '1+ days' }
      ];
    }
    
    if (!settings.visionTypes) {
      settingsUpdates.visionTypes = [
        { name: 'Spiritual', color: '#8B5CF6' },
        { name: 'Physical', color: '#EF4444' },
        { name: 'Intellectual', color: '#3B82F6' },
        { name: 'Social', color: '#10B981' }
      ];
    }
    
    if (!settings.taskCategories) {
      settingsUpdates.taskCategories = [
        { name: 'Decisions', color: '#8B5CF6' },
        { name: 'Actions', color: '#10B981' },
        { name: 'Involve Others', color: '#F59E0B' }
      ];
    }
    
    if (!settings.statusColors) {
      settingsUpdates.statusColors = {
        'icebox': '#6B7280',    // Gray
        'backlog': '#3B82F6',   // Blue
        'todo': '#F59E0B',      // Yellow
        'progress': '#F97316',  // Orange
        'review': '#8B5CF6',    // Purple
        'done': '#10B981'       // Green
      };
    }
    
    if (!settings.goalCategories) {
      settingsUpdates.goalCategories = [
        { name: 'Target', color: '#3B82F6' },
        { name: 'Lifestyle/Value', color: '#10B981' }
      ];
    }
    
    if (!settings.goalTypes) {
      settingsUpdates.goalTypes = [
        { name: 'Spiritual', color: '#8B5CF6' },
        { name: 'Physical', color: '#EF4444' },
        { name: 'Intellectual', color: '#3B82F6' },
        { name: 'Social', color: '#10B981' },
        { name: 'Financial', color: '#F59E0B' },
        { name: 'Protector', color: '#EF4444' }
      ];
    }
    
    if (!settings.bucketlistTypes) {
      settingsUpdates.bucketlistTypes = [
        { name: 'Location', color: '#3B82F6' },
        { name: 'Experience', color: '#10B981' }
      ];
    }
    
    if (Object.keys(settingsUpdates).length > 0) {
      setSettings({ ...settings, ...settingsUpdates });
    }
  }, [settings, setSettings]);

  // Role migration: Add missing default roles
  useEffect(() => {
    const defaultRoles = [
      { id: 'disciple', name: 'Disciple of Christ', color: '#8B5CF6' },
      { id: 'individual', name: 'Individual/Development', color: '#3B82F6' },
      { id: 'family', name: 'Family Member', color: '#F59E0B' },
      { id: 'friend', name: 'Friend', color: '#10B981' },
      { id: 'student', name: 'Student', color: '#3B82F6' },
      { id: 'employer', name: 'Employer', color: '#EF4444' },
      { id: 'future-employer', name: 'Future Employer', color: '#8B5CF6' }
    ];

    const missingRoles = defaultRoles.filter(defaultRole => 
      !roles.some(existingRole => existingRole.id === defaultRole.id)
    );

    if (missingRoles.length > 0) {
      setRoles([...roles, ...missingRoles]);
    }
  }, [roles, setRoles]);
}
