const User = require('../models/User');
const Skill = require('../models/Skill');
const ExchangeRequest = require('../models/ExchangeRequest');
const Review = require('../models/Review');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get administrative dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalSkills = await Skill.countDocuments();
    const totalExchanges = await ExchangeRequest.countDocuments();
    const completedExchanges = await ExchangeRequest.countDocuments({ status: 'Completed' });
    const pendingExchanges = await ExchangeRequest.countDocuments({ status: 'Pending' });

    const avgRatingAgg = await User.aggregate([
      { $group: { _id: null, avg: { $avg: '$averageRating' } } },
    ]);

    const averagePlatformRating = avgRatingAgg[0]?.avg
      ? parseFloat(avgRatingAgg[0].avg.toFixed(1))
      : 5.0;

    return successResponse(res, 200, 'Admin metrics loaded', {
      totalUsers,
      activeUsers,
      totalSkills,
      totalExchanges,
      completedExchanges,
      pendingExchanges,
      averagePlatformRating,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users for admin moderation
// @route   GET /api/admin/users
// @access  Private/Admin
const getAdminUsers = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .populate('skillsOffered')
      .populate('skillsWanted')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'Admin users list retrieved', users);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active/suspended status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return errorResponse(res, 404, 'User not found.');
    }

    if (user._id.toString() === req.user._id.toString()) {
      return errorResponse(res, 400, 'Admin cannot suspend their own account.');
    }

    user.isActive = !user.isActive;
    await user.save();

    return successResponse(
      res,
      200,
      `User account ${user.isActive ? 'activated' : 'suspended'} successfully`,
      user
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return errorResponse(res, 404, 'User not found.');
    }

    if (user._id.toString() === req.user._id.toString()) {
      return errorResponse(res, 400, 'Admin cannot delete their own account.');
    }

    await User.findByIdAndDelete(req.params.id);
    return successResponse(res, 200, 'User account deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get all exchange audit logs
// @route   GET /api/admin/exchanges
// @access  Private/Admin
const getAdminExchanges = async (req, res, next) => {
  try {
    const exchanges = await ExchangeRequest.find()
      .populate('sender', 'name email avatar')
      .populate('receiver', 'name email avatar')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'Admin exchange audit log retrieved', exchanges);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all skills with full details for admin
// @route   GET /api/admin/skills
// @access  Private/Admin
const getAdminSkills = async (req, res, next) => {
  try {
    const skills = await Skill.find().sort({ createdAt: -1 });
    return successResponse(res, 200, 'Admin skills list retrieved', skills);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a skill
// @route   DELETE /api/admin/skills/:id
// @access  Private/Admin
const deleteSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return errorResponse(res, 404, 'Skill not found.');
    }
    await Skill.findByIdAndDelete(req.params.id);
    return successResponse(res, 200, 'Skill deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAdminUsers,
  toggleUserStatus,
  deleteUser,
  getAdminExchanges,
  getAdminSkills,
  deleteSkill,
};

