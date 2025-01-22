const router = require('express').Router();
const getMessages = require('../controllers/messageController');
const verifyToken = require('../middlewares/AuthMiddleware');

router.post('/get-messages', verifyToken, getMessages);

module.exports = router;