import { useState, useEffect } from 'react';
import type { Project, Priority } from '@/types';

interface UseProjectFormProps {
  project?: Project | null;
  mode: 'add' | 'edit';
  projectStatuses: Array<{ id: string; name: string; color: string }>;
  onClose: () => void;
}

interface ProjectFormData {
  name: string;
  description: string;
  status: Project['status'];
  priority: Priority;
  type: string;
  size: string;
  startDate: string;
  endDate: string;
  storyIds: string[];
}

/**
 * Custom hook for managing project form state and logic
 */
export function useProjectForm({
  project,
  mode,
  projectStatuses
}: UseProjectFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    status: (projectStatuses[0]?.name || 'Icebox') as Project['status'],
    priority: 'medium' as Priority,
    type: '',
    size: '',
    startDate: '',
    endDate: '',
    storyIds: []
  });

  const [selectedStories, setSelectedStories] = useState<string[]>([]);
  const [storySearchQuery, setStorySearchQuery] = useState('');

  // Initialize form data when project or mode changes
  useEffect(() => {
    if (mode === 'edit' && project) {
      setFormData({
        name: project.name,
        description: project.description,
        status: project.status,
        priority: project.priority,
        type: project.type || '',
        size: project.size || '',
        startDate: project.startDate || '',
        endDate: project.endDate || '',
        storyIds: project.storyIds
      });
      setSelectedStories(project.storyIds);
    } else {
      setFormData({
        name: '',
        description: '',
        status: (projectStatuses[0]?.name || 'Icebox') as Project['status'],
        priority: 'medium' as Priority,
        type: '',
        size: '',
        startDate: '',
        endDate: '',
        storyIds: []
      });
      setSelectedStories([]);
    }
    setStorySearchQuery('');
  }, [mode, project, projectStatuses]);

  const updateFormField = <K extends keyof ProjectFormData>(
    field: K,
    value: ProjectFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStoryToggle = (storyId: string) => {
    setSelectedStories(prev =>
      prev.includes(storyId)
        ? prev.filter(id => id !== storyId)
        : [...prev, storyId]
    );
  };

  const getSubmitData = (): ProjectFormData => {
    return {
      ...formData,
      storyIds: selectedStories
    };
  };

  return {
    formData,
    selectedStories,
    storySearchQuery,
    setStorySearchQuery,
    updateFormField,
    handleStoryToggle,
    getSubmitData
  };
}

