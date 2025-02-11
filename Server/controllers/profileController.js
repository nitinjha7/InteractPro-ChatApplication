const User = require('../models/UserModel');
const {renameSync, unlinkSync} = require('fs');
const path = require("path");

const updateProfile = async (req, res) => {
    try {
        const {id} = req;
        const {firstName, lastName} = req.body;

        if(!firstName || !lastName){
            return res.status(400).json({error: 'Please fill in all fields'});
        }

        const userData = await User.findByIdAndUpdate(id, {
            firstName,
            lastName,
            profileSetup: true
            },
            {new: true, runValidators: true}
        );

        return res.status(200).json({
            id: userData._id,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            profileSetup: userData.profileSetup,
            image: userData.image
        })
    }
    catch (err){
        console.log(err);
        res.status(500).json({error: 'Internal server error'});
    }
}

const uploadImage = async (req, res) => {
  try {
    if(!req.file){
        console.log("No file uploaded");
        return res.status(400).json({error: 'Please provide an image'});
    }

    const date = Date.now();
    let fileName = "uploads/profile-images/" + date + req.file.originalname;
    renameSync(req.file.path, fileName);


    const updatedUser = await User.findByIdAndUpdate(req.id, {
        image: fileName
    }, {new: true, runValidators: true});

    return res.status(200).json({
      image: updatedUser.image
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteImage = async (req, res, next) => {
  try {
    const user = await User.findById(req.id);
    if (!user) {
      return res.status(400).json({ error: "No user found" });
    }

    if (!user.image) {
      return res.status(400).json({ error: "No image found" });
    }

    unlinkSync(user.image);
    user.image = null;
    await user.save();
    return res.status(200).send("Profile image deleted");
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { updateProfile, uploadImage, deleteImage };