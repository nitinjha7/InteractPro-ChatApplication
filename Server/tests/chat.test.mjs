import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { makeApp, resetDb, cookieOf, prisma } from './helpers.mjs';

const app = makeApp();
const post = (path) => request(app).post('/trpc/' + path);
const get = (path) => request(app).get('/trpc/' + path);
const input = (obj) => 'input=' + encodeURIComponent(JSON.stringify({ json: obj }));

const makeUser = async (email, firstName) => {
  const res = await post('auth.signup').send({ json: { email, password: 'pass1234' } });
  const cookie = cookieOf(res);
  await post('auth.updateProfile').set('Cookie', cookie).send({ json: { firstName, lastName: 'Test' } });
  return { cookie, id: res.body.result.data.json.user._id };
};

beforeEach(async () => {
  await resetDb();
});

describe('chat.searchContacts', () => {
  it('finds another user by name, case-insensitively', async () => {
    const alice = await makeUser('a@t.com', 'Alice');
    await makeUser('b@t.com', 'Bob');

    const res = await get('chat.searchContacts?' + input({ searchTerm: 'bob' })).set('Cookie', alice.cookie);
    expect(res.status).toBe(200);
    const contacts = res.body.result.data.json.contacts;
    expect(contacts).toHaveLength(1);
    expect(contacts[0].firstName).toBe('Bob');
    expect(contacts[0]._id).toBeTruthy();
    expect(contacts[0].password).toBeUndefined();
  });

  it('never returns the searcher themselves', async () => {
    const alice = await makeUser('a@t.com', 'Alice');
    const res = await get('chat.searchContacts?' + input({ searchTerm: 'alice' })).set('Cookie', alice.cookie);
    expect(res.body.result.data.json.contacts).toHaveLength(0);
  });

  it('401s without a cookie', async () => {
    const res = await get('chat.searchContacts?' + input({ searchTerm: 'x' }));
    expect(res.status).toBe(401);
  });
});

describe('chat.getMessages', () => {
  it('returns the conversation oldest-first with raw id sender/recipient', async () => {
    const alice = await makeUser('a@t.com', 'Alice');
    const bob = await makeUser('b@t.com', 'Bob');

    await prisma.message.create({
      data: { senderId: alice.id, recipientId: bob.id, messageType: 'text', content: 'first' },
    });
    await prisma.message.create({
      data: { senderId: bob.id, recipientId: alice.id, messageType: 'text', content: 'second' },
    });

    const res = await get('chat.getMessages?' + input({ contactId: bob.id })).set('Cookie', alice.cookie);
    expect(res.status).toBe(200);
    const chat = res.body.result.data.json.chat;
    expect(chat).toHaveLength(2);
    expect(chat[0].content).toBe('first');
    expect(typeof chat[0].sender).toBe('string');
    expect(typeof chat[0].recipient).toBe('string');
    expect(chat[0]._id).toBeTruthy();
  });

  it('does not leak a conversation the caller is not part of', async () => {
    const alice = await makeUser('a@t.com', 'Alice');
    const bob = await makeUser('b@t.com', 'Bob');
    const carol = await makeUser('c@t.com', 'Carol');

    await prisma.message.create({
      data: { senderId: bob.id, recipientId: carol.id, messageType: 'text', content: 'private' },
    });

    const res = await get('chat.getMessages?' + input({ contactId: bob.id })).set('Cookie', alice.cookie);
    expect(res.body.result.data.json.chat).toHaveLength(0);
  });
});

describe('chat.getDmList', () => {
  it('returns one row per conversation, newest first', async () => {
    const alice = await makeUser('a@t.com', 'Alice');
    const bob = await makeUser('b@t.com', 'Bob');
    const carol = await makeUser('c@t.com', 'Carol');

    await prisma.message.create({
      data: {
        senderId: alice.id, recipientId: bob.id, messageType: 'text', content: 'to bob',
        timeStamp: new Date('2026-01-01T00:00:00Z'),
      },
    });
    await prisma.message.create({
      data: {
        senderId: alice.id, recipientId: carol.id, messageType: 'text', content: 'to carol old',
        timeStamp: new Date('2026-01-02T00:00:00Z'),
      },
    });
    await prisma.message.create({
      data: {
        senderId: alice.id, recipientId: carol.id, messageType: 'text', content: 'to carol new',
        timeStamp: new Date('2026-01-03T00:00:00Z'),
      },
    });

    const res = await get('chat.getDmList').set('Cookie', alice.cookie);
    expect(res.status).toBe(200);
    const contacts = res.body.result.data.json.contacts;
    expect(contacts).toHaveLength(2);
    expect(contacts[0].firstName).toBe('Carol');
    expect(contacts[1].firstName).toBe('Bob');
    expect(contacts[0].lastMessageTime).toBeTruthy();
  });

  it('returns an empty list when there are no messages', async () => {
    const alice = await makeUser('a@t.com', 'Alice');
    const res = await get('chat.getDmList').set('Cookie', alice.cookie);
    expect(res.body.result.data.json.contacts).toEqual([]);
  });
});
