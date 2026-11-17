const { getRedisClients } = require('../config/redis');

// Chat opens once the receiver accepts an exchange. Pending, Rejected and
// Cancelled exchanges stay closed, so an unanswered or refused request cannot be
// used to keep messaging someone. This matches the exchanges the Messages page lists.
const CHAT_OPEN_STATUSES = ['Accepted', 'In Progress', 'Completed'];

const isChatOpen = (exchange) => CHAT_OPEN_STATUSES.includes(exchange.status);

// Socket messages bypass the REST rate limiter, so each user gets a separate
// budget shared across all of their open sockets. With Redis the budget is
// shared across every server instance; otherwise it is counted per process.
const SOCKET_MESSAGE_LIMIT = 30;
const SOCKET_MESSAGE_WINDOW_MS = 60 * 1000;
const socketMessageWindows = new Map();

const allowSocketMessageLocal = (userId, now = Date.now()) => {
  const current = socketMessageWindows.get(userId);

  if (!current || now - current.start >= SOCKET_MESSAGE_WINDOW_MS) {
    socketMessageWindows.set(userId, { start: now, count: 1 });
    return true;
  }

  if (current.count >= SOCKET_MESSAGE_LIMIT) return false;
  current.count += 1;
  return true;
};

// Drop expired windows so the map does not keep every user who ever chatted
const pruneSocketMessageWindows = (now = Date.now()) => {
  for (const [userId, window] of socketMessageWindows) {
    if (now - window.start >= SOCKET_MESSAGE_WINDOW_MS) socketMessageWindows.delete(userId);
  }
};
setInterval(pruneSocketMessageWindows, SOCKET_MESSAGE_WINDOW_MS).unref();

// Fixed one-minute windows in Redis: one counter per user per window, expiring
// after it ends. If Redis is unavailable, fall back to the per-process budget.
const allowSocketMessageShared = async (redisClient, userId, now) => {
  const window = Math.floor(now / SOCKET_MESSAGE_WINDOW_MS);
  const key = `socketmsg:${userId}:${window}`;
  const [count] = await redisClient.multi().incr(key).pExpire(key, SOCKET_MESSAGE_WINDOW_MS * 2).exec();
  return Number(count) <= SOCKET_MESSAGE_LIMIT;
};

const allowSocketMessage = async (userId, { now = Date.now(), redisClient = getRedisClients()?.client } = {}) => {
  if (redisClient?.isReady) {
    try {
      return await allowSocketMessageShared(redisClient, userId, now);
    } catch (error) {
      // fall through to the local budget
    }
  }
  return allowSocketMessageLocal(userId, now);
};

module.exports = {
  CHAT_OPEN_STATUSES,
  isChatOpen,
  SOCKET_MESSAGE_LIMIT,
  SOCKET_MESSAGE_WINDOW_MS,
  allowSocketMessage,
  allowSocketMessageLocal,
  pruneSocketMessageWindows,
};
