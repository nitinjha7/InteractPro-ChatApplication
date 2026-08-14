import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { makeApp } from './helpers.mjs';

describe('trpc bootstrap', () => {
  it('answers the health query', async () => {
    const res = await request(makeApp()).get('/trpc/health');
    expect(res.status).toBe(200);
    expect(res.body.result.data.json).toEqual({ ok: true });
  });
});
