import { Task, OutboxItem, AppSettings } from '../types';
import * as simulatedServer from './simulatedServer';

// API client abstraction - can switch between simulated and real backends
// Currently only simulated is implemented, but structure allows easy addition of real API

export interface ApiClient {
  fetchAllTasks(): Promise<Task[]>;
  applyChange(change: OutboxItem): Promise<Task | null>;
  pushAllTasks(tasks: Task[]): Promise<void>;
}

function createSimulatedClient(): ApiClient {
  return {
    fetchAllTasks: simulatedServer.fetchAllTasks,
    applyChange: simulatedServer.applyChange,
    pushAllTasks: simulatedServer.pushAllTasks,
  };
}

function createRealClient(_baseUrl: string): ApiClient {
  // placeholder for real API implementation
  // would use fetch/axios to call actual endpoints
  throw new Error('Real API not implemented. Set API_MODE to simulated.');
}

let client: ApiClient = createSimulatedClient();

export function configureApiClient(settings: AppSettings) {
  if (settings.apiMode === 'real') {
    // would get baseUrl from env or settings
    client = createRealClient('');
  } else {
    client = createSimulatedClient();
    simulatedServer.configureSimulatedServer({
      latencyMs: settings.simulatedLatencyMs,
      failureRate: settings.simulatedFailureRate,
    });
  }
}

export function getApiClient(): ApiClient {
  return client;
}
