import { googleSheetsService } from '@/services/googleSheetsService';
import type { SheetData } from '@/services/googleSheetsService';

export interface MigrationResult {
  success: boolean;
  migratedEntities: {
    stories: number;
    goals: number;
    projects: number;
    visions: number;
    bucketlist: number;
    importantDates: number;
    traditions: number;
    sprints: number;
  };
  errors: string[];
  backupCreated: boolean;
}

export interface MigrationOptions {
  createBackup?: boolean;
  overwriteExisting?: boolean;
  onProgress?: (progress: number, message: string) => void;
}

class MigrationService {
  private readonly STORAGE_KEYS = {
    STORIES: 'life-scrum-stories',
    GOALS: 'life-scrum-goals',
    PROJECTS: 'life-scrum-projects',
    VISIONS: 'life-scrum-visions',
    BUCKETLIST: 'life-scrum-bucketlist',
    IMPORTANT_DATES: 'life-scrum-important-dates',
    TRADITIONS: 'life-scrum-traditions',
    SPRINTS: 'life-scrum-sprints',
    SETTINGS: 'life-scrum-settings'
  };

  // Check if migration is needed
  isMigrationNeeded(): boolean {
    // Check if any localStorage data exists
    const hasLocalData = Object.values(this.STORAGE_KEYS).some(key => {
      const data = localStorage.getItem(key);
      return data && data !== '[]' && data !== '{}' && data !== 'null';
    });

    // Check if Google Sheets is already configured
    const settings = this.getSettings();
    const hasGoogleSheets = settings?.googleSheets?.isConnected;

    return hasLocalData && !hasGoogleSheets;
  }

  // Get current settings
  private getSettings(): any {
    try {
      const settings = localStorage.getItem(this.STORAGE_KEYS.SETTINGS);
      return settings ? JSON.parse(settings) : null;
    } catch {
      return null;
    }
  }

  // Create backup of localStorage data
  private createBackup(): string {
    const backup: Record<string, any> = {};
    
    Object.entries(this.STORAGE_KEYS).forEach(([_name, key]) => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          backup[key] = JSON.parse(data);
        }
      } catch (error) {
        console.warn(`Failed to backup ${key}:`, error);
      }
    });

    const backupData = JSON.stringify(backup, null, 2);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupKey = `life-scrum-backup-${timestamp}`;
    
    localStorage.setItem(backupKey, backupData);
    return backupKey;
  }

  // Load data from localStorage
  private loadLocalData(): SheetData {
    const loadFromStorage = <T>(key: string, defaultValue: T): T => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch {
        return defaultValue;
      }
    };

    return {
      stories: loadFromStorage(this.STORAGE_KEYS.STORIES, []),
      goals: loadFromStorage(this.STORAGE_KEYS.GOALS, []),
      projects: loadFromStorage(this.STORAGE_KEYS.PROJECTS, []),
      visions: loadFromStorage(this.STORAGE_KEYS.VISIONS, []),
      bucketlist: loadFromStorage(this.STORAGE_KEYS.BUCKETLIST, []),
      importantDates: loadFromStorage(this.STORAGE_KEYS.IMPORTANT_DATES, []),
      traditions: loadFromStorage(this.STORAGE_KEYS.TRADITIONS, []),
      sprints: loadFromStorage(this.STORAGE_KEYS.SPRINTS, []),
      settings: loadFromStorage(this.STORAGE_KEYS.SETTINGS, {} as any)
    };
  }

  // Validate data before migration
  private validateData(data: SheetData): string[] {
    const errors: string[] = [];

    // Validate stories
    if (!Array.isArray(data.stories)) {
      errors.push('Stories data is not an array');
    }

    // Validate goals
    if (!Array.isArray(data.goals)) {
      errors.push('Goals data is not an array');
    }

    // Validate projects
    if (!Array.isArray(data.projects)) {
      errors.push('Projects data is not an array');
    }

    // Validate visions
    if (!Array.isArray(data.visions)) {
      errors.push('Visions data is not an array');
    }

    // Validate bucketlist
    if (!Array.isArray(data.bucketlist)) {
      errors.push('Bucketlist data is not an array');
    }

    // Validate important dates
    if (!Array.isArray(data.importantDates)) {
      errors.push('Important dates data is not an array');
    }

    // Validate traditions
    if (!Array.isArray(data.traditions)) {
      errors.push('Traditions data is not an array');
    }

    // Validate sprints
    if (!Array.isArray(data.sprints)) {
      errors.push('Sprints data is not an array');
    }

    // Validate settings
    if (typeof data.settings !== 'object' || data.settings === null) {
      errors.push('Settings data is not an object');
    }

    return errors;
  }

  // Migrate data to Google Sheets
  async migrate(options: MigrationOptions = {}): Promise<MigrationResult> {
    const {
      createBackup = true,
      overwriteExisting = false,
      onProgress
    } = options;

    const result: MigrationResult = {
      success: false,
      migratedEntities: {
        stories: 0, goals: 0, projects: 0, visions: 0,
        bucketlist: 0, importantDates: 0, traditions: 0, sprints: 0
      },
      errors: [],
      backupCreated: false
    };

    try {
      onProgress?.(0, 'Starting migration...');

      // Check if Google Sheets is authenticated
      if (!googleSheetsService.isAuthenticated()) {
        result.errors.push('Not authenticated with Google Sheets');
        return result;
      }

      // Create backup if requested
      if (createBackup) {
        onProgress?.(10, 'Creating backup...');
        this.createBackup();
        result.backupCreated = true;
      }

      // Load local data
      onProgress?.(20, 'Loading local data...');
      const localData = this.loadLocalData();

      // Validate data
      onProgress?.(30, 'Validating data...');
      const validationErrors = this.validateData(localData);
      if (validationErrors.length > 0) {
        result.errors.push(...validationErrors);
        return result;
      }

      // Check if Google Sheets already has data
      onProgress?.(40, 'Checking existing data...');
      if (!overwriteExisting) {
        try {
          const existingData = await googleSheetsService.loadAllData();
          const hasExistingData = Object.values(existingData).some((arr: any) => 
            Array.isArray(arr) && arr.length > 0
          );

          if (hasExistingData) {
            result.errors.push('Google Sheets already contains data. Use overwriteExisting option to replace it.');
            return result;
          }
        } catch (error) {
          // If we can't load existing data, assume it's empty and continue
          console.warn('Could not check existing data:', error);
        }
      }

      // Initialize sheet structure
      onProgress?.(50, 'Initializing sheet structure...');
      await googleSheetsService.initializeSheet();

      // Save data to Google Sheets
      onProgress?.(70, 'Uploading data to Google Sheets...');
      await googleSheetsService.saveAllData(localData);

      // Update settings to include Google Sheets configuration
      onProgress?.(85, 'Updating settings...');
      const settings = this.getSettings();
      if (settings) {
        const updatedSettings = {
          ...settings,
          googleSheets: {
            ...settings.googleSheets,
            isConnected: true,
            lastSync: new Date().toISOString()
          }
        };
        localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
      }

      // Count migrated entities
      result.migratedEntities = {
        stories: localData.stories.length,
        goals: localData.goals.length,
        projects: localData.projects.length,
        visions: localData.visions.length,
        bucketlist: localData.bucketlist.length,
        importantDates: localData.importantDates.length,
        traditions: localData.traditions.length,
        sprints: localData.sprints.length
      };

      onProgress?.(100, 'Migration completed successfully!');
      result.success = true;

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`Migration failed: ${errorMessage}`);
      console.error('Migration error:', error);
      return result;
    }
  }

  // Restore from backup
  restoreFromBackup(backupKey: string): boolean {
    try {
      const backupData = localStorage.getItem(backupKey);
      if (!backupData) {
        console.error('Backup not found:', backupKey);
        return false;
      }

      const backup = JSON.parse(backupData);
      
      // Restore each entity type
      Object.entries(backup).forEach(([key, value]) => {
        if (Object.values(this.STORAGE_KEYS).includes(key)) {
          localStorage.setItem(key, JSON.stringify(value));
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      return false;
    }
  }

  // List available backups
  listBackups(): string[] {
    const backups: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('life-scrum-backup-')) {
        backups.push(key);
      }
    }
    return backups.sort().reverse(); // Most recent first
  }

  // Clean up old backups (keep only the 5 most recent)
  cleanupBackups(): void {
    const backups = this.listBackups();
    if (backups.length > 5) {
      const toDelete = backups.slice(5);
      toDelete.forEach(backup => {
        localStorage.removeItem(backup);
      });
    }
  }

  // Get migration status
  getMigrationStatus(): {
    needsMigration: boolean;
    hasLocalData: boolean;
    hasGoogleSheets: boolean;
    backupCount: number;
  } {
    const hasLocalData = this.isMigrationNeeded();
    const settings = this.getSettings();
    const hasGoogleSheets = settings?.googleSheets?.isConnected || false;
    const backupCount = this.listBackups().length;

    return {
      needsMigration: hasLocalData && !hasGoogleSheets,
      hasLocalData,
      hasGoogleSheets,
      backupCount
    };
  }
}

// Export singleton instance
export const migrationService = new MigrationService();
