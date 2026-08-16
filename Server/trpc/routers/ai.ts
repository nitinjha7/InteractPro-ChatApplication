import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc';
import { isAiConfigured, embedOne, generateAnswer } from '../../lib/ai/gemini.mjs';
import { searchEmbeddings } from '../../lib/ai/embeddings.mjs';

const requireAi = () => {
  if (!isAiConfigured()) {
    throw new TRPCError({
      code: 'PRECONDITION_FAILED',
      message: 'AI is not configured on this server',
    });
  }
};

const buildPrompt = (question: string, sources: Array<{ content: string }>) => {
  const context = sources.map((s, i) => `[${i + 1}] ${s.content}`).join('\n');
  return [
    'Answer the question using only the numbered chat messages below.',
    'Cite the messages you used with their bracket numbers, like [1] or [2].',
    'If the messages do not contain the answer, say you could not find it.',
    '',
    'Messages:',
    context,
    '',
    `Question: ${question}`,
  ].join('\n');
};

export const aiRouter = router({
  status: protectedProcedure.query(() => ({ configured: isAiConfigured() })),

  semanticSearch: protectedProcedure
    .input(z.object({ query: z.string().min(1).max(500), limit: z.number().int().min(1).max(20).optional() }))
    .query(async ({ ctx, input }) => {
      requireAi();
      const values = await embedOne(input.query);
      const results = await searchEmbeddings({
        values,
        limit: input.limit ?? 8,
        userId: ctx.userId,
      });
      return { results };
    }),

  ragQuery: protectedProcedure
    .input(z.object({ query: z.string().min(1).max(500) }))
    .mutation(async ({ ctx, input }) => {
      requireAi();
      const values = await embedOne(input.query);
      const sources = await searchEmbeddings({ values, limit: 6, userId: ctx.userId });

      if (sources.length === 0) {
        return { answer: 'I could not find anything in your messages about that.', citations: [] };
      }

      const answer = await generateAnswer(buildPrompt(input.query, sources));
      return { answer, citations: sources };
    }),
});
