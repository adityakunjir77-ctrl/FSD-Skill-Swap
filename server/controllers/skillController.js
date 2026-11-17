const Skill = require('../models/Skill');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { SEARCH_TIMEOUT_MS, toSearchPattern, exactNameRegex } = require('../utils/sanitize');
const { findPage } = require('../utils/pagination');

const MAX_SKILLS = 500; // largest page the public skill list serves

// @desc    Get all skills (with search & category filtering)
// @route   GET /api/skills
// @access  Public
const getSkills = async (req, res, next) => {
  try {
    const { search, category } = req.query;
    const searchPattern = toSearchPattern(search);
    const query = {};

    if (searchPattern) {
      query.name = { $regex: searchPattern, $options: 'i' };
    }

    if (typeof category === 'string' && category && category !== 'All') {
      query.category = category;
    }

    // Alphabetical; `cursor` loads the next page
    const { items, pagination } = await findPage(Skill, query, {
      field: 'name',
      direction: 1,
      valueType: 'string',
      cursorParam: req.query.cursor,
      limitParam: req.query.limit,
      defaultLimit: 100,
      maxLimit: MAX_SKILLS,
      build: (q) => q.maxTimeMS(SEARCH_TIMEOUT_MS),
    });

    return successResponse(res, 200, 'Skills retrieved successfully', items, { pagination });
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

    if (typeof name !== 'string' || !name.trim()) {
      return errorResponse(res, 400, 'Skill name is required.');
    }

    const existingSkill = await Skill.findOne({ name: exactNameRegex(name.trim()) });
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
