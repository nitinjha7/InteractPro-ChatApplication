import express from 'express';
import cookieParser from 'cookie-parser';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { createRequire } from 'module';
import { appRouter } from '../trpc/routers/index.ts';
import { createContext } from '../trpc/context.ts';

const require = createRequire(import.meta.url);
const prisma = require('../config/prisma');

export const makeApp = () => {
  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use('/trpc', createExpressMiddleware({ router: appRouter, createContext }));
  return app;
};

export const resetDb = async () => {
  await prisma.sessionParticipant.deleteMany();
  await prisma.codeSession.deleteMany();
  await prisma.message.deleteMany();
  await prisma.user.deleteMany();
};

export const cookieOf = (res) => {
  const raw = res.headers['set-cookie'] || [];
  return raw.map((c) => c.split(';')[0]).join('; ');
};

export { prisma };
