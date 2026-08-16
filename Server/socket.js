const { Server } = require('socket.io');
const prisma = require('./config/prisma');
const { toMessage } = require('./lib/serialize');

const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    const userSocketMap = new Map();

    const sendMessage = async (message) => {
        const senderSocketId = userSocketMap.get(message.sender);
        const recipientSocketId = userSocketMap.get(message.recipient);

        const created = await prisma.message.create({
            data: {
                senderId: message.sender,
                recipientId: message.recipient,
                messageType: message.messageType,
                content: message.content ?? null,
                fileUrl: message.fileUrl ?? null,
                language: message.language ?? null,
            },
            include: {
                sender: true,
                recipient: true,
            },
        });

        const messageData = toMessage(created);

        if(senderSocketId){
            io.to(senderSocketId).emit("receiveMessage", messageData);
        }

        if(recipientSocketId){
            io.to(recipientSocketId).emit("receiveMessage", messageData);
        }

        import('./lib/ai/ingest.mjs')
            .then(({ ingestMessage }) => ingestMessage(created))
            .catch(() => {});
    }

    io.on('connection', (socket) => {
        const userId = socket.handshake.query.userId;

        if(userId){
            userSocketMap.set(userId, socket.id);
            console.log(`User connected: ${userId} with socket id: ${socket.id}`);
        } else {
            console.log("User connected without userId");
        }

        socket.on('sendMessage', sendMessage);

        socket.on('disconnect', () => {
            userSocketMap.delete(userId);
            console.log(`User disconnected: ${userId}`);
        });
    })

    return io;
};

module.exports = setupSocket;
