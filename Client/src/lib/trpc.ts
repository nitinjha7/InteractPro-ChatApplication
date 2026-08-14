import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '../../../Server/trpc/routers/index';

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${import.meta.env.VITE_APP_SERVER_URL}/trpc`,
      transformer: superjson,
      fetch: (url, options) => fetch(url, { ...options, credentials: 'include' }),
    }),
  ],
});
