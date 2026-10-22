import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '../../../Server/trpc/routers/index';

export const trpc = createTRPCReact<AppRouter>();

const trpcUrl = import.meta.env.PROD
  ? '/trpc'
  : `${import.meta.env.VITE_APP_SERVER_URL}/trpc`;

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: trpcUrl,
      transformer: superjson,
      fetch: (url, options) => fetch(url, { ...options, credentials: 'include' }),
    }),
  ],
});
