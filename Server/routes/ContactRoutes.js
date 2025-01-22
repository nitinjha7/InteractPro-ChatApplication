const { Router } = require('express');
const {searchContact} = require('../controllers/ContactController.js');
const verifyToken = require('../middlewares/AuthMiddleware.js');
const {getDMList} = require('../controllers/ContactController.js');

const router = Router();
router.post('/search', verifyToken, searchContact);
router.get('/get-dm-list', verifyToken, getDMList)

module.exports = router;