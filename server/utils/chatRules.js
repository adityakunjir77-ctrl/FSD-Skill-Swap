// Chat opens once the receiver accepts an exchange. Pending, Rejected and
// Cancelled exchanges stay closed, so an unanswered or refused request cannot be
// used to keep messaging someone. This matches the exchanges the Messages page lists.
const CHAT_OPEN_STATUSES = ['Accepted', 'In Progress', 'Completed'];

const isChatOpen = (exchange) => CHAT_OPEN_STATUSES.includes(exchange.status);

// Socket messages bypass the REST rate limiter, so each user gets a separate
// budget shared across all of their open sockets. In-memory, like the REST
// limits: a multi-instance deployment needs a shared store.
const SOCKET_MESSAGE_LIMIT = 30;
const SOCKET_MESSAGE_WINDOW_MS = 60 * 1000;
const socketMessageWindows = new Map();

const allowSocketMessage = (userId, now = Date.now()) => {
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

module.exports = {
  CHAT_OPEN_STATUSES,
  isChatOpen,
  SOCKET_MESSAGE_LIMIT,
  SOCKET_MESSAGE_WINDOW_MS,
  allowSocketMessage,
  pruneSocketMessageWindows,
};
