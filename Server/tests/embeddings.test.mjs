import { describe, it, expect, beforeEach } from 'vitest';
import { resetDb, prisma } from './helpers.mjs';
import { toVectorLiteral, insertEmbedding, searchEmbeddings } from '../lib/ai/embeddings.mjs';

const vecOf = (fill) => Array.from({ length: 768 }, () => fill);

const seedUsers = async () => {
  const alice = await prisma.user.create({ data: { email: 'a@t.com', password: 'x' } });
  const bob = await prisma.user.create({ data: { email: 'b@t.com', password: 'x' } });
  const carol = await prisma.user.create({ data: { email: 'c@t.com', password: 'x' } });
  return { alice, bob, carol };
};

beforeEach(async () => {
  await resetDb();
});

describe('toVectorLiteral', () => {
  it('formats numbers as a bracketed comma list', () => {
    expect(toVectorLiteral([1, 2.5, -3])).toBe('[1,2.5,-3]');
  });
});

describe('insertEmbedding', () => {
  it('stores a row linked to the message', async () => {
    const { alice, bob } = await seedUsers();
    const msg = await prisma.message.create({
      data: { senderId: alice.id, recipientId: bob.id, messageType: 'text', content: 'hello' },
    });

    await insertEmbedding({ messageId: msg.id, content: 'hello', values: vecOf(0.5) });

    const rows = await prisma.$queryRaw`SELECT message_id, content FROM embeddings`;
    expect(rows).toHaveLength(1);
    expect(rows[0].message_id).toBe(msg.id);
  });

  it('replaces the existing row when the same message is embedded twice', async () => {
    const { alice, bob } = await seedUsers();
    const msg = await prisma.message.create({
      data: { senderId: alice.id, recipientId: bob.id, messageType: 'text', content: 'first' },
    });

    await insertEmbedding({ messageId: msg.id, content: 'first', values: vecOf(0.5) });
    await insertEmbedding({ messageId: msg.id, content: 'second', values: vecOf(0.6) });

    const rows = await prisma.$queryRaw`SELECT content FROM embeddings`;
    expect(rows).toHaveLength(1);
    expect(rows[0].content).toBe('second');
  });
});

describe('searchEmbeddings', () => {
  it('returns the closest match first', async () => {
    const { alice, bob } = await seedUsers();
    const near = await prisma.message.create({
      data: { senderId: alice.id, recipientId: bob.id, messageType: 'text', content: 'near' },
    });
    const far = await prisma.message.create({
      data: { senderId: alice.id, recipientId: bob.id, messageType: 'text', content: 'far' },
    });

    await insertEmbedding({ messageId: near.id, content: 'near', values: vecOf(0.5) });
    await insertEmbedding({ messageId: far.id, content: 'far', values: vecOf(-0.5) });

    const results = await searchEmbeddings({ values: vecOf(0.5), userId: alice.id });

    expect(results[0].content).toBe('near');
    expect(results[0].score).toBeGreaterThan(results[1].score);
  });

  it('never returns messages from a conversation the asker is not part of', async () => {
    const { alice, bob, carol } = await seedUsers();
    const theirs = await prisma.message.create({
      data: { senderId: bob.id, recipientId: carol.id, messageType: 'text', content: 'private' },
    });
    await insertEmbedding({ messageId: theirs.id, content: 'private', values: vecOf(0.5) });

    const results = await searchEmbeddings({ values: vecOf(0.5), userId: alice.id });

    expect(results).toHaveLength(0);
  });

  it('respects the limit', async () => {
    const { alice, bob } = await seedUsers();
    for (let i = 0; i < 5; i++) {
      const m = await prisma.message.create({
        data: { senderId: alice.id, recipientId: bob.id, messageType: 'text', content: `m${i}` },
      });
      await insertEmbedding({ messageId: m.id, content: `m${i}`, values: vecOf(0.1 * i) });
    }

    const results = await searchEmbeddings({ values: vecOf(0.2), userId: alice.id, limit: 2 });

    expect(results).toHaveLength(2);
  });
});
