const express = require('express');
const router = express.Router();
const { getUserNotifications, markNotificationAsRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getUserNotifications);
router.put('/:id/read', protect, markNotificationAsRead);

module.exports = router;
