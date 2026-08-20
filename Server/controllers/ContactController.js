const prisma = require("../config/prisma");
const { toUser } = require("../lib/serialize");

const searchContact = async (req, res, next) => {
  try {
    const { searchTerm } = req.body;

    const contacts = await prisma.user.findMany({
      where: {
        id: { not: req.id },
        OR: [
          { firstName: { contains: searchTerm, mode: "insensitive" } },
          { lastName: { contains: searchTerm, mode: "insensitive" } },
          { email: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
    });

    return res.status(200).json({ contacts: contacts.map(toUser) });
  } catch (error) {
    return res.status(500).send("Internal Server Error");
  }
};

const getDMList = async (req, res, next) => {
  try {
    const userId = req.id;

    // one row per conversation partner, carrying the newest message time
    const rows = await prisma.$queryRaw`
      SELECT DISTINCT ON (contact_id)
        contact_id,
        time_stamp AS "lastMessageTime"
      FROM (
        SELECT
          CASE WHEN sender_id = ${userId} THEN recipient_id ELSE sender_id END AS contact_id,
          time_stamp
        FROM messages
        WHERE sender_id = ${userId} OR recipient_id = ${userId}
      ) AS conversations
      WHERE contact_id IS NOT NULL
      ORDER BY contact_id, time_stamp DESC
    `;

    if (rows.length === 0) {
      return res.status(200).json({ contacts: [] });
    }

    const users = await prisma.user.findMany({
      where: { id: { in: rows.map((r) => r.contact_id) } },
    });
    const usersById = new Map(users.map((u) => [u.id, u]));

    const contacts = rows
      .map((row) => {
        const user = usersById.get(row.contact_id);
        if (!user) return null;
        return {
          id: user.id,
          lastMessageTime: row.lastMessageTime,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          image: user.image,
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

    return res.status(200).json({ contacts });
  } catch (error) {
    return res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  searchContact,
  getDMList,
};
