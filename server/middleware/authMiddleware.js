const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 401, 'Not authorized. Token missing or invalid.');
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'skillswap_super_secret_jwt_key_2026_academic_project'
    );

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return errorResponse(res, 401, 'User account no longer exists.');
    }

    if (!user.isActive) {
      return errorResponse(res, 403, 'Your account has been suspended by an administrator.');
    }

    req.user = user;
    next();
  } catch (err) {
    return errorResponse(res, 401, 'Not authorized. Token expired or invalid signature.');
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return errorResponse(res, 403, 'Access denied. Administrative privileges required.');
  }
};

module.exports = { protect, admin };
