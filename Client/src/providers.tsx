import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { trpc, trpcClient } from './lib/trpc';
import { SocketProvider } from './context/SocketContext';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <SocketProvider>
          {children}
          <Toaster position="top-center" expand richColors duration={2000} />
        </SocketProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
