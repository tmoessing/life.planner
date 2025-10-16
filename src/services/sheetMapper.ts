import type { 
  Story, 
  Goal, 
  Project, 
  Vision, 
  BucketlistItem, 
  ImportantDate, 
  Tradition, 
  Sprint,
  Settings 
} from '@/types';

// Column schemas for each entity type
export const SHEET_SCHEMAS = {
  Stories: [
    'id', 'title', 'description', 'labels', 'priority', 'weight', 'size', 'type', 'status',
    'roleId', 'visionId', 'projectId', 'dueDate', 'sprintId', 'scheduled', 'taskCategories',
    'scheduledDate', 'location', 'goalId', 'checklist', 'createdAt', 'updatedAt', 'deleted',
    'repeat', 'subtasks'
  ],
  Goals: [
    'id', 'title', 'name', 'description', 'visionId', 'category', 'goalType', 'roleId',
    'priority', 'status', 'order', 'storyIds', 'projectId', 'completed', 'createdAt', 'updatedAt'
  ],
  Projects: [
    'id', 'name', 'description', 'status', 'priority', 'type', 'roleId', 'visionId',
    'order', 'startDate', 'endDate', 'storyIds', 'createdAt', 'updatedAt'
  ],
  Visions: [
    'id', 'title', 'name', 'description', 'type', 'order'
  ],
  Bucketlist: [
    'id', 'title', 'description', 'completed', 'completedAt', 'category', 'priority',
    'bucketlistType', 'status', 'roleId', 'visionId', 'dueDate', 'order', 'country',
    'state', 'city', 'experienceCategory', 'createdAt', 'updatedAt'
  ],
  ImportantDates: [
    'id', 'title', 'date', 'endDate', 'isRequired', 'category', 'createdAt', 'updatedAt'
  ],
  Traditions: [
    'id', 'title', 'description', 'traditionType', 'traditionalCategory', 'createdAt', 'updatedAt'
  ],
  Sprints: [
    'id', 'isoWeek', 'year', 'startDate', 'endDate'
  ],
  Settings: [
    'key', 'value'
  ]
} as const;

// Type for sheet names
export type SheetName = keyof typeof SHEET_SCHEMAS;

// Validation functions
export const validateStory = (story: any): story is Story => {
  return (
    typeof story.id === 'string' &&
    typeof story.title === 'string' &&
    typeof story.description === 'string' &&
    Array.isArray(story.labels) &&
    typeof story.priority === 'string' &&
    typeof story.weight === 'number' &&
    typeof story.size === 'string' &&
    typeof story.type === 'string' &&
    typeof story.status === 'string' &&
    Array.isArray(story.checklist) &&
    typeof story.createdAt === 'string' &&
    typeof story.updatedAt === 'string'
  );
};

export const validateGoal = (goal: any): goal is Goal => {
  return (
    typeof goal.id === 'string' &&
    typeof goal.title === 'string' &&
    typeof goal.category === 'string' &&
    typeof goal.goalType === 'string' &&
    typeof goal.priority === 'string' &&
    typeof goal.status === 'string' &&
    typeof goal.order === 'number' &&
    Array.isArray(goal.storyIds) &&
    typeof goal.completed === 'boolean' &&
    typeof goal.createdAt === 'string' &&
    typeof goal.updatedAt === 'string'
  );
};

export const validateProject = (project: any): project is Project => {
  return (
    typeof project.id === 'string' &&
    typeof project.name === 'string' &&
    typeof project.description === 'string' &&
    typeof project.status === 'string' &&
    typeof project.priority === 'string' &&
    typeof project.order === 'number' &&
    Array.isArray(project.storyIds) &&
    typeof project.createdAt === 'string' &&
    typeof project.updatedAt === 'string'
  );
};

export const validateImportantDate = (importantDate: any): importantDate is ImportantDate => {
  return (
    typeof importantDate.id === 'string' &&
    typeof importantDate.title === 'string' &&
    typeof importantDate.date === 'string' &&
    (importantDate.endDate === undefined || typeof importantDate.endDate === 'string') &&
    (importantDate.isRequired === undefined || typeof importantDate.isRequired === 'boolean') &&
    (importantDate.category === undefined || typeof importantDate.category === 'string') &&
    typeof importantDate.createdAt === 'string' &&
    typeof importantDate.updatedAt === 'string'
  );
};

export const validateVision = (vision: any): vision is Vision => {
  return (
    typeof vision.id === 'string' &&
    typeof vision.title === 'string' &&
    typeof vision.type === 'string' &&
    typeof vision.order === 'number'
  );
};

export const validateBucketlistItem = (item: any): item is BucketlistItem => {
  return (
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.completed === 'boolean' &&
    typeof item.priority === 'string' &&
    typeof item.bucketlistType === 'string' &&
    typeof item.createdAt === 'string' &&
    typeof item.updatedAt === 'string'
  );
};


export const validateTradition = (tradition: any): tradition is Tradition => {
  return (
    typeof tradition.id === 'string' &&
    typeof tradition.title === 'string' &&
    typeof tradition.description === 'string' &&
    typeof tradition.traditionType === 'string' &&
    typeof tradition.traditionalCategory === 'string' &&
    typeof tradition.createdAt === 'string' &&
    typeof tradition.updatedAt === 'string'
  );
};

export const validateSprint = (sprint: any): sprint is Sprint => {
  return (
    typeof sprint.id === 'string' &&
    typeof sprint.isoWeek === 'number' &&
    typeof sprint.year === 'number' &&
    typeof sprint.startDate === 'string' &&
    typeof sprint.endDate === 'string'
  );
};

// Data transformation utilities
export class SheetMapper {
  // Convert sheet row to Story
  static rowToStory(row: any[]): Story {
    return {
      id: row[0] || '',
      title: row[1] || '',
      description: row[2] || '',
      labels: this.parseJsonArray(row[3]),
      priority: row[4] as any || 'medium',
      weight: this.parseInt(row[5], 1) as 1 | 3 | 5 | 8 | 13 | 21,
      size: row[6] as any || 'M',
      type: row[7] || '',
      status: row[8] as any || 'backlog',
      roleId: row[9] || undefined,
      visionId: row[10] || undefined,
      projectId: row[11] || undefined,
      dueDate: row[12] || undefined,
      sprintId: row[13] || undefined,
      scheduled: row[14] || undefined,
      taskCategories: this.parseJsonArray(row[15]),
      scheduledDate: row[16] || undefined,
      location: row[17] || undefined,
      goalId: row[18] || undefined,
      checklist: this.parseJsonArray(row[19]) || [],
      createdAt: row[20] || new Date().toISOString(),
      updatedAt: row[21] || new Date().toISOString(),
      deleted: row[22] === 'true',
      repeat: this.parseJson(row[23]),
      subtasks: this.parseJsonArray(row[24])
    };
  }

  // Convert Story to sheet row
  static storyToRow(story: Story): any[] {
    return [
      story.id,
      story.title,
      story.description,
      this.stringifyJson(story.labels),
      story.priority,
      story.weight,
      story.size,
      story.type,
      story.status,
      story.roleId || '',
      story.visionId || '',
      story.projectId || '',
      story.dueDate || '',
      story.sprintId || '',
      story.scheduled || '',
      this.stringifyJson(story.taskCategories),
      story.scheduledDate || '',
      story.location || '',
      story.goalId || '',
      this.stringifyJson(story.checklist),
      story.createdAt,
      story.updatedAt,
      story.deleted ? 'true' : 'false',
      this.stringifyJson(story.repeat),
      this.stringifyJson(story.subtasks)
    ];
  }

  // Convert sheet row to Goal
  static rowToGoal(row: any[]): Goal {
    return {
      id: row[0] || '',
      title: row[1] || '',
      name: row[2] || row[1] || '',
      description: row[3] || undefined,
      visionId: row[4] || undefined,
      category: row[5] as any || 'target',
      goalType: row[6] || '',
      roleId: row[7] || undefined,
      priority: row[8] as any || 'medium',
      status: row[9] as any || 'icebox',
      order: this.parseInt(row[10], 0),
      storyIds: this.parseJsonArray(row[11]) || [],
      projectId: row[12] || undefined,
      completed: row[13] === 'true',
      createdAt: row[14] || new Date().toISOString(),
      updatedAt: row[15] || new Date().toISOString()
    };
  }

  // Convert Goal to sheet row
  static goalToRow(goal: Goal): any[] {
    return [
      goal.id,
      goal.title,
      goal.name,
      goal.description || '',
      goal.visionId || '',
      goal.category,
      goal.goalType,
      goal.roleId || '',
      goal.priority,
      goal.status,
      goal.order,
      this.stringifyJson(goal.storyIds || []),
      goal.projectId || '',
      goal.completed ? 'true' : 'false',
      goal.createdAt,
      goal.updatedAt
    ];
  }

  // Convert sheet row to Project
  static rowToProject(row: any[]): Project {
    return {
      id: row[0] || '',
      name: row[1] || '',
      description: row[2] || '',
      status: row[3] as any || 'Icebox',
      priority: row[4] as any || 'medium',
      type: row[5] || undefined,
      roleId: row[6] || undefined,
      visionId: row[7] || undefined,
      order: this.parseInt(row[8], 0),
      startDate: row[9] || undefined,
      endDate: row[10] || undefined,
      storyIds: this.parseJsonArray(row[11]) || [],
      createdAt: row[12] || new Date().toISOString(),
      updatedAt: row[13] || new Date().toISOString()
    };
  }

  // Convert Project to sheet row
  static projectToRow(project: Project): any[] {
    return [
      project.id,
      project.name,
      project.description,
      project.status,
      project.priority,
      project.type || '',
      project.roleId || '',
      project.visionId || '',
      project.order,
      project.startDate || '',
      project.endDate || '',
      this.stringifyJson(project.storyIds),
      project.createdAt,
      project.updatedAt
    ];
  }

  // Convert sheet row to Vision
  static rowToVision(row: any[]): Vision {
    return {
      id: row[0] || '',
      title: row[1] || '',
      name: row[2] || row[1] || '',
      description: row[3] || undefined,
      type: row[4] || '',
      order: this.parseInt(row[5], 0)
    };
  }

  // Convert Vision to sheet row
  static visionToRow(vision: Vision): any[] {
    return [
      vision.id,
      vision.title,
      vision.name,
      vision.description || '',
      vision.type,
      vision.order
    ];
  }

  // Convert sheet row to BucketlistItem
  static rowToBucketlistItem(row: any[]): BucketlistItem {
    return {
      id: row[0] || '',
      title: row[1] || '',
      description: row[2] || undefined,
      completed: row[3] === 'true',
      completedAt: row[4] || undefined,
      category: row[5] || undefined,
      priority: row[6] as any || 'medium',
      bucketlistType: row[7] as any || 'experience',
      status: row[8] as any || undefined,
      roleId: row[9] || undefined,
      visionId: row[10] || undefined,
      dueDate: row[11] || undefined,
      order: this.parseInt(row[12], 0),
      country: row[13] || undefined,
      state: row[14] || undefined,
      city: row[15] || undefined,
      experienceCategory: row[16] || undefined,
      createdAt: row[17] || new Date().toISOString(),
      updatedAt: row[18] || new Date().toISOString()
    };
  }

  // Convert BucketlistItem to sheet row
  static bucketlistItemToRow(item: BucketlistItem): any[] {
    return [
      item.id,
      item.title,
      item.description || '',
      item.completed ? 'true' : 'false',
      item.completedAt || '',
      item.category || '',
      item.priority,
      item.bucketlistType,
      item.status || '',
      item.roleId || '',
      item.visionId || '',
      item.dueDate || '',
      item.order || '',
      item.country || '',
      item.state || '',
      item.city || '',
      item.experienceCategory || '',
      item.createdAt,
      item.updatedAt
    ];
  }

  // Convert sheet row to ImportantDate
  static rowToImportantDate(row: any[]): ImportantDate {
    return {
      id: row[0] || '',
      title: row[1] || '',
      date: row[2] || '',
      createdAt: row[3] || new Date().toISOString(),
      updatedAt: row[4] || new Date().toISOString()
    };
  }

  // Convert ImportantDate to sheet row
  static importantDateToRow(date: ImportantDate): any[] {
    return [
      date.id,
      date.title,
      date.date,
      date.createdAt,
      date.updatedAt
    ];
  }

  // Convert sheet row to Tradition
  static rowToTradition(row: any[]): Tradition {
    return {
      id: row[0] || '',
      title: row[1] || '',
      description: row[2] || '',
      traditionType: row[3] || '',
      traditionalCategory: row[4] || '',
      createdAt: row[5] || new Date().toISOString(),
      updatedAt: row[6] || new Date().toISOString()
    };
  }

  // Convert Tradition to sheet row
  static traditionToRow(tradition: Tradition): any[] {
    return [
      tradition.id,
      tradition.title,
      tradition.description,
      tradition.traditionType,
      tradition.traditionalCategory,
      tradition.createdAt,
      tradition.updatedAt
    ];
  }

  // Convert sheet row to Sprint
  static rowToSprint(row: any[]): Sprint {
    return {
      id: row[0] || '',
      isoWeek: this.parseInt(row[1], 1),
      year: this.parseInt(row[2], new Date().getFullYear()),
      startDate: row[3] || '',
      endDate: row[4] || ''
    };
  }

  // Convert Sprint to sheet row
  static sprintToRow(sprint: Sprint): any[] {
    return [
      sprint.id,
      sprint.isoWeek,
      sprint.year,
      sprint.startDate,
      sprint.endDate
    ];
  }

  // Convert Settings object to key-value pairs
  static settingsToRows(settings: Settings): { key: string; value: string }[] {
    return Object.entries(settings).map(([key, value]) => ({
      key,
      value: this.stringifyJson(value)
    }));
  }

  // Convert key-value pairs to Settings object
  static rowsToSettings(rows: { key: string; value: string }[]): Settings {
    const settings: any = {};
    rows.forEach(({ key, value }) => {
      try {
        settings[key] = this.parseJson(value);
      } catch {
        settings[key] = value;
      }
    });
    return settings as Settings;
  }

  // Helper methods
  private static parseJson(str: string | undefined): any {
    if (!str) return undefined;
    try {
      return JSON.parse(str);
    } catch {
      return undefined;
    }
  }

  private static parseJsonArray(str: string | undefined): any[] {
    if (!str) return [];
    try {
      const parsed = JSON.parse(str);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private static parseInt(str: string | undefined, defaultValue: number): number {
    if (!str) return defaultValue;
    const parsed = parseInt(str, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  private static stringifyJson(obj: any): string {
    if (obj === undefined || obj === null) return '';
    try {
      return JSON.stringify(obj);
    } catch {
      return '';
    }
  }

  // Validation methods
  static validateStory(story: any): story is Story {
    return validateStory(story);
  }

  static validateGoal(goal: any): goal is Goal {
    return validateGoal(goal);
  }

  static validateProject(project: any): project is Project {
    return validateProject(project);
  }

  static validateVision(vision: any): vision is Vision {
    return validateVision(vision);
  }

  static validateBucketlistItem(item: any): item is BucketlistItem {
    return validateBucketlistItem(item);
  }

  static validateImportantDate(date: any): date is ImportantDate {
    return validateImportantDate(date);
  }

  static validateTradition(tradition: any): tradition is Tradition {
    return validateTradition(tradition);
  }

  static validateSprint(sprint: any): sprint is Sprint {
    return validateSprint(sprint);
  }
}
