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
          },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};
