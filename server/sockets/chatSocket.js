const Message = require('../models/Message');
const Notification = require('../models/Notification');
const ExchangeRequest = require('../models/ExchangeRequest');

const registerChatSockets = (io) => {
  io.on('connection', (socket) => {

    // User personal room for instant notifications
    socket.on('join-user-room', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
      }
    });

    // Join specific Exchange Chat room
    socket.on('join-exchange-room', (exchangeId) => {
      if (exchangeId) {
        socket.join(`exchange_${exchangeId}`);
      }
    });

    // Leave Exchange Chat room
    socket.on('leave-exchange-room', (exchangeId) => {
      if (exchangeId) {
        socket.leave(`exchange_${exchangeId}`);
      }
    });

    // Real-time Chat Messaging
    socket.on('send-message', async (data) => {
      try {
        const { exchangeId, senderId, receiverId, content } = data;

        if (!exchangeId || !senderId || !receiverId || !content) return;

        // Save to Database
        const message = await Message.create({
          exchange: exchangeId,
          sender: senderId,
          receiver: receiverId,
          content: content.trim(),
        });

        const populated = await Message.findById(message._id)
          .populate('sender', 'name email avatar')
          .populate('receiver', 'name email avatar');

        // Broadcast to chat room
        io.to(`exchange_${exchangeId}`).emit('receive-message', populated);

        // Create Notification & send to receiver's personal user room
        const notification = await Notification.create({
          recipient: receiverId,
          sender: senderId,
          type: 'new_message',
          title: 'New Chat Message',
          message: `${populated.sender.name}: "${content.trim().slice(0, 35)}..."`,
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
