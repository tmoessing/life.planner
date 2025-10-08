import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAtom } from 'jotai';
import { currentSprintAtom, storiesAtom, selectedSprintIdAtom, safeSprintsAtom } from '@/stores/appStore';
import { format, eachDayOfInterval, parseISO } from 'date-fns';

export function BurndownChart() {
  const [currentSprint] = useAtom(currentSprintAtom);
  const [stories] = useAtom(storiesAtom);
  const [selectedSprintId] = useAtom(selectedSprintIdAtom);
  const [sprints] = useAtom(safeSprintsAtom);
  // const [columns] = useAtom(safeColumnsAtom);

  // Use selected sprint or fall back to current sprint
  const selectedSprint = sprints.find(sprint => sprint.id === selectedSprintId) || currentSprint;

  console.log('BurndownChart - selectedSprintId:', selectedSprintId);
  console.log('BurndownChart - selectedSprint:', selectedSprint);
  console.log('BurndownChart - stories count:', stories.length);

  const generateBurndownData = () => {
    if (!selectedSprint) {
      console.log('No selected sprint found');
      return [];
    }

    const startDate = parseISO(selectedSprint.startDate);
    const endDate = parseISO(selectedSprint.endDate);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    // Calculate total weight for the sprint
    const sprintStories = stories.filter(story => story.sprintId === selectedSprint.id);
    const totalWeight = sprintStories.reduce((sum, story) => sum + story.weight, 0);

    // Calculate ideal burndown (straight line from total to 0)
    const idealBurndown = totalWeight / (days.length - 1);

    // Calculate actual burndown based on stories in Done status
    const doneStories = sprintStories.filter(story => story.status === 'done');
    const completedWeight = doneStories.reduce((sum, story) => sum + story.weight, 0);

    return days.map((day, index) => {
      const dayStr = format(day, 'MMM dd');
      const idealRemaining = Math.max(0, totalWeight - (idealBurndown * index));
      
      // Calculate actual remaining based on current completion
      // For now, we'll show current completion as a flat line
      // In a real implementation, you'd track daily progress with timestamps
      const actualRemaining = Math.max(0, totalWeight - completedWeight);
      
      return {
        day: dayStr,
        ideal: Math.round(idealRemaining),
        actual: Math.round(actualRemaining)
      };
    });
  };

  const data = generateBurndownData();

  // Debug logging
  console.log('BurndownChart data:', { selectedSprint, data });

  if (!selectedSprint) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p>No sprint selected</p>
          <p className="text-sm">Select a sprint to view burndown chart</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p>No data available</p>
          <p className="text-sm">Add stories to the sprint to see burndown</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="ideal" 
            stroke="#8884d8" 
            strokeWidth={2}
            name="Ideal"
            strokeDasharray="5 5"
          />
          <Line 
            type="monotone" 
            dataKey="actual" 
            stroke="#82ca9d" 
            strokeWidth={2}
            name="Actual"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
