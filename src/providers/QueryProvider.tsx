import type {ReactNode} from 'react';
import {useState} from 'react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {QUERY_GC_TIME_MS, QUERY_STALE_TIME_MS} from '@/constants';

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

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};
