import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import { createRequire } from 'module';
import { resetDb, cookieOf } from './helpers.js';

const require = createRequire(import.meta.url);
const { createExpressMiddleware } = require('@trpc/server/adapters/express');
const { appRouter } = require('../trpc/routers');
const { createContext } = require('../trpc/context');
const AuthRoute = require('../routes/AuthRoute');
const ContactRoutes = require('../routes/ContactRoutes');
const messageRoutes = require('../routes/messageRoutes');
const profileRoute = require('../routes/profileRoute');

// both apis on one app so the same session can be used against either
const app = express();
app.use(cookieParser());
app.use(express.json());
app.use('/trpc', createExpressMiddleware({ router: appRouter, createContext }));
app.use('/api/auth', AuthRoute);
app.use('/api', profileRoute);
app.use('/api/contact', ContactRoutes);
app.use('/api/message', messageRoutes);

const keys = (obj) => Object.keys(obj).sort();

beforeEach(async () => {
  await resetDb();
});

describe('rest and trpc agree', () => {
  it('userInfo returns the same fields', async () => {
    const signup = await request(app)
      .post('/trpc/auth.signup')
      .send({ json: { email: 'a@t.com', password: 'pass1234' } });
    const cookie = cookieOf(signup);

    const rest = await request(app).get('/api/auth/userInfo').set('Cookie', cookie);
    const trpc = await request(app).get('/trpc/auth.userInfo').set('Cookie', cookie);

    expect(rest.status).toBe(200);
    expect(trpc.status).toBe(200);
    expect(keys(trpc.body.result.data.json.user)).toEqual(keys(rest.body.user));
  });

  it('a session created via trpc is accepted by rest', async () => {
    const signup = await request(app)
      .post('/trpc/auth.signup')
      .send({ json: { email: 'a@t.com', password: 'pass1234' } });

    const rest = await request(app).get('/api/auth/userInfo').set('Cookie', cookieOf(signup));
    expect(rest.status).toBe(200);
    expect(rest.body.user.email).toBe('a@t.com');
  });

  it('a session created via rest is accepted by trpc', async () => {
    const signup = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'a@t.com', password: 'pass1234' });

    const trpc = await request(app).get('/trpc/auth.userInfo').set('Cookie', cookieOf(signup));
    expect(trpc.status).toBe(200);
    expect(trpc.body.result.data.json.user.email).toBe('a@t.com');
  });

  it('search returns the same contact fields', async () => {
    const alice = await request(app)
      .post('/trpc/auth.signup')
      .send({ json: { email: 'a@t.com', password: 'pass1234' } });
    const cookie = cookieOf(alice);

    const bob = await request(app)
      .post('/trpc/auth.signup')
      .send({ json: { email: 'b@t.com', password: 'pass1234' } });
    await request(app)
      .post('/trpc/auth.updateProfile')
      .set('Cookie', cookieOf(bob))
      .send({ json: { firstName: 'Bob', lastName: 'Test' } });

    const rest = await request(app)
      .post('/api/contact/search')
      .set('Cookie', cookie)
      .send({ searchTerm: 'bob' });

    const q = 'input=' + encodeURIComponent(JSON.stringify({ json: { searchTerm: 'bob' } }));
    const trpc = await request(app).get('/trpc/chat.searchContacts?' + q).set('Cookie', cookie);

    expect(keys(trpc.body.result.data.json.contacts[0])).toEqual(keys(rest.body.contacts[0]));
  });
});
