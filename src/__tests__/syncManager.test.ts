import { OutboxItem, Task } from '../types';

// mock the store module
const mockDispatch = jest.fn();
const mockGetState = jest.fn();

jest.mock('../store', () => ({
  store: {
    dispatch: (action: unknown) => mockDispatch(action),
    getState: () => mockGetState(),
  },
}));

// mock the API
const mockApplyChange = jest.fn();
jest.mock('../api', () => ({
  getApiClient: () => ({
    applyChange: mockApplyChange,
  }),
}));

// import after mocks
import { processOutbox } from '../sync/syncManager';

describe('syncManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('processOutbox', () => {
    it('does nothing when offline', async () => {
      mockGetState.mockReturnValue({
        sync: { outbox: [{ id: '1', operation: 'create', taskId: 't1', payload: {}, timestamp: '', retryCount: 0 }] },
        settings: { settings: { simulateNetwork: false } },
      });

      await processOutbox();

      expect(mockApplyChange).not.toHaveBeenCalled();
      // should set status to offline
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'sync/setSyncStatus', payload: 'offline' })
      );
    });

    it('sets synced status when outbox is empty', async () => {
      mockGetState.mockReturnValue({
        sync: { outbox: [] },
        settings: { settings: { simulateNetwork: true } },
      });

      await processOutbox();

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'sync/setSyncStatus', payload: 'synced' })
      );
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'sync/updateLastSyncTime' })
      );
    });

    it('processes outbox items when online', async () => {
      const outboxItem: OutboxItem = {
        id: 'item-1',
        operation: 'create',
        taskId: 'task-1',
        payload: { title: 'Test' } as Partial<Task>,
        timestamp: '2025-01-01T00:00:00Z',
        retryCount: 0,
      };

      mockGetState.mockReturnValue({
        sync: { outbox: [outboxItem] },
        settings: { settings: { simulateNetwork: true } },
      });

      mockApplyChange.mockResolvedValue({ id: 'task-1', title: 'Test' });

      await processOutbox();

      expect(mockApplyChange).toHaveBeenCalledWith(outboxItem);
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'sync/removeFromOutbox', payload: 'item-1' })
      );
    });

    it('increments retry on failure', async () => {
      const outboxItem: OutboxItem = {
        id: 'item-1',
        operation: 'update',
        taskId: 'task-1',
        payload: { status: 'completed' },
        timestamp: '2025-01-01T00:00:00Z',
        retryCount: 0,
      };

      mockGetState.mockReturnValue({
        sync: { outbox: [outboxItem] },
        settings: { settings: { simulateNetwork: true } },
      });

      mockApplyChange.mockRejectedValue(new Error('Network error'));

      await processOutbox();

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'sync/incrementRetry', payload: 'item-1' })
      );
    });

    it('skips items that exceeded max retries', async () => {
      const outboxItem: OutboxItem = {
        id: 'item-1',
        operation: 'delete',
        taskId: 'task-1',
        payload: null,
        timestamp: '2025-01-01T00:00:00Z',
        retryCount: 3, // max retries reached
      };

      mockGetState.mockReturnValue({
        sync: { outbox: [outboxItem] },
        settings: { settings: { simulateNetwork: true } },
      });

      await processOutbox();

      expect(mockApplyChange).not.toHaveBeenCalled();
    });
  });
});
