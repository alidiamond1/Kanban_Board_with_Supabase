import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Card } from './Card';
import { Plus, X } from 'lucide-react';
import type { Task } from './KanbanBoard';

interface ColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onAddTask: (title: string, description: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  isLoading?: boolean;
}

export function Column({
  id,
  title,
  tasks,
  onAddTask,
  onDeleteTask,
  onUpdateTask,
  isLoading,
}: ColumnProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  
  const { setNodeRef } = useDroppable({ id });

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle.trim(), newTaskDescription.trim());
      setNewTaskTitle('');
      setNewTaskDescription('');
      setIsAddingTask(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddTask();
    }
  };

  return (
    <div className="flex flex-col w-80 bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
        <span className="text-sm text-gray-500">{tasks.length}</span>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <SortableContext
            items={tasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-3">
              {tasks.map((task) => (
                <Card
                  key={task.id}
                  task={task}
                  onDelete={onDeleteTask}
                  onUpdate={onUpdateTask}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </div>

      {isAddingTask ? (
        <div className="mt-4 bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">New Task</h3>
            <button
              onClick={() => setIsAddingTask(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Task title"
            className="w-full mb-2 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <textarea
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            placeholder="Task description (optional)"
            className="w-full mb-3 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsAddingTask(false)}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleAddTask}
              disabled={!newTaskTitle.trim()}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Task
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingTask(true)}
          disabled={isLoading}
          className="mt-4 flex items-center justify-center w-full py-2 rounded-md bg-white border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Task
        </button>
      )}
    </div>
  );
}