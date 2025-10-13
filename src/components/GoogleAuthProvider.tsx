import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { googleSheetsService } from '@/services/googleSheetsService';
import { syncService } from '@/services/syncService';
import type { ConnectionState, SyncStatus } from '@/types';

interface GoogleAuthContextValue {
  isAuthenticated: boolean;
  isConnecting: boolean;
  connectionState: ConnectionState;
  syncStatus: SyncStatus;
  authenticate: () => Promise<boolean>;
  signOut: () => Promise<void>;
  triggerSync: () => Promise<void>;
  initialize: (clientId: string) => Promise<void>;
}

const GoogleAuthContext = createContext<GoogleAuthContextValue | undefined>(undefined);

interface GoogleAuthProviderProps {
  children: ReactNode;
  clientId?: string;
}

export function GoogleAuthProvider({ children, clientId }: GoogleAuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    pendingChanges: 0,
    isOnline: navigator.onLine
  });

  // Initialize Google Auth
  const initialize = async (clientId: string): Promise<void> => {
    if (!clientId) {
      console.error('Google Client ID is required');
      return;
    }

    try {
      setIsConnecting(true);
      setConnectionState('connecting');

      await googleSheetsService.initialize(clientId);
      
      // Check if already authenticated
      const authenticated = googleSheetsService.isAuthenticated();
      setIsAuthenticated(authenticated);
      setConnectionState(authenticated ? 'connected' : 'disconnected');

      if (authenticated) {
        // Initialize sync service
        await syncService.initialize();
      }
    } catch (error) {
      console.error('Failed to initialize Google Auth:', error);
      setConnectionState('error');
    } finally {
      setIsConnecting(false);
    }
  };

  // Authenticate user
  const authenticate = async (): Promise<boolean> => {
    try {
      setIsConnecting(true);
      setConnectionState('connecting');

      const success = await googleSheetsService.authenticate();
      setIsAuthenticated(success);
      setConnectionState(success ? 'connected' : 'disconnected');

      if (success) {
        // Initialize sync service after authentication
        await syncService.initialize();
      }

      return success;
    } catch (error) {
      console.error('Authentication failed:', error);
      setConnectionState('error');
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    try {
      await syncService.disconnect();
      setIsAuthenticated(false);
      setConnectionState('disconnected');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  // Trigger manual sync
  const triggerSync = async (): Promise<void> => {
    try {
      const result = await syncService.triggerSync();
      if (!result.success) {
        console.error('Sync failed:', result.errors);
      }
    } catch (error) {
      console.error('Sync error:', error);
    }
  };

  // Update sync status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const status = syncService.getSyncStatus();
      setSyncStatus(status);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Update connection state
  useEffect(() => {
    const interval = setInterval(() => {
      const state = syncService.getConnectionState();
      setConnectionState(state);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Initialize on mount if clientId is provided
  useEffect(() => {
    if (clientId && !isAuthenticated && !isConnecting) {
      initialize(clientId);
    }
  }, [clientId]);

  const value: GoogleAuthContextValue = {
    isAuthenticated,
    isConnecting,
    connectionState,
    syncStatus,
    authenticate,
    signOut,
    triggerSync,
    initialize
  };

  return (
    <GoogleAuthContext.Provider value={value}>
      {children}
    </GoogleAuthContext.Provider>
  );
}

export function useGoogleAuth(): GoogleAuthContextValue {
  const context = useContext(GoogleAuthContext);
  if (context === undefined) {
    throw new Error('useGoogleAuth must be used within a GoogleAuthProvider');
  }
  return context;
}

// Hook for checking authentication status
export function useGoogleAuthStatus() {
  const { isAuthenticated, isConnecting, connectionState } = useGoogleAuth();
  
  return {
    isAuthenticated,
    isConnecting,
    connectionState,
    isReady: !isConnecting && connectionState !== 'connecting'
  };
}

// Hook for sync operations
export function useGoogleSync() {
  const { syncStatus, triggerSync } = useGoogleAuth();
  
  return {
    syncStatus,
    triggerSync,
    isSyncing: syncStatus.isSyncing,
    isOnline: syncStatus.isOnline,
    pendingChanges: syncStatus.pendingChanges,
    lastSync: syncStatus.lastSync,
    error: syncStatus.error
  };
}
