const Skill = require('../models/Skill');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get all skills (with search & category filtering)
// @route   GET /api/skills
// @access  Public
const getSkills = async (req, res, next) => {
  try {
    const { search, category } = req.query;
    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    const skills = await Skill.find(query).sort({ name: 1 });
    return successResponse(res, 200, 'Skills retrieved successfully', skills);
  } catch (error) {
    next(error);
  }
};

// @desc    Get predefined skill categories with counts
// @route   GET /api/skills/categories
// @access  Public
const getSkillCategories = async (req, res, next) => {
  try {
    const categories = [
      'Programming',
      'Web Development',
      'Mobile Development',
      'UI/UX Design',
      'Graphic Design',
      'Languages',
      'Marketing',
      'Photography',
      'Video Editing',
      'Music',
      'Business',
      'Other',
    ];

    const categoryStats = await Promise.all(
      categories.map(async (cat) => {
        const count = await Skill.countDocuments({ category: cat });
        return { name: cat, count };
      })
    );

    return successResponse(res, 200, 'Skill categories fetched', categoryStats);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new skill
// @route   POST /api/skills
// @access  Private
const createSkill = async (req, res, next) => {
  try {
    const { name, category, description } = req.body;

    if (!name) {
      return errorResponse(res, 400, 'Skill name is required.');
    }

    const existingSkill = await Skill.findOne({ name: new RegExp(`^${name.trim()}$`, 'i') });
    if (existingSkill) {
      return successResponse(res, 200, 'Skill already exists', existingSkill);
    }

    const skill = await Skill.create({
      name: name.trim(),
      category: category || 'Other',
      description: description || '',
    });

    return successResponse(res, 201, 'Skill created successfully', skill);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSkills,
  getSkillCategories,
  createSkill,
};
