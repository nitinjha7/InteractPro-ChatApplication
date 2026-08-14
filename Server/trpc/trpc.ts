import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import type { Response } from 'express';
import type { PrismaClient } from '@prisma/client';

export interface Context {
  prisma: PrismaClient;
  userId: string | null;
  res: Response;
}

const t = initTRPC.context<Context>().create({ transformer: superjson });

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});
