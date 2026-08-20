import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resetDb, prisma } from './helpers.mjs';
import { ingestMessage } from '../lib/ai/ingest.mjs';

const original = process.env.GEMINI_API_KEY;

beforeEach(async () => {
  await resetDb();
});

afterEach(() => {
  if (original === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = original;
});

describe('ingestMessage', () => {
  it('does nothing and does not throw when there is no api key', async () => {
    delete process.env.GEMINI_API_KEY;
    const user = await prisma.user.create({ data: { email: 'a@t.com', password: 'x' } });
    const msg = await prisma.message.create({
      data: { senderId: user.id, messageType: 'text', content: 'hello' },
    });

    await expect(ingestMessage(msg)).resolves.toBeUndefined();

    const rows = await prisma.$queryRaw`SELECT count(*)::int AS n FROM embeddings`;
    expect(rows[0].n).toBe(0);
  });

  it('skips messages with no text content', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    const user = await prisma.user.create({ data: { email: 'a@t.com', password: 'x' } });
    const msg = await prisma.message.create({
      data: { senderId: user.id, messageType: 'file', content: null, fileUrl: 'http://x/y.png' },
    });

    await expect(ingestMessage(msg)).resolves.toBeUndefined();

    const rows = await prisma.$queryRaw`SELECT count(*)::int AS n FROM embeddings`;
    expect(rows[0].n).toBe(0);
  });

  it('swallows api failures instead of rejecting', async () => {
    process.env.GEMINI_API_KEY = 'definitely-not-a-valid-key';
    const user = await prisma.user.create({ data: { email: 'a@t.com', password: 'x' } });
    const msg = await prisma.message.create({
      data: { senderId: user.id, messageType: 'text', content: 'hello' },
    });

    await expect(ingestMessage(msg)).resolves.toBeUndefined();
  });
});
