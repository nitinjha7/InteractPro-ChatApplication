const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const createContext = ({ req, res }) => {
  let userId = null;

  const token = req.cookies?.token;
  if (token) {
    try {
      userId = jwt.verify(token, process.env.JWT_KEY).id;
    } catch {
      userId = null;
    }
  }

  return { prisma, userId, res };
};

module.exports = { createContext };
