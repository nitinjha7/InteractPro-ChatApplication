import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { makeApp, resetDb, cookieOf } from './helpers.mjs';

const app = makeApp();
const post = (path) => request(app).post('/trpc/' + path);
const get = (path) => request(app).get('/trpc/' + path);
const input = (obj) => 'input=' + encodeURIComponent(JSON.stringify({ json: obj }));

const original = process.env.GEMINI_API_KEY;

const makeUser = async (email) => {
  const res = await post('auth.signup').send({ json: { email, password: 'pass1234' } });
  return { cookie: cookieOf(res), id: res.body.result.data.json.user.id };
};

beforeEach(async () => {
  await resetDb();
});

afterEach(() => {
  if (original === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = original;
});

describe('ai.status', () => {
  it('reports configured false when there is no key', async () => {
    delete process.env.GEMINI_API_KEY;
    const alice = await makeUser('a@t.com');
    const res = await get('ai.status').set('Cookie', alice.cookie);
    expect(res.status).toBe(200);
    expect(res.body.result.data.json.configured).toBe(false);
  });

  it('401s without a cookie', async () => {
    const res = await get('ai.status');
    expect(res.status).toBe(401);
  });
});

describe('ai.semanticSearch', () => {
  it('401s without a cookie', async () => {
    const res = await get('ai.semanticSearch?' + input({ query: 'anything' }));
    expect(res.status).toBe(401);
  });

  it('rejects an empty query', async () => {
    const alice = await makeUser('a@t.com');
    const res = await get('ai.semanticSearch?' + input({ query: '' })).set('Cookie', alice.cookie);
    expect(res.status).toBe(400);
  });

  it('returns a clear error when ai is not configured', async () => {
    delete process.env.GEMINI_API_KEY;
    const alice = await makeUser('a@t.com');
    const res = await get('ai.semanticSearch?' + input({ query: 'hello' })).set('Cookie', alice.cookie);
    expect(res.status).toBe(412);
  });
});

describe('ai.ragQuery', () => {
  it('401s without a cookie', async () => {
    const res = await post('ai.ragQuery').send({ json: { query: 'anything' } });
    expect(res.status).toBe(401);
  });

  it('returns a clear error when ai is not configured', async () => {
    delete process.env.GEMINI_API_KEY;
    const alice = await makeUser('a@t.com');
    const res = await post('ai.ragQuery')
      .set('Cookie', alice.cookie)
      .send({ json: { query: 'how does auth work' } });
    expect(res.status).toBe(412);
  });
});
