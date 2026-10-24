const express = require('express');
const router = express.Router();
const {
  createSession,
  getUserSessions,
  updateSessionStatus,
} = require('../controllers/sessionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createSession);
router.get('/', protect, getUserSessions);
router.put('/:id/status', protect, updateSessionStatus);

module.exports = router;
