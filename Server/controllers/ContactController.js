  const User = require("../models/UserModel");
  const mongoose = require("mongoose");
  const Message = require("../models/MessageModel");

  const searchContact = async (req, res, next) => {
    try {
      const { searchTerm } = req.body;

      // if (!searchTerm) {
      //   return res.status(400).json({ message: "Search term is required" });
      // }

      // Sanitize and create search regex
      const sanitizedSearchTerm = searchTerm.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );
      const searchRegex = new RegExp(sanitizedSearchTerm, "i");

      console.log("Search Regex:", searchRegex);
      console.log("Current User ID:", req.userId);

      const contacts = await User.find({
        $and: [
          { _id: { $ne: req.id } }, // Exclude current user
          {
            $or: [
              { firstName: searchRegex },
              { lastName: searchRegex },
              { email: searchRegex },
            ],
          },
        ],
      });

      console.log("Contacts Found:", contacts);

      return res.status(200).json({ contacts });
    } catch (error) {
      console.error("Error in searchContact:", error);
      return res.status(500).send("Internal Server Error");
    }
  };

  const getDMList = async (req, res, next) => {
    try {
      let userId = req.id;
      userId = new mongoose.Types.ObjectId(userId);

      const contacts = await Message.aggregate([
        {
          $match: {
            $or: [{ sender: userId }, { recipient: userId }],
          },
        },
        {
          $sort: { timeStamp: -1 },
        },
        {
          $group: {
            _id: {
              $cond: {
                if: { $eq: ["$sender", userId] },
                then: "$recipient",
                else: "$sender",
              },
            },
            lastMessageTime: { $first: "$timeStamp" },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "contactInfo",
          },
        },
        {
          $unwind: "$contactInfo",
        },
        {
          $project: {
            _id: 1,
            lastMessageTime: 1,
            firstName: "$contactInfo.firstName",
            lastName: "$contactInfo.lastName",
            email: "$contactInfo.email",
            image: "$contactInfo.image",
          },
        },
        {
          $sort: { lastMessageTime: -1 },
        },
      ]);

      console.log("DM List:", contacts);

      return res.status(200).json({ contacts });
    } catch (error) {
      console.error("Error in getDMList:", error);
      return res.status(500).send("Internal Server Error");
    }
  };

  module.exports = {
    searchContact,
    getDMList,
  };
