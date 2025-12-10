import { Task, OutboxItem } from '../types';
import { getServerJson, setServerJson, STORAGE_KEYS } from '../storage';

// simulated server that persists "remote" data separately
// this mimics what a real backend would do

interface SimulatedServerConfig {
  latencyMs: number;
  failureRate: number; // 0-1
}

let config: SimulatedServerConfig = {
  latencyMs: 500,
  failureRate: 0.2,
};

export function configureSimulatedServer(newConfig: Partial<SimulatedServerConfig>) {
  config = { ...config, ...newConfig };
}

// helper to simulate network delay
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// helper to randomly fail based on failure rate
function maybeThrow(): void {
  if (Math.random() < config.failureRate) {
    throw new Error('Simulated network failure');
  }
}

// fetch all tasks from "server"
export async function fetchAllTasks(): Promise<Task[]> {
  await delay(config.latencyMs);
  maybeThrow();
  return await getServerJson<Task[]>(STORAGE_KEYS.SERVER_TASKS, []);
}

// apply a single change to the "server"
export async function applyChange(change: OutboxItem): Promise<Task | null> {
  await delay(config.latencyMs);
  maybeThrow();

  const tasks = await getServerJson<Task[]>(STORAGE_KEYS.SERVER_TASKS, []);
  let result: Task | null = null;

  switch (change.operation) {
    case 'create': {
      if (change.payload) {
        const newTask = change.payload as Task;
        // check for conflicts - if task already exists, use last-writer-wins
        const existingIndex = tasks.findIndex((t) => t.id === newTask.id);
        if (existingIndex !== -1) {
          const existing = tasks[existingIndex];
          if (new Date(newTask.updatedAt) > new Date(existing.updatedAt)) {
            tasks[existingIndex] = newTask;
            result = newTask;
          } else {
            result = existing; // server version wins
          }
        } else {
          tasks.push(newTask);
          result = newTask;
        }
      }
      break;
    }
    case 'update': {
      if (change.payload) {
        const index = tasks.findIndex((t) => t.id === change.taskId);
        if (index !== -1) {
          const existing = tasks[index];
          const updates = change.payload;
          // last-writer-wins based on timestamp
          if (updates.updatedAt && new Date(updates.updatedAt) > new Date(existing.updatedAt)) {
            tasks[index] = { ...existing, ...updates };
            result = tasks[index];
          } else {
            result = existing;
          }
        }
      }
      break;
    }
    case 'delete': {
      const index = tasks.findIndex((t) => t.id === change.taskId);
      if (index !== -1) {
        tasks.splice(index, 1);
      }
      result = null;
      break;
    }
  }

  await setServerJson(STORAGE_KEYS.SERVER_TASKS, tasks);
  return result;
}

// batch sync - push all local tasks to server (for initial sync)
export async function pushAllTasks(tasks: Task[]): Promise<void> {
  await delay(config.latencyMs);
  maybeThrow();
  await setServerJson(STORAGE_KEYS.SERVER_TASKS, tasks);
}

// clear server data (for testing)
export async function clearServerData(): Promise<void> {
  await delay(100);
  await setServerJson(STORAGE_KEYS.SERVER_TASKS, []);
}
