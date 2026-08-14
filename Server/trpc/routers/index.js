const { router, publicProcedure } = require('../trpc');
const { authRouter } = require('./auth');

const appRouter = router({
  health: publicProcedure.query(() => ({ ok: true })),
  auth: authRouter,
});

module.exports = { appRouter };
