import { GoogleGenAI } from '@google/genai';

const EMBED_MODEL = 'gemini-embedding-001';
const EMBED_DIMENSIONS = 768;
const CHAT_MODEL = 'gemini-2.5-flash';

let client = null;

export const isAiConfigured = () => Boolean(process.env.GEMINI_API_KEY);

const getClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set');
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
};

export const resetClientForTests = () => {
  client = null;
};

export const embedMany = async (texts) => {
  if (texts.length === 0) return [];
  const res = await getClient().models.embedContent({
    model: EMBED_MODEL,
    contents: texts,
    config: { outputDimensionality: EMBED_DIMENSIONS },
  });
  return (res.embeddings ?? []).map((e) => e.values ?? []);
};

export const embedOne = async (text) => {
  const [vector] = await embedMany([text]);
  if (!vector) throw new Error('embedding failed');
  return vector;
};

export const generateAnswer = async (prompt) => {
  const res = await getClient().models.generateContent({
    model: CHAT_MODEL,
    contents: prompt,
  });
  return res.text ?? '';
};
