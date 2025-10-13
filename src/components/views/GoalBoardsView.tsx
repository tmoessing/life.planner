import { useState } from 'react';
import { useAtom } from 'jotai';
import { goalsAtom, settingsAtom, updateGoalAtom, visionsAtom } from '@/stores/appStore';
import { useGoalSettings } from '@/utils/settingsMirror';
import { useSettingsMigration } from '@/hooks/useSettingsMigration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GoalModal } from '@/components/modals/GoalModal';
import { Target, Heart, Brain, Users, Filter, List, PieChart, Plus } from 'lucide-react';
import type { Goal } from '@/types';

type BoardType = 'Goal Type' | 'Category' | 'Priority' | 'Status' | 'Vision';
type ViewType = 'list' | 'pie';

export function GoalBoardsView() {
  const [goals] = useAtom(goalsAtom);
  const [settings] = useAtom(settingsAtom);
  const [visions] = useAtom(visionsAtom);
  const [, updateGoal] = useAtom(updateGoalAtom);

  // Use settings mirror system for goal settings
  const goalSettings = useGoalSettings();
  
  // Ensure settings are properly migrated
  useSettingsMigration();
  
  
  const [selectedBoardType, setSelectedBoardType] = useState<BoardType>('Goal Type');
  const [viewType, setViewType] = useState<ViewType>('list');
  const [draggedGoalId, setDraggedGoalId] = useState<string | null>(null);
  const [dragOverBoardId, setDragOverBoardId] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  // Get board options based on selected type
  const getBoardOptions = () => {
    switch (selectedBoardType) {
      case 'Goal Type':
        return goalSettings.goalTypes.map(type => ({
          id: type.name,
          label: type.name,
          color: type.color
        }));
      case 'Category':
        return goalSettings.goalCategories.map(category => ({
          id: category.name,
          label: category.name,
          color: category.color
        }));
      case 'Priority':
        return [
          { id: 'low', label: 'Low', color: goalSettings.getPriorityColor('low') },
          { id: 'medium', label: 'Medium', color: goalSettings.getPriorityColor('medium') },
          { id: 'high', label: 'High', color: goalSettings.getPriorityColor('high') }
        ];
      case 'Status':
        return [
          { id: 'icebox', label: 'Icebox', color: goalSettings.getStatusColor('icebox') },
          { id: 'backlog', label: 'Backlog', color: goalSettings.getStatusColor('backlog') },
          { id: 'todo', label: 'To Do', color: goalSettings.getStatusColor('todo') },
          { id: 'in-progress', label: 'In Progress', color: goalSettings.getStatusColor('in-progress') },
          { id: 'review', label: 'Review', color: goalSettings.getStatusColor('review') },
          { id: 'done', label: 'Done', color: goalSettings.getStatusColor('done') }
        ];
      case 'Vision':
        return visions.map(vision => ({
          id: vision.id,
          label: vision.title,
          color: goalSettings.getTypeColor('Vision') || '#6B7280'
        }));
      default:
        return [];
    }
  };

  // Get goals for a specific board
  const getGoalsForBoard = (boardId: string) => {
    return goals.filter(goal => {
      switch (selectedBoardType) {
        case 'Goal Type':
          return goal.goalType === boardId;
        case 'Category':
          return goal.category === boardId.toLowerCase().replace('/', '-');
        case 'Priority':
          return goal.priority === boardId;
        case 'Status':
          return goal.status === boardId;
        case 'Vision':
          return goal.visionId === boardId;
        default:
          return false;
      }
    });
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, goalId: string) => {
    setDraggedGoalId(goalId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', goalId);
  };

  const handleDragEnd = () => {
    setDraggedGoalId(null);
    setDragOverBoardId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragOverBoard = (boardId: string) => {
    setDragOverBoardId(boardId);
  };

  const handleDragLeaveBoard = () => {
    setDragOverBoardId(null);
  };

  const handleDrop = (e: React.DragEvent, targetBoardId: string) => {
    e.preventDefault();
    const goalId = e.dataTransfer.getData('text/plain');
    
    if (goalId) {
      let updates: Partial<Goal> = {};
      
      switch (selectedBoardType) {
        case 'Goal Type':
          updates.goalType = targetBoardId;
          break;
        case 'Category':
          updates.category = targetBoardId.toLowerCase().replace('/', '-') as 'target' | 'lifestyle-value';
          break;
        case 'Priority':
          updates.priority = targetBoardId as 'low' | 'medium' | 'high';
          break;
        case 'Status':
          updates.status = targetBoardId as Goal['status'];
          break;
        case 'Vision':
          updates.visionId = targetBoardId;
          break;
      }
      
      updateGoal(goalId, updates);
    }
    
    setDraggedGoalId(null);
    setDragOverBoardId(null);
  };

  const getStatusColor = (status: string) => {
    const statusColor = goalSettings.getStatusColor(status);
    return {
      backgroundColor: `${statusColor}20`,
      borderColor: `${statusColor}40`,
      color: statusColor
    };
  };

  // Get color for board based on type and value
  const getBoardColor = (boardId: string) => {
    switch (selectedBoardType) {
      case 'Goal Type':
        const goalTypeColor = goalSettings.getTypeColor(boardId);
        return {
          backgroundColor: `${goalTypeColor}20`,
          borderColor: `${goalTypeColor}40`,
          color: goalTypeColor
        };
      case 'Category':
        const categoryColor = goalSettings.getCategoryColor(boardId);
        return {
          backgroundColor: `${categoryColor}20`,
          borderColor: `${categoryColor}40`,
          color: categoryColor
        };
      case 'Priority':
        const priorityColor = goalSettings.getPriorityColor(boardId);
        return {
          backgroundColor: `${priorityColor}20`,
          borderColor: `${priorityColor}40`,
          color: priorityColor
        };
      case 'Status':
        return getStatusColor(boardId);
      case 'Vision':
        const vision = visions.find(v => v.id === boardId);
        if (vision) {
          const visionColor = goalSettings.getTypeColor('Vision') || '#6B7280';
          return {
            backgroundColor: `${visionColor}20`,
            borderColor: `${visionColor}40`,
            color: visionColor
          };
        }
        const defaultColor = goalSettings.getTypeColor('default') || '#6B7280';
        return { backgroundColor: '#F9FAFB', borderColor: '#E5E7EB', color: defaultColor };
      default:
        const fallbackColor = goalSettings.getTypeColor('default') || '#6B7280';
        return { backgroundColor: '#F9FAFB', borderColor: '#E5E7EB', color: fallbackColor };
    }
  };

  // Pie chart data preparation
  const getPieChartData = () => {
    const boardOptions = getBoardOptions();
    
    return boardOptions.map(board => ({
      label: board.label,
      value: getGoalsForBoard(board.id).length,
      color: board.color
    })).filter(item => item.value > 0);
  };

  const renderPieChart = () => {
    const data = getPieChartData();
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    if (total === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center">
            <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No goals to display</p>
          </div>
        </div>
      );
    }

    let currentAngle = 0;
    const radius = 120;
    const centerX = 150;
    const centerY = 150;

    return (
      <div className="flex items-center justify-center p-6">
        <div className="relative">
          <svg width="300" height="300" className="transform -rotate-90">
            {data.map((item, index) => {
              const percentage = item.value / total;
              const angle = percentage * 360;
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;
              
              const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
              const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
              const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
              const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
              
              const largeArcFlag = angle > 180 ? 1 : 0;
              const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');
              
              currentAngle += angle;
              
              return (
                <path
                  key={index}
                  d={pathData}
                  fill={item.color}
                  stroke="white"
                  strokeWidth="2"
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                  data-tooltip={`${item.label}: ${item.value} goals (${Math.round(percentage * 100)}%)`}
                />
              );
            })}
          </svg>
          
          {/* Legend */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {data.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate">{item.label}</span>
                <span className="text-muted-foreground">({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const boardOptions = getBoardOptions();

  // Modal handlers
  const handleAddGoal = () => {
    setSelectedGoal(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGoal(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold">Goal Boards</h2>
          <p className="text-sm text-muted-foreground">
            Organize goals by different attributes with drag and drop
          </p>
        </div>
        
        <Button onClick={handleAddGoal} className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Add Goal
        </Button>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Group by:</span>
          </div>
          <Select value={selectedBoardType} onValueChange={(value: BoardType) => setSelectedBoardType(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Goal Type">Goal Type</SelectItem>
              <SelectItem value="Category">Category</SelectItem>
              <SelectItem value="Priority">Priority</SelectItem>
              <SelectItem value="Status">Status</SelectItem>
              <SelectItem value="Vision">Vision</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">View:</span>
          <div className="flex border rounded-md">
            <Button
              variant={viewType === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewType('list')}
              className="rounded-r-none"
            >
              <List className="h-4 w-4 mr-1" />
              List
            </Button>
            <Button
              variant={viewType === 'pie' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewType('pie')}
              className="rounded-l-none"
            >
              <PieChart className="h-4 w-4 mr-1" />
              Chart
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewType === 'list' ? (
        <>
          {/* Status Labels Section - Fixed at top */}
          <div className="mb-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
              {boardOptions.map((board) => {
                const goalsForBoard = getGoalsForBoard(board.id);
                const boardColor = getBoardColor(board.id);
                
                return (
                  <div key={board.id} className="bg-card p-3 sm:p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: boardColor.color }}
                        ></div>
                        <span className="text-xs sm:text-sm font-medium">{board.label}</span>
                      </div>
                      <span className="text-lg sm:text-2xl font-bold">{goalsForBoard.length}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Swipeable Kanban Boards */}
          <div className="sm:hidden">
            <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
              ← Swipe left/right to navigate between kanban boards →
            </div>
            <div 
              className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 scroll-smooth" 
              style={{ 
                scrollbarWidth: 'thin',
                WebkitOverflowScrolling: 'touch',
                scrollBehavior: 'smooth'
              }}
            >
              {boardOptions.map((board) => {
                const goalsForBoard = getGoalsForBoard(board.id);
                
                return (
                  <div 
                    key={board.id}
                    className="w-80 flex-shrink-0"
                  >
                    <Card 
                      className={`h-96 overflow-y-auto ${
                        dragOverBoardId === board.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      style={getBoardColor(board.id)}
                      onDragOver={handleDragOver}
                      onDragEnter={() => handleDragOverBoard(board.id)}
                      onDragLeave={handleDragLeaveBoard}
                      onDrop={(e) => handleDrop(e, board.id)}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between">
                          <span className="text-base">{board.label}</span>
                          <Badge variant="secondary" className="text-xs">
                            {goalsForBoard.length}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {goalsForBoard.length === 0 ? (
                          <div className="text-center py-8">
                            <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">No goals</p>
                          </div>
                        ) : (
                          goalsForBoard.map((goal) => (
                            <div
                              key={goal.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, goal.id)}
                              onDragEnd={handleDragEnd}
                              onClick={() => handleEditGoal(goal)}
                              className="p-2 sm:p-3 border rounded-lg hover:shadow-sm transition-shadow cursor-pointer"
                            >
                              <div className="flex items-start justify-between mb-1.5 sm:mb-2">
                                <h3 className="font-medium text-xs sm:text-sm leading-tight line-clamp-1">{goal.title}</h3>
                                <Badge 
                                  variant="secondary" 
                                  className={`text-[10px] sm:text-xs px-1.5 py-0.5 ${getStatusColor(goal.status)}`}
                                >
                                  {goal.status.replace('-', ' ')}
                                </Badge>
                              </div>
                              
                              {goal.description && (
                                <p className="text-[10px] sm:text-xs text-muted-foreground mb-1.5 sm:mb-2 line-clamp-1 sm:line-clamp-2">
                                  {goal.description}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
                                <span className="capitalize">{goal.goalType}</span>
                                <span>•</span>
                                <span className="capitalize">{goal.category}</span>
                                <span>•</span>
                                <span>{goal.priority}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Desktop Kanban Grid */}
          <div className="hidden sm:grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {boardOptions.map((board) => {
              const goalsForBoard = getGoalsForBoard(board.id);
              
              return (
                <Card 
                  key={board.id}
                  className={`h-fit ${
                    dragOverBoardId === board.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  style={getBoardColor(board.id)}
                  onDragOver={handleDragOver}
                  onDragEnter={() => handleDragOverBoard(board.id)}
                  onDragLeave={handleDragLeaveBoard}
                  onDrop={(e) => handleDrop(e, board.id)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-base">{board.label}</span>
                      <Badge variant="secondary" className="text-xs">
                        {goalsForBoard.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {goalsForBoard.length === 0 ? (
                      <div className="text-center py-8">
                        <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No goals</p>
                      </div>
                    ) : (
                      goalsForBoard.map((goal) => (
                        <div
                          key={goal.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, goal.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => handleEditGoal(goal)}
                          className="p-2 sm:p-3 border rounded-lg hover:shadow-sm transition-shadow cursor-pointer"
                        >
                          <div className="flex items-start justify-between mb-1.5 sm:mb-2">
                            <h3 className="font-medium text-xs sm:text-sm leading-tight line-clamp-1">{goal.title}</h3>
                            <Badge 
                              variant="secondary" 
                              className={`text-[10px] sm:text-xs px-1.5 py-0.5 ${getStatusColor(goal.status)}`}
                            >
                              {goal.status.replace('-', ' ')}
                            </Badge>
                          </div>
                          
                          {goal.description && (
                            <p className="text-[10px] sm:text-xs text-muted-foreground mb-1.5 sm:mb-2 line-clamp-1 sm:line-clamp-2">
                              {goal.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
                            <span className="capitalize">{goal.goalType}</span>
                            <span>•</span>
                            <span className="capitalize">{goal.category}</span>
                            <span>•</span>
                            <span>{goal.priority}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              {selectedBoardType} Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderPieChart()}
          </CardContent>
        </Card>
      )}

      {/* Goal Modal */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        goal={selectedGoal}
      />
    </div>
  );
}
