const { z } = require('zod');
const { router, protectedProcedure } = require('../trpc');
const { toUser, toMessage } = require('../../lib/serialize');

const chatRouter = router({
  searchContacts: protectedProcedure
    .input(z.object({ searchTerm: z.string() }))
    .query(async ({ ctx, input }) => {
      const contacts = await ctx.prisma.user.findMany({
        where: {
          id: { not: ctx.userId },
          OR: [
            { firstName: { contains: input.searchTerm, mode: 'insensitive' } },
            { lastName: { contains: input.searchTerm, mode: 'insensitive' } },
            { email: { contains: input.searchTerm, mode: 'insensitive' } },
          ],
        },
      });
      return { contacts: contacts.map(toUser) };
    }),

  getMessages: protectedProcedure
    .input(z.object({ contactId: z.string() }))
    .query(async ({ ctx, input }) => {
      const chat = await ctx.prisma.message.findMany({
        where: {
          OR: [
            { senderId: ctx.userId, recipientId: input.contactId },
            { senderId: input.contactId, recipientId: ctx.userId },
          ],
        },
        orderBy: { timeStamp: 'asc' },
      });
      return { chat: chat.map(toMessage) };
    }),

  getDmList: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.prisma.$queryRaw`
      SELECT DISTINCT ON (contact_id)
        contact_id,
        time_stamp AS "lastMessageTime"
      FROM (
        SELECT
          CASE WHEN sender_id = ${ctx.userId} THEN recipient_id ELSE sender_id END AS contact_id,
          time_stamp
        FROM messages
        WHERE sender_id = ${ctx.userId} OR recipient_id = ${ctx.userId}
      ) AS conversations
      WHERE contact_id IS NOT NULL
      ORDER BY contact_id, time_stamp DESC
    `;

    if (rows.length === 0) return { contacts: [] };

    const users = await ctx.prisma.user.findMany({
      where: { id: { in: rows.map((r) => r.contact_id) } },
    });
    const byId = new Map(users.map((u) => [u.id, u]));

    const contacts = rows
      .map((row) => {
        const user = byId.get(row.contact_id);
        if (!user) return null;
        return {
          _id: user.id,
          lastMessageTime: row.lastMessageTime,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          image: user.image,
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

    return { contacts };
  }),
});

module.exports = { chatRouter };
