import { useState } from 'react';
import { ProjectModal } from '@/components/modals/ProjectModal';
import { ProjectKanbanBoard } from '@/components/boards/ProjectKanbanBoard';
import { ProjectStoryManager } from '@/components/ProjectStoryManager';
import { ProjectKanbanView } from '@/components/boards/ProjectKanbanView';
import type { Project } from '@/types';

export function ProjectView() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [showKanban, setShowKanban] = useState(false);
  const [showStoryManager, setShowStoryManager] = useState(false);


  const handleAddProject = () => {
    setSelectedProject(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleOpenKanban = (project: Project) => {
    setSelectedProject(project);
    setShowKanban(true);
  };

  const handleOpenStoryManager = (project: Project) => {
    setSelectedProject(project);
    setShowStoryManager(true);
  };



  return (
    <div className="h-full">
      <ProjectKanbanView
        onAddProject={handleAddProject}
        onEditProject={handleEditProject}
        onOpenKanban={handleOpenKanban}
        onOpenStoryManager={handleOpenStoryManager}
      />

      {/* Project Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        project={selectedProject}
        mode={modalMode}
      />

      {/* Kanban Board Modal */}
      {showKanban && selectedProject && (
        <ProjectKanbanBoard
          project={selectedProject}
          onClose={() => setShowKanban(false)}
        />
      )}

      {/* Story Manager Modal */}
      {showStoryManager && selectedProject && (
        <ProjectStoryManager
          project={selectedProject}
          onClose={() => setShowStoryManager(false)}
        />
      )}
    </div>
  );
}
