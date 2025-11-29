import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAtom } from 'jotai';
import { currentSprintAtom, storiesAtom, selectedSprintIdAtom, safeSprintsAtom } from '@/stores/appStore';
import { format, eachDayOfInterval, parseISO } from 'date-fns';

export function BurnupChart() {
  const [currentSprint] = useAtom(currentSprintAtom);
  const [stories] = useAtom(storiesAtom);
  const [selectedSprintId] = useAtom(selectedSprintIdAtom);
  const [sprints] = useAtom(safeSprintsAtom);
  // const [columns] = useAtom(safeColumnsAtom);

  // Use selected sprint or fall back to current sprint
  const selectedSprint = sprints.find(sprint => sprint.id === selectedSprintId) || currentSprint;


  const generateBurnupData = () => {
    if (!selectedSprint) {
      return [];
    }

    const startDate = parseISO(selectedSprint.startDate);
    const endDate = parseISO(selectedSprint.endDate);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    // Calculate total scope for the sprint
    const sprintStories = stories.filter(story => story.sprintId === selectedSprint.id);
    const totalScope = sprintStories.reduce((sum, story) => sum + story.weight, 0);

    // Calculate actual completed work
    const doneStories = sprintStories.filter(story => story.status === 'done');
    const completedWeight = doneStories.reduce((sum, story) => sum + story.weight, 0);

    return days.map((day) => {
      const dayStr = format(day, 'MMM dd');
      
      // For burnup, we show cumulative completed work
      // For now, we'll show current completion as a flat line
      // In a real implementation, you'd track daily completion with timestamps
      const completed = Math.min(totalScope, completedWeight);
      
      return {
        day: dayStr,
        completed: Math.round(completed),
        total: totalScope
      };
    });
  };

  const data = generateBurnupData();

  if (!selectedSprint) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p>No sprint selected</p>
          <p className="text-sm">Select a sprint to view burnup chart</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p>No data available</p>
          <p className="text-sm">Add stories to the sprint to see burnup</p>
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
            dataKey="completed" 
            stroke="#82ca9d" 
            strokeWidth={2}
            name="Completed"
          />
          <Line 
            type="monotone" 
            dataKey="total" 
            stroke="#8884d8" 
            strokeWidth={2}
            name="Total Scope"
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
