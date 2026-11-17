// Load environment variables first: some modules (rate limiters, Redis) read
// them as they load
require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const cors = require('cors');
const helmet = require('helmet');
const { getRedisClients, closeRedis } = require('./config/redis');
const connectDB = require('./config/db');
const { closeDB } = require('./config/db');
const { startCounterReconciliation, stopCounterReconciliation } = require('./services/counterReconciliation');
const { startOutboxWorker, stopOutboxWorker } = require('./services/outbox');
const { getJwtSecret, getTrustProxy, getMongoOptions } = require('./config/env');
const { apiLimiter } = require('./middleware/rateLimiter');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');
const { successResponse } = require('./utils/apiResponse');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const skillRoutes = require('./routes/skillRoutes');
const matchRoutes = require('./routes/matchRoutes');
const exchangeRoutes = require('./routes/exchangeRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const messageRoutes = require('./routes/messageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Socket Imports
const registerChatSockets = require('./sockets/chatSocket');

// Refuse to start with a missing or publicly known signing secret, an
// unparseable proxy hop count, or invalid database settings
let trustProxy;
try {
  getJwtSecret();
  trustProxy = getTrustProxy();
  getMongoOptions();
} catch (error) {
  console.error(`[Config] ${error.message}`);
  process.exit(1);
}

let shuttingDown = false;

// Connect to MongoDB, then start background work: counter reconciliation and
// the outbox worker that delivers notifications and live chat events. `io` is
// created below, before the connection resolves.
connectDB().then(() => {
  if (shuttingDown) return;
  startCounterReconciliation();
  startOutboxWorker(io);
});

const app = express();
const server = http.createServer(app);

// Number of reverse proxies in front of the app, so rate limits see real client IPs
app.set('trust proxy', trustProxy);

// Configure Socket.io
const io = new Server(server, {
  maxHttpBufferSize: 100 * 1024,
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// With Redis, rooms are shared: an emit or disconnect on one instance reaches
// sockets connected to every instance. Clients may use HTTP long polling before
// upgrading to WebSocket, so a load balancer must keep each client on one
// instance (sticky sessions).
const redis = getRedisClients();
if (redis) {
  io.adapter(createAdapter(redis.publisher, redis.subscriber));
} else {
  console.log('[Socket.io] REDIS_URL not set: running as a single instance.');
}

// Register Socket.io Handlers
registerChatSockets(io);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use('/api', apiLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach Socket.io instance to request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Base API Routes / Health Check
app.get('/api/health', (req, res) => {
  return successResponse(res, 200, 'SkillSwap API is up and running!', {
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Mount Application Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/exchanges', exchangeRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`[SkillSwap Server] Running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Graceful shutdown for deploys and restarts: stop accepting connections, let
// in-flight requests finish, stop background jobs, then close the database.
// Outbox events not yet delivered stay pending and are sent after restart.
const SHUTDOWN_TIMEOUT_MS = 10 * 1000;

const shutdown = async (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[SkillSwap Server] ${signal} received, shutting down...`);

  const forceExit = setTimeout(() => {
    console.error('[SkillSwap Server] Shutdown timed out; exiting anyway.');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  forceExit.unref();

  try {
    // Disconnects sockets and closes the HTTP server, which waits for
    // in-flight requests; idle keep-alive connections are closed right away
    await new Promise((resolve) => {
      io.close(() => resolve());
      server.closeIdleConnections?.();
    });
    await Promise.all([stopOutboxWorker(), stopCounterReconciliation()]);
    await Promise.all([closeDB(), closeRedis()]);
    clearTimeout(forceExit);
    console.log('[SkillSwap Server] Shutdown complete.');
    process.exit(0);
  } catch (error) {
    console.error('[SkillSwap Server] Error during shutdown:', error.message);
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = { app, server, io };
