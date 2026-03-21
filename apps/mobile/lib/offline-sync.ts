import { MMKV } from 'react-native-mmkv';
import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';

// ─── MMKV Storage ──────────────────────────────────────────────────
export const storage = new MMKV({ id: 'fieldvault-cache' });

/**
 * MMKV-backed storage adapter for React Query persistence.
 * Caches query results locally so the app works offline.
 */
const mmkvStorage = {
  getItem: (key: string): string | null => {
    const value = storage.getString(key);
    return value ?? null;
  },
  setItem: (key: string, value: string): void => {
    storage.set(key, value);
  },
  removeItem: (key: string): void => {
    storage.delete(key);
  },
};

// ─── Query Client ──────────────────────────────────────────────────
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Keep cached data for 5 minutes when online
      staleTime: 5 * 60 * 1000,
      // Cache persists for 24 hours offline
      gcTime: 24 * 60 * 60 * 1000,
      // Retry failed requests 2 times
      retry: 2,
      // Don't refetch on window focus in mobile
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// ─── Persister ─────────────────────────────────────────────────────
export const persister = createSyncStoragePersister({
  storage: mmkvStorage,
  key: 'fieldvault-react-query',
  // Serialize/deserialize with max age of 24 hours
  throttleTime: 1000,
});

// ─── Online Manager ────────────────────────────────────────────────
// Automatically pauses/resumes queries based on network status
export function setupOnlineManager() {
  onlineManager.setEventListener((setOnline) => {
    return NetInfo.addEventListener((state) => {
      const isConnected = !!state.isConnected;
      setOnline(isConnected);

      // Process offline queue when coming back online
      if (isConnected) {
        processOfflineQueue();
      }
    });
  });
}

// ─── Offline Mutation Queue ────────────────────────────────────────
const OFFLINE_QUEUE_KEY = 'fieldvault-offline-queue';

export interface OfflineMutation {
  id: string;
  type: 'checkout' | 'checkin' | 'create_maintenance' | 'update_asset';
  endpoint: string;
  method: 'POST' | 'PATCH' | 'PUT';
  payload: any;
  createdAt: string;
  retryCount: number;
}

/**
 * Get all queued offline mutations
 */
export function getOfflineQueue(): OfflineMutation[] {
  const raw = storage.getString(OFFLINE_QUEUE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Add a mutation to the offline queue (called when device is offline)
 */
export function addToOfflineQueue(mutation: Omit<OfflineMutation, 'id' | 'createdAt' | 'retryCount'>): void {
  const queue = getOfflineQueue();
  const entry: OfflineMutation = {
    ...mutation,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    retryCount: 0,
  };
  queue.push(entry);
  storage.set(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

/**
 * Remove a mutation from the offline queue after successful sync
 */
function removeFromOfflineQueue(id: string): void {
  const queue = getOfflineQueue().filter((m) => m.id !== id);
  storage.set(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

/**
 * Process all queued offline mutations when device comes back online.
 * Each mutation is replayed against the API in order.
 */
export async function processOfflineQueue(): Promise<{ synced: number; failed: number }> {
  const queue = getOfflineQueue();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  // Dynamic import to avoid circular dependency
  const { api } = await import('./api');
  let synced = 0;
  let failed = 0;

  for (const mutation of queue) {
    try {
      if (mutation.method === 'POST') {
        await api.post(mutation.endpoint, mutation.payload);
      } else if (mutation.method === 'PATCH') {
        await api.patch(mutation.endpoint, mutation.payload);
      } else if (mutation.method === 'PUT') {
        await api.put(mutation.endpoint, mutation.payload);
      }
      removeFromOfflineQueue(mutation.id);
      synced++;
    } catch (error: any) {
      // If it's a 4xx error (client error), remove it — retrying won't help
      if (error.response?.status >= 400 && error.response?.status < 500) {
        removeFromOfflineQueue(mutation.id);
        failed++;
      } else {
        // Network error or 5xx — increment retry count, keep in queue
        mutation.retryCount++;
        if (mutation.retryCount >= 5) {
          removeFromOfflineQueue(mutation.id);
          failed++;
        }
      }
    }
  }

  // Refresh data after sync
  if (synced > 0) {
    queryClient.invalidateQueries();
  }

  return { synced, failed };
}

/**
 * Clear the entire offline queue (for debugging/reset)
 */
export function clearOfflineQueue(): void {
  storage.delete(OFFLINE_QUEUE_KEY);
}

// ─── React Hooks ───────────────────────────────────────────────────

/**
 * Hook that exposes current online/offline status.
 * Returns { isOnline, pendingCount } for UI indicators.
 */
export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Check initial status
    NetInfo.fetch().then((state) => {
      setIsOnline(!!state.isConnected);
    });

    // Listen for changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(!!state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  // Poll pending count periodically
  useEffect(() => {
    const updateCount = () => {
      setPendingCount(getOfflineQueue().length);
    };
    updateCount();
    const interval = setInterval(updateCount, 3000);
    return () => clearInterval(interval);
  }, []);

  const syncNow = useCallback(async () => {
    if (!isOnline) return { synced: 0, failed: 0 };
    const result = await processOfflineQueue();
    setPendingCount(getOfflineQueue().length);
    return result;
  }, [isOnline]);

  return { isOnline, pendingCount, syncNow };
}
