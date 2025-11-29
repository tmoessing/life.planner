import { googleSheetsService, type SheetData } from './googleSheetsService';
import type { 
  Settings,
  SyncStatus,
  SyncConflict,
  ConnectionState
} from '@/types';

export interface SyncOptions {
  forceSync?: boolean;
  resolveConflicts?: 'local' | 'remote' | 'prompt';
  onConflict?: (conflict: SyncConflict) => Promise<any>;
  onProgress?: (progress: number) => void;
}

export interface SyncResult {
  success: boolean;
  conflicts: SyncConflict[];
  syncedEntities: {
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
}

class SyncService {
  private syncStatus: SyncStatus = {
    isSyncing: false,
    pendingChanges: 0,
    isOnline: navigator.onLine
  };
  private connectionState: ConnectionState = 'disconnected';
  private syncInterval?: number;
  private pendingChanges: Set<string> = new Set();
  private conflictResolvers: Map<string, (conflict: SyncConflict) => Promise<any>> = new Map();

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Online/offline detection
    window.addEventListener('online', () => {
      this.syncStatus.isOnline = true;
      this.connectionState = 'connected';
      this.triggerSync();
    });

    window.addEventListener('offline', () => {
      this.syncStatus.isOnline = false;
      this.connectionState = 'disconnected';
    });

    // Visibility change detection for background sync
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.syncStatus.isOnline) {
        this.triggerSync();
      }
    });
  }

  // Initialize sync service
  async initialize(): Promise<void> {
    try {
      this.connectionState = 'connecting';
      
      // Check if Google Sheets is configured
      const settings = this.getSettings();
      if (!settings?.googleSheets?.sheetId) {
        this.connectionState = 'disconnected';
        return;
      }

      // Initialize Google Sheets service
      if (settings.googleSheets.clientId) {
        await googleSheetsService.initialize(settings.googleSheets.clientId);
      }

      // Authenticate if needed
      if (!googleSheetsService.isAuthenticated()) {
        const authenticated = await googleSheetsService.authenticate();
        if (!authenticated) {
          this.connectionState = 'error';
          return;
        }
      }

      // Set sheet ID
      googleSheetsService.setSheetId(settings.googleSheets.sheetId);

      // Initialize sheet structure
      await googleSheetsService.initializeSheet();

      this.connectionState = 'connected';
      this.syncStatus.isOnline = true;

      // Start auto-sync if enabled
      if (settings.googleSheets?.autoSync) {
        this.startAutoSync(settings.googleSheets.syncInterval);
      }

      // Initial sync
      await this.sync();
    } catch (error) {
      console.error('Failed to initialize sync service:', error);
      this.connectionState = 'error';
      this.syncStatus.error = error instanceof Error ? error.message : 'Unknown error';
    }
  }

  // Start auto-sync
  startAutoSync(intervalSeconds: number = 30): void {
    this.stopAutoSync();
    this.syncInterval = setInterval(() => {
      if (this.syncStatus.isOnline && !this.syncStatus.isSyncing) {
        this.sync();
      }
    }, intervalSeconds * 1000);
  }

  // Stop auto-sync
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = undefined;
    }
  }

  // Trigger manual sync
  async triggerSync(): Promise<SyncResult> {
    if (this.syncStatus.isSyncing) {
      return {
        success: false,
        conflicts: [],
        syncedEntities: {
          stories: 0, goals: 0, projects: 0, visions: 0,
          bucketlist: 0, importantDates: 0, traditions: 0, sprints: 0
        },
        errors: ['Sync already in progress']
      };
    }

    return this.sync();
  }

  // Main sync method
  async sync(options: SyncOptions = {}): Promise<SyncResult> {
    if (!this.syncStatus.isOnline) {
      return {
        success: false,
        conflicts: [],
        syncedEntities: {
          stories: 0, goals: 0, projects: 0, visions: 0,
          bucketlist: 0, importantDates: 0, traditions: 0, sprints: 0
        },
        errors: ['Offline - sync queued for when online']
      };
    }

    this.syncStatus.isSyncing = true;
    this.syncStatus.error = undefined;

    try {
      // Load current data from Google Sheets
      const remoteData = await googleSheetsService.loadAllData();
      
      // Load current data from localStorage (for comparison)
      const localData = this.loadLocalData();

      // Compare and merge data
      const mergeResult = await this.mergeData(localData, remoteData, options);

      // Save merged data to both Google Sheets and localStorage
      await this.saveData(mergeResult.mergedData);

      this.syncStatus.isSyncing = false;
      this.syncStatus.lastSync = new Date();
      this.syncStatus.pendingChanges = 0;
      this.pendingChanges.clear();

      return {
        success: true,
        conflicts: mergeResult.conflicts,
        syncedEntities: mergeResult.syncedEntities,
        errors: []
      };
    } catch (error) {
      this.syncStatus.isSyncing = false;
      this.syncStatus.error = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        success: false,
        conflicts: [],
        syncedEntities: {
          stories: 0, goals: 0, projects: 0, visions: 0,
          bucketlist: 0, importantDates: 0, traditions: 0, sprints: 0
        },
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // Merge local and remote data
  private async mergeData(
    localData: SheetData, 
    remoteData: SheetData, 
    options: SyncOptions
  ): Promise<{
    mergedData: SheetData;
    conflicts: SyncConflict[];
    syncedEntities: any;
  }> {
    const conflicts: SyncConflict[] = [];
    const syncedEntities = {
      stories: 0, goals: 0, projects: 0, visions: 0,
      bucketlist: 0, importantDates: 0, traditions: 0, sprints: 0
    };

    // Merge each entity type
    const mergedData: SheetData = {
      stories: await this.mergeEntities(localData.stories, remoteData.stories, 'stories', conflicts, syncedEntities, options),
      goals: await this.mergeEntities(localData.goals, remoteData.goals, 'goals', conflicts, syncedEntities, options),
      projects: await this.mergeEntities(localData.projects, remoteData.projects, 'projects', conflicts, syncedEntities, options),
      visions: await this.mergeEntities(localData.visions, remoteData.visions, 'visions', conflicts, syncedEntities, options),
      bucketlist: await this.mergeEntities(localData.bucketlist, remoteData.bucketlist, 'bucketlist', conflicts, syncedEntities, options),
      importantDates: await this.mergeEntities(localData.importantDates, remoteData.importantDates, 'importantDates', conflicts, syncedEntities, options),
      traditions: await this.mergeEntities(localData.traditions, remoteData.traditions, 'traditions', conflicts, syncedEntities, options),
      sprints: await this.mergeEntities(localData.sprints, remoteData.sprints, 'sprints', conflicts, syncedEntities, options),
      settings: this.mergeSettings(localData.settings, remoteData.settings)
    };

    return { mergedData, conflicts, syncedEntities };
  }

  // Merge entities of the same type
  private async mergeEntities<T extends { id: string; updatedAt?: string }>(
    local: T[],
    remote: T[],
    entityType: string,
    conflicts: SyncConflict[],
    syncedEntities: any,
    options: SyncOptions
  ): Promise<T[]> {
    const localMap = new Map(local.map(item => [item.id, item]));
    const remoteMap = new Map(remote.map(item => [item.id, item]));
    const merged: T[] = [];

    // Get all unique IDs
    const allIds = new Set([...localMap.keys(), ...remoteMap.keys()]);

    for (const id of allIds) {
      const localItem = localMap.get(id);
      const remoteItem = remoteMap.get(id);

      if (!localItem && remoteItem) {
        // Only exists remotely - add it
        merged.push(remoteItem);
        syncedEntities[entityType]++;
      } else if (localItem && !remoteItem) {
        // Only exists locally - add it
        merged.push(localItem);
        syncedEntities[entityType]++;
      } else if (localItem && remoteItem) {
        // Exists in both - check for conflicts
        const localTime = new Date(localItem.updatedAt || '').getTime();
        const remoteTime = new Date(remoteItem.updatedAt || '').getTime();

        if (Math.abs(localTime - remoteTime) < 1000) {
          // Times are very close - no conflict, use local
          merged.push(localItem);
        } else if (localTime > remoteTime) {
          // Local is newer
          merged.push(localItem);
        } else if (remoteTime > localTime) {
          // Remote is newer
          merged.push(remoteItem);
        } else {
          // Conflict - both have been modified
          const conflict: SyncConflict = {
            entityType,
            entityId: id,
            localVersion: localItem,
            remoteVersion: remoteItem,
            conflictType: 'update'
          };
          conflicts.push(conflict);

          // Resolve conflict based on options
          const resolved = await this.resolveConflict(conflict, options);
          merged.push(resolved);
        }
        syncedEntities[entityType]++;
      }
    }

    return merged;
  }

  // Merge settings (always prefer local for settings)
  private mergeSettings(local: Settings, remote: Settings): Settings {
    return { ...remote, ...local };
  }

  // Resolve conflict
  private async resolveConflict(conflict: SyncConflict, options: SyncOptions): Promise<any> {
    const resolver = this.conflictResolvers.get(conflict.entityType) || options.onConflict;
    
    if (resolver) {
      return await resolver(conflict);
    }

    // Default resolution based on options
    switch (options.resolveConflicts) {
      case 'local':
        return conflict.localVersion;
      case 'remote':
        return conflict.remoteVersion;
      case 'prompt':
        // In a real app, this would show a UI dialog
        // For now, default to local
        return conflict.localVersion;
      default:
        // Default to local
        return conflict.localVersion;
    }
  }

  // Register conflict resolver for entity type
  registerConflictResolver(entityType: string, resolver: (conflict: SyncConflict) => Promise<any>): void {
    this.conflictResolvers.set(entityType, resolver);
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
      stories: loadFromStorage('life-scrum-stories', []),
      goals: loadFromStorage('life-scrum-goals', []),
      projects: loadFromStorage('life-scrum-projects', []),
      visions: loadFromStorage('life-scrum-visions', []),
      bucketlist: loadFromStorage('life-scrum-bucketlist', []),
      importantDates: loadFromStorage('life-scrum-important-dates', []),
      traditions: loadFromStorage('life-scrum-traditions', []),
      sprints: loadFromStorage('life-scrum-sprints', []),
      settings: loadFromStorage('life-scrum-settings', {} as Settings)
    };
  }

  // Save data to both Google Sheets and localStorage
  private async saveData(data: SheetData): Promise<void> {
    // Save to Google Sheets
    await googleSheetsService.saveAllData(data);

    // Save to localStorage as backup
    this.saveToLocalStorage(data);
  }

  // Save to localStorage
  private saveToLocalStorage(data: SheetData): void {
    const saveToStorage = (key: string, value: any): void => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`Failed to save ${key} to localStorage:`, error);
      }
    };

    saveToStorage('life-scrum-stories', data.stories);
    saveToStorage('life-scrum-goals', data.goals);
    saveToStorage('life-scrum-projects', data.projects);
    saveToStorage('life-scrum-visions', data.visions);
    saveToStorage('life-scrum-bucketlist', data.bucketlist);
    saveToStorage('life-scrum-important-dates', data.importantDates);
    saveToStorage('life-scrum-traditions', data.traditions);
    saveToStorage('life-scrum-sprints', data.sprints);
    saveToStorage('life-scrum-settings', data.settings);
  }

  // Get settings from localStorage
  private getSettings(): Settings | null {
    try {
      const settings = localStorage.getItem('life-scrum-settings');
      return settings ? JSON.parse(settings) : null;
    } catch {
      return null;
    }
  }

  // Mark entity as changed
  markChanged(entityType: string, entityId: string): void {
    this.pendingChanges.add(`${entityType}:${entityId}`);
    this.syncStatus.pendingChanges = this.pendingChanges.size;
  }

  // Get sync status
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  // Get connection state
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  // Check if online
  isOnline(): boolean {
    return this.syncStatus.isOnline;
  }

  // Disconnect
  async disconnect(): Promise<void> {
    this.stopAutoSync();
    await googleSheetsService.signOut();
    this.connectionState = 'disconnected';
    this.syncStatus.isOnline = false;
  }

  // Cleanup
  destroy(): void {
    this.stopAutoSync();
    window.removeEventListener('online', () => {});
    window.removeEventListener('offline', () => {});
    document.removeEventListener('visibilitychange', () => {});
  }
}

// Export singleton instance
export const syncService = new SyncService();
