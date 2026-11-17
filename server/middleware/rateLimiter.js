const { rateLimit } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { getRedisClients, sendRedisCommand } = require('../config/redis');
const { errorResponse } = require('../utils/apiResponse');

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

// With REDIS_URL set, counts live in Redis so every server instance shares them
// and they survive restarts; otherwise each process counts in memory. If Redis
// is unreachable, requests are allowed rather than failing the whole API.
const storeFor = (name) => {
  if (!getRedisClients()) return undefined;
  return new RedisStore({
    sendCommand: (...args) => sendRedisCommand(args),
    prefix: `rl:${name}:`,
  });
};

// During a Redis outage every request hits a store error; log one line a
// minute instead of a stack trace per request
let lastStoreErrorLog = 0;
const limiterLogger = {
  error: (error, message) => {
    if (Date.now() - lastStoreErrorLog < 60 * 1000) return;
    lastStoreErrorLog = Date.now();
    console.error(`[RateLimit] ${message || 'Store error'} ${error?.message || error}`);
  },
  warn: (error, message) => console.warn(`[RateLimit] ${message || ''} ${error?.message || error}`),
};

const createLimiter = (name, options) =>
  rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    store: storeFor(name),
    passOnStoreError: true,
    logger: limiterLogger,
    handler: (req, res, next, { statusCode, message }) => errorResponse(res, statusCode, message),
    ...options,
  });

const apiLimiter = createLimiter('api', {
  windowMs: FIFTEEN_MINUTES,
  limit: 1000,
  message: 'Too many requests. Please try again later.',
});

// Only failed attempts count, so people are not locked out by normal use.
const loginLimiter = createLimiter('login', {
  windowMs: FIFTEEN_MINUTES,
  limit: 10,
  skipSuccessfulRequests: true,
  message: 'Too many failed sign-in attempts. Please try again in 15 minutes.',
});

const registerLimiter = createLimiter('register', {
  windowMs: ONE_HOUR,
  limit: 20,
  message: 'Too many registration attempts. Please try again later.',
});

module.exports = { apiLimiter, loginLimiter, registerLimiter };
