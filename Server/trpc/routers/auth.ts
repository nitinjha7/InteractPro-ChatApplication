import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { TRPCError } from '@trpc/server';
import type { Response } from 'express';
import { router, publicProcedure, protectedProcedure } from '../trpc';

const { toUser } = require('../../lib/serialize');

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
} as const;

const setAuthCookie = (res: Response, user: { id: string; email: string }) => {
  const token = jwt.sign({ email: user.email, id: user.id }, process.env.JWT_KEY as string, {
    expiresIn: '3d',
  });
  res.cookie('token', token, cookieOptions);
};

const credentials = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authRouter = router({
  signup: publicProcedure.input(credentials).mutation(async ({ ctx, input }) => {
    const existing = await ctx.prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new TRPCError({ code: 'CONFLICT', message: 'Email already registered' });
    }

    const password = await bcrypt.hash(input.password, await bcrypt.genSalt());
    const user = await ctx.prisma.user.create({ data: { email: input.email, password } });

    setAuthCookie(ctx.res, user);
    return { user: toUser(user) };
  }),

  login: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({ where: { email: input.email } });
      if (!user || !(await bcrypt.compare(input.password, user.password))) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
      }

      setAuthCookie(ctx.res, user);
      return { user: toUser(user) };
    }),

  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.res.clearCookie('token', cookieOptions);
    return { message: 'Logged Out successfully' };
  }),

  userInfo: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({ where: { id: ctx.userId } });
    if (!user) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
    }
    return { user: toUser(user) };
  }),

  updateProfile: protectedProcedure
    .input(z.object({ firstName: z.string().min(1), lastName: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.update({
        where: { id: ctx.userId },
        data: { ...input, profileSetup: true },
      });
      return { user: toUser(user) };
    }),
});
