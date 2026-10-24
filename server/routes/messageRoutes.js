const express = require('express');
const router = express.Router();
const { getMessagesByExchange, sendMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:exchangeId', protect, getMessagesByExchange);
router.post('/', protect, sendMessage);

module.exports = router;
