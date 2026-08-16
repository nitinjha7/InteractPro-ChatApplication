import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc';

const COLORS = ['#f97316', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#eab308'];

const pickColor = () => COLORS[Math.floor(Math.random() * COLORS.length)] as string;

export const codeSessionRouter = router({
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(100), language: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const session = await ctx.prisma.codeSession.create({
        data: {
          name: input.name,
          language: input.language,
          ownerId: ctx.userId,
          participants: { create: { userId: ctx.userId, color: pickColor() } },
        },
      });
      return { session };
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const sessions = await ctx.prisma.codeSession.findMany({
      where: { participants: { some: { userId: ctx.userId } } },
      include: { participants: true },
      orderBy: { updatedAt: 'desc' },
    });
    return { sessions };
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const session = await ctx.prisma.codeSession.findUnique({
        where: { id: input.id },
        include: {
          participants: { include: { user: { select: { id: true, firstName: true, email: true } } } },
          owner: { select: { id: true, firstName: true, email: true } },
        },
      });

      if (!session) throw new TRPCError({ code: 'NOT_FOUND' });

      const isParticipant = session.participants.some((p) => p.userId === ctx.userId);
      if (!isParticipant) throw new TRPCError({ code: 'FORBIDDEN' });

      return { session };
    }),

  join: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const session = await ctx.prisma.codeSession.findUnique({ where: { id: input.id } });
      if (!session) throw new TRPCError({ code: 'NOT_FOUND' });

      const participant = await ctx.prisma.sessionParticipant.upsert({
        where: { sessionId_userId: { sessionId: input.id, userId: ctx.userId } },
        update: {},
        create: { sessionId: input.id, userId: ctx.userId, color: pickColor() },
      });

      return { participant };
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const session = await ctx.prisma.codeSession.findUnique({ where: { id: input.id } });
      if (!session) throw new TRPCError({ code: 'NOT_FOUND' });
      if (session.ownerId !== ctx.userId) throw new TRPCError({ code: 'FORBIDDEN' });

      await ctx.prisma.codeSession.delete({ where: { id: input.id } });
      return { success: true as const };
    }),
});
