// IDs are strings (uuid style)

export type Priority = "Q1" | "Q2" | "Q3" | "Q4" | "high" | "medium" | "low"; // Priority levels (Eisenhower Matrix + traditional)
export type StoryType = "Spiritual" | "Physical" | "Intellectual" | "Social" | string;

export type Role = {
  id: string;
  name: string; // e.g., Disciple of Christ, Student
  color: string; // hex
};

export type Label = { 
  id: string; 
  name: string; 
  color: string; 
};

export type Vision = {
  id: string;
  title: string;
  name: string; // alias for title for compatibility
  description?: string; // optional short description
  type: StoryType;
  order: number; // for Importance view ordering
};

export type Goal = {
  id: string;
  title: string;
  name: string; // alias for title for compatibility
  description?: string;
  visionId?: string; // reference to a vision
  category: 'target' | 'lifestyle-value'; // goal category (Target or Lifestyle/Value)
  goalType: string; // goal type (Spiritual, Physical, Intellectual, Social, Financial, Protector)
  roleId?: string; // reference to a role
  priority: Priority; // priority tied to settings
  status: 'icebox' | 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';
  order: number;
  storyIds?: string[]; // references to stories assigned to this goal
  projectId?: string; // reference to a project
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BucketlistItem = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string;
  category?: string;
  priority: Priority;
  bucketlistType: 'location' | 'experience';
  status?: 'in-progress' | 'completed' | 'not-started' | 'on-hold';
  roleId?: string;
  visionId?: string;
  dueDate?: string;
  order?: number;
  // Location fields (only used when bucketlistType is 'location')
  country?: string;
  state?: string;
  city?: string;
  // Experience fields (only used when bucketlistType is 'experience')
  experienceCategory?: string;
  createdAt: string;
  updatedAt: string;
};

export type ImportantDate = {
  id: string;
  title: string;
  date: string; // ISO date string
  createdAt: string;
  updatedAt: string;
};

export type Tradition = {
  id: string;
  title: string;
  description: string;
  traditionType: string; // Holiday, Celebration, Traditional
  traditionalCategory: string; // Social, Spiritual, Physical, Intellectual
  createdAt: string;
  updatedAt: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  status: 'Icebox' | 'Backlog' | 'To do' | 'In Progress' | 'Done';
  priority: Priority;
  roleId?: string;
  visionId?: string;
  order: number;
  startDate: string;
  endDate: string;
  storyIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type Story = {
  id: string;
  title: string;
  description: string; // templated as described below
  labels: string[]; // label ids
  priority: Priority;
  weight: 1 | 3 | 5 | 8 | 13 | 21;
  size: "XS" | "S" | "M" | "L" | "XL"; // used for time estimate picker
  type: StoryType; // mapped to role when applicable
  status: "icebox" | "backlog" | "todo" | "progress" | "review" | "done"; // Kanban status
  roleId?: string; // Role selection
  visionId?: string; // link to Vision
  projectId?: string; // link to Project
  dueDate?: string; // ISO date
  sprintId?: string; // nullable, story may exist without a sprint
  scheduled?: string; // ISO date for Roadmap scheduling, optional
  taskCategories?: string[]; // Multiple task categories: Decisions, Actions, Involve Others
  scheduledDate?: string; // ISO date for scheduled date
  location?: string; // Location attribute
  goalId?: string; // Associated goal ID (optional)
  checklist: { id: string; text: string; done: boolean }[];
  createdAt: string;
  updatedAt: string;
  deleted?: boolean;
  repeat?: {
    cadence: "none" | "weekly" | "biweekly" | "monthly"; // implement weekly at minimum
    count?: number; // optional number of repeats
  };
  subtasks?: string[]; // child Story ids for bigger work
};

export type Sprint = {
  id: string; // format: Week-<isoWeek>-<year>
  isoWeek: number;
  year: number;
  startDate: string; // Monday ISO
  endDate: string; // Sunday ISO
};

export type Board = {
  id: string;
  name: string;
  columns: string[]; // column ids in order
};

export type Column = {
  id: string;
  name: "Icebox" | "Backlog" | "To Do" | "In Progress" | "Review" | "Done";
  storyIds: string[];
};

export type StoryTypeConfig = {
  name: string;
  color: string; // hex color
};

export type StorySizeConfig = {
  name: string;
  color: string; // hex color
  timeEstimate: string; // e.g., "15 min", "1 hour", "2-4 hours"
};

export type TaskCategoryConfig = {
  name: string;
  color: string; // hex color
};

export type VisionTypeConfig = {
  name: string;
  color: string; // hex color
};

export type GoalCategoryConfig = {
  name: string;
  color: string; // hex color
};

export type GoalTypeConfig = {
  name: string;
  color: string; // hex color
};

export type BucketlistTypeConfig = {
  name: string;
  color: string; // hex color
};

export type TraditionTypeConfig = {
  id: string;
  name: string;
  color: string; // hex color
};

export type Settings = {
  theme: "light" | "dark" | "system";
  roles: Role[]; // editable
  labels: Label[]; // editable, color aware
  storyTypes: StoryTypeConfig[]; // story types with colors
  storySizes: StorySizeConfig[]; // story sizes with colors and time estimates
  taskCategories: TaskCategoryConfig[]; // task categories with colors
  visionTypes: VisionTypeConfig[]; // vision types with colors
  goalCategories: GoalCategoryConfig[]; // goal categories with colors (Target, Lifestyle/Value)
  goalTypes: GoalTypeConfig[]; // goal types with colors (Spiritual, Physical, Intellectual, Social, Financial, Protector)
  goalStatuses: StoryTypeConfig[]; // goal statuses with colors (Not Started, In Progress, Completed, Paused, Cancelled)
  bucketlistTypes: BucketlistTypeConfig[]; // bucketlist types with colors (Location, Experience)
  bucketlistCategories: StoryTypeConfig[]; // bucketlist categories with colors (Adventure, Travel, Learning, etc.)
  countries: string[]; // list of countries for location-based bucketlist items
  usStates: string[]; // list of US states
  experienceCategories: string[]; // list of experience categories
  projectTypes: StoryTypeConfig[]; // project types with colors
  traditionTypes: StoryTypeConfig[]; // tradition types with colors
  traditionalCategories: StoryTypeConfig[]; // traditional categories with colors
  importantDateTypes: StoryTypeConfig[]; // important date types with colors
  priorityColors: Record<Priority, string>; // priority colors (Q1, Q2, Q3, Q4 for stories)
  bucketlistPriorityColors: Record<string, string>; // bucketlist priority colors (low, medium, high)
  weightBaseColor: string; // base color for weight gradient
  roleToTypeMap: Record<string, StoryType>; // Disciple -> Spiritual, Friend -> Social, etc.
  statusColors: Record<string, string>; // status colors (icebox, backlog, todo, progress, review, done)
  projectStatusColors: Record<string, string>; // project status colors (icebox, backlog, todo, progress, done)
  roadmapScheduledColor: string; // color for scheduled items in roadmap
  sizeColors: Record<string, string>; // size colors for story sizes
  chartColors: {
    ideal: string;
    actual: string;
  }; // chart colors for burndown/burnup charts
  
  // UI Customization
  ui: UICustomization;
  
  // Layout Customization
  layout: LayoutCustomization;
  
  // Behavior Customization
  behavior: BehaviorCustomization;
  
  // Accessibility Customization
  accessibility: AccessibilityCustomization;
};

export type UICustomization = {
  // Theme and Colors
  theme: "light" | "dark" | "system" | "auto";
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  mutedTextColor: string;
  borderColor: string;
  
  // Typography
  fontFamily: "system" | "serif" | "mono" | "custom";
  customFontFamily?: string;
  fontSize: "small" | "medium" | "large";
  fontWeight: "light" | "normal" | "medium" | "semibold" | "bold";
  lineHeight: "tight" | "normal" | "relaxed";
  
  // Spacing and Sizing
  spacing: "compact" | "normal" | "comfortable";
  borderRadius: "none" | "small" | "medium" | "large";
  shadowIntensity: "none" | "subtle" | "medium" | "strong";
  
  // Component Visibility
  header: {
    show: boolean;
    showTitle: boolean;
    showNavigation: boolean;
    showAddButton: boolean;
    showPlannerButton: boolean;
    showSettingsButton: boolean;
    compactMode: boolean;
  };
  
  navigation: {
    show: boolean;
    showGroupLabels: boolean;
    showDescriptions: boolean;
    compactMode: boolean;
    position: "top" | "sidebar" | "bottom";
  };
  
  addDropdown: {
    show: boolean;
    showSingleAdd: boolean;
    showBulkAdd: boolean;
    showLabels: boolean;
    compactMode: boolean;
  };
  
  // Button Customization
  buttons: {
    style: "default" | "minimal" | "outlined" | "filled";
    size: "small" | "medium" | "large";
    showIcons: boolean;
    showLabels: boolean;
    hoverEffects: boolean;
    clickEffects: boolean;
  };
  
  // Card Customization
  cards: {
    style: "default" | "minimal" | "elevated" | "outlined";
    showBorders: boolean;
    showShadows: boolean;
    hoverEffects: boolean;
    compactMode: boolean;
  };
  
  // Modal Customization
  modals: {
    backdrop: "blur" | "dark" | "light" | "none";
    animation: "slide" | "fade" | "scale" | "none";
    size: "small" | "medium" | "large" | "full";
    position: "center" | "top" | "bottom";
  };
  
  // Form Customization
  forms: {
    inputStyle: "default" | "minimal" | "outlined" | "filled";
    showLabels: boolean;
    showHelpText: boolean;
    validationStyle: "inline" | "tooltip" | "modal";
    autoSave: boolean;
  };
};

export type LayoutCustomization = {
  // Overall Layout
  containerWidth: "narrow" | "normal" | "wide" | "full";
  sidebarWidth: "narrow" | "normal" | "wide";
  sidebarPosition: "left" | "right" | "none";
  
  // Header Layout
  headerHeight: "small" | "medium" | "large";
  headerSticky: boolean;
  headerTransparent: boolean;
  
  // Navigation Layout
  navigationStyle: "horizontal" | "vertical" | "dropdown" | "tabs";
  navigationPosition: "top" | "sidebar" | "bottom";
  showNavigationLabels: boolean;
  showNavigationIcons: boolean;
  
  // Content Layout
  contentPadding: "none" | "small" | "medium" | "large";
  contentMaxWidth: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  contentCentered: boolean;
  
  // Grid Layouts
  storyGridColumns: number;
  projectGridColumns: number;
  goalGridColumns: number;
  
  // Responsive Behavior
  mobileLayout: "stack" | "collapse" | "hide";
  tabletLayout: "stack" | "side-by-side" | "grid";
  desktopLayout: "full" | "sidebar" | "grid";
  
  // Section Visibility
  sections: {
    header: boolean;
    navigation: boolean;
    content: boolean;
    footer: boolean;
    sidebar: boolean;
  };
  
  // Component Arrangement
  componentOrder: {
    header: string[];
    navigation: string[];
    content: string[];
    sidebar: string[];
  };
};

export type BehaviorCustomization = {
  // Interaction Behavior
  interactions: {
    hoverDelay: number; // milliseconds
    clickDelay: number; // milliseconds
    doubleClickDelay: number; // milliseconds
    dragThreshold: number; // pixels
    scrollSensitivity: number; // multiplier
  };
  
  // Animation Behavior
  animations: {
    enabled: boolean;
    duration: "fast" | "normal" | "slow";
    easing: "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out";
    reduceMotion: boolean;
  };
  
  // Auto-save Behavior
  autoSave: {
    enabled: boolean;
    interval: number; // seconds
    showIndicator: boolean;
    showNotifications: boolean;
  };
  
  // Keyboard Shortcuts
  shortcuts: {
    enabled: boolean;
    showHints: boolean;
    customShortcuts: Record<string, string>;
  };
  
  // Data Behavior
  data: {
    confirmDeletes: boolean;
    confirmOverwrites: boolean;
    autoBackup: boolean;
    backupInterval: number; // hours
    maxBackups: number;
  };
  
  // Navigation Behavior
  navigation: {
    rememberLastView: boolean;
    showBreadcrumbs: boolean;
    autoCloseDropdowns: boolean;
    keyboardNavigation: boolean;
  };
  
  // Form Behavior
  forms: {
    autoFocus: boolean;
    validateOnBlur: boolean;
    validateOnChange: boolean;
    showValidationErrors: boolean;
    autoComplete: boolean;
  };
  
  // Modal Behavior
  modals: {
    closeOnEscape: boolean;
    closeOnBackdrop: boolean;
    preventScroll: boolean;
    restoreFocus: boolean;
  };
};

export type AccessibilityCustomization = {
  // Visual Accessibility
  visual: {
    highContrast: boolean;
    reducedMotion: boolean;
    largeText: boolean;
    colorBlindFriendly: boolean;
    focusIndicators: boolean;
  };
  
  // Motor Accessibility
  motor: {
    largeTouchTargets: boolean;
    reducedPrecisionRequired: boolean;
    voiceControl: boolean;
    switchControl: boolean;
  };
  
  // Cognitive Accessibility
  cognitive: {
    simplifiedInterface: boolean;
    clearLabels: boolean;
    progressIndicators: boolean;
    errorPrevention: boolean;
    helpText: boolean;
  };
  
  // Screen Reader Support
  screenReader: {
    announceChanges: boolean;
    describeImages: boolean;
    skipLinks: boolean;
    landmarks: boolean;
  };
  
  // Keyboard Navigation
  keyboard: {
    tabOrder: "logical" | "visual" | "custom";
    focusTrapping: boolean;
    escapeHandling: boolean;
    arrowKeyNavigation: boolean;
  };
};

export type AppState = {
  stories: Story[];
  sprints: Sprint[];
  boards: Board[];
  columns: Column[];
  visions: Vision[];
  settings: Settings;
  selectedSprintId?: string;
  selectedStoryIds: string[];
  focusedStoryId?: string;
  filters: {
    text: string;
    keywords: string;
    dueSoon: boolean;
  };
  layout: {
    chartSectionCollapsed: boolean;
    boardSectionCollapsed: boolean;
    roadmapSectionCollapsed: boolean;
    chartAboveBoard: boolean;
    roadmapPosition: 'top' | 'middle' | 'bottom';
  };
  ui: {
    chartCollapsed: {
      burndown: boolean;
      burnup: boolean;
    };
  };
};

// View types
export type ViewType = "today" | "sprint" | "story-boards" | "importance" | "goals" | "goals-kanban" | "bucketlist" | "planner" | "sprint-planning" | "add-stories" | "add-goals" | "add-projects" | "add-bucketlist" | "projects" | "projects-kanban" | "project-product-management" | "important-dates" | "traditions" | "goal-boards" | "settings";

// Filter keyword types
export type FilterKey = "sprint" | "type" | "role" | "priority" | "label" | "weight" | "size" | "due" | "dueSoon";
export type FilterOperator = "=" | "!=";

// Brain level and time bucket types for Planner
export type BrainLevel = "low" | "moderate" | "high";
export type TimeBucket = "XS" | "S" | "M" | "L" | "XL";

// Chart data types
export type BurndownData = {
  day: string;
  ideal: number;
  actual: number;
};

export type BurnupData = {
  day: string;
  completed: number;
  total: number;
};

// Multi-select and keyboard navigation
export type SelectionMode = "single" | "multi";
export type NavigationDirection = "up" | "down" | "left" | "right";

// Modal types
export type ModalType = "add-story" | "edit-story" | "delete-story" | "help" | "import" | "export";

// Roadmap grid types
export type RoadmapCell = {
  date: string;
  storyId?: string;
};

export type RoadmapColumn = {
  storyId: string;
  storyTitle: string;
  cells: RoadmapCell[];
};

// Re-export types from story.ts
export type { StoryFilters, StoryFormData } from './story';
