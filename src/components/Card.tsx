import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Pencil, Trash2, User } from 'lucide-react';
import type { Task } from './KanbanBoard';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface CardProps {
  task: Task;
  overlay?: boolean;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
}

export function Card({ task, overlay, onDelete, onUpdate }: CardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: task.id,
    disabled: overlay || isEditing,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  const handleSave = async () => {
    if (editedTitle.trim() === '') return;
    
    await onUpdate(task.id, {
      title: editedTitle,
      description: editedDescription,
    });
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <input
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full mb-2 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Task title"
          autoFocus
        />
        <textarea
          value={editedDescription}
          onChange={(e) => setEditedDescription(e.target.value)}
          className="w-full mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Task description"
          rows={2}
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setIsEditing(false)}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        group bg-white rounded-lg p-4 shadow-sm border border-gray-200
        hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing
        ${overlay ? 'shadow-lg' : ''}
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-gray-900">{task.title}</h3>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            priorityColors[task.priority]
          }`}
        >
          {task.priority}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-4">{task.description}</p>

      <div className="flex items-center justify-between text-gray-500">
        <div className="flex items-center">
          {task.assignee && (
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              <span className="text-xs">{task.assignee}</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsEditing(true);
            }}
            className="p-1 hover:text-blue-600 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              onDelete(task.id);
            }}
            className="p-1 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}