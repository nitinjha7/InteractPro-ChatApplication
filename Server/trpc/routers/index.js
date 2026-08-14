const { router, publicProcedure } = require('../trpc');
const { authRouter } = require('./auth');
const { chatRouter } = require('./chat');

const appRouter = router({
  health: publicProcedure.query(() => ({ ok: true })),
  auth: authRouter,
  chat: chatRouter,
});

module.exports = { appRouter };
