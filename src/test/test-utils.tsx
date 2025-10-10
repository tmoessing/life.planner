import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'jotai';
import { AppProvider } from '@/contexts/AppContext';

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider>
      <AppProvider>
        {children}
      </AppProvider>
    </Provider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Mock data generators
export const createMockStory = (overrides = {}) => ({
  id: 'test-story-1',
  title: 'Test Story',
  description: 'A test story description',
  priority: 'Q2' as const,
  type: 'Intellectual' as const,
  size: 'M' as const,
  weight: 5 as const,
  status: 'backlog' as const,
  labels: [],
  checklist: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockRole = (overrides = {}) => ({
  id: 'test-role-1',
  name: 'Test Role',
  color: '#3B82F6',
  ...overrides,
});

export const createMockVision = (overrides = {}) => ({
  id: 'test-vision-1',
  title: 'Test Vision',
  description: 'A test vision description',
  type: 'Intellectual',
  order: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockGoal = (overrides = {}) => ({
  id: 'test-goal-1',
  title: 'Test Goal',
  description: 'A test goal description',
  category: 'Target',
  type: 'Intellectual',
  status: 'Not Started',
  targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockProject = (overrides = {}) => ({
  id: 'test-project-1',
  name: 'Test Project',
  description: 'A test project description',
  status: 'backlog',
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockSettings = (overrides = {}) => ({
  theme: 'system' as const,
  roles: [createMockRole()],
  labels: [],
  storyTypes: [
    { name: 'Spiritual', color: '#8B5CF6' },
    { name: 'Physical', color: '#EF4444' },
    { name: 'Intellectual', color: '#3B82F6' },
    { name: 'Social', color: '#10B981' },
  ],
  storySizes: [
    { name: 'XS', color: '#10B981', timeEstimate: '15 min' },
    { name: 'S', color: '#3B82F6', timeEstimate: '30 min' },
    { name: 'M', color: '#F59E0B', timeEstimate: '1 hour' },
    { name: 'L', color: '#EF4444', timeEstimate: '2-4 hours' },
    { name: 'XL', color: '#8B5CF6', timeEstimate: '1+ days' },
  ],
  taskCategories: [
    { name: 'Decisions', color: '#8B82F6' },
    { name: 'Actions', color: '#10B981' },
    { name: 'Involve Others', color: '#F59E0B' },
  ],
  priorityColors: {
    Q1: '#EF4444',
    Q2: '#10B981',
    Q3: '#F59E0B',
    Q4: '#6B7280',
  },
  statusColors: {
    icebox: '#6B7280',
    backlog: '#3B82F6',
    todo: '#F59E0B',
    progress: '#F97316',
    review: '#8B5CF6',
    done: '#10B981',
  },
  weightBaseColor: '#3B82F6',
  ...overrides,
});

// Test helpers
export const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0));

export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
  };
};

export const mockAtomValue = (value: any) => {
  return vi.fn(() => value);
};

export const mockAtomSetter = () => {
  return vi.fn();
};
