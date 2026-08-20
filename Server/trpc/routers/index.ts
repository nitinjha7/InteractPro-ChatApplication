import { router, publicProcedure } from '../trpc';
import { authRouter } from './auth';
import { chatRouter } from './chat';
import { codeSessionRouter } from './codeSession';
import { aiRouter } from './ai';

export const appRouter = router({
  health: publicProcedure.query(() => ({ ok: true })),
  auth: authRouter,
  chat: chatRouter,
  codeSession: codeSessionRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
