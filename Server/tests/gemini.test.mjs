import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { isAiConfigured, embedOne, resetClientForTests } from '../lib/ai/gemini.mjs';

const original = process.env.GEMINI_API_KEY;

beforeEach(() => {
  resetClientForTests();
});

afterEach(() => {
  if (original === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = original;
  resetClientForTests();
});

describe('gemini configuration', () => {
  it('reports not configured when the key is missing', () => {
    delete process.env.GEMINI_API_KEY;
    expect(isAiConfigured()).toBe(false);
  });

  it('reports configured when the key is present', () => {
    process.env.GEMINI_API_KEY = 'test-key';
    expect(isAiConfigured()).toBe(true);
  });

  it('importing the module without a key does not throw', async () => {
    delete process.env.GEMINI_API_KEY;
    const mod = await import('../lib/ai/gemini.mjs');
    expect(typeof mod.embedOne).toBe('function');
  });

  it('rejects with a clear message when embedding without a key', async () => {
    delete process.env.GEMINI_API_KEY;
    await expect(embedOne('hello')).rejects.toThrow(/GEMINI_API_KEY/);
  });
});
