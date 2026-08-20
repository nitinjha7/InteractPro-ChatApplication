import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { makeApp, resetDb, cookieOf, prisma } from './helpers.mjs';

const app = makeApp();
const post = (path) => request(app).post('/trpc/' + path);
const get = (path) => request(app).get('/trpc/' + path);
const input = (obj) => 'input=' + encodeURIComponent(JSON.stringify({ json: obj }));

const makeUser = async (email) => {
  const res = await post('auth.signup').send({ json: { email, password: 'pass1234' } });
  return { cookie: cookieOf(res), id: res.body.result.data.json.user.id };
};

beforeEach(async () => {
  await resetDb();
});

describe('codeSession.create', () => {
  it('creates a session and adds the owner as a participant', async () => {
    const alice = await makeUser('a@t.com');

    const res = await post('codeSession.create')
      .set('Cookie', alice.cookie)
      .send({ json: { name: 'scratch', language: 'javascript' } });

    expect(res.status).toBe(200);
    const session = res.body.result.data.json.session;
    expect(session.name).toBe('scratch');
    expect(session.ownerId).toBe(alice.id);

    const participants = await prisma.sessionParticipant.findMany({
      where: { sessionId: session.id },
    });
    expect(participants).toHaveLength(1);
    expect(participants[0].userId).toBe(alice.id);
  });

  it('401s without a cookie', async () => {
    const res = await post('codeSession.create').send({ json: { name: 'x', language: 'javascript' } });
    expect(res.status).toBe(401);
  });

  it('rejects an empty name', async () => {
    const alice = await makeUser('a@t.com');
    const res = await post('codeSession.create')
      .set('Cookie', alice.cookie)
      .send({ json: { name: '', language: 'javascript' } });
    expect(res.status).toBe(400);
  });
});

describe('codeSession.list', () => {
  it('returns only sessions the caller participates in', async () => {
    const alice = await makeUser('a@t.com');
    const bob = await makeUser('b@t.com');

    await post('codeSession.create')
      .set('Cookie', alice.cookie)
      .send({ json: { name: 'alice-session', language: 'javascript' } });
    await post('codeSession.create')
      .set('Cookie', bob.cookie)
      .send({ json: { name: 'bob-session', language: 'python' } });

    const res = await get('codeSession.list').set('Cookie', alice.cookie);
    const sessions = res.body.result.data.json.sessions;

    expect(sessions).toHaveLength(1);
    expect(sessions[0].name).toBe('alice-session');
  });
});

describe('codeSession.join', () => {
  it('lets a second user join and then see the session in their list', async () => {
    const alice = await makeUser('a@t.com');
    const bob = await makeUser('b@t.com');

    const created = await post('codeSession.create')
      .set('Cookie', alice.cookie)
      .send({ json: { name: 'shared', language: 'javascript' } });
    const sessionId = created.body.result.data.json.session.id;

    const joined = await post('codeSession.join')
      .set('Cookie', bob.cookie)
      .send({ json: { id: sessionId } });
    expect(joined.status).toBe(200);

    const list = await get('codeSession.list').set('Cookie', bob.cookie);
    expect(list.body.result.data.json.sessions).toHaveLength(1);
  });

  it('is idempotent when the same user joins twice', async () => {
    const alice = await makeUser('a@t.com');
    const bob = await makeUser('b@t.com');

    const created = await post('codeSession.create')
      .set('Cookie', alice.cookie)
      .send({ json: { name: 'shared', language: 'javascript' } });
    const sessionId = created.body.result.data.json.session.id;

    await post('codeSession.join').set('Cookie', bob.cookie).send({ json: { id: sessionId } });
    const second = await post('codeSession.join')
      .set('Cookie', bob.cookie)
      .send({ json: { id: sessionId } });

    expect(second.status).toBe(200);
    const participants = await prisma.sessionParticipant.findMany({ where: { sessionId } });
    expect(participants).toHaveLength(2);
  });
});

describe('codeSession.getById', () => {
  it('returns the session with its participants populated', async () => {
    const alice = await makeUser('a@t.com');
    const created = await post('codeSession.create')
      .set('Cookie', alice.cookie)
      .send({ json: { name: 'scratch', language: 'javascript' } });
    const sessionId = created.body.result.data.json.session.id;

    const res = await get('codeSession.getById?' + input({ id: sessionId })).set('Cookie', alice.cookie);
    const session = res.body.result.data.json.session;

    expect(session.name).toBe('scratch');
    expect(Array.isArray(session.participants)).toBe(true);
    expect(session.participants).toHaveLength(1);
  });

  it('403s for a user who is not a participant', async () => {
    const alice = await makeUser('a@t.com');
    const bob = await makeUser('b@t.com');

    const created = await post('codeSession.create')
      .set('Cookie', alice.cookie)
      .send({ json: { name: 'private', language: 'javascript' } });
    const sessionId = created.body.result.data.json.session.id;

    const res = await get('codeSession.getById?' + input({ id: sessionId })).set('Cookie', bob.cookie);
    expect(res.status).toBe(403);
  });

  it('404s for a session that does not exist', async () => {
    const alice = await makeUser('a@t.com');
    const res = await get('codeSession.getById?' + input({ id: 'nope' })).set('Cookie', alice.cookie);
    expect(res.status).toBe(404);
  });
});

describe('codeSession.remove', () => {
  it('lets the owner delete', async () => {
    const alice = await makeUser('a@t.com');
    const created = await post('codeSession.create')
      .set('Cookie', alice.cookie)
      .send({ json: { name: 'scratch', language: 'javascript' } });
    const sessionId = created.body.result.data.json.session.id;

    const res = await post('codeSession.remove')
      .set('Cookie', alice.cookie)
      .send({ json: { id: sessionId } });

    expect(res.status).toBe(200);
    expect(await prisma.codeSession.count()).toBe(0);
  });

  it('403s when a non-owner participant tries to delete', async () => {
    const alice = await makeUser('a@t.com');
    const bob = await makeUser('b@t.com');

    const created = await post('codeSession.create')
      .set('Cookie', alice.cookie)
      .send({ json: { name: 'scratch', language: 'javascript' } });
    const sessionId = created.body.result.data.json.session.id;
    await post('codeSession.join').set('Cookie', bob.cookie).send({ json: { id: sessionId } });

    const res = await post('codeSession.remove')
      .set('Cookie', bob.cookie)
      .send({ json: { id: sessionId } });

    expect(res.status).toBe(403);
    expect(await prisma.codeSession.count()).toBe(1);
  });
});
