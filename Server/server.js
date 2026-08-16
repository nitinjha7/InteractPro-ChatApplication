const express = require('express');
const dbConnect = require('./config/database');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const AuthRoute = require('./routes/AuthRoute');
const ContactRoutes = require('./routes/ContactRoutes');
const messageRoutes = require('./routes/messageRoutes');
const profileRoute = require('./routes/profileRoute');
const setupSocket = require('./socket');
const http = require('http');
const { createExpressMiddleware } = require('@trpc/server/adapters/express');
const { appRouter } = require('./trpc/routers');
const { createContext } = require('./trpc/context');

require('dotenv').config();
const app = express();

app.use(cors({
    origin: [process.env.CLIENT_URL],
    methods: ["GET", "POST", "DELETE"],
    credentials: true
}))

app.use(cookieParser());
app.use(express.json());
app.use("/uploads/profile-images", express.static("uploads/profile-images"));

app.use('/trpc', createExpressMiddleware({ router: appRouter, createContext }));

app.use('/api/auth', AuthRoute);
app.use('/api', profileRoute);
app.use('/api/contact', ContactRoutes);
app.use('/api/message', messageRoutes);

const server = http.createServer(app);
const io = setupSocket(server);

// yjs module is esm so that only one copy of yjs is ever loaded
import('./yjs/index.mjs').then(({ setupYjs }) => setupYjs(io));

dbConnect();

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})