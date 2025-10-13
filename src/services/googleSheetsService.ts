import { gapi } from 'gapi-script';
import { loadGoogleApi, isGoogleApiReady } from '@/utils/googleApiLoader';
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

// Google Sheets API configuration
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

export interface GoogleSheetsConfig {
  sheetId: string;
  isAuthenticated: boolean;
  accessToken?: string;
}

export interface SheetData {
  stories: Story[];
  goals: Goal[];
  projects: Project[];
  visions: Vision[];
  bucketlist: BucketlistItem[];
  importantDates: ImportantDate[];
  traditions: Tradition[];
  sprints: Sprint[];
  settings: Settings;
}

export interface SyncStatus {
  isSyncing: boolean;
  lastSync?: Date;
  error?: string;
  pendingChanges: number;
}

class GoogleSheetsService {
  private config: GoogleSheetsConfig = {
    sheetId: '',
    isAuthenticated: false
  };
  private syncStatus: SyncStatus = {
    isSyncing: false,
    pendingChanges: 0
  };

  // Initialize Google API
  async initialize(clientId: string): Promise<void> {
    try {
      console.log('Starting Google API initialization...');
      
      // Ensure Google API script is loaded first
      await loadGoogleApi();
      console.log('Google API script loaded');
      
      // Wait for gapi to be available
      let attempts = 0;
      const maxAttempts = 20;
      while (attempts < maxAttempts) {
        if (isGoogleApiReady()) {
          console.log('Google API is ready');
          break;
        }
        console.log(`Waiting for Google API... attempt ${attempts + 1}/${maxAttempts}`);
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (!isGoogleApiReady()) {
        throw new Error('Google API failed to load');
      }

      console.log('Loading Google API client and auth2...');
      // Load the Google API client
      await new Promise<void>((resolve, reject) => {
        gapi.load('client:auth2', async () => {
          try {
            console.log('Initializing Google API client...');
            await gapi.client.init({
              clientId,
              discoveryDocs: [DISCOVERY_DOC],
              scope: SCOPES
            });
            console.log('Google API initialized successfully');
            
            // Test Google Sheets API access
            try {
              console.log('Testing Google Sheets API access...');
              // Try to access the sheets API to ensure it's working
              if ((gapi.client as any).sheets) {
                console.log('Google Sheets API is available');
              } else {
                console.warn('Google Sheets API not available');
              }
            } catch (apiError) {
              console.warn('Google Sheets API test failed:', apiError);
            }
            
            resolve();
          } catch (error) {
            console.error('Failed to initialize Google API client:', error);
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('Failed to initialize Google API:', error);
      throw error;
    }
  }

  // Check if Google API is loaded
  private isGoogleApiLoaded(): boolean {
    try {
      // Check if gapi is available
      if (typeof gapi === 'undefined') {
        return false;
      }
      
      // Check if auth2 is available
      if (typeof (gapi as any).auth2 === 'undefined') {
        return false;
      }
      
      // Check if client is available
      if (typeof gapi.client === 'undefined') {
        return false;
      }
      
      // Check if getAuthInstance is a function
      if (typeof (gapi as any).auth2.getAuthInstance !== 'function') {
        return false;
      }
      
      // Try to get auth instance
      const authInstance = (gapi as any).auth2.getAuthInstance();
      return authInstance !== null && authInstance !== undefined;
    } catch (error) {
      console.log('Google API check failed:', error);
      return false;
    }
  }

  // Authenticate user
  async authenticate(): Promise<boolean> {
    try {
      console.log('Starting authentication...');
      
      // Wait for Google API to be fully loaded
      let attempts = 0;
      const maxAttempts = 30;
      while (attempts < maxAttempts && !this.isGoogleApiLoaded()) {
        console.log(`Waiting for Google API to be loaded... attempt ${attempts + 1}/${maxAttempts}`);
        await new Promise(resolve => setTimeout(resolve, 200));
        attempts++;
      }

      if (!this.isGoogleApiLoaded()) {
        console.error('Google API not loaded after waiting');
        throw new Error('Google API not loaded. Please initialize first.');
      }
      
      console.log('Google API is loaded, getting auth instance...');
      const authInstance = (gapi as any).auth2.getAuthInstance();
      
      // Check if already signed in
      if (authInstance.isSignedIn.get()) {
        console.log('User already signed in');
        const user = authInstance.currentUser.get();
        this.config.isAuthenticated = true;
        this.config.accessToken = user.getAuthResponse().access_token;
        return true;
      }
      
      // Sign in if not already signed in
      console.log('Signing in user...');
      const user = await authInstance.signIn();
      
      if (user.isSignedIn()) {
        console.log('User signed in successfully');
        this.config.isAuthenticated = true;
        this.config.accessToken = user.getAuthResponse().access_token;
        return true;
      }
      
      console.log('User sign in failed');
      return false;
    } catch (error) {
      console.error('Authentication failed:', error);
      // Don't throw the error, just return false
      return false;
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      if (!this.isGoogleApiLoaded()) {
        this.config.isAuthenticated = false;
        this.config.accessToken = undefined;
        return;
      }
      
      const authInstance = (gapi as any).auth2.getAuthInstance();
      await authInstance.signOut();
      this.config.isAuthenticated = false;
      this.config.accessToken = undefined;
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  }

  // Set sheet ID
  setSheetId(sheetId: string): void {
    this.config.sheetId = sheetId;
  }

  // Get sheet ID from URL
  extractSheetIdFromUrl(url: string): string | null {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  }

  // Initialize sheet structure (create tabs if missing)
  async initializeSheet(): Promise<void> {
    if (!this.config.isAuthenticated || !this.config.sheetId) {
      throw new Error('Not authenticated or sheet ID not set');
    }

    try {
      // Get existing sheets
      const response = await (gapi.client as any).sheets.spreadsheets.get({
        spreadsheetId: this.config.sheetId
      });

      const existingSheets = response.result.sheets?.map((sheet: any) => sheet.properties?.title) || [];
      const requiredSheets = [
        'Stories', 'Goals', 'Projects', 'Visions', 'Bucketlist', 
        'ImportantDates', 'Traditions', 'Sprints', 'Settings'
      ];

      const missingSheets = requiredSheets.filter(sheet => !existingSheets.includes(sheet));

      if (missingSheets.length > 0) {
        // Add missing sheets
        const requests = missingSheets.map(sheetName => ({
          addSheet: {
            properties: {
              title: sheetName,
              gridProperties: {
                rowCount: 1000,
                columnCount: 20
              }
            }
          }
        }));

        await (gapi.client as any).sheets.spreadsheets.batchUpdate({
          spreadsheetId: this.config.sheetId,
          resource: { requests }
        });
      }
    } catch (error) {
      console.error('Failed to initialize sheet:', error);
      throw error;
    }
  }

  // Generic method to read data from a sheet
  async readSheetData<T>(sheetName: string, mapper: (row: any[]) => T): Promise<T[]> {
    if (!this.config.isAuthenticated || !this.config.sheetId) {
      throw new Error('Not authenticated or sheet ID not set');
    }

    try {
      const response = await (gapi.client as any).sheets.spreadsheets.values.get({
        spreadsheetId: this.config.sheetId,
        range: `${sheetName}!A:Z`
      });

      const rows = response.result.values || [];
      if (rows.length <= 1) return []; // No data or only headers

      // Skip header row
      return rows.slice(1).map((row: any) => mapper(row));
    } catch (error) {
      console.error(`Failed to read ${sheetName} data:`, error);
      throw error;
    }
  }

  // Generic method to write data to a sheet
  async writeSheetData<T>(sheetName: string, data: T[], headers: string[], mapper: (item: T) => any[]): Promise<void> {
    if (!this.config.isAuthenticated || !this.config.sheetId) {
      throw new Error('Not authenticated or sheet ID not set');
    }

    try {
      // Prepare data with headers
      const values = [
        headers,
        ...data.map(item => mapper(item))
      ];

      // Clear existing data and write new data
      await (gapi.client as any).sheets.spreadsheets.values.clear({
        spreadsheetId: this.config.sheetId,
        range: `${sheetName}!A:Z`
      });

      await (gapi.client as any).sheets.spreadsheets.values.update({
        spreadsheetId: this.config.sheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'RAW',
        resource: { values }
      });
    } catch (error) {
      console.error(`Failed to write ${sheetName} data:`, error);
      throw error;
    }
  }

  // Load all data from sheets
  async loadAllData(): Promise<SheetData> {
    this.syncStatus.isSyncing = true;
    this.syncStatus.error = undefined;

    try {
      const [stories, goals, projects, visions, bucketlist, importantDates, traditions, sprints, settings] = await Promise.all([
        this.loadStories(),
        this.loadGoals(),
        this.loadProjects(),
        this.loadVisions(),
        this.loadBucketlist(),
        this.loadImportantDates(),
        this.loadTraditions(),
        this.loadSprints(),
        this.loadSettings()
      ]);

      this.syncStatus.isSyncing = false;
      this.syncStatus.lastSync = new Date();
      this.syncStatus.pendingChanges = 0;

      return {
        stories,
        goals,
        projects,
        visions,
        bucketlist,
        importantDates,
        traditions,
        sprints,
        settings
      };
    } catch (error) {
      this.syncStatus.isSyncing = false;
      this.syncStatus.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  // Save all data to sheets
  async saveAllData(data: SheetData): Promise<void> {
    this.syncStatus.isSyncing = true;
    this.syncStatus.error = undefined;

    try {
      await Promise.all([
        this.saveStories(data.stories),
        this.saveGoals(data.goals),
        this.saveProjects(data.projects),
        this.saveVisions(data.visions),
        this.saveBucketlist(data.bucketlist),
        this.saveImportantDates(data.importantDates),
        this.saveTraditions(data.traditions),
        this.saveSprints(data.sprints),
        this.saveSettings(data.settings)
      ]);

      this.syncStatus.isSyncing = false;
      this.syncStatus.lastSync = new Date();
      this.syncStatus.pendingChanges = 0;
    } catch (error) {
      this.syncStatus.isSyncing = false;
      this.syncStatus.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  // Entity-specific load methods
  async loadStories(): Promise<Story[]> {
    return this.readSheetData('Stories', (row) => this.mapRowToStory(row));
  }

  async loadGoals(): Promise<Goal[]> {
    return this.readSheetData('Goals', (row) => this.mapRowToGoal(row));
  }

  async loadProjects(): Promise<Project[]> {
    return this.readSheetData('Projects', (row) => this.mapRowToProject(row));
  }

  async loadVisions(): Promise<Vision[]> {
    return this.readSheetData('Visions', (row) => this.mapRowToVision(row));
  }

  async loadBucketlist(): Promise<BucketlistItem[]> {
    return this.readSheetData('Bucketlist', (row) => this.mapRowToBucketlistItem(row));
  }

  async loadImportantDates(): Promise<ImportantDate[]> {
    return this.readSheetData('ImportantDates', (row) => this.mapRowToImportantDate(row));
  }

  async loadTraditions(): Promise<Tradition[]> {
    return this.readSheetData('Traditions', (row) => this.mapRowToTradition(row));
  }

  async loadSprints(): Promise<Sprint[]> {
    return this.readSheetData('Sprints', (row) => this.mapRowToSprint(row));
  }

  async loadSettings(): Promise<Settings> {
    const settingsArray = await this.readSheetData('Settings', (row) => ({ key: row[0], value: row[1] }));
    const settingsObj: any = {};
    settingsArray.forEach(({ key, value }) => {
      try {
        settingsObj[key] = JSON.parse(value);
      } catch {
        settingsObj[key] = value;
      }
    });
    return settingsObj as Settings;
  }

  // Entity-specific save methods
  async saveStories(stories: Story[]): Promise<void> {
    const headers = ['id', 'title', 'description', 'labels', 'priority', 'weight', 'size', 'type', 'status', 'roleId', 'visionId', 'projectId', 'dueDate', 'sprintId', 'scheduled', 'taskCategories', 'scheduledDate', 'location', 'goalId', 'checklist', 'createdAt', 'updatedAt', 'deleted', 'repeat', 'subtasks'];
    return this.writeSheetData('Stories', stories, headers, (story) => this.mapStoryToRow(story));
  }

  async saveGoals(goals: Goal[]): Promise<void> {
    const headers = ['id', 'title', 'name', 'description', 'visionId', 'category', 'goalType', 'roleId', 'priority', 'status', 'order', 'storyIds', 'projectId', 'completed', 'createdAt', 'updatedAt'];
    return this.writeSheetData('Goals', goals, headers, (goal) => this.mapGoalToRow(goal));
  }

  async saveProjects(projects: Project[]): Promise<void> {
    const headers = ['id', 'name', 'description', 'status', 'priority', 'type', 'roleId', 'visionId', 'order', 'startDate', 'endDate', 'storyIds', 'createdAt', 'updatedAt'];
    return this.writeSheetData('Projects', projects, headers, (project) => this.mapProjectToRow(project));
  }

  async saveVisions(visions: Vision[]): Promise<void> {
    const headers = ['id', 'title', 'name', 'description', 'type', 'order'];
    return this.writeSheetData('Visions', visions, headers, (vision) => this.mapVisionToRow(vision));
  }

  async saveBucketlist(bucketlist: BucketlistItem[]): Promise<void> {
    const headers = ['id', 'title', 'description', 'completed', 'completedAt', 'category', 'priority', 'bucketlistType', 'status', 'roleId', 'visionId', 'dueDate', 'order', 'country', 'state', 'city', 'experienceCategory', 'createdAt', 'updatedAt'];
    return this.writeSheetData('Bucketlist', bucketlist, headers, (item) => this.mapBucketlistItemToRow(item));
  }

  async saveImportantDates(importantDates: ImportantDate[]): Promise<void> {
    const headers = ['id', 'title', 'date', 'createdAt', 'updatedAt'];
    return this.writeSheetData('ImportantDates', importantDates, headers, (date) => this.mapImportantDateToRow(date));
  }

  async saveTraditions(traditions: Tradition[]): Promise<void> {
    const headers = ['id', 'title', 'description', 'traditionType', 'traditionalCategory', 'createdAt', 'updatedAt'];
    return this.writeSheetData('Traditions', traditions, headers, (tradition) => this.mapTraditionToRow(tradition));
  }

  async saveSprints(sprints: Sprint[]): Promise<void> {
    const headers = ['id', 'isoWeek', 'year', 'startDate', 'endDate'];
    return this.writeSheetData('Sprints', sprints, headers, (sprint) => this.mapSprintToRow(sprint));
  }

  async saveSettings(settings: Settings): Promise<void> {
    const settingsArray = Object.entries(settings).map(([key, value]) => ({
      key,
      value: JSON.stringify(value)
    }));
    const headers = ['key', 'value'];
    return this.writeSheetData('Settings', settingsArray, headers, (item) => [item.key, item.value]);
  }

  // Mapping methods (row to object)
  private mapRowToStory(row: any[]): Story {
    return {
      id: row[0] || '',
      title: row[1] || '',
      description: row[2] || '',
      labels: row[3] ? JSON.parse(row[3]) : [],
      priority: row[4] as any || 'medium',
      weight: (parseInt(row[5]) || 1) as 1 | 3 | 5 | 8 | 13 | 21,
      size: row[6] as any || 'M',
      type: row[7] || '',
      status: row[8] as any || 'backlog',
      roleId: row[9] || undefined,
      visionId: row[10] || undefined,
      projectId: row[11] || undefined,
      dueDate: row[12] || undefined,
      sprintId: row[13] || undefined,
      scheduled: row[14] || undefined,
      taskCategories: row[15] ? JSON.parse(row[15]) : undefined,
      scheduledDate: row[16] || undefined,
      location: row[17] || undefined,
      goalId: row[18] || undefined,
      checklist: row[19] ? JSON.parse(row[19]) : [],
      createdAt: row[20] || new Date().toISOString(),
      updatedAt: row[21] || new Date().toISOString(),
      deleted: row[22] === 'true',
      repeat: row[23] ? JSON.parse(row[23]) : undefined,
      subtasks: row[24] ? JSON.parse(row[24]) : undefined
    };
  }

  private mapRowToGoal(row: any[]): Goal {
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
      order: parseInt(row[10]) || 0,
      storyIds: row[11] ? JSON.parse(row[11]) : [],
      projectId: row[12] || undefined,
      completed: row[13] === 'true',
      createdAt: row[14] || new Date().toISOString(),
      updatedAt: row[15] || new Date().toISOString()
    };
  }

  private mapRowToProject(row: any[]): Project {
    return {
      id: row[0] || '',
      name: row[1] || '',
      description: row[2] || '',
      status: row[3] as any || 'Icebox',
      priority: row[4] as any || 'medium',
      type: row[5] || undefined,
      roleId: row[6] || undefined,
      visionId: row[7] || undefined,
      order: parseInt(row[8]) || 0,
      startDate: row[9] || undefined,
      endDate: row[10] || undefined,
      storyIds: row[11] ? JSON.parse(row[11]) : [],
      createdAt: row[12] || new Date().toISOString(),
      updatedAt: row[13] || new Date().toISOString()
    };
  }

  private mapRowToVision(row: any[]): Vision {
    return {
      id: row[0] || '',
      title: row[1] || '',
      name: row[2] || row[1] || '',
      description: row[3] || undefined,
      type: row[4] || '',
      order: parseInt(row[5]) || 0
    };
  }

  private mapRowToBucketlistItem(row: any[]): BucketlistItem {
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
      order: parseInt(row[12]) || undefined,
      country: row[13] || undefined,
      state: row[14] || undefined,
      city: row[15] || undefined,
      experienceCategory: row[16] || undefined,
      createdAt: row[17] || new Date().toISOString(),
      updatedAt: row[18] || new Date().toISOString()
    };
  }

  private mapRowToImportantDate(row: any[]): ImportantDate {
    return {
      id: row[0] || '',
      title: row[1] || '',
      date: row[2] || '',
      createdAt: row[3] || new Date().toISOString(),
      updatedAt: row[4] || new Date().toISOString()
    };
  }

  private mapRowToTradition(row: any[]): Tradition {
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

  private mapRowToSprint(row: any[]): Sprint {
    return {
      id: row[0] || '',
      isoWeek: parseInt(row[1]) || 1,
      year: parseInt(row[2]) || new Date().getFullYear(),
      startDate: row[3] || '',
      endDate: row[4] || ''
    };
  }

  // Mapping methods (object to row)
  private mapStoryToRow(story: Story): any[] {
    return [
      story.id,
      story.title,
      story.description,
      JSON.stringify(story.labels),
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
      story.taskCategories ? JSON.stringify(story.taskCategories) : '',
      story.scheduledDate || '',
      story.location || '',
      story.goalId || '',
      JSON.stringify(story.checklist),
      story.createdAt,
      story.updatedAt,
      story.deleted ? 'true' : 'false',
      story.repeat ? JSON.stringify(story.repeat) : '',
      story.subtasks ? JSON.stringify(story.subtasks) : ''
    ];
  }

  private mapGoalToRow(goal: Goal): any[] {
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
      JSON.stringify(goal.storyIds || []),
      goal.projectId || '',
      goal.completed ? 'true' : 'false',
      goal.createdAt,
      goal.updatedAt
    ];
  }

  private mapProjectToRow(project: Project): any[] {
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
      JSON.stringify(project.storyIds),
      project.createdAt,
      project.updatedAt
    ];
  }

  private mapVisionToRow(vision: Vision): any[] {
    return [
      vision.id,
      vision.title,
      vision.name,
      vision.description || '',
      vision.type,
      vision.order
    ];
  }

  private mapBucketlistItemToRow(item: BucketlistItem): any[] {
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

  private mapImportantDateToRow(date: ImportantDate): any[] {
    return [
      date.id,
      date.title,
      date.date,
      date.createdAt,
      date.updatedAt
    ];
  }

  private mapTraditionToRow(tradition: Tradition): any[] {
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

  private mapSprintToRow(sprint: Sprint): any[] {
    return [
      sprint.id,
      sprint.isoWeek,
      sprint.year,
      sprint.startDate,
      sprint.endDate
    ];
  }

  // Get sync status
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  // Check if authenticated
  isAuthenticated(): boolean {
    if (!this.isGoogleApiLoaded()) {
      return false;
    }
    
    try {
      const authInstance = (gapi as any).auth2.getAuthInstance();
      return authInstance.isSignedIn.get();
    } catch (error) {
      return this.config.isAuthenticated;
    }
  }

  // Get current sheet ID
  getSheetId(): string {
    return this.config.sheetId;
  }
}

// Export singleton instance
export const googleSheetsService = new GoogleSheetsService();
