const prisma = require("../config/prisma");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { toUser } = require("../lib/serialize");

const signToken = (user) =>
  jwt.sign({ email: user.email, id: user.id }, process.env.JWT_KEY, {
    expiresIn: "3d",
  });

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
};

const signUp = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        Error: "Please provide an email and password",
      });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({
        Error: "Email already registered",
      });
    }

    const salt = await bcrypt.genSalt();
    const hashed = await bcrypt.hash(password, salt);

    const data = await prisma.user.create({
      data: { email, password: hashed },
    });

    res.cookie("token", signToken(data), cookieOptions);

    return res.status(201).json({
      user: toUser(data),
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

    const data = await prisma.user.findUnique({ where: { email } });

    if (!data) {
      return res.status(400).json({
        Error: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, data.password);

    if (!isMatch) {
      return res.status(400).json({
        Error: "Wrong Password",
      });
    }

    res.cookie("token", signToken(data), cookieOptions);

    return res.status(200).json({
      user: toUser(data),
    });
  } catch (err) {
    return res.status(500).json({
      "Internal Server Error": err,
    });
  }
};

const getUserInfo = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.id } });
    if (!user) {
      return res.status(404).json({
        Error: "User not found",
      });
    }

    return res.status(200).json({
      user: toUser(user),
    });
  } catch (err) {
    return res.status(500).json({
      "Internal Server Error": err,
    });
  }
};

const logOut = async (req, res) => {
  try {
    res.clearCookie("token", cookieOptions);
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
