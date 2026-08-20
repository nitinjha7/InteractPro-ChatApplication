import jwt from 'jsonwebtoken';
import type { Request, Response } from 'express';
import type { Context } from './trpc';

const prisma = require('../config/prisma');

export const createContext = ({ req, res }: { req: Request; res: Response }): Context => {
  let userId: string | null = null;

  const token = req.cookies?.token;
  if (token) {
    try {
      userId = (jwt.verify(token, process.env.JWT_KEY as string) as { id: string }).id;
    } catch {
      userId = null;
    }
  }

  return { prisma, userId, res };
};
