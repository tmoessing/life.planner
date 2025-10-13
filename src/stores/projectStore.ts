import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { Project } from '@/types';
import { STORAGE_KEYS } from '@/constants';

// Core project atoms
export const projectsAtom = atomWithStorage<Project[]>(STORAGE_KEYS.PROJECTS, []);

// Project action atoms
export const addProjectAtom = atom(
  null,
  (get, set, projectData: Partial<Project>) => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: projectData.name || '',
      description: projectData.description || '',
      status: projectData.status || 'Backlog',
      priority: projectData.priority || 'Q2',
      type: projectData.type,
      order: projectData.order || 0,
      startDate: projectData.startDate || '',
      endDate: projectData.endDate || '',
      storyIds: projectData.storyIds || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const currentProjects = get(projectsAtom);
    set(projectsAtom, [...currentProjects, newProject]);
    return newProject;
  }
);

export const updateProjectAtom = atom(
  null,
  (get, set, projectId: string, updates: Partial<Project>) => {
    const projects = get(projectsAtom);
    const updatedProjects = projects.map(project => 
      project.id === projectId 
        ? { ...project, ...updates, updatedAt: new Date().toISOString() }
        : project
    );
    set(projectsAtom, updatedProjects);
  }
);

export const deleteProjectAtom = atom(
  null,
  (get, set, projectId: string) => {
    const projects = get(projectsAtom);
    const updatedProjects = projects.filter(project => project.id !== projectId);
    set(projectsAtom, updatedProjects);
  }
);

// Project-Story management atoms
export const addStoryToProjectAtom = atom(
  null,
  (get, set, projectId: string, storyId: string) => {
    const projects = get(projectsAtom);
    const updatedProjects = projects.map(project => 
      project.id === projectId 
        ? { ...project, storyIds: [...project.storyIds, storyId], updatedAt: new Date().toISOString() }
        : project
    );
    set(projectsAtom, updatedProjects);
  }
);

export const removeStoryFromProjectAtom = atom(
  null,
  (get, set, projectId: string, storyId: string) => {
    const projects = get(projectsAtom);
    const updatedProjects = projects.map(project => 
      project.id === projectId 
        ? { ...project, storyIds: (project.storyIds || []).filter(id => id !== storyId), updatedAt: new Date().toISOString() }
        : project
    );
    set(projectsAtom, updatedProjects);
  }
);

// Bulk delete atoms
export const deleteAllProjectsAtom = atom(
  null,
  (get, set) => {
    set(projectsAtom, []);
  }
);
