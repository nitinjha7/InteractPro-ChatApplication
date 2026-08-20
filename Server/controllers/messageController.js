const prisma = require("../config/prisma");
const { toMessage } = require("../lib/serialize");

const getMessages = async (req, res, next) => {
  try {
    const user1 = req.id;
    const user2 = req.body.id;

    if (!user1 || !user2) {
      return res.status(400).json({
        Error: "Invalid request",
      });
    }

    const chat = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user1, recipientId: user2 },
          { senderId: user2, recipientId: user1 },
        ],
      },
      orderBy: { timeStamp: "asc" },
    });

    return res.status(200).json({ chat: chat.map(toMessage) });
  } catch (err) {
    return res.status(500).json({
      Error: "Internal Server Error",
    });
  }
};

module.exports = getMessages;
