const express = require('express');
const router = express.Router();
const {
  createExchangeRequest,
  getUserExchangeRequests,
  updateExchangeStatus,
} = require('../controllers/exchangeController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createExchangeRequest);
router.get('/', protect, getUserExchangeRequests);
router.put('/:id/status', protect, updateExchangeStatus);

module.exports = router;
