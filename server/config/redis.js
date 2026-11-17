const { createClient } = require('redis');

// Redis lets several server processes share state: Socket.IO rooms (so live
// events and "disconnect this user" reach sockets on every process) and rate
// limit counters (so limits cannot be dodged by spreading requests across
// processes). Set REDIS_URL to enable it. Without it the server runs in
// single-process mode, which is fine for local development and one instance.
//
// If Redis goes down, the app keeps working on its own instance: rate limits
// allow requests, the socket message budget counts locally, and live events
// reach only local sockets until Redis returns.

const INITIAL_CONNECT_WAIT_MS = 3000;

let clients = null; // { client, publisher, subscriber }
let initialConnection = Promise.resolve();

const isRedisConfigured = () => Boolean((process.env.REDIS_URL || '').trim());

const createRedisClient = (role, { queueWhileOffline }) => {
  const redis = createClient({
    url: process.env.REDIS_URL.trim(),
    // Commands fail at once while disconnected instead of queueing without
    // limit. Only the subscriber queues, for its own subscribe calls, which
    // are sent once connected and restored automatically after a reconnect.
    disableOfflineQueue: !queueWhileOffline,
    socket: {
      connectTimeout: 5000,
      reconnectStrategy: (retries) => Math.min(100 * 2 ** retries, 5000),
    },
  });

  let reportedDown = false;
  redis.on('error', (error) => {
    if (!reportedDown) {
      console.error(`[Redis] ${role} connection error: ${error.message}`);
      reportedDown = true;
    }
  });
  redis.on('ready', () => {
    if (reportedDown) console.log(`[Redis] ${role} connection restored.`);
    reportedDown = false;
  });

  return redis;
};

// The Socket.IO adapter publishes without handling errors, and an unhandled
// rejection would crash the process. A failed publish only means other
// instances miss that event, so it is logged and dropped.
const tolerantPublisher = (redis) => {
  const publish = redis.publish.bind(redis);
  let lastLogged = 0;
  redis.publish = (...args) =>
    publish(...args).catch((error) => {
      if (Date.now() - lastLogged > 60 * 1000) {
        console.error(`[Redis] Publish failed; other instances miss events until Redis returns: ${error.message}`);
        lastLogged = Date.now();
      }
      return 0;
    });
  return redis;
};

// Creates the clients once. Called at startup before rate limiters and the
// Socket.IO adapter are built; connections open in the background.
const getRedisClients = () => {
  if (!isRedisConfigured()) return null;

  if (!clients) {
    clients = {
      client: createRedisClient('command', { queueWhileOffline: false }),
      publisher: tolerantPublisher(createRedisClient('publisher', { queueWhileOffline: false })),
      subscriber: createRedisClient('subscriber', { queueWhileOffline: true }),
    };

    const connected = Promise.all(Object.values(clients).map((c) => c.connect()))
      .then(() => console.log('[Redis] Connected; rate limits and Socket.IO rooms are shared across instances.'))
      .catch((error) => console.error(`[Redis] Initial connection failed: ${error.message}`));

    // Settles once connected or after a short wait, whichever comes first
    initialConnection = Promise.race([
      connected,
      new Promise((resolve) => setTimeout(resolve, INITIAL_CONNECT_WAIT_MS).unref()),
    ]);
  }

  return clients;
};

// Runs a raw command. Only the first commands after startup wait for the
// initial connection; after that a disconnected client fails immediately.
const sendRedisCommand = async (args) => {
  await initialConnection;
  return clients.client.sendCommand(args);
};

const closeRedis = async () => {
  if (!clients) return;
  const open = Object.values(clients).filter((c) => c.isOpen);
  await Promise.all(open.map((c) => c.quit().catch(() => c.disconnect())));
  clients = null;
};

module.exports = { isRedisConfigured, getRedisClients, sendRedisCommand, closeRedis };
