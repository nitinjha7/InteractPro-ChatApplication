const prisma = require("../config/prisma");
const cloudinary = require("../config/cloudinary");

const updateProfile = async (req, res) => {
  try {
    const { id } = req;
    const { firstName, lastName } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({ error: "Please fill in all fields" });
    }

    const userData = await prisma.user.update({
      where: { id },
      data: { firstName, lastName, profileSetup: true },
    });

    return res.status(200).json({
      id: userData.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      profileSetup: userData.profileSetup,
      image: userData.image,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Please provide an image" });
    }

    const userId = req.id;

    const cloudinaryResponse = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "profile-images",
          public_id: userId,
          overwrite: true,
        },
        (error, result) => {
          if (error) {
            reject(error);
          }
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    const user = await prisma.user.update({
      where: { id: userId },
      data: { image: cloudinaryResponse.secure_url },
    });

    return res.status(200).json({
      image: user.image,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteImage = async (req, res) => {
  try {
    const userId = req.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user.image) {
      return res.status(400).json({ error: "No image found" });
    }

    await cloudinary.uploader.destroy(`profile-images/${userId}`);

    await prisma.user.update({
      where: { id: userId },
      data: { image: null },
    });

    return res.status(200).send("Profile image deleted");
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { updateProfile, uploadImage, deleteImage };
