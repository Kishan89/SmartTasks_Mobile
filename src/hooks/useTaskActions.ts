import { useCallback } from 'react';
import { Task } from '../types';
import { useAppDispatch } from '../store';
import { addTask, updateTask, deleteTask } from '../store/taskSlice';
import { queueChange } from '../sync';

// hook that wraps task mutations with sync queue
export function useTaskActions() {
  const dispatch = useAppDispatch();

  const createTask = useCallback(
    (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
      dispatch(addTask(taskData));
      const now = new Date().toISOString();
      const tempId = '';
      queueChange('create', tempId, { ...taskData, createdAt: now, updatedAt: now } as Task);
    },
    [dispatch]
  );

  const editTask = useCallback(
    (id: string, updates: Partial<Task>) => {
      dispatch(updateTask({ id, updates }));
      queueChange('update', id, { ...updates, updatedAt: new Date().toISOString() });
    },
    [dispatch]
  );

  const removeTask = useCallback(
    (id: string) => {
      dispatch(deleteTask(id));
      queueChange('delete', id, null);
    },
    [dispatch]
  );

  return { createTask, editTask, removeTask };
}
