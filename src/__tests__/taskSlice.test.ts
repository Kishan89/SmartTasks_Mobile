import taskReducer, {
  addTask,
  updateTask,
  deleteTask,
  setFilter,
  resetFilters,
  seedDemoData,
  clearAllTasks,
  selectFilteredTasks,
  selectTaskStats,
} from '../store/taskSlice';
import { Task, TaskFilters } from '../types';

// mock storage
jest.mock('../storage', () => ({
  getJson: jest.fn(() => []),
  setJson: jest.fn(),
  STORAGE_KEYS: { TASKS: 'tasks' },
}));

describe('taskSlice', () => {
  const initialState = {
    tasks: [],
    filters: {
      search: '',
      status: 'all' as const,
      priority: 'all' as const,
      sortBy: 'createdAt' as const,
      sortOrder: 'desc' as const,
    },
    isLoading: true,
  };

  describe('addTask', () => {
    it('adds a new task to the beginning of the list', () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test description',
        status: 'pending' as const,
        priority: 'medium' as const,
      };

      const state = taskReducer(initialState, addTask(taskData));

      expect(state.tasks).toHaveLength(1);
      expect(state.tasks[0].title).toBe('Test Task');
      expect(state.tasks[0].status).toBe('pending');
      expect(state.tasks[0].id).toBeDefined();
      expect(state.tasks[0].createdAt).toBeDefined();
    });
  });

  describe('updateTask', () => {
    it('updates an existing task', () => {
      const existingTask: Task = {
        id: 'task-1',
        title: 'Original',
        description: '',
        status: 'pending',
        priority: 'low',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      const stateWithTask = { ...initialState, tasks: [existingTask] };
      const state = taskReducer(
        stateWithTask,
        updateTask({ id: 'task-1', updates: { title: 'Updated', status: 'completed' } })
      );

      expect(state.tasks[0].title).toBe('Updated');
      expect(state.tasks[0].status).toBe('completed');
      expect(state.tasks[0].updatedAt).not.toBe(existingTask.updatedAt);
    });

    it('does nothing if task not found', () => {
      const state = taskReducer(
        initialState,
        updateTask({ id: 'nonexistent', updates: { title: 'New' } })
      );

      expect(state.tasks).toHaveLength(0);
    });
  });

  describe('deleteTask', () => {
    it('removes a task by id', () => {
      const existingTask: Task = {
        id: 'task-1',
        title: 'To Delete',
        description: '',
        status: 'pending',
        priority: 'low',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      const stateWithTask = { ...initialState, tasks: [existingTask] };
      const state = taskReducer(stateWithTask, deleteTask('task-1'));

      expect(state.tasks).toHaveLength(0);
    });
  });

  describe('setFilter', () => {
    it('updates filter values', () => {
      const state = taskReducer(initialState, setFilter({ search: 'test', status: 'completed' }));

      expect(state.filters.search).toBe('test');
      expect(state.filters.status).toBe('completed');
      expect(state.filters.priority).toBe('all'); // unchanged
    });
  });

  describe('resetFilters', () => {
    it('resets all filters to defaults', () => {
      const modifiedState = {
        ...initialState,
        filters: {
          search: 'test',
          status: 'completed' as const,
          priority: 'high' as const,
          sortBy: 'priority' as const,
          sortOrder: 'asc' as const,
        },
      };

      const state = taskReducer(modifiedState, resetFilters());

      expect(state.filters.search).toBe('');
      expect(state.filters.status).toBe('all');
      expect(state.filters.priority).toBe('all');
    });
  });

  describe('selectFilteredTasks', () => {
    const tasks: Task[] = [
      { id: '1', title: 'Buy groceries', description: '', status: 'pending', priority: 'low', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
      { id: '2', title: 'Finish report', description: '', status: 'completed', priority: 'high', createdAt: '2025-01-02', updatedAt: '2025-01-02' },
      { id: '3', title: 'Call mom', description: '', status: 'pending', priority: 'medium', createdAt: '2025-01-03', updatedAt: '2025-01-03' },
    ];

    it('filters by search term', () => {
      const state = { tasks: { tasks, filters: { ...initialState.filters, search: 'report' }, isLoading: false } };
      const result = selectFilteredTasks(state);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Finish report');
    });

    it('filters by status', () => {
      const state = { tasks: { tasks, filters: { ...initialState.filters, status: 'pending' as const }, isLoading: false } };
      const result = selectFilteredTasks(state);

      expect(result).toHaveLength(2);
      expect(result.every((t) => t.status === 'pending')).toBe(true);
    });

    it('filters by priority', () => {
      const state = { tasks: { tasks, filters: { ...initialState.filters, priority: 'high' as const }, isLoading: false } };
      const result = selectFilteredTasks(state);

      expect(result).toHaveLength(1);
      expect(result[0].priority).toBe('high');
    });
  });

  describe('selectTaskStats', () => {
    it('calculates correct statistics', () => {
      const tasks: Task[] = [
        { id: '1', title: 'A', description: '', status: 'pending', priority: 'low', createdAt: '', updatedAt: '' },
        { id: '2', title: 'B', description: '', status: 'completed', priority: 'high', createdAt: '', updatedAt: '' },
        { id: '3', title: 'C', description: '', status: 'in_progress', priority: 'medium', createdAt: '', updatedAt: '' },
        { id: '4', title: 'D', description: '', status: 'completed', priority: 'high', createdAt: '', updatedAt: '' },
      ];

      const state = { tasks: { tasks, filters: initialState.filters, isLoading: false } };
      const stats = selectTaskStats(state);

      expect(stats.total).toBe(4);
      expect(stats.pending).toBe(1);
      expect(stats.inProgress).toBe(1);
      expect(stats.completed).toBe(2);
      expect(stats.lowPriority).toBe(1);
      expect(stats.mediumPriority).toBe(1);
      expect(stats.highPriority).toBe(2);
    });
  });
});
