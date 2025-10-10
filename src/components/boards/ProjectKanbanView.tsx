import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, DragOverEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { ProjectCard } from '@/components/boards/ProjectCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  projectsAtom, 
  updateProjectAtom 
} from '@/stores/appStore';
import { Plus, FolderOpen } from 'lucide-react';
import { useProjectSettings } from '@/utils/settingsMirror';
import type { Project } from '@/types';

// Project Status Columns - will be updated with settings colors
const PROJECT_COLUMNS = [
  { id: 'icebox', name: 'Icebox', color: 'bg-gray-100 border-gray-300' },
  { id: 'backlog', name: 'Backlog', color: 'bg-blue-100 border-blue-300' },
  { id: 'to-do', name: 'To do', color: 'bg-yellow-100 border-yellow-300' },
  { id: 'in-progress', name: 'In Progress', color: 'bg-orange-100 border-orange-300' },
  { id: 'done', name: 'Done', color: 'bg-green-100 border-green-300' }
];

// Project Kanban Column Component
function ProjectKanbanColumn({ 
  column, 
  projects, 
  selectedProjects,
  onProjectClick,
  onEditProject, 
  onOpenKanban, 
  onOpenStoryManager,
  projectSettings
}: { 
  column: typeof PROJECT_COLUMNS[0]; 
  projects: Project[]; 
  selectedProjects: string[];
  onProjectClick: (projectId: string, event: React.MouseEvent, projectList?: Project[], currentIndex?: number) => void;
  onEditProject: (project: Project) => void;
  onOpenKanban: (project: Project) => void;
  onOpenStoryManager: (project: Project) => void;
  projectSettings: any;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'project-column',
      status: column.id === 'icebox' ? 'Icebox' : 
              column.id === 'backlog' ? 'Backlog' :
              column.id === 'to-do' ? 'To do' :
              column.id === 'in-progress' ? 'In Progress' : 'Done'
    }
  });

  return (
    <div className="flex-1 flex flex-col">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg">{column.name}</h3>
          <Badge variant="outline" className="text-xs">
            {projects.length} projects
          </Badge>
        </div>
      </div>
      
      <div 
        ref={setNodeRef}
        className={`flex-1 space-y-3 p-3 rounded-lg border-2 border-dashed transition-colors overflow-y-auto ${
          isOver ? 'border-blue-400 bg-blue-50' : ''
        }`}
        style={{
          backgroundColor: isOver ? undefined : `${projectSettings.getStatusColor(column.id)}20`,
          borderColor: isOver ? undefined : `${projectSettings.getStatusColor(column.id)}40`
        }}
      >
        {projects.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500">
            <div className="text-center">
              <FolderOpen className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No projects</p>
            </div>
          </div>
        ) : (
          projects.map((project, index) => (
            <div
              key={project.id}
              onClick={(event) => onProjectClick(project.id, event, projects, index)}
              className="cursor-pointer"
            >
              <ProjectCard
                project={project}
                isSelected={selectedProjects.includes(project.id)}
                onEdit={onEditProject}
                onOpenKanban={onOpenKanban}
                onOpenStoryManager={onOpenStoryManager}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

interface ProjectKanbanViewProps {
  onAddProject: () => void;
  onEditProject: (project: Project) => void;
  onOpenKanban: (project: Project) => void;
  onOpenStoryManager: (project: Project) => void;
}

export function ProjectKanbanView({ 
  onAddProject, 
  onEditProject, 
  onOpenKanban, 
  onOpenStoryManager 
}: ProjectKanbanViewProps) {
  const [projects] = useAtom(projectsAtom);
  const [, updateProject] = useAtom(updateProjectAtom);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const projectSettings = useProjectSettings();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Group projects by status
  const projectsByStatus = {
    icebox: projects.filter(p => p.status === 'Icebox'),
    backlog: projects.filter(p => p.status === 'Backlog'),
    'to-do': projects.filter(p => p.status === 'To do'),
    'in-progress': projects.filter(p => p.status === 'In Progress'),
    done: projects.filter(p => p.status === 'Done')
  };

  // Helper function to get range of projects between two indices
  const getProjectsInRange = (projectList: Project[], startIndex: number, endIndex: number): string[] => {
    const start = Math.min(startIndex, endIndex);
    const end = Math.max(startIndex, endIndex);
    return projectList.slice(start, end + 1).map(project => project.id);
  };

  const handleProjectClick = (projectId: string, event: React.MouseEvent, projectList?: Project[], currentIndex?: number) => {
    if (event.ctrlKey && event.shiftKey && projectList && currentIndex !== undefined && lastSelectedIndex !== null) {
      // Range selection with Ctrl+Shift
      const rangeProjectIds = getProjectsInRange(projectList, lastSelectedIndex, currentIndex);
      setSelectedProjects(prev => {
        const newSet = new Set(prev);
        rangeProjectIds.forEach(id => newSet.add(id));
        return Array.from(newSet);
      });
    } else if (event.ctrlKey || event.metaKey) {
      // Multi-select with Ctrl/Cmd
      setSelectedProjects(prev => 
        prev.includes(projectId) 
          ? prev.filter(id => id !== projectId)
          : [...prev, projectId]
      );
      // Update last selected index for range selection
      if (projectList && currentIndex !== undefined) {
        setLastSelectedIndex(currentIndex);
      }
    } else {
      // Single select
      setSelectedProjects([projectId]);
      // Update last selected index for range selection
      if (projectList && currentIndex !== undefined) {
        setLastSelectedIndex(currentIndex);
      }
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // Handle drag over if needed
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find which column the active item is in
    let fromColumnId = '';
    let toColumnId = '';

    // Check if dropping on a column (either by column ID or by column data type)
    if (over.data.current?.type === 'project-column' || ['icebox', 'backlog', 'to-do', 'in-progress', 'done'].includes(overId)) {
      toColumnId = overId;
    } else {
      // Find the column of the over item (could be a project)
      for (const [status, projectList] of Object.entries(projectsByStatus)) {
        if (projectList.some(project => project.id === overId)) {
          toColumnId = status;
          break;
        }
      }
    }

    // Find which column the active item is in
    for (const [status, projectList] of Object.entries(projectsByStatus)) {
      if (projectList.some(project => project.id === activeId)) {
        fromColumnId = status;
        break;
      }
    }


    if (fromColumnId && toColumnId && fromColumnId !== toColumnId) {
      // If multiple projects are selected and the dragged project is one of them, move all selected projects
      if (selectedProjects.includes(activeId) && selectedProjects.length > 1) {
        selectedProjects.forEach(projectId => {
          // Find which column each selected project is in
          for (const [status, projectList] of Object.entries(projectsByStatus)) {
            if (projectList.some(project => project.id === projectId)) {
              if (status !== toColumnId) {
                const newStatus = toColumnId === 'icebox' ? 'Icebox' : 
                                toColumnId === 'backlog' ? 'Backlog' :
                                toColumnId === 'to-do' ? 'To do' :
                                toColumnId === 'in-progress' ? 'In Progress' : 'Done';
                updateProject(projectId, { status: newStatus as Project['status'] });
              }
            }
          }
        });
        setSelectedProjects([]);
      } else {
        // Move single project
        const newStatus = toColumnId === 'icebox' ? 'Icebox' : 
                         toColumnId === 'backlog' ? 'Backlog' :
                         toColumnId === 'to-do' ? 'To do' :
                         toColumnId === 'in-progress' ? 'In Progress' : 'Done';
        updateProject(activeId, { status: newStatus as Project['status'] });
      }
    }
  };

  const activeProject = activeId ? projects.find(p => p.id === activeId) : null;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Projects</h2>
          <p className="text-sm text-muted-foreground">
            Manage your projects and track their progress
          </p>
        </div>
        <Button onClick={onAddProject} className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 mb-6">
        {PROJECT_COLUMNS.map((column) => (
          <div key={column.id} className="bg-card p-3 sm:p-4 rounded-lg border">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: projectSettings.getStatusColor(column.id) }}
              ></div>
              <span className="text-xs sm:text-sm font-medium">{column.name}</span>
            </div>
            <p className="text-lg sm:text-2xl font-bold mt-1">
              {projectsByStatus[column.id as keyof typeof projectsByStatus].length}
            </p>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="flex-1 min-h-0">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 h-full overflow-x-auto">
            {PROJECT_COLUMNS.map((column) => (
              <div key={column.id} className="flex-1 min-w-0 sm:min-w-[200px]">
                <ProjectKanbanColumn
                  column={column}
                  projects={projectsByStatus[column.id as keyof typeof projectsByStatus]}
                  selectedProjects={selectedProjects}
                  onProjectClick={handleProjectClick}
                  onEditProject={onEditProject}
                  onOpenKanban={onOpenKanban}
                  onOpenStoryManager={onOpenStoryManager}
                  projectSettings={projectSettings}
                />
              </div>
            ))}
          </div>

          <DragOverlay>
            {activeProject ? (
              <div className="opacity-50">
                <ProjectCard 
                  project={activeProject}
                  onEdit={onEditProject}
                  onOpenKanban={onOpenKanban}
                  onOpenStoryManager={onOpenStoryManager}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
