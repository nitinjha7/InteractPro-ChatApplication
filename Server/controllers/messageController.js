const Message = require('../models/MessageModel');

const getMessages = async (req, res, next) => {
    try{
        const user1 = req.id;
        const user2 = req.body.id;

        if(!user1 || !user2){
            return res.status(400).json({
                Error: "Invalid request"
            });
        }

        const chat = await Message.find({
            $or: [
                { sender: user1, recipient: user2 },
                { sender: user2, recipient: user1 }
            ]
        }).sort({ timeStamp: 1 });

        return res.status(200).json({ chat });
    }

    catch(err){
        return res.status(500).json({
            Error: "Internal Server Error"
        });
    }
}

module.exports = getMessages;