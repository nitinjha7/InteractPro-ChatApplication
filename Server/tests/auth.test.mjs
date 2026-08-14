import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { makeApp, resetDb, cookieOf, prisma } from './helpers.mjs';

const app = makeApp();
const call = (path) => request(app).post('/trpc/' + path);

beforeEach(async () => {
  await resetDb();
});

describe('auth.signup', () => {
  it('creates a user and returns _id without the password', async () => {
    const res = await call('auth.signup').send({ json: { email: 'a@t.com', password: 'pass1234' } });
    expect(res.status).toBe(200);
    const user = res.body.result.data.json.user;
    expect(user._id).toBeTruthy();
    expect(user.password).toBeUndefined();
    expect(user.email).toBe('a@t.com');
  });

  it('sets an auth cookie', async () => {
    const res = await call('auth.signup').send({ json: { email: 'a@t.com', password: 'pass1234' } });
    expect(cookieOf(res)).toContain('token=');
  });

  it('rejects a duplicate email', async () => {
    await call('auth.signup').send({ json: { email: 'a@t.com', password: 'pass1234' } });
    const res = await call('auth.signup').send({ json: { email: 'a@t.com', password: 'pass1234' } });
    expect(res.status).toBe(409);
  });

  it('rejects a short password', async () => {
    const res = await call('auth.signup').send({ json: { email: 'a@t.com', password: 'x' } });
    expect(res.status).toBe(400);
  });

  it('stores the password hashed, not in plain text', async () => {
    await call('auth.signup').send({ json: { email: 'a@t.com', password: 'pass1234' } });
    const row = await prisma.user.findUnique({ where: { email: 'a@t.com' } });
    expect(row.password).not.toBe('pass1234');
    expect(row.password.startsWith('$2')).toBe(true);
  });
});

describe('auth.login', () => {
  beforeEach(async () => {
    await call('auth.signup').send({ json: { email: 'a@t.com', password: 'pass1234' } });
  });

  it('accepts the right password', async () => {
    const res = await call('auth.login').send({ json: { email: 'a@t.com', password: 'pass1234' } });
    expect(res.status).toBe(200);
    expect(res.body.result.data.json.user._id).toBeTruthy();
  });

  it('rejects the wrong password', async () => {
    const res = await call('auth.login').send({ json: { email: 'a@t.com', password: 'nope' } });
    expect(res.status).toBe(401);
  });

  it('rejects an unknown email', async () => {
    const res = await call('auth.login').send({ json: { email: 'ghost@t.com', password: 'pass1234' } });
    expect(res.status).toBe(401);
  });
});

describe('auth.userInfo', () => {
  it('returns the signed-in user', async () => {
    const signup = await call('auth.signup').send({ json: { email: 'a@t.com', password: 'pass1234' } });
    const res = await request(app).get('/trpc/auth.userInfo').set('Cookie', cookieOf(signup));
    expect(res.status).toBe(200);
    expect(res.body.result.data.json.user.email).toBe('a@t.com');
  });

  it('401s without a cookie', async () => {
    const res = await request(app).get('/trpc/auth.userInfo');
    expect(res.status).toBe(401);
  });
});

describe('auth.updateProfile', () => {
  it('sets the names and flips profileSetup', async () => {
    const signup = await call('auth.signup').send({ json: { email: 'a@t.com', password: 'pass1234' } });
    const res = await call('auth.updateProfile')
      .set('Cookie', cookieOf(signup))
      .send({ json: { firstName: 'Alice', lastName: 'Anderson' } });
    expect(res.status).toBe(200);
    const user = res.body.result.data.json.user;
    expect(user.firstName).toBe('Alice');
    expect(user.profileSetup).toBe(true);
  });

  it('401s when not signed in', async () => {
    const res = await call('auth.updateProfile').send({ json: { firstName: 'A', lastName: 'B' } });
    expect(res.status).toBe(401);
  });
});
