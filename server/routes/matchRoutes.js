const express = require('express');
const router = express.Router();
const { getRecommendedMatches } = require('../controllers/matchController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getRecommendedMatches);

module.exports = router;
