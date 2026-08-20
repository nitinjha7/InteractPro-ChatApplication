import { describe, it, expect, beforeEach } from 'vitest';
import { resetDb, prisma } from './helpers.mjs';

const vec = (fill) => `[${Array.from({ length: 768 }, () => fill).join(',')}]`;

beforeEach(async () => {
  await resetDb();
});

describe('pgvector', () => {
  it('has the vector extension installed', async () => {
    const rows = await prisma.$queryRaw`
      SELECT installed_version FROM pg_available_extensions WHERE name = 'vector'
    `;
    expect(rows[0].installed_version).not.toBeNull();
  });

  it('stores and reads back a 768-dimension vector', async () => {
    const user = await prisma.user.create({ data: { email: 'a@t.com', password: 'x' } });
    const msg = await prisma.message.create({
      data: { senderId: user.id, messageType: 'text', content: 'hello' },
    });

    await prisma.$executeRaw`
      INSERT INTO embeddings (id, message_id, content, embedding)
      VALUES ('e1', ${msg.id}, 'hello', ${vec(0.5)}::vector)
    `;

    const rows = await prisma.$queryRaw`
      SELECT vector_dims(embedding) AS dims FROM embeddings WHERE id = 'e1'
    `;
    expect(Number(rows[0].dims)).toBe(768);
  });

  it('orders results by cosine distance, closest first', async () => {
    const user = await prisma.user.create({ data: { email: 'a@t.com', password: 'x' } });
    const near = await prisma.message.create({
      data: { senderId: user.id, messageType: 'text', content: 'near' },
    });
    const far = await prisma.message.create({
      data: { senderId: user.id, messageType: 'text', content: 'far' },
    });

    await prisma.$executeRaw`
      INSERT INTO embeddings (id, message_id, content, embedding)
      VALUES ('e-near', ${near.id}, 'near', ${vec(0.5)}::vector)
    `;
    await prisma.$executeRaw`
      INSERT INTO embeddings (id, message_id, content, embedding)
      VALUES ('e-far', ${far.id}, 'far', ${vec(-0.5)}::vector)
    `;

    const rows = await prisma.$queryRaw`
      SELECT content FROM embeddings ORDER BY embedding <=> ${vec(0.5)}::vector LIMIT 2
    `;
    expect(rows[0].content).toBe('near');
    expect(rows[1].content).toBe('far');
  });

  it('deletes the embedding when its message is deleted', async () => {
    const user = await prisma.user.create({ data: { email: 'a@t.com', password: 'x' } });
    const msg = await prisma.message.create({
      data: { senderId: user.id, messageType: 'text', content: 'bye' },
    });
    await prisma.$executeRaw`
      INSERT INTO embeddings (id, message_id, content, embedding)
      VALUES ('e-del', ${msg.id}, 'bye', ${vec(0.1)}::vector)
    `;

    await prisma.message.delete({ where: { id: msg.id } });

    const rows = await prisma.$queryRaw`SELECT count(*)::int AS n FROM embeddings`;
    expect(rows[0].n).toBe(0);
  });
});
