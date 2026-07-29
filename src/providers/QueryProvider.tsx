import type {ReactNode} from 'react';
import {useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {QueryClient} from '@tanstack/react-query';
import {createAsyncStoragePersister} from '@tanstack/query-async-storage-persister';
import {PersistQueryClientProvider} from '@tanstack/react-query-persist-client';
import {
  QUERY_GC_TIME_MS,
  QUERY_PERSIST_MAX_AGE_MS,
  QUERY_STALE_TIME_MS,
  STORAGE_KEYS,
} from '@/constants';

export const QueryProvider = ({children}: {children: ReactNode}) => {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: QUERY_STALE_TIME_MS,
            gcTime: QUERY_GC_TIME_MS,
            retry: 2,
            refetchOnWindowFocus: false,
            // Recover automatically when the device comes back online.
            refetchOnReconnect: true,
          },
          mutations: {
            // Don't silently replay writes (lesson completion, reviews) — a
            // failed mutation surfaces so the caller can decide.
            retry: 0,
          },
        },
      }),
  );

  // Persist the query cache to AsyncStorage so previously-loaded courses,
  // lessons and profile hydrate instantly — and stay readable offline.
  const [persister] = useState(() =>
    createAsyncStoragePersister({storage: AsyncStorage, key: STORAGE_KEYS.queryCache}),
  );

  return (
    <PersistQueryClientProvider
      client={client}
      persistOptions={{
        persister,
        maxAge: QUERY_PERSIST_MAX_AGE_MS,
        // Bump when the cached shape changes so stale entries are discarded.
        buster: 'v1',
      }}>
      {children}
    </PersistQueryClientProvider>
  );
};
