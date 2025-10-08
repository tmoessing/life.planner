import { Provider, useAtom } from 'jotai';
import { Header } from '@/components/Header';
import { currentViewAtom } from '@/stores/appStore';
import { useSettingsMigration } from '@/hooks/useSettingsMigration';

// View imports
import { SprintView } from '@/components/views/SprintView';
import { StoryBoardsView } from '@/components/views/StoryBoardsView';
import { ImportanceView } from '@/components/views/ImportanceView';
import { GoalsView } from '@/components/views/GoalsView';
import { GoalsKanbanBoardsView } from '@/components/views/GoalsKanbanBoardsView';
import { BucketlistView } from '@/components/views/BucketlistView';
import { PlannerView } from '@/components/views/PlannerView';
import { SprintPlanningView } from '@/components/views/SprintPlanningView';
import { SprintReviewView } from '@/components/views/SprintReviewView';
import { AddStoriesView } from '@/components/views/AddStoriesView';
import { AddGoalsView } from '@/components/views/AddGoalsView';
import { AddProjectsView } from '@/components/views/AddProjectsView';
import { AddBucketlistView } from '@/components/views/AddBucketlistView';
import { ProjectView } from '@/components/views/ProjectView';
import { ProjectsKanbanBoardsView } from '@/components/views/ProjectsKanbanBoardsView';
import { ProjectProductManagementView } from '@/components/views/ProjectProductManagementView';

function AppContent() {
  const [currentView] = useAtom(currentViewAtom);
  
  // Handle settings migration
  useSettingsMigration();

  // View component mapping
  const viewComponents = {
    'sprint': SprintView,
    'story-boards': StoryBoardsView,
    'importance': ImportanceView,
    'goals': GoalsView,
    'goals-kanban': GoalsKanbanBoardsView,
    'bucketlist': BucketlistView,
    'planner': PlannerView,
    'sprint-planning': SprintPlanningView,
    'sprint-review': SprintReviewView,
    'add-stories': AddStoriesView,
    'add-goals': AddGoalsView,
    'add-projects': AddProjectsView,
    'add-bucketlist': AddBucketlistView,
    'projects': ProjectView,
    'projects-kanban': ProjectsKanbanBoardsView,
    'project-product-management': ProjectProductManagementView,
  } as const;

  const renderView = () => {
    const ViewComponent = viewComponents[currentView] || SprintView;
    return <ViewComponent />;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {renderView()}
      </main>
    </div>
  );
}

function App() {
  return (
    <Provider>
      <AppContent />
    </Provider>
  );
}

export default App;
