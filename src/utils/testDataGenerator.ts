import type { 
  Story, 
  Goal, 
  Project, 
  Vision, 
  BucketlistItem, 
  ImportantDate, 
  Tradition,
  Sprint,
  Role,
  Label,
  Class,
  Assignment,
  AssignmentType,
  AssignmentStatus,
  AssignmentRecurrencePattern
} from '@/types';

// Sample data arrays for generating pseudo content
const storyTitles = [
  'Complete morning workout routine',
  'Read 30 pages of current book',
  'Call family members',
  'Update project documentation',
  'Practice meditation for 15 minutes',
  'Review and respond to emails',
  'Plan weekly meals',
  'Organize workspace',
  'Learn new programming concept',
  'Write in journal',
  'Take a walk in nature',
  'Cook a new recipe',
  'Review financial budget',
  'Schedule doctor appointment',
  'Clean and organize closet',
  'Practice guitar for 30 minutes',
  'Research vacation destinations',
  'Update LinkedIn profile',
  'Volunteer at local charity',
  'Attend online course session'
];

const storyDescriptions = [
  'A focused task to improve daily productivity and well-being',
  'An important step towards personal development goals',
  'Building and maintaining meaningful relationships',
  'Essential work for project completion and team coordination',
  'Mental health and mindfulness practice',
  'Staying connected and responsive in professional life',
  'Health and nutrition planning for the week ahead',
  'Creating an efficient and inspiring work environment',
  'Continuous learning and skill development',
  'Self-reflection and personal growth documentation',
  'Physical activity and connection with nature',
  'Culinary exploration and skill building',
  'Financial responsibility and planning',
  'Health maintenance and preventive care',
  'Home organization and decluttering',
  'Creative expression and musical skill development',
  'Travel planning and adventure preparation',
  'Professional networking and career development',
  'Community service and social contribution',
  'Educational advancement and knowledge acquisition'
];

const goalTitles = [
  'Achieve fitness milestone',
  'Complete professional certification',
  'Build emergency fund',
  'Learn new language',
  'Travel to 5 new countries',
  'Read 50 books this year',
  'Start side business',
  'Improve work-life balance',
  'Master new skill',
  'Strengthen relationships',
  'Reduce stress levels',
  'Increase savings rate',
  'Develop leadership skills',
  'Create passive income',
  'Improve health metrics',
  'Build professional network',
  'Learn to cook gourmet meals',
  'Volunteer regularly',
  'Write and publish book',
  'Achieve work promotion'
];

const projectNames = [
  'Home Renovation Project',
  'Personal Website Development',
  'Garden Transformation',
  'Learning Management System',
  'Community Outreach Program',
  'Fitness Challenge Initiative',
  'Financial Planning System',
  'Creative Writing Portfolio',
  'Language Learning Journey',
  'Sustainable Living Transition',
  'Professional Development Plan',
  'Health and Wellness Program',
  'Technology Skills Upgrade',
  'Art and Craft Collection',
  'Travel Planning Adventure',
  'Business Startup Preparation',
  'Home Organization System',
  'Educational Content Creation',
  'Volunteer Coordination Project',
  'Personal Brand Development'
];

const visionTitles = [
  'Become a successful entrepreneur',
  'Achieve financial independence',
  'Maintain excellent health and fitness',
  'Build strong family relationships',
  'Contribute meaningfully to community',
  'Develop expertise in chosen field',
  'Travel the world extensively',
  'Create lasting positive impact',
  'Achieve work-life harmony',
  'Become a lifelong learner',
  'Build a beautiful home',
  'Develop creative talents',
  'Help others achieve their goals',
  'Live with purpose and passion',
  'Create memorable experiences',
  'Build wealth for future generations',
  'Master multiple languages',
  'Develop spiritual understanding',
  'Create sustainable lifestyle',
  'Achieve personal fulfillment'
];

const bucketlistTitles = [
  'Visit the Great Wall of China',
  'Skydive from 15,000 feet',
  'Learn to play piano',
  'Write a novel',
  'Run a marathon',
  'Learn to surf',
  'Visit all 7 continents',
  'Master a new language',
  'Start a garden',
  'Volunteer abroad',
  'Learn to cook Italian cuisine',
  'Take a hot air balloon ride',
  'Visit the Northern Lights',
  'Learn to dance salsa',
  'Go on a safari',
  'Learn to play guitar',
  'Visit Machu Picchu',
  'Learn to scuba dive',
  'Start a blog',
  'Learn to paint'
];

const importantDateTitles = [
  'Anniversary',
  'Birthday',
  'Holiday',
  'Meeting',
  'Deadline',
  'Event',
  'Appointment',
  'Celebration',
  'Reminder',
  'Milestone'
];

const traditionTitles = [
  'Weekly Family Dinner',
  'Monthly Book Club',
  'Annual Vacation',
  'Birthday Celebration',
  'Holiday Gathering',
  'Sunday Brunch',
  'Game Night',
  'Movie Night',
  'Exercise Routine',
  'Meditation Practice'
];

const classTitles = [
  'Introduction to Computer Science',
  'Data Structures and Algorithms',
  'Database Systems',
  'Software Engineering',
  'Web Development',
  'Mobile App Development',
  'Machine Learning',
  'Operating Systems',
  'Computer Networks',
  'Cybersecurity Fundamentals',
  'Linear Algebra',
  'Calculus III',
  'Statistics and Probability',
  'Discrete Mathematics',
  'Digital Design',
  'Computer Architecture',
  'Artificial Intelligence',
  'Cloud Computing',
  'Distributed Systems',
  'Human-Computer Interaction'
];

const classCodes = [
  'CS101', 'CS201', 'CS301', 'CS401', 'CS501',
  'MATH201', 'MATH301', 'MATH401',
  'EE201', 'EE301',
  'SE301', 'SE401',
  'IT201', 'IT301'
];

const assignmentTypes = [
  'homework',
  'project',
  'exam',
  'quiz',
  'lab',
  'essay',
  'presentation',
  'discussion'
];

const assignmentTitles = [
  'Complete Chapter 5 Exercises',
  'Midterm Exam',
  'Final Project Submission',
  'Lab Report 3',
  'Research Paper',
  'Group Presentation',
  'Weekly Quiz',
  'Programming Assignment',
  'Case Study Analysis',
  'Online Discussion Post',
  'Homework Set 4',
  'Project Milestone 2',
  'Final Exam',
  'Lab Assignment 5',
  'Essay on Topic',
  'Code Review Assignment',
  'Design Document',
  'System Architecture Report',
  'Literature Review',
  'Capstone Project'
];

// Helper function to get random item from array
const getRandomItem = <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)];

// Helper function to get random items from array
const getRandomItems = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Helper function to generate random date
const getRandomDate = (start: Date, end: Date): string => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString();
};

// Helper function to generate ID
const generateId = (prefix: string): string => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const generateTestData = () => {
  const now = new Date();
  const futureDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
  const pastDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000); // 1 year ago

  // Generate Stories
  const stories: Story[] = Array.from({ length: 25 }, (_, i) => ({
    id: generateId('story'),
    title: getRandomItem(storyTitles),
    description: getRandomItem(storyDescriptions),
    labels: getRandomItems(['workout', 'study', 'family', 'spiritual'], Math.floor(Math.random() * 3) + 1),
    priority: getRandomItem(['Q1', 'Q2', 'Q3', 'Q4', 'high', 'medium', 'low']),
    weight: getRandomItem([1, 3, 5, 8, 13, 21]),
    size: getRandomItem(['XS', 'S', 'M', 'L', 'XL']),
    type: getRandomItem(['Spiritual', 'Physical', 'Intellectual', 'Social']),
    status: getRandomItem(['icebox', 'backlog', 'todo', 'progress', 'review', 'done']),
    roleId: Math.random() > 0.5 ? 'disciple' : undefined,
    visionId: Math.random() > 0.7 ? 'vision-1' : undefined,
    projectId: Math.random() > 0.6 ? 'project-1' : undefined,
    dueDate: Math.random() > 0.5 ? getRandomDate(now, futureDate) : undefined,
    sprintId: Math.random() > 0.4 ? 'sprint-1' : undefined,
    scheduled: Math.random() > 0.6 ? getRandomDate(now, futureDate) : undefined,
    taskCategories: getRandomItems(['Decisions', 'Actions', 'Involve Others'], Math.floor(Math.random() * 2) + 1),
    scheduledDate: Math.random() > 0.5 ? getRandomDate(now, futureDate) : undefined,
    location: Math.random() > 0.7 ? getRandomItem(['Home', 'Office', 'Gym', 'Library']) : undefined,
    goalId: Math.random() > 0.6 ? 'goal-1' : undefined,
    checklist: Array.from({ length: Math.floor(Math.random() * 4) + 1 }, (_, j) => ({
      id: `checklist-${i}-${j}`,
      text: `Task ${j + 1}`,
      done: Math.random() > 0.5
    })),
    createdAt: getRandomDate(pastDate, now),
    updatedAt: getRandomDate(pastDate, now),
    deleted: false,
    repeat: Math.random() > 0.8 ? {
      cadence: getRandomItem(['none', 'weekly', 'biweekly', 'monthly']),
      count: Math.floor(Math.random() * 10) + 1
    } : undefined,
    subtasks: Math.random() > 0.7 ? [`subtask-${i}-1`, `subtask-${i}-2`] : undefined
  }));

  // Generate Goals
  const goals: Goal[] = Array.from({ length: 15 }, (_, i) => ({
    id: generateId('goal'),
    title: getRandomItem(goalTitles),
    name: getRandomItem(goalTitles), // alias for title
    description: `A meaningful goal focused on ${getRandomItem(['personal growth', 'professional development', 'health improvement', 'relationship building'])}`,
    visionId: Math.random() > 0.3 ? 'vision-1' : undefined,
    category: getRandomItem(['target', 'lifestyle-value']),
    goalType: getRandomItem(['Spiritual', 'Physical', 'Intellectual', 'Social', 'Financial', 'Protector']),
    roleId: Math.random() > 0.4 ? 'disciple' : undefined,
    priority: getRandomItem(['Q1', 'Q2', 'Q3', 'Q4', 'high', 'medium', 'low']),
    status: getRandomItem(['icebox', 'backlog', 'todo', 'in-progress', 'review', 'done']),
    order: i,
    storyIds: Math.random() > 0.5 ? [`story-${i}-1`, `story-${i}-2`] : undefined,
    projectId: Math.random() > 0.6 ? 'project-1' : undefined,
    completed: Math.random() > 0.7,
    createdAt: getRandomDate(pastDate, now),
    updatedAt: getRandomDate(pastDate, now)
  }));

  // Generate Projects
  const projects: Project[] = Array.from({ length: 8 }, (_, i) => ({
    id: generateId('project'),
    name: getRandomItem(projectNames),
    description: `A comprehensive project focused on ${getRandomItem(['innovation', 'improvement', 'development', 'transformation'])}`,
    status: getRandomItem(['Icebox', 'Backlog', 'To do', 'In Progress', 'Done']),
    priority: getRandomItem(['Q1', 'Q2', 'Q3', 'Q4', 'high', 'medium', 'low']),
    roleId: Math.random() > 0.3 ? 'disciple' : undefined,
    visionId: Math.random() > 0.4 ? 'vision-1' : undefined,
    order: i,
    startDate: getRandomDate(pastDate, now),
    endDate: getRandomDate(now, futureDate),
    storyIds: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, j) => `story-${i}-${j}`),
    createdAt: getRandomDate(pastDate, now),
    updatedAt: getRandomDate(pastDate, now)
  }));

  // Generate Visions
  const visions: Vision[] = Array.from({ length: 6 }, (_, i) => ({
    id: generateId('vision'),
    title: getRandomItem(visionTitles),
    name: getRandomItem(visionTitles), // alias for title
    description: `A compelling vision for ${getRandomItem(['personal growth', 'professional success', 'community impact', 'life fulfillment'])}`,
    type: getRandomItem(['Spiritual', 'Physical', 'Intellectual', 'Social']),
    order: i
  }));

  // Generate Bucketlist Items
  const bucketlist: BucketlistItem[] = Array.from({ length: 20 }, (_, i) => ({
    id: generateId('bucketlist'),
    title: getRandomItem(bucketlistTitles),
    description: `An exciting bucketlist item: ${getRandomItem(['adventure', 'learning', 'experience', 'achievement'])}`,
    completed: Math.random() > 0.8,
    completedAt: Math.random() > 0.8 ? getRandomDate(pastDate, now) : undefined,
    category: getRandomItem(['Adventure', 'Travel', 'Learning', 'Experience', 'Achievement', 'Personal']),
    priority: getRandomItem(['Q1', 'Q2', 'Q3', 'Q4', 'high', 'medium', 'low']),
    bucketlistType: getRandomItem(['location', 'experience']),
    status: getRandomItem(['in-progress', 'completed']),
    roleId: Math.random() > 0.5 ? 'disciple' : undefined,
    visionId: Math.random() > 0.4 ? 'vision-1' : undefined,
    dueDate: Math.random() > 0.6 ? getRandomDate(now, futureDate) : undefined,
    order: i,
    country: Math.random() > 0.5 ? getRandomItem(['US', 'Canada', 'Mexico', 'France', 'Japan', 'Australia']) : undefined,
    state: Math.random() > 0.7 ? getRandomItem(['California', 'New York', 'Texas', 'Florida']) : undefined,
    city: Math.random() > 0.6 ? getRandomItem(['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix']) : undefined,
    experienceCategory: Math.random() > 0.5 ? getRandomItem(['Adventure', 'Cultural', 'Educational', 'Entertainment', 'Nature']) : undefined,
    createdAt: getRandomDate(pastDate, now),
    updatedAt: getRandomDate(pastDate, now)
  }));

  // Generate Important Dates
  const importantDates: ImportantDate[] = Array.from({ length: 12 }, () => ({
    id: generateId('important-date'),
    title: getRandomItem(importantDateTitles),
    date: getRandomDate(now, futureDate),
    createdAt: getRandomDate(pastDate, now),
    updatedAt: getRandomDate(pastDate, now)
  }));

  // Generate Traditions
  const traditions: Tradition[] = Array.from({ length: 10 }, () => ({
    id: generateId('tradition'),
    title: getRandomItem(traditionTitles),
    description: `A meaningful tradition that brings ${getRandomItem(['joy', 'connection', 'reflection', 'celebration'])}`,
    traditionType: getRandomItem(['Spiritual', 'Physical', 'Intellectual', 'Social']),
    traditionalCategory: getRandomItem(['Christmas', 'Birthday', 'New Year', 'Easter', 'Thanksgiving']),
    createdAt: getRandomDate(pastDate, now),
    updatedAt: getRandomDate(pastDate, now)
  }));

  // Generate Sprints
  const sprints: Sprint[] = Array.from({ length: 8 }, (_, i) => {
    const startDate = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
    const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
    
    // Calculate ISO week number manually
    const getISOWeek = (date: Date): number => {
      const target = new Date(date.valueOf());
      const dayNr = (date.getDay() + 6) % 7;
      target.setDate(target.getDate() - dayNr + 3);
      const firstThursday = target.valueOf();
      target.setMonth(0, 1);
      if (target.getDay() !== 4) {
        target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
      }
      return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
    };
    
    return {
      id: `sprint-${i + 1}`,
      isoWeek: getISOWeek(startDate),
      year: startDate.getFullYear(),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
  });

  // Generate Classes
  const classes: Class[] = Array.from({ length: 6 }, () => {
    const semester = getRandomItem(['Fall', 'Winter', 'Spring', 'Summer'] as const) as 'Fall' | 'Winter' | 'Spring' | 'Summer';
    const year = now.getFullYear();
    const classCode = getRandomItem(classCodes);
    const creditHours = getRandomItem([3, 4]);
    const classType = getRandomItem(['Major', 'Minor', 'GE', 'Religion', 'Elective'] as const) as 'Major' | 'Minor' | 'GE' | 'Religion' | 'Elective';
    
    // Generate schedule (1-3 time slots per class)
    const schedule = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => {
      const days = getRandomItems(['Monday', 'Wednesday', 'Friday', 'Tuesday', 'Thursday'], Math.floor(Math.random() * 3) + 1);
      const hour = Math.floor(Math.random() * 8) + 8; // 8 AM to 4 PM
      const minute = Math.random() > 0.5 ? 0 : 30;
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const endHour = hour + (Math.random() > 0.5 ? 1 : 1.5);
      const endMinute = endHour % 1 === 0.5 ? 30 : 0;
      const endTime = `${Math.floor(endHour).toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
      
      return {
        time,
        endTime,
        days
      };
    });
    
    return {
      id: generateId('class'),
      title: getRandomItem(classTitles),
      classCode,
      semester,
      year,
      creditHours,
      classType,
      schedule,
      assignmentIds: [], // Will be populated after assignments are created
      createdAt: getRandomDate(pastDate, now),
      updatedAt: getRandomDate(pastDate, now)
    };
  });

  // Generate Assignments (linked to classes)
  const assignments: Assignment[] = [];
  classes.forEach((cls) => {
    // Each class gets 3-8 assignments
    const assignmentCount = Math.floor(Math.random() * 6) + 3;
    const classAssignments = Array.from({ length: assignmentCount }, () => {
      const assignmentId = generateId('assignment');
      const assignmentType = getRandomItem(assignmentTypes) as AssignmentType;
      const dueDate = getRandomDate(now, futureDate);
      const dueTime = Math.random() > 0.5 ? `${Math.floor(Math.random() * 12) + 8}:${Math.random() > 0.5 ? '00' : '30'}` : undefined;
      const status = getRandomItem(['not-started', 'in-progress', 'completed', 'submitted'] as const) as AssignmentStatus;
      const weight = getRandomItem([1, 3, 5, 8, 13, 21] as const);
      
      // Some assignments have recurrence patterns (for weekly homework, etc.)
      const recurrencePattern: AssignmentRecurrencePattern | undefined = Math.random() > 0.7 && assignmentType === 'homework' ? {
        type: 'weekly',
        daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
        time: '09:00',
        endDate: getRandomDate(now, futureDate)
      } : undefined;
      
      return {
        id: assignmentId,
        classId: cls.id,
        title: getRandomItem(assignmentTitles),
        type: assignmentType,
        description: Math.random() > 0.5 ? `Complete ${assignmentType} assignment for ${cls.title}` : undefined,
        dueDate,
        dueTime,
        status,
        weight,
        recurrencePattern,
        storyId: Math.random() > 0.6 ? undefined : undefined, // Could link to stories
        createdAt: getRandomDate(pastDate, now),
        updatedAt: getRandomDate(pastDate, now)
      };
    });
    
    assignments.push(...classAssignments);
    
    // Update class with assignment IDs
    cls.assignmentIds = classAssignments.map(a => a.id);
  });

  return {
    stories,
    goals,
    projects,
    visions,
    bucketlist,
    importantDates,
    traditions,
    sprints,
    classes,
    assignments
  };
};
