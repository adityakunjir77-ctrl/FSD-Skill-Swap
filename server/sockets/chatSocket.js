const Message = require('../models/Message');
const Notification = require('../models/Notification');
const ExchangeRequest = require('../models/ExchangeRequest');
const User = require('../models/User');
const { verifyToken } = require('../utils/generateToken');
const { USER_SUMMARY_FIELDS } = require('../utils/userFields');

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

  const exchange = await ExchangeRequest.findById(exchangeId).select('sender receiver');
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

        const sender = await loadActiveUser(socket);
        if (!sender) return;

        const exchange = await loadOwnExchange(socket, exchangeId);
        if (!exchange) return;

        const receiverId =
          exchange.sender.toString() === socket.userId ? exchange.receiver : exchange.sender;

        // Save to Database
        const message = await Message.create({
          exchange: exchange._id,
          sender: sender._id,
          receiver: receiverId,
          content: text,
        });

        const populated = await Message.findById(message._id)
          .populate('sender', USER_SUMMARY_FIELDS)
          .populate('receiver', USER_SUMMARY_FIELDS);

        // Broadcast to chat room
        io.to(`exchange_${exchange._id}`).emit('receive-message', populated);

        // Create Notification & send to receiver's personal user room
        const notification = await Notification.create({
          recipient: receiverId,
          sender: sender._id,
          type: 'new_message',
          title: 'New Chat Message',
          message: `${sender.name}: "${text.slice(0, 35)}..."`,
          link: '/messages',
        });

        io.to(`user_${receiverId}`).emit('new-notification', notification);

      } catch (error) {
        console.error('[Socket.io Chat Error]:', error);
      }
    });

  });
};

module.exports = registerChatSockets;
