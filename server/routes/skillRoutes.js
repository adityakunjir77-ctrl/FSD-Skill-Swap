const express = require('express');
const router = express.Router();
const { getSkills, getSkillCategories, createSkill } = require('../controllers/skillController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getSkills);
router.get('/categories', getSkillCategories);
router.post('/', protect, createSkill);

module.exports = router;
