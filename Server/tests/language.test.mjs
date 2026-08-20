import { describe, it, expect, beforeEach } from 'vitest';
import { resetDb, prisma } from './helpers.mjs';

beforeEach(async () => {
  await resetDb();
});

describe('code message language', () => {
  it('persists and returns the language of a code message', async () => {
    const alice = await prisma.user.create({ data: { email: 'a@t.com', password: 'x' } });
    const bob = await prisma.user.create({ data: { email: 'b@t.com', password: 'x' } });

    await prisma.message.create({
      data: {
        senderId: alice.id,
        recipientId: bob.id,
        messageType: 'code',
        content: 'print("hi")',
        language: 'python',
      },
    });

    const row = await prisma.message.findFirst({ where: { senderId: alice.id } });
    expect(row.language).toBe('python');
  });

  it('leaves language null for a plain text message', async () => {
    const alice = await prisma.user.create({ data: { email: 'a@t.com', password: 'x' } });
    const bob = await prisma.user.create({ data: { email: 'b@t.com', password: 'x' } });

    await prisma.message.create({
      data: { senderId: alice.id, recipientId: bob.id, messageType: 'text', content: 'hello' },
    });

    const row = await prisma.message.findFirst({ where: { senderId: alice.id } });
    expect(row.language).toBeNull();
  });
});
