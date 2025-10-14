import { useState } from 'react';
import { useAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible } from '@/components/ui/collapsible';
import { Trash2, AlertTriangle, Download, FileSpreadsheet, Upload, Settings, Users, Tag, Target, FolderOpen, Sparkles, ListChecks, CheckSquare, BookOpen, Trophy, Eye, FileText, Zap, Star, Calendar, Heart, Gift } from 'lucide-react';
import { ImportModal } from '@/components/modals/ImportModal';
import { RolesSettings } from '@/components/settings/RolesSettings';
import { TraditionsSettings } from '@/components/settings/TraditionsSettings';
import { PrioritiesSettings } from '@/components/settings/PrioritiesSettings';
import { TypesSettings } from '@/components/settings/TypesSettings';
import { StatusSettings } from '@/components/settings/StatusSettings';
import { BucketlistCategoriesSettings } from '@/components/settings/BucketlistCategoriesSettings';
import { BucketlistTypesSettings } from '@/components/settings/BucketlistTypesSettings';
import { ProjectSizesSettings } from '@/components/settings/ProjectSizesSettings';
import { WeightSettings } from '@/components/settings/WeightSettings';
import { GoalCategoriesSettings } from '@/components/settings/GoalCategoriesSettings';
import { GoogleSheetsSettings } from '@/components/settings/GoogleSheetsSettings';
import { 
  deleteAllDataAtom, 
  storiesAtom, 
  sprintsAtom, 
  goalsAtom, 
  projectsAtom, 
  visionsAtom, 
  bucketlistAtom, 
  rolesAtom, 
  labelsAtom,
  importantDatesAtom,
  traditionsAtom
} from '@/stores/appStore';
import { exportToExcel } from '@/utils/export';
import { generateTestData } from '@/utils/testDataGenerator';

type SettingsCategory = 'stories' | 'goals' | 'projects' | 'bucketlist' | 'visions' | 'roles' | 'traditions';

export function SettingsView() {
  const [, deleteAllData] = useAtom(deleteAllDataAtom);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showTestDataModal, setShowTestDataModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SettingsCategory>('stories');
  
  // Get all data for export
  const [stories, setStories] = useAtom(storiesAtom);
  const [sprints, setSprints] = useAtom(sprintsAtom);
  const [goals, setGoals] = useAtom(goalsAtom);
  const [projects, setProjects] = useAtom(projectsAtom);
  const [visions, setVisions] = useAtom(visionsAtom);
  const [bucketlist, setBucketlist] = useAtom(bucketlistAtom);
  const [roles] = useAtom(rolesAtom);
  const [labels] = useAtom(labelsAtom);
  const [importantDates, setImportantDates] = useAtom(importantDatesAtom);
  const [traditions, setTraditions] = useAtom(traditionsAtom);

  const handleDeleteAll = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    deleteAllData();
    setShowDeleteModal(false);
  };

  const handleExportData = () => {
    exportToExcel({
      stories,
      sprints,
      goals,
      projects,
      visions,
      bucketlist,
      roles,
      labels,
      importantDates,
      traditions
    });
  };

  const handleGenerateTestData = () => {
    setShowTestDataModal(true);
  };

  const handleConfirmTestData = () => {
    const testData = generateTestData();
    
    // Merge with existing data instead of replacing
    setStories(prev => [...prev, ...testData.stories]);
    setGoals(prev => [...prev, ...testData.goals]);
    setProjects(prev => [...prev, ...testData.projects]);
    setVisions(prev => [...prev, ...testData.visions]);
    setBucketlist(prev => [...prev, ...testData.bucketlist]);
    setImportantDates(prev => [...prev, ...testData.importantDates]);
    setTraditions(prev => [...prev, ...testData.traditions]);
    setSprints(prev => [...prev, ...testData.sprints]);
    
    setShowTestDataModal(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your application settings, data, and configuration options.</p>
      </div>

      <Tabs defaultValue="configuration" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="configuration" className="gap-2">
            <Settings className="h-4 w-4" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-2">
            <Download className="h-4 w-4" />
            Data Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configuration" className="space-y-6">
          {/* Visual Category Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Settings Category
              </CardTitle>
              <CardDescription>
                Choose which type of settings you want to configure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                
                <Button
                  variant={selectedCategory === 'stories' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('stories')}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <BookOpen className="h-5 w-5" />
                  <span>Stories</span>
                </Button>
                
                <Button
                  variant={selectedCategory === 'goals' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('goals')}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <Trophy className="h-5 w-5" />
                  <span>Goals</span>
                </Button>
                
                <Button
                  variant={selectedCategory === 'projects' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('projects')}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <FolderOpen className="h-5 w-5" />
                  <span>Projects</span>
                </Button>
                
                <Button
                  variant={selectedCategory === 'bucketlist' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('bucketlist')}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <ListChecks className="h-5 w-5" />
                  <span>Bucketlist</span>
                </Button>
                
                <Button
                  variant={selectedCategory === 'visions' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('visions')}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <Eye className="h-5 w-5" />
                  <span>Visions</span>
                </Button>
                
                <Button
                  variant={selectedCategory === 'roles' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('roles')}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <Users className="h-5 w-5" />
                  <span>Roles</span>
                </Button>
                
                
                <Button
                  variant={selectedCategory === 'traditions' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('traditions')}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <Heart className="h-5 w-5" />
                  <span>Traditions</span>
                </Button>
                
              </div>
            </CardContent>
          </Card>

          {/* Dynamic Settings Based on Category */}

          {selectedCategory === 'stories' && (
            <div className="space-y-6">
              {/* Priorities Settings */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                <PrioritiesSettings category="stories" />
                <div className="hidden lg:block"></div>
                <div className="hidden lg:block"></div>
              </div>

              {/* Types Settings */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                <TypesSettings category="stories" />
                <div className="hidden lg:block"></div>
                <div className="hidden lg:block"></div>
              </div>

              {/* Status Settings */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                <StatusSettings category="stories" />
                <div className="hidden lg:block"></div>
                <div className="hidden lg:block"></div>
              </div>

              {/* Weight Settings */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                <WeightSettings />
                <div className="hidden lg:block"></div>
                <div className="hidden lg:block"></div>
              </div>
            </div>
          )}

          {selectedCategory === 'goals' && (
            <div className="space-y-6">
              {/* Goal Categories Settings */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                <GoalCategoriesSettings />
                <div className="hidden lg:block"></div>
                <div className="hidden lg:block"></div>
              </div>

              {/* Priorities Settings */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                <PrioritiesSettings category="goals" />
                <div className="hidden lg:block"></div>
                <div className="hidden lg:block"></div>
              </div>

              {/* Types Settings */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                <TypesSettings category="goals" />
                <div className="hidden lg:block"></div>
                <div className="hidden lg:block"></div>
              </div>

              {/* Status Settings */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                <StatusSettings category="goals" />
                <div className="hidden lg:block"></div>
                <div className="hidden lg:block"></div>
              </div>
            </div>
          )}

          {selectedCategory === 'projects' && (
            <div className="space-y-6">
              {/* Types Settings */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                <TypesSettings category="projects" />
                <div className="hidden lg:block"></div>
                <div className="hidden lg:block"></div>
              </div>

              {/* Status Settings */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                <StatusSettings category="projects" />
                <div className="hidden lg:block"></div>
                <div className="hidden lg:block"></div>
              </div>

              {/* Project Sizes Settings */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                <ProjectSizesSettings />
                <div className="hidden lg:block"></div>
                <div className="hidden lg:block"></div>
              </div>
            </div>
          )}

          {selectedCategory === 'bucketlist' && (
            <div className="space-y-6">
              {/* Types Settings */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                <BucketlistTypesSettings />
                <div className="hidden lg:block"></div>
                <div className="hidden lg:block"></div>
              </div>

              {/* Categories Settings */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                <BucketlistCategoriesSettings />
                <div className="hidden lg:block"></div>
                <div className="hidden lg:block"></div>
              </div>
              
              {/* Status Settings */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                <StatusSettings category="bucketlist" />
                <div className="hidden lg:block"></div>
                <div className="hidden lg:block"></div>
              </div>
              
              {/* Priorities Settings */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                <PrioritiesSettings category="bucketlist" />
                <div className="hidden lg:block"></div>
                <div className="hidden lg:block"></div>
              </div>
            </div>
          )}

          {selectedCategory === 'visions' && (
            <div className="space-y-6">
              <TypesSettings category="visions" />
            </div>
          )}

          {selectedCategory === 'roles' && (
            <div className="space-y-6">
              <RolesSettings />
            </div>
          )}


          {selectedCategory === 'traditions' && (
            <div className="space-y-6">
              <TraditionsSettings />
            </div>
          )}

        </TabsContent>

        <TabsContent value="data" className="space-y-3 sm:space-y-4">
          <Collapsible
            title="Data Export"
            description="Export all your data to a CSV file that can be opened in Excel or other spreadsheet applications."
            icon={<Download className="h-5 w-5" />}
            defaultOpen={false}
          >
            <div className="space-y-3 sm:space-y-4">
              <div>
                <h3 className="font-medium text-sm sm:text-base">Export All Data</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                  Download all your data in a single CSV file that can be opened in Excel or other spreadsheet applications.
                </p>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  <p className="font-medium mb-2">Data included:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    <div>Stories ({stories.length} items)</div>
                    <div>Goals ({goals.length} items)</div>
                    <div>Projects ({projects.length} items)</div>
                    <div>Visions ({visions.length} items)</div>
                    <div>Bucketlist ({bucketlist.length} items)</div>
                    <div>Important Dates ({importantDates.length} items)</div>
                    <div>Traditions ({traditions.length} items)</div>
                    <div>Sprints ({sprints.length} items)</div>
                    <div>Roles ({roles.length} items)</div>
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleExportData}
                className="gap-2 w-full sm:w-auto"
                size="sm"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Export to Excel/CSV
              </Button>
            </div>
          </Collapsible>

          <Collapsible
            title="Data Import"
            description="Import data from a CSV file. You can choose to merge with existing data or overwrite it completely."
            icon={<Upload className="h-5 w-5" />}
          >
            <div className="space-y-3 sm:space-y-4">
              <div>
                <h3 className="font-medium text-sm sm:text-base">Import Data</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                  Upload a CSV file to import your data. You can choose which data types to import and whether to merge or overwrite existing data.
                </p>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  <p className="font-medium mb-2">Import options:</p>
                  <div className="space-y-1">
                    <div><strong>Merge:</strong> Add new items without replacing existing ones</div>
                    <div><strong>Overwrite:</strong> Replace all existing data with imported data</div>
                    <div>Select specific data types to import</div>
                    <div>Preview data before importing</div>
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => setShowImportModal(true)}
                className="gap-2 w-full sm:w-auto"
                size="sm"
              >
                <Upload className="h-4 w-4" />
                Import from CSV
              </Button>
            </div>
          </Collapsible>

          <Collapsible
            title="Test Data"
            description="Generate pseudo data for testing and demonstration purposes. This will add sample data to your existing data."
            icon={<Zap className="h-5 w-5" />}
          >
            <div className="space-y-3 sm:space-y-4">
              <div>
                <h3 className="font-medium text-sm sm:text-base">Generate Test Data</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                  Create realistic sample data to test the application features and see how it works with populated data.
                </p>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  <p className="font-medium mb-2">Test data includes:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    <div>25 Stories with various statuses and priorities</div>
                    <div>15 Goals across different categories</div>
                    <div>8 Projects with realistic timelines</div>
                    <div>6 Visions for different life areas</div>
                    <div>20 Bucketlist items (locations and experiences)</div>
                    <div>12 Important dates and events</div>
                    <div>10 Traditions and recurring activities</div>
                    <div>8 Sprints for project management</div>
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleGenerateTestData}
                className="gap-2 w-full sm:w-auto"
                size="sm"
              >
                <Zap className="h-4 w-4" />
                Generate Test Data
              </Button>
            </div>
          </Collapsible>

          <Collapsible
            title="Google Sheets Integration"
            description="Connect your life planner to Google Sheets for cloud storage and synchronization."
            icon={<FileSpreadsheet className="h-5 w-5" />}
          >
            <GoogleSheetsSettings />
          </Collapsible>

          <Collapsible
            title="Danger Zone"
            description="These actions are irreversible. Please proceed with caution."
            icon={<AlertTriangle className="h-5 w-5" />}
            className="border-destructive"
          >
            <div className="space-y-3 sm:space-y-4">
              <div>
                <h3 className="font-medium text-sm sm:text-base">Delete All Data</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Permanently delete all stories, goals, projects, visions, and other data. This action cannot be undone.
                </p>
              </div>
              <Button 
                variant="destructive" 
                onClick={handleDeleteAll}
                className="gap-2 w-full sm:w-auto"
                size="sm"
              >
                <Trash2 className="h-4 w-4" />
                Delete All Data
              </Button>
            </div>
          </Collapsible>

      {showDeleteModal && (
        <DeleteAllModal 
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {showTestDataModal && (
        <TestDataModal 
          onConfirm={handleConfirmTestData}
          onCancel={() => setShowTestDataModal(false)}
        />
      )}

        </TabsContent>
      </Tabs>

      <ImportModal 
        open={showImportModal}
        onOpenChange={setShowImportModal}
      />
    </div>
  );
}

interface DeleteAllModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteAllModal({ onConfirm, onCancel }: DeleteAllModalProps) {
  const [confirmationText, setConfirmationText] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);

  const requiredText = 'DELETE ALL DATA';
  const isTextValid = confirmationText === requiredText;

  const handleTextChange = (value: string) => {
    setConfirmationText(value);
    setIsConfirmed(value === requiredText);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete All Data
          </CardTitle>
          <CardDescription>
            This action is permanent and cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm">
              This will permanently delete:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>All stories and sprints</li>
              <li>All goals and visions</li>
              <li>All projects</li>
              <li>All bucketlist items</li>
              <li>All important dates</li>
              <li>All traditions</li>
              <li>All roles</li>
              <li>All boards and columns</li>
            </ul>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmation" className="text-sm font-medium">
              To confirm, type <code className="bg-muted px-1 rounded">{requiredText}</code> in the box below:
            </label>
            <input
              id="confirmation"
              type="text"
              value={confirmationText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={requiredText}
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              autoComplete="off"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={onConfirm}
              disabled={!isConfirmed}
            >
              Delete All Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface TestDataModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

function TestDataModal({ onConfirm, onCancel }: TestDataModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Generate Test Data
          </CardTitle>
          <CardDescription>
            This will add sample data to your existing data for testing purposes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm">
              This will generate realistic sample data including:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>25 Stories with various statuses and priorities</li>
              <li>15 Goals across different categories</li>
              <li>8 Projects with realistic timelines</li>
              <li>6 Visions for different life areas</li>
              <li>20 Bucketlist items (locations and experiences)</li>
              <li>12 Important dates and events</li>
              <li>10 Traditions and recurring activities</li>
              <li>8 Sprints for project management</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-3">
              <strong>Note:</strong> This data will be added to your existing data, not replace it.
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={onConfirm} className="gap-2">
              <Zap className="h-4 w-4" />
              Generate Test Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
