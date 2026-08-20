import * as Y from 'yjs';
import { YSocketIO } from 'y-socket.io/dist/server';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const prisma = require('../config/prisma');

const DOC_PREFIX = 'session-';

export const docNameToSessionId = (name) =>
  name.startsWith(DOC_PREFIX) ? name.slice(DOC_PREFIX.length) : null;

export const saveSnapshot = async (sessionId, doc) => {
  const content = doc.getText('code').toString();
  const snapshot = Buffer.from(Y.encodeStateAsUpdate(doc));

  try {
    await prisma.codeSession.update({
      where: { id: sessionId },
      data: { content, snapshot },
    });
  } catch {
    // session was deleted while someone still had it open
  }
};

export const loadSnapshot = async (sessionId, doc) => {
  const session = await prisma.codeSession.findUnique({ where: { id: sessionId } });
  if (!session || !session.snapshot) return;
  Y.applyUpdate(doc, new Uint8Array(session.snapshot));
};

export const setupYjs = (io) => {
  const ysocketio = new YSocketIO(io, {});
  ysocketio.initialize();

  ysocketio.on('document-loaded', async (doc) => {
    const sessionId = docNameToSessionId(doc.name);
    if (sessionId) await loadSnapshot(sessionId, doc);
  });

  ysocketio.on('all-document-connections-closed', async (doc) => {
    const sessionId = docNameToSessionId(doc.name);
    if (sessionId) await saveSnapshot(sessionId, doc);
  });

  setInterval(() => {
    for (const doc of ysocketio.documents.values()) {
      const sessionId = docNameToSessionId(doc.name);
      if (sessionId) saveSnapshot(sessionId, doc);
    }
  }, 30000).unref();

  return ysocketio;
};
