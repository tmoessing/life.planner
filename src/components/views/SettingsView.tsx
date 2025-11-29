import { useState } from 'react';
import { useAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, AlertTriangle, Download, FileSpreadsheet, Upload, Settings, Users, Tag, Target, FolderOpen, Sparkles, ListChecks, CheckSquare, BookOpen, Trophy, Eye, FileText, Zap, Star, Calendar, Heart, Gift, GraduationCap, Moon, Monitor } from 'lucide-react';
import { settingsAtom } from '@/stores/settingsStore';
import { ImportModal } from '@/components/modals/ImportModal';
import { RolesSettings } from '@/components/settings/RolesSettings';
import { TraditionsSettings } from '@/components/settings/TraditionsSettings';
import { PrioritiesSettings } from '@/components/settings/PrioritiesSettings';
import { TypesSettings } from '@/components/settings/TypesSettings';
import { StatusSettings } from '@/components/settings/StatusSettings';
import { BucketlistCategoriesSettings } from '@/components/settings/BucketlistCategoriesSettings';
import { BucketlistTypesSettings } from '@/components/settings/BucketlistTypesSettings';
import { ProjectSizesSettings } from '@/components/settings/ProjectSizesSettings';
import { ProjectPrioritySettings } from '@/components/settings/ProjectPrioritySettings';
import { WeightSettings } from '@/components/settings/WeightSettings';
import { GoalCategoriesSettings } from '@/components/settings/GoalCategoriesSettings';
import { ImportantDateSettings } from '@/components/settings/ImportantDateSettings';
import { TaskCategoriesSettings } from '@/components/settings/TaskCategoriesSettings';
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
import { classesAtom } from '@/stores/classStore';
import { assignmentsAtom } from '@/stores/assignmentStore';
import { exportToExcel } from '@/utils/export';
import { generateTestData } from '@/utils/testDataGenerator';

type SettingsCategory = 'stories' | 'goals' | 'projects' | 'bucketlist' | 'visions' | 'roles' | 'traditions' | 'important-dates';

export function SettingsView() {
  const [, deleteAllData] = useAtom(deleteAllDataAtom);
  const [settings, setSettings] = useAtom(settingsAtom);
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
  const [classes, setClasses] = useAtom(classesAtom);
  const [assignments, setAssignments] = useAtom(assignmentsAtom);

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
    setClasses(prev => [...prev, ...testData.classes]);
    setAssignments(prev => [...prev, ...testData.assignments]);
    
    setShowTestDataModal(false);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="configuration" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="configuration" className="gap-1 sm:gap-2 py-2 sm:py-1.5 touch-target min-h-[44px] sm:min-h-0">
            <Settings className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Configuration</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-1 sm:gap-2 py-2 sm:py-1.5 touch-target min-h-[44px] sm:min-h-0">
            <Download className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Data Management</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configuration" className="space-y-6">
          {/* Visual Category Selector */}
          <Card className="sticky top-4 z-20 glass-panel rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Settings className="h-5 w-5" />
                Settings Category
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Choose which type of settings you want to configure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                
                <Button
                  variant={selectedCategory === 'stories' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('stories')}
                  className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 h-auto min-w-fit text-xs sm:text-sm rounded-full transition-all duration-150 hover:scale-[1.03] hover:shadow-md"
                >
                  <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Stories</span>
                </Button>
                
                <Button
                  variant={selectedCategory === 'goals' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('goals')}
                  className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 h-auto min-w-fit text-xs sm:text-sm rounded-full transition-all duration-150 hover:scale-[1.03] hover:shadow-md"
                >
                  <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Goals</span>
                </Button>
                
                <Button
                  variant={selectedCategory === 'projects' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('projects')}
                  className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 h-auto min-w-fit text-xs sm:text-sm rounded-full transition-all duration-150 hover:scale-[1.03] hover:shadow-md"
                >
                  <FolderOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Projects</span>
                </Button>
                
                <Button
                  variant={selectedCategory === 'bucketlist' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('bucketlist')}
                  className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 h-auto min-w-fit text-xs sm:text-sm rounded-full transition-all duration-150 hover:scale-[1.03] hover:shadow-md"
                >
                  <ListChecks className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Bucketlist</span>
                </Button>
                
                <Button
                  variant={selectedCategory === 'visions' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('visions')}
                  className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 h-auto min-w-fit text-xs sm:text-sm rounded-full transition-all duration-150 hover:scale-[1.03] hover:shadow-md"
                >
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Visions</span>
                </Button>
                
                <Button
                  variant={selectedCategory === 'roles' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('roles')}
                  className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 h-auto min-w-fit text-xs sm:text-sm rounded-full transition-all duration-150 hover:scale-[1.03] hover:shadow-md"
                >
                  <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Roles</span>
                </Button>
                
                <Button
                  variant={selectedCategory === 'traditions' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('traditions')}
                  className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 h-auto min-w-fit text-xs sm:text-sm rounded-full transition-all duration-150 hover:scale-[1.03] hover:shadow-md"
                >
                  <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Traditions</span>
                </Button>
                
                <Button
                  variant={selectedCategory === 'important-dates' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('important-dates')}
                  className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 h-auto min-w-fit text-xs sm:text-sm rounded-full transition-all duration-150 hover:scale-[1.03] hover:shadow-md"
                >
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Important Dates</span>
                </Button>
                
              </div>
            </CardContent>
          </Card>

          {/* Dynamic Settings Based on Category */}

          {selectedCategory === 'stories' && (
            <div className="space-y-4">
              <Collapsible
                title="Story Priorities (Quadrants)"
                description="Manage priority levels (Q1, Q2, Q3, Q4) and their colors for stories."
                defaultOpen={false}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                  <PrioritiesSettings category="stories" />
                  <div className="hidden lg:block"></div>
                  <div className="hidden lg:block"></div>
                </div>
              </Collapsible>

              <Collapsible
                title="Story Types"
                description="Manage types for categorizing stories."
                defaultOpen={false}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                  <TypesSettings category="stories" />
                  <div className="hidden lg:block"></div>
                  <div className="hidden lg:block"></div>
                </div>
              </Collapsible>

              <Collapsible
                title="Story Statuses"
                description="Manage status levels (icebox, backlog, todo, progress, review, done) and their colors."
                defaultOpen={false}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                  <StatusSettings category="stories" />
                  <div className="hidden lg:block"></div>
                  <div className="hidden lg:block"></div>
                </div>
              </Collapsible>

              <Collapsible
                title="Weight Settings"
                description="Configure the weight gradient colors for story and assignment weights."
                defaultOpen={false}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                  <WeightSettings />
                  <div className="hidden lg:block"></div>
                  <div className="hidden lg:block"></div>
                </div>
              </Collapsible>

              <Collapsible
                title="Task Categories"
                description="Manage task categories with colors for visual identification."
                defaultOpen={false}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                  <TaskCategoriesSettings />
                  <div className="hidden lg:block"></div>
                  <div className="hidden lg:block"></div>
                </div>
              </Collapsible>
            </div>
          )}

          {selectedCategory === 'goals' && (
            <div className="space-y-4">
              <Collapsible
                title="Goal Categories"
                description="Manage categories for organizing goals. These appear in the Add Goals view dropdown."
                defaultOpen={false}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                  <GoalCategoriesSettings />
                  <div className="hidden lg:block"></div>
                  <div className="hidden lg:block"></div>
                </div>
              </Collapsible>

              <Collapsible
                title="Goal Priorities"
                description="Manage priority levels and their colors for goals."
                defaultOpen={false}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                  <PrioritiesSettings category="goals" />
                  <div className="hidden lg:block"></div>
                  <div className="hidden lg:block"></div>
                </div>
              </Collapsible>

              <Collapsible
                title="Goal Types"
                description="Manage types for categorizing goals."
                defaultOpen={false}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                  <TypesSettings category="goals" />
                  <div className="hidden lg:block"></div>
                  <div className="hidden lg:block"></div>
                </div>
              </Collapsible>

              <Collapsible
                title="Goal Statuses"
                description="Manage status levels and their colors for goals."
                defaultOpen={false}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                  <StatusSettings category="goals" />
                  <div className="hidden lg:block"></div>
                  <div className="hidden lg:block"></div>
                </div>
              </Collapsible>
            </div>
          )}

          {selectedCategory === 'projects' && (
            <div className="space-y-4">
              <Collapsible
                title="Project Types"
                description="Manage types for categorizing projects."
                defaultOpen={false}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                  <TypesSettings category="projects" />
                  <div className="hidden lg:block"></div>
                  <div className="hidden lg:block"></div>
                </div>
              </Collapsible>

              <Collapsible
                title="Project Statuses"
                description="Manage status levels and their colors for projects."
                defaultOpen={false}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                  <StatusSettings category="projects" />
                  <div className="hidden lg:block"></div>
                  <div className="hidden lg:block"></div>
                </div>
              </Collapsible>

              <Collapsible
                title="Project Sizes"
                description="Manage project sizes (XS, S, M, L, XL) with colors for visual identification."
                defaultOpen={false}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                  <ProjectSizesSettings />
                  <div className="hidden lg:block"></div>
                  <div className="hidden lg:block"></div>
                </div>
              </Collapsible>

              <Collapsible
                title="Project Priority Colors"
                description="Manage project priority levels and their colors for visual identification."
                defaultOpen={false}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                  <ProjectPrioritySettings />
                  <div className="hidden lg:block"></div>
                  <div className="hidden lg:block"></div>
                </div>
              </Collapsible>
            </div>
          )}

          {selectedCategory === 'bucketlist' && (
            <div className="space-y-4">
              <Collapsible
                title="Bucketlist Types"
                description="Manage types for organizing bucketlist items. These appear in the bucketlist modal dropdown."
                defaultOpen={false}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                  <BucketlistTypesSettings />
                  <div className="hidden lg:block"></div>
                  <div className="hidden lg:block"></div>
                </div>
              </Collapsible>

              <Collapsible
                title="Bucketlist Categories"
                description="Manage categories for organizing bucketlist items. These appear in the bucketlist modal dropdown."
                defaultOpen={false}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                  <BucketlistCategoriesSettings />
                  <div className="hidden lg:block"></div>
                  <div className="hidden lg:block"></div>
                </div>
              </Collapsible>

              <Collapsible
                title="Bucketlist Statuses"
                description="Manage status levels and their colors for bucketlist items."
                defaultOpen={false}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                  <StatusSettings category="bucketlist" />
                  <div className="hidden lg:block"></div>
                  <div className="hidden lg:block"></div>
                </div>
              </Collapsible>

              <Collapsible
                title="Bucketlist Priorities"
                description="Manage priority levels and their colors for bucketlist items."
                defaultOpen={false}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                  <PrioritiesSettings category="bucketlist" />
                  <div className="hidden lg:block"></div>
                  <div className="hidden lg:block"></div>
                </div>
              </Collapsible>
            </div>
          )}

          {selectedCategory === 'visions' && (
            <div className="space-y-4">
              <Collapsible
                title="Vision Types"
                description="Manage types for categorizing visions."
                defaultOpen={false}
              >
                <TypesSettings category="visions" />
              </Collapsible>
            </div>
          )}

          {selectedCategory === 'roles' && (
            <div className="space-y-4">
              <Collapsible
                title="Roles"
                description="Manage roles that can be assigned to stories and other items."
                defaultOpen={false}
              >
                <RolesSettings />
              </Collapsible>
            </div>
          )}

          {selectedCategory === 'traditions' && (
            <div className="space-y-4">
              <Collapsible
                title="Tradition Types"
                description="Manage tradition types (life areas) that can be assigned to traditions."
                defaultOpen={false}
              >
                <TraditionsSettings />
              </Collapsible>
            </div>
          )}

          {selectedCategory === 'important-dates' && (
            <div className="space-y-4">
              <Collapsible
                title="Important Date Categories"
                description="Manage important date categories with colors for visual identification."
                defaultOpen={false}
              >
                <ImportantDateSettings />
              </Collapsible>
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
                    <div>6 Classes with schedules and assignments</div>
                    <div>18-48 Assignments linked to classes</div>
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
            title="Appearance"
            description="Customize the appearance and theme of the application."
            icon={<Moon className="h-5 w-5" />}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1">
                  <Label htmlFor="theme" className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Theme
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Choose between light mode, dark mode, or follow your system preference.
                  </p>
                </div>
                <Select
                  value={settings.ui?.theme || 'system'}
                  onValueChange={(value: 'light' | 'dark' | 'system') => {
                    setSettings({
                      ...settings,
                      ui: {
                        ...settings.ui,
                        theme: value
                      }
                    });
                  }}
                >
                  <SelectTrigger id="theme" className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Collapsible>

          <Collapsible
            title="UI Visibility"
            description="Control which sections and features are visible in the application."
            icon={<Settings className="h-5 w-5" />}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="hideClasses" className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Show Classes
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle visibility of the Classes section in navigation. Hide this when you're not in classes.
                  </p>
                </div>
                <Switch
                  id="hideClasses"
                  checked={settings.layout.sections.classes}
                  onCheckedChange={(checked) => {
                    setSettings({
                      ...settings,
                      layout: {
                        ...settings.layout,
                        sections: {
                          ...settings.layout.sections,
                          classes: checked
                        }
                      }
                    });
                  }}
                />
              </div>
            </div>
          </Collapsible>

          <Collapsible
            title="Danger Zone"
            description="These actions are irreversible. Please proceed with caution."
            icon={<AlertTriangle className="h-5 w-5" />}
            className="border-destructive glass-danger"
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
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete All Data
          </DialogTitle>
          <DialogDescription>
            This action is permanent and cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
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
            <Input
              id="confirmation"
              type="text"
              value={confirmationText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={requiredText}
              autoComplete="off"
            />
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="w-full sm:w-auto touch-target min-h-[44px] sm:min-h-0"
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
            disabled={!isConfirmed}
            className="w-full sm:w-auto touch-target min-h-[44px] sm:min-h-0"
          >
            Delete All Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface TestDataModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

function TestDataModal({ onConfirm, onCancel }: TestDataModalProps) {
  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Generate Test Data
          </DialogTitle>
          <DialogDescription>
            This will add sample data to your existing data for testing purposes.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
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
              <li>6 Classes with schedules and assignments</li>
              <li>18-48 Assignments linked to classes</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-3">
              <strong>Note:</strong> This data will be added to your existing data, not replace it.
            </p>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="w-full sm:w-auto touch-target min-h-[44px] sm:min-h-0"
          >
            Cancel
          </Button>
          <Button 
            onClick={onConfirm} 
            className="gap-2 w-full sm:w-auto touch-target min-h-[44px] sm:min-h-0"
          >
            <Zap className="h-4 w-4" />
            Generate Test Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
