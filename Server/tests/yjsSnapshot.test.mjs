import { describe, it, expect, beforeEach } from 'vitest';
import * as Y from 'yjs';
import { resetDb, prisma } from './helpers.mjs';
import { docNameToSessionId, saveSnapshot, loadSnapshot } from '../yjs/index.mjs';

beforeEach(async () => {
  await resetDb();
});

describe('docNameToSessionId', () => {
  it('extracts the id from a session doc name', () => {
    expect(docNameToSessionId('session-abc123')).toBe('abc123');
  });

  it('returns null for an unrelated doc name', () => {
    expect(docNameToSessionId('something-else')).toBeNull();
  });
});

describe('snapshots', () => {
  const makeSession = async () => {
    const owner = await prisma.user.create({ data: { email: 'a@t.com', password: 'x' } });
    return prisma.codeSession.create({
      data: { name: 'scratch', language: 'javascript', ownerId: owner.id },
    });
  };

  it('saves the document text and binary state', async () => {
    const session = await makeSession();
    const doc = new Y.Doc();
    doc.getText('code').insert(0, 'const x = 1');

    await saveSnapshot(session.id, doc);

    const row = await prisma.codeSession.findUnique({ where: { id: session.id } });
    expect(row.content).toBe('const x = 1');
    expect(row.snapshot).not.toBeNull();
  });

  it('restores a saved document into a fresh doc', async () => {
    const session = await makeSession();
    const original = new Y.Doc();
    original.getText('code').insert(0, 'hello world');
    await saveSnapshot(session.id, original);

    const restored = new Y.Doc();
    await loadSnapshot(session.id, restored);

    expect(restored.getText('code').toString()).toBe('hello world');
  });

  it('leaves the doc empty when there is no snapshot yet', async () => {
    const session = await makeSession();
    const doc = new Y.Doc();

    await loadSnapshot(session.id, doc);

    expect(doc.getText('code').toString()).toBe('');
  });

  it('does not throw when the session no longer exists', async () => {
    const doc = new Y.Doc();
    doc.getText('code').insert(0, 'orphan');
    await expect(saveSnapshot('deleted-id', doc)).resolves.toBeUndefined();
  });
});
