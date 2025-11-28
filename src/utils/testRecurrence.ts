import { generateRecurrenceInstances } from './recurrenceUtils';
import type { Story } from '@/types';

// Test function to verify recurrence is working
export function testRecurrence() {
  const testStory: Story = {
    id: 'test-story-1',
    title: 'Test Recurring Story',
    description: 'A test story that repeats weekly',
    labels: [],
    priority: 'Q1',
    weight: 1,
    size: 'M',
    type: 'Intellectual',
    status: 'todo',
    checklist: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    repeat: {
      cadence: 'weekly',
      interval: 1,
      instances: {}
    }
  };

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 14); // Next 2 weeks

  console.log('Testing recurrence generation...');
  console.log('Story:', testStory.title);
  console.log('Repeat config:', testStory.repeat);
  console.log('Start date:', startDate);
  console.log('End date:', endDate);

  const instances = generateRecurrenceInstances(testStory, startDate, endDate);
  
  console.log('Generated instances:', instances);
  console.log('Number of instances:', instances.length);
  
  return instances;
}
