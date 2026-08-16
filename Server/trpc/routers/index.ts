import { router, publicProcedure } from '../trpc';
import { authRouter } from './auth';
import { chatRouter } from './chat';
import { codeSessionRouter } from './codeSession';

export const appRouter = router({
  health: publicProcedure.query(() => ({ ok: true })),
  auth: authRouter,
  chat: chatRouter,
  codeSession: codeSessionRouter,
});

export type AppRouter = typeof appRouter;
