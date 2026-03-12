import { MMKV } from 'react-native-mmkv';
import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';

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
      setOnline(!!state.isConnected);
    });
  });
}
