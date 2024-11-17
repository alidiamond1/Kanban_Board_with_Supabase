import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Column } from './Column';
import { Card } from './Card';
import { Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export type Task = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
};

const defaultColumns = ['Todo', 'In Progress', 'Done'];

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error: supabaseError } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: true });

      if (supabaseError) {
        throw supabaseError;
      }

      setTasks(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch tasks';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tasksByColumn = defaultColumns.reduce((acc, columnId) => {
    acc[columnId] = filteredTasks.filter(
      (task) => task.status.toLowerCase() === columnId.toLowerCase()
    );
    return acc;
  }, {} as Record<string, Task[]>);

  async function handleDragEnd(event: any) {
    const { active, over } = event;

    if (!over) return;

    const activeTask = tasks.find((task) => task.id === active.id);
    const overColumn = over.id;

    if (activeTask && activeTask.status !== overColumn) {
      try {
        const { error: supabaseError } = await supabase
          .from('tasks')
          .update({ status: overColumn })
          .eq('id', activeTask.id);

        if (supabaseError) {
          throw supabaseError;
        }

        setTasks(
          tasks.map((task) =>
            task.id === activeTask.id
              ? { ...task, status: overColumn }
              : task
          )
        );
        toast.success('Task moved successfully');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update task';
        toast.error(message);
      }
    }

    setActiveId(null);
  }

  async function handleAddTask(columnId: string, title: string, description: string) {
    const newTask = {
      title,
      description,
      status: columnId,
      priority: 'medium' as const,
    };

    try {
      const { data, error: supabaseError } = await supabase
        .from('tasks')
        .insert([newTask])
        .select()
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      if (data) {
        setTasks([...tasks, data]);
        toast.success('Task created successfully');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create task';
      toast.error(message);
    }
  }

  async function handleDeleteTask(taskId: string) {
    try {
      const { error: supabaseError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (supabaseError) {
        throw supabaseError;
      }

      setTasks(tasks.filter((task) => task.id !== taskId));
      toast.success('Task deleted successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete task';
      toast.error(message);
    }
  }

  async function handleUpdateTask(taskId: string, updates: Partial<Task>) {
    try {
      const { error: supabaseError } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId);

      if (supabaseError) {
        throw supabaseError;
      }

      setTasks(tasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      ));
      toast.success('Task updated successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update task';
      toast.error(message);
    }
  }

  if (error) {
    return (
      <div className="h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchTasks}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Kanban Board</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={(event) => setActiveId(event.active.id)}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 h-[calc(100vh-12rem)]">
          {defaultColumns.map((columnId) => (
            <Column
              key={columnId}
              id={columnId}
              title={columnId}
              tasks={tasksByColumn[columnId] || []}
              onAddTask={(title, description) => handleAddTask(columnId, title, description)}
              onDeleteTask={handleDeleteTask}
              onUpdateTask={handleUpdateTask}
              isLoading={isLoading}
            />
          ))}
        </div>

        <DragOverlay>
          {activeId ? (
            <Card
              task={tasks.find((task) => task.id === activeId)!}
              overlay
              onDelete={() => {}}
              onUpdate={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}