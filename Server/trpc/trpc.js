const { initTRPC, TRPCError } = require('@trpc/server');
const superjson = require('superjson');

const t = initTRPC.context().create({ transformer: superjson });

const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});

module.exports = {
  router: t.router,
  publicProcedure: t.procedure,
  protectedProcedure,
};
