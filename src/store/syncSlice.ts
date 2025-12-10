import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { OutboxItem, SyncStatus } from '../types';
import { getJson, setJson, STORAGE_KEYS } from '../storage';

interface SyncState {
  status: SyncStatus;
  outbox: OutboxItem[];
  lastSyncTime: string | null;
  error: string | null;
}

const initialState: SyncState = {
  status: 'offline',
  outbox: [],
  lastSyncTime: null,
  error: null,
};

// async thunk to load outbox from storage
export const loadOutbox = createAsyncThunk('sync/loadOutbox', async () => {
  const outbox = await getJson<OutboxItem[]>(STORAGE_KEYS.OUTBOX, []);
  const lastSyncTime = await getJson<string | null>(STORAGE_KEYS.LAST_SYNC, null);
  return { outbox, lastSyncTime };
});

const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    addToOutbox(state, action: PayloadAction<Omit<OutboxItem, 'retryCount'>>) {
      const item: OutboxItem = { ...action.payload, retryCount: 0 };
      state.outbox.push(item);
      setJson(STORAGE_KEYS.OUTBOX, state.outbox);
    },

    removeFromOutbox(state, action: PayloadAction<string>) {
      state.outbox = state.outbox.filter((item) => item.id !== action.payload);
      setJson(STORAGE_KEYS.OUTBOX, state.outbox);
    },

    incrementRetry(state, action: PayloadAction<string>) {
      const item = state.outbox.find((i) => i.id === action.payload);
      if (item) {
        item.retryCount++;
        setJson(STORAGE_KEYS.OUTBOX, state.outbox);
      }
    },

    clearFailedItems(state, action: PayloadAction<number>) {
      const maxRetries = action.payload;
      state.outbox = state.outbox.filter((item) => item.retryCount < maxRetries);
      setJson(STORAGE_KEYS.OUTBOX, state.outbox);
    },

    setSyncStatus(state, action: PayloadAction<SyncStatus>) {
      state.status = action.payload;
    },

    setSyncError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      if (action.payload) {
        state.status = 'error';
      }
    },

    updateLastSyncTime(state) {
      state.lastSyncTime = new Date().toISOString();
      setJson(STORAGE_KEYS.LAST_SYNC, state.lastSyncTime);
    },

    clearOutbox(state) {
      state.outbox = [];
      setJson(STORAGE_KEYS.OUTBOX, []);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadOutbox.fulfilled, (state, action) => {
      state.outbox = action.payload.outbox;
      state.lastSyncTime = action.payload.lastSyncTime;
    });
  },
});

export const {
  addToOutbox,
  removeFromOutbox,
  incrementRetry,
  clearFailedItems,
  setSyncStatus,
  setSyncError,
  updateLastSyncTime,
  clearOutbox,
} = syncSlice.actions;

export default syncSlice.reducer;

// selectors
export const selectSyncStatus = (state: { sync: SyncState }) => state.sync.status;
export const selectOutboxCount = (state: { sync: SyncState }) => state.sync.outbox.length;
export const selectLastSyncTime = (state: { sync: SyncState }) => state.sync.lastSyncTime;
export const selectSyncError = (state: { sync: SyncState }) => state.sync.error;
