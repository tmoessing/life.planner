import { useState } from 'react';
import { GoalModal } from '@/components/modals/GoalModal';
import { AllGoalsKanbanBoard } from '@/components/boards/AllGoalsKanbanBoard';
import type { Goal } from '@/types';

export function GoalsView() {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

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

  const handleDeleteGoal = (goalId: string) => {
    // Delete is handled directly in AllGoalsKanbanBoard
  };

  return (
    <div className="h-full">
      <AllGoalsKanbanBoard
        onAddGoal={handleAddGoal}
        onEditGoal={handleEditGoal}
        onDeleteGoal={handleDeleteGoal}
      />

      {/* Goal Modal */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        goal={selectedGoal}
      />
    </div>
  );
}