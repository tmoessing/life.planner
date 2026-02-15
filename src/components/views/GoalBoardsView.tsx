import { useState } from 'react';
import { useAtom } from 'jotai';
import { goalsAtom, updateGoalAtom, visionsAtom } from '@/stores/appStore';
import { useGoalSettings } from '@/utils/settingsMirror';
import { useSettingsMigration } from '@/hooks/useSettingsMigration';
import { FilterBar } from '@/components/forms/FilterBar';
import { BoardGridLayout } from '@/components/shared/BoardGridLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GoalModal } from '@/components/modals/GoalModal';
import { Target, Filter, List, PieChart, Plus, Search, Tag, Flag, Layers, Sparkles } from 'lucide-react';
import { GoalCard } from '@/components/shared/GoalCard';
import type { Goal } from '@/types';

type BoardType = 'Goal Type' | 'Category' | 'Priority' | 'Status' | 'Vision';
type ViewType = 'list' | 'pie';

export function GoalBoardsView() {
  const [goals] = useAtom(goalsAtom);
  const [visions] = useAtom(visionsAtom);
  const [, updateGoal] = useAtom(updateGoalAtom);

  // Use settings mirror system for goal settings
  const goalSettings = useGoalSettings();

  // Ensure settings are properly migrated
  useSettingsMigration();


  const [selectedBoardType, setSelectedBoardType] = useState<BoardType>('Goal Type');
  const [viewType, setViewType] = useState<ViewType>('list');
  const [, setDraggedGoalId] = useState<string | null>(null);
  const [dragOverBoardId, setDragOverBoardId] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [currentMobileColumnIndex, setCurrentMobileColumnIndex] = useState(0);

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

  const handleStatusChange = (goalId: string, newStatus: Goal['status']) => {
    updateGoal(goalId, { status: newStatus });
  };

  // Helper function to get board type icon
  const getBoardTypeIcon = (boardType: BoardType) => {
    switch (boardType) {
      case 'Goal Type':
        return <Target className="h-4 w-4" />;
      case 'Category':
        return <Tag className="h-4 w-4" />;
      case 'Priority':
        return <Flag className="h-4 w-4" />;
      case 'Status':
        return <Layers className="h-4 w-4" />;
      case 'Vision':
        return <Sparkles className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
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
      <div className="flex items-center justify-between gap-4">
        {/* Board Type Selector and View Toggle - Left aligned */}
        <div className="flex items-center gap-2">
          <Select value={selectedBoardType} onValueChange={(value: BoardType) => {
            setSelectedBoardType(value);
            setCurrentMobileColumnIndex(0);
          }}>
            <SelectTrigger className="w-full sm:w-48">
              <div className="flex items-center gap-2">
                {getBoardTypeIcon(selectedBoardType)}
                <SelectValue>
                  {selectedBoardType}
                </SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Goal Type" className="pl-12">
                <span className="absolute left-10 flex items-center pointer-events-none" aria-hidden="true">{getBoardTypeIcon('Goal Type')}</span>
                <span className="ml-6">Goal Type</span>
              </SelectItem>
              <SelectItem value="Category" className="pl-12">
                <span className="absolute left-10 flex items-center pointer-events-none" aria-hidden="true">{getBoardTypeIcon('Category')}</span>
                <span className="ml-6">Category</span>
              </SelectItem>
              <SelectItem value="Priority" className="pl-12">
                <span className="absolute left-10 flex items-center pointer-events-none" aria-hidden="true">{getBoardTypeIcon('Priority')}</span>
                <span className="ml-6">Priority</span>
              </SelectItem>
              <SelectItem value="Status" className="pl-12">
                <span className="absolute left-10 flex items-center pointer-events-none" aria-hidden="true">{getBoardTypeIcon('Status')}</span>
                <span className="ml-6">Status</span>
              </SelectItem>
              <SelectItem value="Vision" className="pl-12">
                <span className="absolute left-10 flex items-center pointer-events-none" aria-hidden="true">{getBoardTypeIcon('Vision')}</span>
                <span className="ml-6">Vision</span>
              </SelectItem>
            </SelectContent>
          </Select>
          {/* View Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewType(viewType === 'list' ? 'pie' : 'list')}
            className="gap-2"
          >
            {viewType === 'list' ? (
              <>
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">List</span>
              </>
            ) : (
              <>
                <PieChart className="h-4 w-4" />
                <span className="hidden sm:inline">Chart</span>
              </>
            )}
          </Button>
        </div>

        {/* Search, Filter, Add Goal - Right aligned */}
        <div className="flex items-center gap-2">
          <Button
            variant={showSearch ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setShowSearch(!showSearch);
              if (showSearch) setShowFilter(false);
            }}
            className={`gap-2 ${showSearch ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700 border-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 dark:border-gray-600'}`}
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
          </Button>
          <Button
            variant={showFilter ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setShowFilter(!showFilter);
              if (showFilter) setShowSearch(false);
            }}
            className={`gap-2 ${showFilter ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700 border-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 dark:border-gray-600'}`}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleAddGoal}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Goal</span>
          </Button>
        </div>
      </div>

      {/* Search Panel */}
      {showSearch && (
        <div>
          <FilterBar showSearchOnly={true} />
        </div>
      )}

      {/* Filter Panel */}
      {showFilter && (
        <div>
          <FilterBar showFilterOnly={true} />
        </div>
      )}

      {/* Content */}
      {viewType === 'list' ? (
        <BoardGridLayout
          columns={boardOptions.map((board) => ({
            id: board.id,
            label: board.label,
            items: getGoalsForBoard(board.id),
            color: board.color
          }))}
          renderItem={() => null}
          renderColumn={(column) => (
            <Card
              key={column.id}
              className={`h-full ${dragOverBoardId === column.id ? 'ring-2 ring-blue-500' : ''}`}
              style={{
                backgroundColor: `${column.color}20`,
                borderColor: `${column.color}40`,
                color: column.color
              }}
              onDragOver={(e) => {
                handleDragOver(e);
                handleDragOverBoard(column.id);
              }}
              onDragLeave={handleDragLeaveBoard}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{column.label}</span>
                  <Badge variant="secondary" className="ml-2">
                    {column.items.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {column.items.length > 0 ? (
                  column.items.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      draggable
                      onDragStart={(e) => handleDragStart(e, goal.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => handleEditGoal(goal)}
                      onEdit={handleEditGoal}
                      onStatusChange={handleStatusChange}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Target className="h-8 w-8 opacity-50 mx-auto mb-2" />
                    <p className="text-sm opacity-70">No goals</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          currentMobileColumnIndex={currentMobileColumnIndex}
          onMobileColumnChange={setCurrentMobileColumnIndex}
        />
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
