import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { 
  Story, 
  Sprint, 
  Role, 
  Label, 
  Vision, 
  Goal,
  BucketlistItem,
  Settings, 
  ViewType,
  Column,
  Board,
  Project
} from '@/types';
import { 
  generateSprints, 
  getDefaultSettings, 
  createStory,
  createRole,
  createLabel,
  createVision,
  getCurrentWeek,
  createSprintId,
  filterStories
} from '@/utils';
import { DEFAULT_COLUMNS, DEFAULT_BOARD, STORAGE_KEYS } from '@/constants';

// Initialize default data
const defaultSprints = generateSprints(12);
const defaultSettings = getDefaultSettings();

// Get current week sprint ID for default selection
const getCurrentWeekSprintId = () => {
  const { isoWeek, year } = getCurrentWeek();
  return createSprintId(isoWeek, year);
};
const defaultColumns: Column[] = DEFAULT_COLUMNS;
const defaultBoard: Board = DEFAULT_BOARD;

// Core data atoms with localStorage persistence
export const storiesAtom = atomWithStorage<Story[]>(STORAGE_KEYS.STORIES, []);
export const sprintsAtom = atomWithStorage<Sprint[]>(STORAGE_KEYS.SPRINTS, defaultSprints);
export const projectsAtom = atomWithStorage<Project[]>(STORAGE_KEYS.PROJECTS, []);

// Ensure sprints are never empty - add a fallback
export const safeSprintsAtom = atom(
  (get) => {
    const sprints = get(sprintsAtom);
    return sprints.length > 0 ? sprints : defaultSprints;
  },
  (_, set, newSprints: Sprint[]) => {
    set(sprintsAtom, newSprints.length > 0 ? newSprints : defaultSprints);
  }
);
export const rolesAtom = atomWithStorage<Role[]>(STORAGE_KEYS.ROLES, defaultSettings.roles);
export const labelsAtom = atomWithStorage<Label[]>(STORAGE_KEYS.LABELS, defaultSettings.labels);
export const visionsAtom = atomWithStorage<Vision[]>(STORAGE_KEYS.VISIONS, []);
export const goalsAtom = atomWithStorage<Goal[]>(STORAGE_KEYS.GOALS, []);
export const bucketlistAtom = atomWithStorage<BucketlistItem[]>(STORAGE_KEYS.BUCKETLIST, []);
export const columnsAtom = atomWithStorage<Column[]>(STORAGE_KEYS.COLUMNS, defaultColumns);

// Ensure columns are never empty - add a fallback
export const safeColumnsAtom = atom(
  (get) => {
    const columns = get(columnsAtom);
    return columns.length > 0 ? columns : defaultColumns;
  },
  (_, set, newColumns: Column[]) => {
    set(columnsAtom, newColumns.length > 0 ? newColumns : defaultColumns);
  }
);
export const boardsAtom = atomWithStorage<Board[]>(STORAGE_KEYS.BOARDS, [defaultBoard]);

// Settings atom with migration
const migrateSettings = (settings: any): Settings => {
  // If priorityColors is missing, add it
  if (!settings.priorityColors) {
    settings.priorityColors = {
      'Q1': '#EF4444', // Red for Urgent & Important
      'Q2': '#10B981', // Green for Important, Not Urgent
      'Q3': '#F59E0B', // Yellow for Urgent, Not Important
      'Q4': '#6B7280'  // Gray for Not Urgent, Not Important
    };
  }
  return settings as Settings;
};

// Base settings atom
const baseSettingsAtom = atomWithStorage<Settings>(STORAGE_KEYS.SETTINGS, defaultSettings);

// Settings atom with migration
export const settingsAtom = atom(
  (get) => {
    const settings = get(baseSettingsAtom);
    return migrateSettings(settings);
  },
  (_, set, newSettings: Settings) => {
    set(baseSettingsAtom, newSettings);
  }
);

// UI state atoms
export const currentViewAtom = atomWithStorage<ViewType>(STORAGE_KEYS.CURRENT_VIEW, 'sprint');
export const selectedSprintIdAtom = atomWithStorage<string | undefined>(STORAGE_KEYS.SELECTED_SPRINT, getCurrentWeekSprintId());
export const selectedStoryIdsAtom = atomWithStorage<string[]>(STORAGE_KEYS.SELECTED_STORIES, []);
export const focusedStoryIdAtom = atomWithStorage<string | undefined>(STORAGE_KEYS.FOCUSED_STORY, undefined);

// Filter atoms
export const filterTextAtom = atomWithStorage<string>(STORAGE_KEYS.FILTER_TEXT, '');
export const filterKeywordsAtom = atomWithStorage<string>(STORAGE_KEYS.FILTER_KEYWORDS, '');
export const filterDueSoonAtom = atomWithStorage<boolean>(STORAGE_KEYS.FILTER_DUE_SOON, false);

// Layout atoms
export const chartSectionCollapsedAtom = atomWithStorage<boolean>(STORAGE_KEYS.CHART_COLLAPSED, false);
export const boardSectionCollapsedAtom = atomWithStorage<boolean>(STORAGE_KEYS.BOARD_COLLAPSED, false);
export const roadmapSectionCollapsedAtom = atomWithStorage<boolean>(STORAGE_KEYS.ROADMAP_COLLAPSED, true);
export const chartAboveBoardAtom = atomWithStorage<boolean>(STORAGE_KEYS.CHART_ABOVE_BOARD, false);
export const roadmapPositionAtom = atomWithStorage<'top' | 'middle' | 'bottom'>(STORAGE_KEYS.ROADMAP_POSITION, 'bottom');

// Chart collapse states
export const burndownCollapsedAtom = atomWithStorage<boolean>(STORAGE_KEYS.BURNDOWN_COLLAPSED, false);
export const burnupCollapsedAtom = atomWithStorage<boolean>(STORAGE_KEYS.BURNUP_COLLAPSED, false);

// Derived atoms for computed values
export const currentSprintAtom = atom(
  (get) => {
    const sprints = get(sprintsAtom);
    const selectedId = get(selectedSprintIdAtom);
    
    // First try to find the selected sprint
    let currentSprint = sprints.find(sprint => sprint.id === selectedId);
    
    // If not found, try to find the current week sprint
    if (!currentSprint) {
      const currentWeekId = getCurrentWeekSprintId();
      currentSprint = sprints.find(sprint => sprint.id === currentWeekId);
    }
    
    // Fallback to first sprint if still not found
    return currentSprint || sprints[0];
  }
);

export const filteredStoriesAtom = atom(
  (get) => {
    const stories = get(storiesAtom);
    const text = get(filterTextAtom);
    const keywords = get(filterKeywordsAtom);
    const dueSoon = get(filterDueSoonAtom);
    const roles = get(rolesAtom);
    const labels = get(labelsAtom);
    // const visions = get(visionsAtom);
    
    return filterStories(stories, text, keywords, dueSoon, roles, labels);
  }
);

export const storiesByColumnAtom = atom(
  (get) => {
    const stories = get(storiesAtom);
    const columns = get(columnsAtom);
    const currentSprint = get(currentSprintAtom);
    
    const result: Record<string, Story[]> = {};
    
    columns.forEach(column => {
      result[column.id] = column.storyIds
        .map(id => stories.find(story => story.id === id))
        .filter((story): story is Story => 
          story !== undefined && 
          !story.deleted && 
          story.sprintId === currentSprint?.id
        );
    });
    
    return result;
  }
);

// Sprint-specific stories by status atom
export const sprintStoriesByStatusAtom = atom(
  (get) => {
    const stories = get(storiesAtom);
    const selectedSprintId = get(selectedSprintIdAtom);
    
    
    const statuses = ['icebox', 'backlog', 'todo', 'progress', 'review', 'done'];
    const result: Record<string, Story[]> = {};
    
    statuses.forEach(status => {
      const statusStories = stories.filter(story => 
        !story.deleted && 
        story.sprintId === selectedSprintId &&
        story.status === status
      );
      
      result[status] = statusStories;
    });
    
    return result;
  }
);

// Action atoms
export const addStoryAtom = atom(
  null,
  (get, set, storyData: Partial<Story>, targetStatus?: string) => {
    
    // Only assign to current sprint if sprintId is not provided in the storyData at all
    // If sprintId is explicitly set to undefined, keep it as undefined (no sprint)
    const currentSprint = get(currentSprintAtom);
    const storyDataWithSprint = {
      ...storyData,
      // Only assign to current sprint if sprintId is not a property of storyData
      sprintId: 'sprintId' in storyData ? storyData.sprintId : currentSprint?.id,
      // Set status based on targetStatus or default to backlog
      status: (targetStatus as any) || 'backlog'
    };
    
    console.log('storyDataWithSprint:', storyDataWithSprint);
    
    const newStory = createStory(storyDataWithSprint);
    console.log('newStory created:', newStory);
    
    const currentStories = get(storiesAtom);
    set(storiesAtom, [...currentStories, newStory]);
    console.log('Story added to storiesAtom with status:', newStory.status);
    
    return newStory;
  }
);

export const updateStoryAtom = atom(
  null,
  (get, set, storyId: string, updates: Partial<Story>) => {
    console.log('updateStoryAtom called with:', storyId, updates);
    const stories = get(storiesAtom);
    const updatedStories = stories.map(story => 
      story.id === storyId 
        ? { ...story, ...updates, updatedAt: new Date().toISOString() }
        : story
    );
    console.log('Updated stories:', updatedStories.find(s => s.id === storyId));
    set(storiesAtom, updatedStories);

    // If story is being assigned to a sprint, add it to the backlog column if not already in a column
    if (updates.sprintId && updates.sprintId !== undefined) {
      const columns = get(columnsAtom);
      const story = updatedStories.find(s => s.id === storyId);
      
      // Check if story is already in any column
      const isInAnyColumn = columns.some(col => col.storyIds.includes(storyId));
      
      if (!isInAnyColumn && story) {
        // Add to backlog column by default
        const updatedColumns = columns.map(col => 
          col.id === 'backlog'
            ? { ...col, storyIds: [...col.storyIds, storyId] }
            : col
        );
        set(columnsAtom, updatedColumns);
        console.log('Added story to backlog column:', storyId);
      }
    }
  }
);

export const deleteStoryAtom = atom(
  null,
  (get, set, storyId: string) => {
    const stories = get(storiesAtom);
    const updatedStories = stories.map(story => 
      story.id === storyId 
        ? { ...story, deleted: true, updatedAt: new Date().toISOString() }
        : story
    );
    set(storiesAtom, updatedStories);
  }
);

export const moveStoryAtom = atom(
  null,
  (get, set, storyId: string, toStatus: string) => {
    
    const stories = get(storiesAtom);
    const story = stories.find(s => s.id === storyId);
    
    
    const updatedStories = stories.map(story => 
      story.id === storyId 
        ? { ...story, status: toStatus as any, updatedAt: new Date().toISOString() }
        : story
    );
    
    set(storiesAtom, updatedStories);
  }
);

export const addRoleAtom = atom(
  null,
  (get, set, roleData: Partial<Role>) => {
    const newRole = createRole(roleData);
    const currentRoles = get(rolesAtom);
    set(rolesAtom, [...currentRoles, newRole]);
    return newRole;
  }
);

export const updateRoleAtom = atom(
  null,
  (get, set, roleId: string, updates: Partial<Role>) => {
    const roles = get(rolesAtom);
    const updatedRoles = roles.map(role => 
      role.id === roleId ? { ...role, ...updates } : role
    );
    set(rolesAtom, updatedRoles);
  }
);

export const deleteRoleAtom = atom(
  null,
  (get, set, roleId: string) => {
    const roles = get(rolesAtom);
    const updatedRoles = roles.filter(role => role.id !== roleId);
    set(rolesAtom, updatedRoles);
  }
);

export const addLabelAtom = atom(
  null,
  (get, set, labelData: Partial<Label>) => {
    const newLabel = createLabel(labelData);
    const currentLabels = get(labelsAtom);
    set(labelsAtom, [...currentLabels, newLabel]);
    return newLabel;
  }
);

export const updateLabelAtom = atom(
  null,
  (get, set, labelId: string, updates: Partial<Label>) => {
    const labels = get(labelsAtom);
    const updatedLabels = labels.map(label => 
      label.id === labelId ? { ...label, ...updates } : label
    );
    set(labelsAtom, updatedLabels);
  }
);

export const deleteLabelAtom = atom(
  null,
  (get, set, labelId: string) => {
    const labels = get(labelsAtom);
    const updatedLabels = labels.filter(label => label.id !== labelId);
    set(labelsAtom, updatedLabels);
  }
);

export const addVisionAtom = atom(
  null,
  (get, set, visionData: Partial<Vision>) => {
    const newVision = createVision(visionData);
    const currentVisions = get(visionsAtom);
    set(visionsAtom, [...currentVisions, newVision]);
    return newVision;
  }
);

export const updateVisionAtom = atom(
  null,
  (get, set, visionId: string, updates: Partial<Vision>) => {
    const visions = get(visionsAtom);
    const updatedVisions = visions.map(vision => 
      vision.id === visionId ? { ...vision, ...updates } : vision
    );
    set(visionsAtom, updatedVisions);
  }
);

export const deleteVisionAtom = atom(
  null,
  (get, set, visionId: string) => {
    const visions = get(visionsAtom);
    const updatedVisions = visions.filter(vision => vision.id !== visionId);
    set(visionsAtom, updatedVisions);
  }
);

// Goal management atoms
export const addGoalAtom = atom(
  null,
  (get, set, goalData: Partial<Goal>) => {
    const newGoal: Goal = {
      id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: goalData.title || '',
      description: goalData.description,
      visionId: goalData.visionId,
      category: goalData.category || 'target',
      goalType: goalData.goalType || 'target',
      roleId: goalData.roleId,
      priority: goalData.priority || 'Q1',
      status: goalData.status || 'backlog',
      order: goalData.order || 0,
      storyIds: goalData.storyIds || [],
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const currentGoals = get(goalsAtom);
    set(goalsAtom, [...currentGoals, newGoal]);
    return newGoal;
  }
);

export const updateGoalAtom = atom(
  null,
  (get, set, goalId: string, updates: Partial<Goal>) => {
    const goals = get(goalsAtom);
    const updatedGoals = goals.map(goal => 
      goal.id === goalId ? { ...goal, ...updates, updatedAt: new Date().toISOString() } : goal
    );
    set(goalsAtom, updatedGoals);
  }
);

export const deleteGoalAtom = atom(
  null,
  (get, set, goalId: string) => {
    const goals = get(goalsAtom);
    const updatedGoals = goals.filter(goal => goal.id !== goalId);
    set(goalsAtom, updatedGoals);
  }
);

// Bucketlist management atoms
export const addBucketlistItemAtom = atom(
  null,
  (get, set, itemData: Partial<BucketlistItem>) => {
    const newItem: BucketlistItem = {
      id: `bucketlist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: itemData.title || '',
      description: itemData.description,
      completed: itemData.completed || false,
      completedAt: itemData.completedAt,
      category: itemData.category,
      priority: itemData.priority || 'Q2',
      bucketlistType: itemData.bucketlistType || 'experience',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const currentItems = get(bucketlistAtom);
    set(bucketlistAtom, [...currentItems, newItem]);
    return newItem;
  }
);

export const updateBucketlistItemAtom = atom(
  null,
  (get, set, itemId: string, updates: Partial<BucketlistItem>) => {
    const items = get(bucketlistAtom);
    const updatedItems = items.map(item => 
      item.id === itemId ? { 
        ...item, 
        ...updates, 
        updatedAt: new Date().toISOString(),
        completedAt: updates.completed ? new Date().toISOString() : item.completedAt
      } : item
    );
    set(bucketlistAtom, updatedItems);
  }
);

export const deleteBucketlistItemAtom = atom(
  null,
  (get, set, itemId: string) => {
    const items = get(bucketlistAtom);
    const updatedItems = items.filter(item => item.id !== itemId);
    set(bucketlistAtom, updatedItems);
  }
);

export const reorderVisionsAtom = atom(
  null,
  (get, set, visionIds: string[]) => {
    const visions = get(visionsAtom);
    const reorderedVisions = visionIds.map((id, index) => {
      const vision = visions.find(v => v.id === id);
      return vision ? { ...vision, order: index } : null;
    }).filter((vision): vision is Vision => vision !== null);
    
    set(visionsAtom, reorderedVisions);
  }
);

// Export/Import atoms
export const exportDataAtom = atom(
  (get) => {
    return {
      stories: get(storiesAtom),
      sprints: get(sprintsAtom),
      roles: get(rolesAtom),
      labels: get(labelsAtom),
      visions: get(visionsAtom),
      projects: get(projectsAtom),
      columns: get(columnsAtom),
      boards: get(boardsAtom),
      settings: get(settingsAtom),
      exportDate: new Date().toISOString()
    };
  }
);

export const importDataAtom = atom(
  null,
  (_, set, data: any) => {
    if (data.stories) set(storiesAtom, data.stories);
    // Only set sprints if they exist and are not empty
    if (data.sprints && data.sprints.length > 0) {
      set(sprintsAtom, data.sprints);
    }
    if (data.roles) set(rolesAtom, data.roles);
    if (data.labels) set(labelsAtom, data.labels);
    if (data.visions) set(visionsAtom, data.visions);
    // Only set columns if they exist and are not empty
    if (data.columns && data.columns.length > 0) {
      set(columnsAtom, data.columns);
    }
    // Only set boards if they exist and are not empty
    if (data.boards && data.boards.length > 0) {
      set(boardsAtom, data.boards);
    }
    if (data.projects) set(projectsAtom, data.projects);
    if (data.settings) set(settingsAtom, data.settings);
  }
);

// Project action atoms
export const addProjectAtom = atom(
  null,
  (get, set, projectData: Partial<Project>) => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: projectData.name || '',
      description: projectData.description || '',
      status: projectData.status || 'Backlog',
      priority: projectData.priority || 'Q2',
      order: projectData.order || 0,
      startDate: projectData.startDate || new Date().toISOString().split('T')[0],
      endDate: projectData.endDate || '',
      storyIds: projectData.storyIds || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const currentProjects = get(projectsAtom);
    set(projectsAtom, [...currentProjects, newProject]);
    return newProject;
  }
);

export const updateProjectAtom = atom(
  null,
  (get, set, projectId: string, updates: Partial<Project>) => {
    const projects = get(projectsAtom);
    const updatedProjects = projects.map(project => 
      project.id === projectId 
        ? { ...project, ...updates, updatedAt: new Date().toISOString() }
        : project
    );
    set(projectsAtom, updatedProjects);
  }
);

export const deleteProjectAtom = atom(
  null,
  (get, set, projectId: string) => {
    const projects = get(projectsAtom);
    const updatedProjects = projects.filter(project => project.id !== projectId);
    set(projectsAtom, updatedProjects);
  }
);

// Bulk delete atoms for Settings
export const deleteAllStoriesAtom = atom(
  null,
  (get, set) => {
    set(storiesAtom, []);
  }
);

export const deleteAllGoalsAtom = atom(
  null,
  (get, set) => {
    set(goalsAtom, []);
  }
);

export const deleteAllProjectsAtom = atom(
  null,
  (get, set) => {
    set(projectsAtom, []);
  }
);

export const deleteAllVisionsAtom = atom(
  null,
  (get, set) => {
    set(visionsAtom, []);
  }
);

export const deleteAllBucketlistAtom = atom(
  null,
  (get, set) => {
    set(bucketlistAtom, []);
  }
);

export const deleteAllDataAtom = atom(
  null,
  (get, set) => {
    set(storiesAtom, []);
    set(goalsAtom, []);
    set(projectsAtom, []);
    set(visionsAtom, []);
    set(bucketlistAtom, []);
    set(rolesAtom, []);
    set(labelsAtom, []);
    set(columnsAtom, []);
    set(boardsAtom, []);
    set(sprintsAtom, []);
  }
);

export const addStoryToProjectAtom = atom(
  null,
  (get, set, projectId: string, storyId: string) => {
    const projects = get(projectsAtom);
    const updatedProjects = projects.map(project => 
      project.id === projectId 
        ? { ...project, storyIds: [...project.storyIds, storyId], updatedAt: new Date().toISOString() }
        : project
    );
    set(projectsAtom, updatedProjects);
  }
);

export const removeStoryFromProjectAtom = atom(
  null,
  (get, set, projectId: string, storyId: string) => {
    const projects = get(projectsAtom);
    const updatedProjects = projects.map(project => 
      project.id === projectId 
        ? { ...project, storyIds: (project.storyIds || []).filter(id => id !== storyId), updatedAt: new Date().toISOString() }
        : project
    );
    set(projectsAtom, updatedProjects);
  }
);

// Goal-Story management atoms
export const addStoryToGoalAtom = atom(
  null,
  (get, set, goalId: string, storyId: string) => {
    const goals = get(goalsAtom);
    const updatedGoals = goals.map(goal => 
      goal.id === goalId 
        ? { ...goal, storyIds: [...(goal.storyIds || []), storyId], updatedAt: new Date().toISOString() }
        : goal
    );
    set(goalsAtom, updatedGoals);
  }
);

export const removeStoryFromGoalAtom = atom(
  null,
  (get, set, goalId: string, storyId: string) => {
    const goals = get(goalsAtom);
    const updatedGoals = goals.map(goal => 
      goal.id === goalId 
        ? { ...goal, storyIds: (goal.storyIds || []).filter(id => id !== storyId), updatedAt: new Date().toISOString() }
        : goal
    );
    set(goalsAtom, updatedGoals);
  }
);