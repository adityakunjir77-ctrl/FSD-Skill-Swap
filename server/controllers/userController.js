const User = require('../models/User');
const Skill = require('../models/Skill');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { SEARCH_TIMEOUT_MS, toSearchPattern, exactNameRegex } = require('../utils/sanitize');
const { PUBLIC_PROFILE_FIELDS } = require('../utils/userFields');
const { findPage } = require('../utils/pagination');

const MAX_PUBLIC_USERS = 100; // largest page the public directory serves
const MAX_SEARCH_SKILLS = 200; // skill names a directory search expands to
const EXPERIENCE_LEVELS = User.schema.path('experienceLevel').enumValues;

// Helper to resolve skill names to ObjectId array. Callers cap the list length
// first, because each unknown name costs a lookup and creates a global skill.
const resolveSkills = async (skillInputs) => {
  if (!Array.isArray(skillInputs)) return [];
  const skillIds = [];

  for (const item of skillInputs) {
    if (typeof item === 'string') {
      // Check if valid ObjectId string
      if (item.match(/^[0-9a-fA-F]{24}$/)) {
        skillIds.push(item);
      } else {
        // Find or create skill by name
        const trimmedName = item.trim();
        if (trimmedName) {
          let skill = await Skill.findOne({ name: exactNameRegex(trimmedName) });
          if (!skill) {
            skill = await Skill.create({ name: trimmedName, category: 'Other' });
          }
          skillIds.push(skill._id);
        }
      }
    } else if (item && item._id) {
      skillIds.push(item._id);
    }
  }

  // The same skill may arrive as a name and as an id; store it once
  return [...new Map(skillIds.map((id) => [id.toString(), id])).values()];
};

// @desc    Get all active user profiles (with search & filter)
// @route   GET /api/users
// @access  Public
const getUsers = async (req, res, next) => {
  try {
    const { search, category, experience } = req.query;
    const searchPattern = toSearchPattern(search);
    const conditions = [{ isActive: true, role: 'user' }];

    // Search covers name, bio, location and the names of listed skills, so
    // filtering happens here rather than over whichever page the client has
    if (searchPattern) {
      const regex = { $regex: searchPattern, $options: 'i' };
      const skillIds = (
        await Skill.find({ name: regex })
          .select('_id')
          .limit(MAX_SEARCH_SKILLS)
          .maxTimeMS(SEARCH_TIMEOUT_MS)
          .lean()
      ).map((s) => s._id);

      conditions.push({
        $or: [
          { name: regex },
          { bio: regex },
          { location: regex },
          ...(skillIds.length
            ? [{ skillsOffered: { $in: skillIds } }, { skillsWanted: { $in: skillIds } }]
            : []),
        ],
      });
    }

    // Filter by skill category if requested
    if (typeof category === 'string' && category && category !== 'All') {
      const skillIds = await Skill.find({ category }).distinct('_id');
      conditions.push({ $or: [{ skillsOffered: { $in: skillIds } }, { skillsWanted: { $in: skillIds } }] });
    }

    if (typeof experience === 'string' && experience && experience !== 'All') {
      if (!EXPERIENCE_LEVELS.includes(experience)) {
        return errorResponse(res, 400, 'Invalid experience filter.');
      }
      conditions.push({ experienceLevel: experience });
    }

    // Newest members first; `cursor` loads the next page
    const { items, pagination } = await findPage(User, conditions.length > 1 ? { $and: conditions } : conditions[0], {
      field: 'createdAt',
      cursorParam: req.query.cursor,
      limitParam: req.query.limit,
      defaultLimit: 30,
      maxLimit: MAX_PUBLIC_USERS,
      build: (q) =>
        q
          .select(PUBLIC_PROFILE_FIELDS)
          .populate('skillsOffered')
          .populate('skillsWanted')
          .maxTimeMS(SEARCH_TIMEOUT_MS),
    });

    return successResponse(res, 200, 'Users retrieved successfully', items, { pagination });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user profile by ID
// @route   GET /api/users/:id
// @access  Public
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id, isActive: true })
      .select(PUBLIC_PROFILE_FIELDS)
      .populate('skillsOffered')
      .populate('skillsWanted');

    if (!user) {
      return errorResponse(res, 404, 'User profile not found.');
    }

    return successResponse(res, 200, 'User profile retrieved successfully', user);
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return errorResponse(res, 404, 'User not found.');
    }

    const {
      name,
      bio,
      location,
      experienceLevel,
      availability,
      avatar,
      skillsOffered,
      skillsWanted,
    } = req.body;

    for (const list of [skillsOffered, skillsWanted]) {
      if (Array.isArray(list) && list.length > User.MAX_SKILLS_PER_LIST) {
        return errorResponse(res, 400, `You can list at most ${User.MAX_SKILLS_PER_LIST} skills in each section.`);
      }
    }

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (experienceLevel) user.experienceLevel = experienceLevel;
    if (availability !== undefined) user.availability = availability;
    if (avatar !== undefined) user.avatar = avatar;

    if (skillsOffered !== undefined) {
      user.skillsOffered = await resolveSkills(skillsOffered);
    }

    if (skillsWanted !== undefined) {
      user.skillsWanted = await resolveSkills(skillsWanted);
    }

    await user.save();

    const updatedUser = await User.findById(user._id)
      .select('-password')
      .populate('skillsOffered')
      .populate('skillsWanted');

    return successResponse(res, 200, 'Profile updated successfully', updatedUser);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUserProfile,
};
