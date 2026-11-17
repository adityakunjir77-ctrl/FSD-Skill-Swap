const Message = require('../models/Message');
const ExchangeRequest = require('../models/ExchangeRequest');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { createChatMessage } = require('../services/chatMessages');
const { USER_SUMMARY_FIELDS } = require('../utils/userFields');
const { isChatOpen } = require('../utils/chatRules');
const { findPage } = require('../utils/pagination');

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

    if (!isSender && !isReceiver) {
      return errorResponse(res, 403, 'Not authorized to view messages for this exchange.');
    }

    // Mark unread messages as read
    await Message.updateMany(
      { exchange: exchangeId, receiver: userId, isRead: false },
      { $set: { isRead: true } }
    );

    // Newest page first; `cursor` loads earlier messages
    const { items, pagination } = await findPage(Message, { exchange: exchange._id }, {
      field: 'createdAt',
      cursorParam: req.query.cursor,
      limitParam: req.query.limit,
      defaultLimit: 50,
      maxLimit: 100,
      build: (query) =>
        query.populate('sender', USER_SUMMARY_FIELDS).populate('receiver', USER_SUMMARY_FIELDS),
    });

    // Returned oldest-first so the page reads top to bottom
    return successResponse(res, 200, 'Chat history retrieved', items.reverse(), { pagination });
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

    if (!exchangeId || typeof content !== 'string' || !content.trim()) {
      return errorResponse(res, 400, 'Exchange ID and message content are required.');
    }

    const exchange = await ExchangeRequest.findById(exchangeId);
    if (!exchange) {
      return errorResponse(res, 404, 'Exchange request not found.');
    }

    const isSender = exchange.sender.toString() === userId.toString();
    const isReceiver = exchange.receiver.toString() === userId.toString();

    if (!isSender && !isReceiver) {
      return errorResponse(res, 403, 'Not authorized to send messages for this exchange.');
    }

    if (!isChatOpen(exchange)) {
      return errorResponse(res, 409, 'Chat opens once the exchange request is accepted.');
    }

    const receiverId = isSender ? exchange.receiver : exchange.sender;

    // Live delivery and the receiver's notification go through the outbox
    const message = await createChatMessage({
      exchange,
      sender: req.user,
      receiverId,
      text: content.trim(),
    });

    const populated = await Message.findById(message._id)
      .populate('sender', USER_SUMMARY_FIELDS)
      .populate('receiver', USER_SUMMARY_FIELDS);

    return successResponse(res, 201, 'Message sent successfully', populated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMessagesByExchange,
  sendMessage,
};
