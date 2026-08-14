const express = require('express');
const cookieParser = require('cookie-parser');
const { createExpressMiddleware } = require('@trpc/server/adapters/express');
const { appRouter } = require('../trpc/routers');
const { createContext } = require('../trpc/context');
const prisma = require('../config/prisma');

const makeApp = () => {
  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use('/trpc', createExpressMiddleware({ router: appRouter, createContext }));
  return app;
};

const resetDb = async () => {
  await prisma.message.deleteMany();
  await prisma.user.deleteMany();
};

const cookieOf = (res) => {
  const raw = res.headers['set-cookie'] || [];
  return raw.map((c) => c.split(';')[0]).join('; ');
};

module.exports = { makeApp, resetDb, cookieOf, prisma };
