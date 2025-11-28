import React, { useState, useRef } from 'react';
import { useAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { importDataWithOptionsAtom } from '@/stores/appStore';
import { parseCSVData, defaultImportOptions, type ImportOptions } from '@/utils/import';
import { Upload, AlertTriangle, CheckCircle } from 'lucide-react';

interface ImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportModal({ open, onOpenChange }: ImportModalProps) {
  const [, importData] = useAtom(importDataWithOptionsAtom);
  const [importOptions, setImportOptions] = useState<ImportOptions>(defaultImportOptions);
  const [importMode, setImportMode] = useState<'merge' | 'overwrite'>('overwrite');
  const [fileContent, setFileContent] = useState<string>('');
  const [parsedData, setParsedData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFileContent(content);
      setError('');
      
      try {
        const data = parseCSVData(content);
        setParsedData(data);
        setSuccess(`Successfully parsed ${file.name}`);
      } catch (err) {
        setError('Failed to parse CSV file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!parsedData) {
      setError('No data to import');
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      const options = {
        ...importOptions,
        mode: importMode
      };

      await importData(parsedData, options);
      
      const importedItems = [];
      if (options.importStories && parsedData.stories?.length) importedItems.push(`${parsedData.stories.length} stories`);
      if (options.importGoals && parsedData.goals?.length) importedItems.push(`${parsedData.goals.length} goals`);
      if (options.importProjects && parsedData.projects?.length) importedItems.push(`${parsedData.projects.length} projects`);
      if (options.importVisions && parsedData.visions?.length) importedItems.push(`${parsedData.visions.length} visions`);
      if (options.importBucketlist && parsedData.bucketlist?.length) importedItems.push(`${parsedData.bucketlist.length} bucketlist items`);
      if (options.importImportantDates && parsedData.importantDates?.length) importedItems.push(`${parsedData.importantDates.length} important dates`);
      if (options.importTraditions && parsedData.traditions?.length) importedItems.push(`${parsedData.traditions.length} traditions`);
      if (options.importRoles && parsedData.roles?.length) importedItems.push(`${parsedData.roles.length} roles`);

      setSuccess(`Successfully imported: ${importedItems.join(', ')}`);
      
      // Reset form after successful import
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError('Failed to import data. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setFileContent('');
    setParsedData(null);
    setError('');
    setSuccess('');
    setImportOptions(defaultImportOptions);
    setImportMode('merge');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onOpenChange(false);
  };

  const updateImportOption = (key: keyof ImportOptions, value: boolean) => {
    setImportOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ${open ? 'block' : 'hidden'}`}>
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Data
          </CardTitle>
          <CardDescription>
            Import your data from a CSV file. You can choose to merge with existing data or overwrite it.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* File Selection */}
          <div className="space-y-2">
            <Label htmlFor="file-input">Select CSV File</Label>
            <input
              ref={fileInputRef}
              id="file-input"
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="w-full p-2 border border-input rounded-md"
            />
            {fileContent && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                File loaded successfully
              </div>
            )}
          </div>

          {/* Import Mode Selection */}
          <div className="space-y-3">
            <Label>Import Mode</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="merge"
                  name="importMode"
                  value="merge"
                  checked={importMode === 'merge'}
                  onChange={(e) => setImportMode(e.target.value as 'merge' | 'overwrite')}
                  className="h-4 w-4"
                />
                <Label htmlFor="merge" className="flex-1">
                  <div className="font-medium">Merge</div>
                  <div className="text-sm text-muted-foreground">
                    Add new items without replacing existing ones
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="overwrite"
                  name="importMode"
                  value="overwrite"
                  checked={importMode === 'overwrite'}
                  onChange={(e) => setImportMode(e.target.value as 'merge' | 'overwrite')}
                  className="h-4 w-4"
                />
                <Label htmlFor="overwrite" className="flex-1">
                  <div className="font-medium">Overwrite</div>
                  <div className="text-sm text-muted-foreground">
                    Replace all existing data with imported data
                  </div>
                </Label>
              </div>
            </div>
          </div>

          {/* Data Type Selection */}
          <div className="space-y-3">
            <Label>Select Data to Import</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="import-stories"
                  checked={importOptions.importStories}
                  onCheckedChange={(checked) => updateImportOption('importStories', !!checked)}
                />
                <Label htmlFor="import-stories">Stories</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="import-goals"
                  checked={importOptions.importGoals}
                  onCheckedChange={(checked) => updateImportOption('importGoals', !!checked)}
                />
                <Label htmlFor="import-goals">Goals</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="import-projects"
                  checked={importOptions.importProjects}
                  onCheckedChange={(checked) => updateImportOption('importProjects', !!checked)}
                />
                <Label htmlFor="import-projects">Projects</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="import-visions"
                  checked={importOptions.importVisions}
                  onCheckedChange={(checked) => updateImportOption('importVisions', !!checked)}
                />
                <Label htmlFor="import-visions">Visions</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="import-bucketlist"
                  checked={importOptions.importBucketlist}
                  onCheckedChange={(checked) => updateImportOption('importBucketlist', !!checked)}
                />
                <Label htmlFor="import-bucketlist">Bucketlist</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="import-important-dates"
                  checked={importOptions.importImportantDates}
                  onCheckedChange={(checked) => updateImportOption('importImportantDates', !!checked)}
                />
                <Label htmlFor="import-important-dates">Important Dates</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="import-traditions"
                  checked={importOptions.importTraditions}
                  onCheckedChange={(checked) => updateImportOption('importTraditions', !!checked)}
                />
                <Label htmlFor="import-traditions">Traditions</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="import-roles"
                  checked={importOptions.importRoles}
                  onCheckedChange={(checked) => updateImportOption('importRoles', !!checked)}
                />
                <Label htmlFor="import-roles">Roles</Label>
              </div>
            </div>
          </div>

          {/* Data Preview */}
          {parsedData && (
            <div className="space-y-2">
              <Label>Data Preview</Label>
              <div className="text-sm text-muted-foreground space-y-1">
                {parsedData.stories?.length > 0 && <div>• {parsedData.stories.length} stories</div>}
                {parsedData.goals?.length > 0 && <div>• {parsedData.goals.length} goals</div>}
                {parsedData.projects?.length > 0 && <div>• {parsedData.projects.length} projects</div>}
                {parsedData.visions?.length > 0 && <div>• {parsedData.visions.length} visions</div>}
                {parsedData.bucketlist?.length > 0 && <div>• {parsedData.bucketlist.length} bucketlist items</div>}
                {parsedData.importantDates?.length > 0 && <div>• {parsedData.importantDates.length} important dates</div>}
                {parsedData.traditions?.length > 0 && <div>• {parsedData.traditions.length} traditions</div>}
                {parsedData.roles?.length > 0 && <div>• {parsedData.roles.length} roles</div>}
              </div>
            </div>
          )}

          {/* Error/Success Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Warning for Overwrite Mode */}
          {importMode === 'overwrite' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> Overwrite mode will replace all existing data of the selected types. This action cannot be undone.
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport}
              disabled={!parsedData || isProcessing}
              className="gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Import Data
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
