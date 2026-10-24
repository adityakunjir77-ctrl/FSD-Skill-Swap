const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 400, 'Please provide name, email, and password.');
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });

    if (userExists) {
      return errorResponse(res, 400, 'User with this email already exists.');
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
    });

    const populatedUser = await User.findById(user._id)
      .populate('skillsOffered')
      .populate('skillsWanted');

    const token = generateToken(user._id);

    return successResponse(res, 201, 'Registration successful', {
      token,
      user: populatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, 'Please provide both email and password.');
    }

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password')
      .populate('skillsOffered')
      .populate('skillsWanted');

    if (!user || !(await user.matchPassword(password))) {
      return errorResponse(res, 401, 'Invalid email or password.');
    }

    if (!user.isActive) {
      return errorResponse(res, 403, 'Your account has been suspended by an administrator.');
    }

    const token = generateToken(user._id);
    user.password = undefined; // Don't return password

    return successResponse(res, 200, 'Login successful', {
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current authenticated user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('skillsOffered')
      .populate('skillsWanted');

    return successResponse(res, 200, 'Current user profile fetched successfully', user);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
