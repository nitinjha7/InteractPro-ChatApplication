const {Server} = require('socket.io');
const Message = require('./models/MessageModel');

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

        const createdMessage = await Message.create(message);

        const messageData = await Message.findById(createdMessage._id)
          .populate("sender", "id name firstName lastName image")
          .populate("recipient", "id name firstName lastName image");

        if(senderSocketId){
            io.to(senderSocketId).emit("receiveMessage", messageData);
        }

        if(recipientSocketId){
            io.to(recipientSocketId).emit("receiveMessage", messageData);
        }
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
};

module.exports = setupSocket;