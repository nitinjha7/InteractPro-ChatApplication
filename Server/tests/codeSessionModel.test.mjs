import { describe, it, expect, beforeEach } from 'vitest';
import { resetDb, prisma } from './helpers.mjs';

beforeEach(async () => {
  await resetDb();
});

describe('code session models', () => {
  it('creates a session owned by a user', async () => {
    const owner = await prisma.user.create({ data: { email: 'a@t.com', password: 'x' } });

    const session = await prisma.codeSession.create({
      data: { name: 'scratch', language: 'javascript', content: '', ownerId: owner.id },
    });

    expect(session.id).toBeTruthy();
    expect(session.isActive).toBe(true);
    expect(session.snapshot).toBeNull();
  });

  it('stores participants and enforces one row per user per session', async () => {
    const owner = await prisma.user.create({ data: { email: 'a@t.com', password: 'x' } });
    const session = await prisma.codeSession.create({
      data: { name: 'scratch', language: 'javascript', content: '', ownerId: owner.id },
    });

    await prisma.sessionParticipant.create({
      data: { sessionId: session.id, userId: owner.id, color: '#ff0000' },
    });

    await expect(
      prisma.sessionParticipant.create({
        data: { sessionId: session.id, userId: owner.id, color: '#00ff00' },
      })
    ).rejects.toThrow();
  });

  it('exposes participants through the relation', async () => {
    const owner = await prisma.user.create({ data: { email: 'a@t.com', password: 'x' } });
    const session = await prisma.codeSession.create({
      data: { name: 'scratch', language: 'javascript', content: '', ownerId: owner.id },
    });
    await prisma.sessionParticipant.create({
      data: { sessionId: session.id, userId: owner.id, color: '#ff0000' },
    });

    const loaded = await prisma.codeSession.findUnique({
      where: { id: session.id },
      include: { participants: true },
    });

    expect(loaded.participants).toHaveLength(1);
    expect(loaded.participants[0].userId).toBe(owner.id);
  });

  it('deletes participants when the session is deleted', async () => {
    const owner = await prisma.user.create({ data: { email: 'a@t.com', password: 'x' } });
    const session = await prisma.codeSession.create({
      data: { name: 'scratch', language: 'javascript', content: '', ownerId: owner.id },
    });
    await prisma.sessionParticipant.create({
      data: { sessionId: session.id, userId: owner.id, color: '#ff0000' },
    });

    await prisma.codeSession.delete({ where: { id: session.id } });

    expect(await prisma.sessionParticipant.count()).toBe(0);
  });
});
