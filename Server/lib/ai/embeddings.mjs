import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const prisma = require('../../config/prisma');

export const toVectorLiteral = (values) => `[${values.join(',')}]`;

export const insertEmbedding = async ({ messageId, content, values }) => {
  const literal = toVectorLiteral(values);
  await prisma.$executeRaw`
    INSERT INTO embeddings (id, message_id, content, embedding)
    VALUES (gen_random_uuid()::text, ${messageId}, ${content}, ${literal}::vector)
    ON CONFLICT (message_id)
    DO UPDATE SET content = EXCLUDED.content, embedding = EXCLUDED.embedding
  `;
};

export const searchEmbeddings = async ({ values, limit = 8, userId }) => {
  const literal = toVectorLiteral(values);
  const rows = await prisma.$queryRaw`
    SELECT e.message_id, e.content, 1 - (e.embedding <=> ${literal}::vector) AS score
    FROM embeddings e
    JOIN messages m ON m.id = e.message_id
    WHERE m.sender_id = ${userId} OR m.recipient_id = ${userId}
    ORDER BY e.embedding <=> ${literal}::vector
    LIMIT ${limit}
  `;
  return rows.map((r) => ({
    messageId: r.message_id,
    content: r.content,
    score: Number(r.score),
  }));
};
