const Message = require('../models/Message');
const ExchangeRequest = require('../models/ExchangeRequest');
const Notification = require('../models/Notification');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get all chat messages for a specific exchange request
// @route   GET /api/messages/:exchangeId
// @access  Private
const getMessagesByExchange = async (req, res, next) => {
  try {
    const { exchangeId } = req.params;
    const userId = req.user._id;

    const exchange = await ExchangeRequest.findById(exchangeId);
    if (!exchange) {
      return errorResponse(res, 404, 'Exchange request not found.');
    }

    const isSender = exchange.sender.toString() === userId.toString();
    const isReceiver = exchange.receiver.toString() === userId.toString();

    if (!isSender && !isReceiver && req.user.role !== 'admin') {
      return errorResponse(res, 403, 'Not authorized to view messages for this exchange.');
    }

    // Mark unread messages as read
    await Message.updateMany(
      { exchange: exchangeId, receiver: userId, isRead: false },
      { $set: { isRead: true } }
    );

    const messages = await Message.find({ exchange: exchangeId })
      .populate('sender', 'name email avatar')
      .populate('receiver', 'name email avatar')
      .sort({ createdAt: 1 });

    return successResponse(res, 200, 'Chat history retrieved', messages);
  } catch (error) {
    next(error);
  }
};

// @desc    Send a chat message (REST fallback)
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { exchangeId, content } = req.body;
    const userId = req.user._id;

    if (!exchangeId || !content || !content.trim()) {
      return errorResponse(res, 400, 'Exchange ID and message content are required.');
    }

    const exchange = await ExchangeRequest.findById(exchangeId);
    if (!exchange) {
      return errorResponse(res, 404, 'Exchange request not found.');
    }

    const isSender = exchange.sender.toString() === userId.toString();
    const receiverId = isSender ? exchange.receiver : exchange.sender;

    const message = await Message.create({
      exchange: exchangeId,
      sender: userId,
      receiver: receiverId,
      content: content.trim(),
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'name email avatar')
      .populate('receiver', 'name email avatar');

    // Create Notification for recipient
    await Notification.create({
      recipient: receiverId,
      sender: userId,
      type: 'new_message',
      title: 'New Message Received',
      message: `${req.user.name} sent you a message: "${content.trim().slice(0, 40)}..."`,
      link: '/messages',
    });

    return successResponse(res, 201, 'Message sent successfully', populated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMessagesByExchange,
  sendMessage,
};
