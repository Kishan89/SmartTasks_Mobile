import { v4 as uuid } from 'uuid';
import { OutboxItem, Task } from '../types';
import { store } from '../store';
import {
  addToOutbox,
  removeFromOutbox,
  incrementRetry,
  setSyncStatus,
  setSyncError,
  updateLastSyncTime,
} from '../store/syncSlice';
import { getApiClient } from '../api';

const MAX_RETRIES = 3;

// helper to queue a change for syncing
export function queueChange(
  operation: OutboxItem['operation'],
  taskId: string,
  payload: Partial<Task> | null
) {
  const item: Omit<OutboxItem, 'retryCount'> = {
    id: uuid(),
    operation,
    taskId,
    payload,
    timestamp: new Date().toISOString(),
  };
  store.dispatch(addToOutbox(item));
}

// process all queued changes
export async function processOutbox(): Promise<void> {
  const state = store.getState();
  const { outbox } = state.sync;
  const { simulateNetwork } = state.settings.settings;

  // don't sync if "offline"
  if (!simulateNetwork) {
    store.dispatch(setSyncStatus('offline'));
    return;
  }

  if (outbox.length === 0) {
    store.dispatch(setSyncStatus('synced'));
    store.dispatch(updateLastSyncTime());
    return;
  }

  store.dispatch(setSyncStatus('syncing'));
  store.dispatch(setSyncError(null));

  const api = getApiClient();
  let hasErrors = false;

  // process items in order
  for (const item of outbox) {
    if (item.retryCount >= MAX_RETRIES) {
      // skip items that have exceeded retries
      continue;
    }

    try {
      await api.applyChange(item);
      store.dispatch(removeFromOutbox(item.id));
    } catch (error) {
      hasErrors = true;
      store.dispatch(incrementRetry(item.id));

      if (item.retryCount + 1 >= MAX_RETRIES) {
        store.dispatch(
          setSyncError(`Failed to sync: ${item.operation} ${item.taskId.slice(0, 8)}...`)
        );
      }
    }
  }

  // update final status
  const remaining = store.getState().sync.outbox.filter((i) => i.retryCount < MAX_RETRIES);
  if (remaining.length === 0) {
    store.dispatch(setSyncStatus('synced'));
    store.dispatch(updateLastSyncTime());
  } else if (hasErrors) {
    store.dispatch(setSyncStatus('error'));
  }
}

// start sync when network becomes available
export function startSync() {
  processOutbox().catch(console.error);
}
