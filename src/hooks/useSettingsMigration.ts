import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { settingsAtom, rolesAtom } from '@/stores/appStore';

// Manual reset function for debugging - can be called from browser console
if (typeof window !== 'undefined') {
  (window as any).resetGoalTypes = () => {
    const correctGoalTypes = [
      { name: 'Spiritual', color: '#8B5CF6' },
      { name: 'Physical', color: '#EF4444' },
      { name: 'Intellectual', color: '#3B82F6' },
      { name: 'Social', color: '#10B981' },
      { name: 'Financial', color: '#F59E0B' },
      { name: 'Protector', color: '#81E6D9' }
    ];
    
    const currentSettings = JSON.parse(localStorage.getItem('life-planner-settings') || '{}');
    currentSettings.goalTypes = correctGoalTypes;
    localStorage.setItem('life-planner-settings', JSON.stringify(currentSettings));
    return correctGoalTypes;
  };
}

/**
 * Hook to handle settings migration and ensure required settings exist
 */
export function useSettingsMigration() {
  const [settings, setSettings] = useAtom(settingsAtom);
  const [roles, setRoles] = useAtom(rolesAtom);

  useEffect(() => {
    // Clear any old project types from localStorage that might be interfering
    const oldKeys = ['life-scrum-project-types', 'project-types', 'projectTypes'];
    oldKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
      }
    });
    
    const settingsUpdates: Partial<typeof settings> = {};
    let needsUpdate = false;
    
    if (!settings.storySizes) {
      settingsUpdates.storySizes = [
        { name: 'XS', color: '#10B981', timeEstimate: '15 min' },
        { name: 'S', color: '#3B82F6', timeEstimate: '30 min' },
        { name: 'M', color: '#F59E0B', timeEstimate: '1 hour' },
        { name: 'L', color: '#EF4444', timeEstimate: '2-4 hours' },
        { name: 'XL', color: '#8B5CF6', timeEstimate: '1+ days' }
      ];
      needsUpdate = true;
    }
    
    if (!settings.visionTypes) {
      settingsUpdates.visionTypes = [
        { name: 'Spiritual', color: '#8B5CF6' },
        { name: 'Physical', color: '#EF4444' },
        { name: 'Intellectual', color: '#3B82F6' },
        { name: 'Social', color: '#10B981' }
      ];
      needsUpdate = true;
    }
    
    if (!settings.taskCategories) {
      settingsUpdates.taskCategories = [
        { name: 'Decisions', color: '#8B5CF6' },
        { name: 'Actions', color: '#10B981' },
        { name: 'Involve Others', color: '#F59E0B' },
        { name: 'Buying', color: '#EF4444' },
        { name: 'Travel', color: '#3B82F6' }
      ];
      needsUpdate = true;
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
      needsUpdate = true;
    }
    
    if (!settings.goalCategories) {
      settingsUpdates.goalCategories = [
        { name: 'Target', color: '#3B82F6' },
        { name: 'Lifestyle/Value', color: '#10B981' }
      ];
      needsUpdate = true;
    }
    
    if (!settings.goalStatuses) {
      settingsUpdates.goalStatuses = [
        { name: 'Icebox', color: '#6B7280' },
        { name: 'Backlog', color: '#3B82F6' },
        { name: 'To Do', color: '#F59E0B' },
        { name: 'In Progress', color: '#10B981' },
        { name: 'Review', color: '#8B5CF6' },
        { name: 'Done', color: '#22C55E' }
      ];
      needsUpdate = true;
    }
    
    // Check if goal types need updating (only update if different)
    const correctGoalTypes = [
      { name: 'Spiritual', color: '#8B5CF6' },
      { name: 'Physical', color: '#EF4444' },
      { name: 'Intellectual', color: '#3B82F6' },
      { name: 'Social', color: '#10B981' },
      { name: 'Financial', color: '#F59E0B' },
      { name: 'Protector', color: '#81E6D9' }
    ];
    
    const goalTypesChanged = !settings.goalTypes || 
      JSON.stringify(settings.goalTypes) !== JSON.stringify(correctGoalTypes);
    
    if (goalTypesChanged) {
      settingsUpdates.goalTypes = correctGoalTypes;
      needsUpdate = true;
    }
    
    if (!settings.bucketlistTypes) {
      settingsUpdates.bucketlistTypes = [
        { name: 'Location', color: '#3B82F6' },
        { name: 'Experience', color: '#10B981' }
      ];
      needsUpdate = true;
    }
    
    if (!settings.bucketlistPriorityColors) {
      settingsUpdates.bucketlistPriorityColors = {
        'high': '#EF4444', // Red for High Priority
        'medium': '#F59E0B', // Yellow for Medium Priority
        'low': '#6B7280'  // Gray for Low Priority
      };
      needsUpdate = true;
    }
    
    // Always update project types to the new defaults
    const newProjectTypes = [
      { name: 'Code', color: '#3B82F6' },
      { name: 'Organization', color: '#8B5CF6' },
      { name: 'Learning', color: '#10B981' }
    ];
    
    // Always force update project types to ensure they match the new defaults
    const currentProjectTypes = settings.projectTypes || [];
    const hasOldProjectTypes = currentProjectTypes.some(type => 
      type.name === 'Work' || type.name === 'Personal' || type.name === 'Health' || 
      type.name === 'work' || type.name === 'personal' || type.name === 'health'
    );
    
    const needsProjectTypeUpdate = !settings.projectTypes || 
      currentProjectTypes.length !== newProjectTypes.length ||
      !currentProjectTypes.every((type, index) => 
        type.name === newProjectTypes[index]?.name && 
        type.color === newProjectTypes[index]?.color
      ) ||
      hasOldProjectTypes ||
      currentProjectTypes.length !== 3;
    
    // Always update project types to ensure they are correct
    if (needsProjectTypeUpdate) {
      settingsUpdates.projectTypes = newProjectTypes;
      needsUpdate = true;
    }
    
    // Force update project types regardless of current state to ensure they're correct
    settingsUpdates.projectTypes = newProjectTypes;
    needsUpdate = true;
    
    if (!settings.traditionTypes) {
      settingsUpdates.traditionTypes = [
        { name: 'Spiritual', color: '#8B5CF6' },
        { name: 'Physical', color: '#10B981' },
        { name: 'Intellectual', color: '#F59E0B' },
        { name: 'Social', color: '#3B82F6' }
      ];
      needsUpdate = true;
    }
    
    if (!settings.traditionalCategories) {
      settingsUpdates.traditionalCategories = [
        { name: 'Christmas', color: '#EF4444' },
        { name: 'Birthday', color: '#F59E0B' },
        { name: 'New Year', color: '#8B5CF6' },
        { name: 'Easter', color: '#10B981' },
        { name: 'Thanksgiving', color: '#F97316' },
        { name: 'Halloween', color: '#7C3AED' },
        { name: 'Valentine\'s Day', color: '#EC4899' },
        { name: 'Anniversary', color: '#06B6D4' }
      ];
      needsUpdate = true;
    }
    
    if (!settings.importantDateTypes) {
      settingsUpdates.importantDateTypes = [
        { name: 'Birthday', color: '#F59E0B' },
        { name: 'Anniversary', color: '#EC4899' },
        { name: 'Holiday', color: '#EF4444' },
        { name: 'Reminder', color: '#3B82F6' },
        { name: 'Event', color: '#10B981' }
      ];
      needsUpdate = true;
    }
    
    if (needsUpdate) {
      setSettings({ ...settings, ...settingsUpdates });
    }
  }, [setSettings]);

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
  }, [setRoles]);
}
