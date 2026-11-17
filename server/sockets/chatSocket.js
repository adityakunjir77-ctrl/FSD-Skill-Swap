const ExchangeRequest = require('../models/ExchangeRequest');
const User = require('../models/User');
const { verifyToken } = require('../utils/generateToken');
const { isChatOpen, allowSocketMessage } = require('../utils/chatRules');
const { createChatMessage } = require('../services/chatMessages');

const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;

const authenticateSocket = async (socket, next) => {
  try {
    const decoded = verifyToken(socket.handshake.auth?.token);
    const user = await User.findById(decoded.id).select('isActive');

    if (!user || !user.isActive) {
      return next(new Error('Not authorized'));
    }

    socket.userId = user._id.toString();
    socket.tokenExpiresAt = decoded.exp * 1000;
    next();
  } catch (error) {
    next(new Error('Not authorized'));
  }
};

// Sockets stay open long after the handshake, so every action re-checks the
// account the same way the REST `protect` middleware does on each request.
const loadActiveUser = async (socket) => {
  const user =
    Date.now() < socket.tokenExpiresAt ? await User.findById(socket.userId).select('name isActive') : null;

  if (!user || !user.isActive) {
    socket.disconnect(true);
    return null;
  }

  return user;
};

const loadOwnExchange = async (socket, exchangeId) => {
  if (typeof exchangeId !== 'string' || !OBJECT_ID_PATTERN.test(exchangeId)) return null;

  const exchange = await ExchangeRequest.findById(exchangeId).select('sender receiver status');
  if (!exchange) return null;

  const isParticipant =
    exchange.sender.toString() === socket.userId || exchange.receiver.toString() === socket.userId;

  return isParticipant ? exchange : null;
};

const registerChatSockets = (io) => {
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    // Personal room for instant notifications, always the authenticated user's own
    socket.join(`user_${socket.userId}`);

    // Join specific Exchange Chat room
    socket.on('join-exchange-room', async (exchangeId) => {
      try {
        if (!(await loadActiveUser(socket))) return;

        const exchange = await loadOwnExchange(socket, exchangeId);
        if (exchange) {
          socket.join(`exchange_${exchange._id}`);
        }
      } catch (error) {
        console.error('[Socket.io Join Error]:', error);
      }
    });

    // Leave Exchange Chat room
    socket.on('leave-exchange-room', (exchangeId) => {
      if (typeof exchangeId === 'string') {
        socket.leave(`exchange_${exchangeId}`);
      }
    });

    // Real-time Chat Messaging. Sender and receiver come from the session and the
    // exchange, never from the client.
    socket.on('send-message', async (data) => {
      try {
        const { exchangeId, content } = data || {};
        const text = typeof content === 'string' ? content.trim() : '';

        if (!text) return;

        if (!allowSocketMessage(socket.userId)) {
          socket.emit('message-error', { message: 'You are sending messages too quickly. Please wait a moment.' });
          return;
        }

        const sender = await loadActiveUser(socket);
        if (!sender) return;

        const exchange = await loadOwnExchange(socket, exchangeId);
        if (!exchange) return;

        if (!isChatOpen(exchange)) {
          socket.emit('message-error', { message: 'Chat opens once the exchange request is accepted.' });
          return;
        }

        const receiverId =
          exchange.sender.toString() === socket.userId ? exchange.receiver : exchange.sender;

        // Saved with its outbox events; the outbox worker broadcasts it to the
        // chat room and notifies the receiver
        await createChatMessage({ exchange, sender, receiverId, text });
      } catch (error) {
        if (error.name === 'ValidationError') {
          socket.emit('message-error', { message: 'Message could not be sent. Messages are limited to 2000 characters.' });
          return;
        }
        console.error('[Socket.io Chat Error]:', error.message);
      }
    });

  });
};

module.exports = registerChatSockets;
