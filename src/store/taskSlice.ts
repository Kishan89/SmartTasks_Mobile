import { createSlice, createAsyncThunk, createSelector, PayloadAction } from '@reduxjs/toolkit';
import { Task, TaskFilters, TaskStatus, TaskPriority } from '../types';
import { getJson, setJson, STORAGE_KEYS } from '../storage';
import { v4 as uuid } from 'uuid';

interface TaskState {
  tasks: Task[];
  filters: TaskFilters;
  isLoading: boolean;
}

const defaultFilters: TaskFilters = {
  search: '',
  status: 'all',
  priority: 'all',
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

const initialState: TaskState = {
  tasks: [],
  filters: defaultFilters,
  isLoading: true,
};

// async thunk to load tasks from storage
export const loadTasks = createAsyncThunk('tasks/loadTasks', async () => {
  return await getJson<Task[]>(STORAGE_KEYS.TASKS, []);
});

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask(state, action: PayloadAction<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>) {
      const now = new Date().toISOString();
      const task: Task = {
        ...action.payload,
        id: uuid(),
        createdAt: now,
        updatedAt: now,
      };
      state.tasks.unshift(task);
      setJson(STORAGE_KEYS.TASKS, state.tasks); // fire and forget
    },

    updateTask(state, action: PayloadAction<{ id: string; updates: Partial<Task> }>) {
      const { id, updates } = action.payload;
      const index = state.tasks.findIndex((t) => t.id === id);
      if (index !== -1) {
        state.tasks[index] = {
          ...state.tasks[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        setJson(STORAGE_KEYS.TASKS, state.tasks);
      }
    },

    deleteTask(state, action: PayloadAction<string>) {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);
      setJson(STORAGE_KEYS.TASKS, state.tasks);
    },

    setFilter(state, action: PayloadAction<Partial<TaskFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },

    resetFilters(state) {
      state.filters = defaultFilters;
    },

    setTasks(state, action: PayloadAction<Task[]>) {
      state.tasks = action.payload;
      setJson(STORAGE_KEYS.TASKS, state.tasks);
    },

    seedDemoData(state) {
      const now = new Date();
      const demoTasks: Task[] = [
        {
          id: uuid(),
          title: 'Complete project proposal',
          description: 'Write and submit the Q4 project proposal to stakeholders',
          status: 'in_progress',
          priority: 'high',
          dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: now.toISOString(),
        },
        {
          id: uuid(),
          title: 'Review code changes',
          description: 'Review pull requests from team members',
          status: 'pending',
          priority: 'medium',
          dueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: now.toISOString(),
        },
        {
          id: uuid(),
          title: 'Update documentation',
          description: 'Add API documentation for new endpoints',
          status: 'pending',
          priority: 'low',
          createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: now.toISOString(),
        },
        {
          id: uuid(),
          title: 'Fix login bug',
          description: 'Users report intermittent login failures',
          status: 'completed',
          priority: 'high',
          createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: uuid(),
          title: 'Team standup notes',
          description: 'Prepare notes for weekly standup',
          status: 'completed',
          priority: 'low',
          createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
      state.tasks = demoTasks;
      setJson(STORAGE_KEYS.TASKS, state.tasks);
    },

    clearAllTasks(state) {
      state.tasks = [];
      setJson(STORAGE_KEYS.TASKS, []);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadTasks.fulfilled, (state, action) => {
      state.tasks = action.payload;
      state.isLoading = false;
    });
  },
});

export const {
  addTask,
  updateTask,
  deleteTask,
  setFilter,
  resetFilters,
  setTasks,
  seedDemoData,
  clearAllTasks,
} = taskSlice.actions;

export default taskSlice.reducer;

// Memoized selectors to prevent unnecessary rerenders
export const selectFilteredTasks = createSelector(
  [(state: { tasks: TaskState }) => state.tasks.tasks, (state: { tasks: TaskState }) => state.tasks.filters],
  (tasks, filters) => {
    let filtered = [...tasks];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter((t) => t.title.toLowerCase().includes(search));
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter((t) => t.status === filters.status);
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter((t) => t.priority === filters.priority);
    }

    const priorityOrder: Record<TaskPriority, number> = { high: 3, medium: 2, low: 1 };

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) comparison = 0;
          else if (!a.dueDate) comparison = 1;
          else if (!b.dueDate) comparison = -1;
          else comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case 'priority':
          comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
          break;
        case 'createdAt':
        default:
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return filters.sortOrder === 'asc' ? -comparison : comparison;
    });

    return filtered;
  }
);

export const selectTaskStats = createSelector(
  [(state: { tasks: TaskState }) => state.tasks.tasks],
  (tasks) => ({
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    lowPriority: tasks.filter((t) => t.priority === 'low').length,
    mediumPriority: tasks.filter((t) => t.priority === 'medium').length,
    highPriority: tasks.filter((t) => t.priority === 'high').length,
  })
);
