const { rateLimit } = require('express-rate-limit');
const { errorResponse } = require('../utils/apiResponse');

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

const createLimiter = (options) =>
  rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, { statusCode, message }) => errorResponse(res, statusCode, message),
    ...options,
  });

const apiLimiter = createLimiter({
  windowMs: FIFTEEN_MINUTES,
  limit: 1000,
  message: 'Too many requests. Please try again later.',
});

// Only failed attempts count, so people are not locked out by normal use.
const loginLimiter = createLimiter({
  windowMs: FIFTEEN_MINUTES,
  limit: 10,
  skipSuccessfulRequests: true,
  message: 'Too many failed sign-in attempts. Please try again in 15 minutes.',
});

const registerLimiter = createLimiter({
  windowMs: ONE_HOUR,
  limit: 20,
  message: 'Too many registration attempts. Please try again later.',
});

module.exports = { apiLimiter, loginLimiter, registerLimiter };
