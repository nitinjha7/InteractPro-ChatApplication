import { isAiConfigured, embedOne } from './gemini.mjs';
import { insertEmbedding } from './embeddings.mjs';

export const ingestMessage = async (message) => {
  if (!isAiConfigured()) return;
  if (!message?.content || message.content.trim() === '') return;

  try {
    const values = await embedOne(message.content);
    await insertEmbedding({
      messageId: message.id,
      content: message.content,
      values,
    });
  } catch (err) {
    console.warn('embedding failed for message', message.id, err.message);
  }
};
