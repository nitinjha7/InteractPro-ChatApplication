const User = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const signUp = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        Error: "Please provide an email and password",
      });
    }

    const data = await User.create({ email, password });

    const token = await jwt.sign(
      { email: data.email, id: data._id },
      process.env.JWT_KEY,
      { expiresIn: "3d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.status(201).json({
      user: data,
    });

  } catch (err) {
    return res.status(500).json({
      "Internal Server Error": err,
    });
  }
};

const logIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        Error: "Please provide an email and password",
      });
    }

    const data = await User.findOne({ email });

    if (!data) {
      return res.status(400).json({
        Error: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, data.password);

    console.log("Req Password: ",password); // Plain text password from login
    console.log("Hashed Password", data.password); // Hashed password from the database
    console.log(await bcrypt.compare(password, data.password)); // Should return true or false

    if (!isMatch) {
      return res.status(400).json({
        Error: "Wrong Password",
      });
    }

    const token = await jwt.sign(
      { email: data.email, id: data._id },
      process.env.JWT_KEY,
      { expiresIn: "3d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.status(200).json({
      user: data,
    });
  } catch (err) {
    return res.status(500).json({
      "Internal Server Error": err,
    });
  }
};

const getUserInfo = async (req, res, next) => {
  try {
    console.log("User ID : ", req.id);
    const user = await User.findById(req.id);
    if(!user){
      console.log("No user found");
      return res.status(404).json({
        Error: "User not found"
      })
    }

    return res.status(200).json({
      user
    })

  } catch (err) {
    return res.status(500).json({
      "Internal Server Error": err,
    });
  }
};

const logOut = async (req, res) => {
  try {
    res.clearCookie("token", {httpOnly: true, secure: true, sameSite: "none"});
    return res.status(200).json({
      message: "Logged Out successfully",
    });
  } catch (err) {
    return res.status(500).json({
      "Internal Server Error": err,
    });
  }
};

module.exports = { signUp, logIn, getUserInfo, logOut };

