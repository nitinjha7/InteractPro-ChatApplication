const { router, publicProcedure } = require('../trpc');

const appRouter = router({
  health: publicProcedure.query(() => ({ ok: true })),
});

module.exports = { appRouter };
