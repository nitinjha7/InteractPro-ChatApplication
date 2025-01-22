const express = require('express');
const router = express.Router();
const {signUp, logIn, getUserInfo, logOut} = require('../controllers/AuthController.js');
const verifyToken = require('../middlewares/AuthMiddleware.js');

router.post('/signup', signUp);
router.post('/login', logIn);
router.get('/userInfo', verifyToken, getUserInfo);
router.post('/logout', logOut);

module.exports = router;