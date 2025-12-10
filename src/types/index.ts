// Task model - core data structure for the app
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string; // ISO string
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

// Outbox item for offline sync queue
export interface OutboxItem {
  id: string;
  operation: 'create' | 'update' | 'delete';
  taskId: string;
  payload: Partial<Task> | null;
  timestamp: string;
  retryCount: number;
}

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

// Filter state for task list
export interface TaskFilters {
  search: string;
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  sortBy: 'dueDate' | 'createdAt' | 'priority';
  sortOrder: 'asc' | 'desc';
}

// Settings state
export interface AppSettings {
  theme: 'light' | 'dark';
  simulateNetwork: boolean;
  apiMode: 'simulated' | 'real';
  simulatedLatencyMs: number;
  simulatedFailureRate: number; // 0-1
}
