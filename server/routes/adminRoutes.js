const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAdminUsers,
  toggleUserStatus,
  deleteUser,
  getAdminExchanges,
  getAdminSkills,
  deleteSkill,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// Protect all admin endpoints with JWT and Admin role check
router.use(protect, admin);

router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);
router.put('/users/:id/status', toggleUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/skills', getAdminSkills);
router.delete('/skills/:id', deleteSkill);
router.get('/exchanges', getAdminExchanges);

module.exports = router;
