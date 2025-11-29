import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { settingsAtom } from '@/stores/settingsStore';
import { googleSheetsService } from '@/services/googleSheetsService';
import { syncService } from '@/services/syncService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink,
  Settings as SettingsIcon,
  Wifi,
  WifiOff,
  Clock,
  Database
} from 'lucide-react';
import type { GoogleSheetsConfig } from '@/types';

export function GoogleSheetsSettings() {
  const [settings, setSettings] = useAtom(settingsAtom);
  
  // Simplified state for now
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingChanges, setPendingChanges] = useState(0);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [sheetUrl, setSheetUrl] = useState('');
  const [clientId, setClientId] = useState((import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '');
  const [autoSync, setAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState(30);

  // Real Google Sheets API functions
  const authenticate = async () => {
    setIsConnecting(true);
    setConnectionState('connecting');
    setError(null);
    
    try {
      const success = await googleSheetsService.authenticate();
      if (success) {
        setIsAuthenticated(true);
        setConnectionState('connected');
        
        // Initialize sync service
        try {
          await syncService.initialize();
        } catch (syncError) {
          console.warn('Sync service initialization failed:', syncError);
          // Don't fail authentication if sync fails
        }
      } else {
        setError('Authentication failed - please try again');
        setConnectionState('error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      setConnectionState('error');
    } finally {
      setIsConnecting(false);
    }
  };

  const signOut = async () => {
    try {
      await googleSheetsService.signOut();
      syncService.stopAutoSync();
      setIsAuthenticated(false);
      setConnectionState('disconnected');
      setError(null);
    } catch (err) {
      setError('Sign out failed');
    }
  };

  const initialize = async (clientId: string) => {
    setIsInitializing(true);
    setError(null);
    
    try {
      await googleSheetsService.initialize(clientId);
      const authenticated = googleSheetsService.isAuthenticated();
      setIsAuthenticated(authenticated);
      setConnectionState(authenticated ? 'connected' : 'disconnected');
    } catch (err) {
      setError('Initialization failed');
      setConnectionState('error');
    } finally {
      setIsInitializing(false);
    }
  };

  const triggerSync = async () => {
    setIsSyncing(true);
    setError(null);
    
    try {
      const result = await syncService.triggerSync();
      if (result.success) {
        setLastSync(new Date());
        setPendingChanges(0);
      } else {
        setError(result.errors.join(', '));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  // Load settings on mount and initialize Google API
  useEffect(() => {
    const googleSheets = settings.googleSheets;
    if (googleSheets) {
      setSheetUrl(googleSheets.sheetUrl || '');
      setClientId(googleSheets.clientId || '');
      setAutoSync(googleSheets.autoSync);
      setSyncInterval(googleSheets.syncInterval);
    }

    // Initialize Google API if client ID is available
    const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
    if (clientId && !isAuthenticated) {
      initialize(clientId);
    }
  }, [settings.googleSheets]);

  // Update sync status from sync service
  useEffect(() => {
    const updateSyncStatus = () => {
      const status = syncService.getSyncStatus();
      setIsSyncing(status.isSyncing);
      setLastSync(status.lastSync || null);
      setPendingChanges(status.pendingChanges);
      setIsOnline(status.isOnline);
      if (status.error) {
        setError(status.error);
      }
    };

    // Update immediately
    updateSyncStatus();

    // Set up interval for real-time updates
    const interval = setInterval(updateSyncStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  // Extract sheet ID from URL
  const extractSheetId = (url: string): string | null => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  // Save Google Sheets configuration
  const saveConfig = async () => {
    const sheetId = extractSheetId(sheetUrl);
    if (!sheetId) {
      alert('Please enter a valid Google Sheets URL');
      return;
    }

    const googleSheetsConfig: GoogleSheetsConfig = {
      sheetUrl,
      sheetId,
      isConnected: isAuthenticated,
      autoSync,
      syncInterval,
      clientId: clientId || undefined
    };

    setSettings({
      ...settings,
      googleSheets: googleSheetsConfig
    });

    // Set up Google Sheets service with the sheet ID
    try {
      googleSheetsService.setSheetId(sheetId);
      
      // Initialize if client ID is provided
      if (clientId && !isAuthenticated) {
        await initialize(clientId);
      }
    } catch (err) {
      setError('Failed to configure Google Sheets');
    }
  };

  // Handle authentication
  const handleAuth = async () => {
    if (isAuthenticated) {
      await signOut();
    } else {
      // Ensure Google API is initialized before authenticating
      const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
      if (clientId && !isAuthenticated) {
        await initialize(clientId);
      }
      
      await authenticate();
    }
  };

  // Handle manual sync
  const handleSync = async () => {
    await triggerSync();
  };

  // Get connection status badge
  const getConnectionStatus = () => {
    switch (connectionState) {
      case 'connected':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Connected</Badge>;
      case 'connecting':
        return <Badge variant="secondary"><RefreshCw className="w-3 h-3 mr-1 animate-spin" />Connecting</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" />Disconnected</Badge>;
    }
  };

  // Get sync status badge
  const getSyncStatus = () => {
    if (isSyncing) {
      return <Badge variant="secondary"><RefreshCw className="w-3 h-3 mr-1 animate-spin" />Syncing</Badge>;
    }
    if (error) {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Error</Badge>;
    }
    if (lastSync) {
      return <Badge variant="default" className="bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3 mr-1" />Synced</Badge>;
    }
    return <Badge variant="outline">Not synced</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Google Sheets Integration
          </CardTitle>
          <CardDescription>
            Connect your life planner to Google Sheets for cloud storage and synchronization.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuration Section */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientId">Google Client ID</Label>
                <Input
                  id="clientId"
                  type="text"
                  placeholder="Enter your Google OAuth Client ID"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  disabled={!!(import.meta as any).env?.VITE_GOOGLE_CLIENT_ID}
                />
                <p className="text-sm text-muted-foreground">
                  {(import.meta as any).env?.VITE_GOOGLE_CLIENT_ID 
                    ? "Client ID loaded from environment variables" 
                    : "Get this from the Google Cloud Console"}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sheetUrl">Google Sheets URL</Label>
                <Input
                  id="sheetUrl"
                  type="url"
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  The URL of your Google Sheet
                </p>
              </div>
            </div>

            <Button onClick={saveConfig} disabled={!clientId || !sheetUrl}>
              <SettingsIcon className="w-4 h-4 mr-2" />
              Save Configuration
            </Button>
          </div>

          <Separator />

          {/* Authentication Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  Connect to your Google account
                </p>
              </div>
              {getConnectionStatus()}
            </div>

            <Button 
              onClick={handleAuth} 
              disabled={isConnecting || isInitializing || !clientId || !sheetUrl}
              variant={isAuthenticated ? "destructive" : "default"}
            >
              {isConnecting || isInitializing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : isAuthenticated ? (
                <XCircle className="w-4 h-4 mr-2" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              {isInitializing ? 'Initializing...' : isConnecting ? (isAuthenticated ? 'Signing Out...' : 'Connecting...') : isAuthenticated ? 'Disconnect' : 'Connect to Google'}
            </Button>

            {isAuthenticated && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => window.open(sheetUrl, '_blank')}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Sheet
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Sync Settings */}
          {isAuthenticated && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Synchronization</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage data sync settings
                  </p>
                </div>
                {getSyncStatus()}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoSync">Auto Sync</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically sync changes in the background
                    </p>
                  </div>
                  <Switch
                    id="autoSync"
                    checked={autoSync}
                    onCheckedChange={setAutoSync}
                  />
                </div>

                {autoSync && (
                  <div className="space-y-2">
                    <Label htmlFor="syncInterval">Sync Interval (seconds)</Label>
                    <Input
                      id="syncInterval"
                      type="number"
                      min="10"
                      max="300"
                      value={syncInterval}
                      onChange={(e) => setSyncInterval(parseInt(e.target.value) || 30)}
                    />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button 
                    onClick={handleSync} 
                    disabled={isSyncing || !isOnline}
                    variant="outline"
                  >
                    {isSyncing ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    {isSyncing ? 'Syncing...' : 'Sync Now'}
                  </Button>
                  
                  {pendingChanges > 0 && (
                    <Badge variant="secondary">
                      {pendingChanges} pending changes
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Status Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-green-600" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>

            {lastSync && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Last synced: {new Date(lastSync).toLocaleString()}
                </span>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Sync error: {error}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
