import { router, publicProcedure } from '../trpc';
import { authRouter } from './auth';
import { chatRouter } from './chat';

export const appRouter = router({
  health: publicProcedure.query(() => ({ ok: true })),
  auth: authRouter,
  chat: chatRouter,
});

export type AppRouter = typeof appRouter;
