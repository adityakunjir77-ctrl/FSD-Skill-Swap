const User = require('../models/User');
const Skill = require('../models/Skill');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Helper to resolve skill names to ObjectId array
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
          let skill = await Skill.findOne({ name: new RegExp(`^${trimmedName}$`, 'i') });
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

  return skillIds;
};

// @desc    Get all active user profiles (with search & filter)
// @route   GET /api/users
// @access  Public
const getUsers = async (req, res, next) => {
  try {
    const { search, category, role } = req.query;
    let query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    if (role) {
      query.role = role;
    }

    let users = await User.find(query)
      .select('-password')
      .populate('skillsOffered')
      .populate('skillsWanted')
      .sort({ createdAt: -1 });

    // Filter by skill category if requested
    if (category) {
      users = users.filter((u) => {
        const hasOfferedCat = u.skillsOffered.some((s) => s.category === category);
        const hasWantedCat = u.skillsWanted.some((s) => s.category === category);
        return hasOfferedCat || hasWantedCat;
      });
    }

    return successResponse(res, 200, 'Users retrieved successfully', users);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user profile by ID
// @route   GET /api/users/:id
// @access  Public
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('skillsOffered')
      .populate('skillsWanted');

    if (!user || !user.isActive) {
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
