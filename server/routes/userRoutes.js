const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getUsers);
router.put('/profile', protect, updateUserProfile);
router.get('/:id', getUserById);

module.exports = router;
