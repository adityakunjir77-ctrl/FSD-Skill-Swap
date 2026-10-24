const ExchangeRequest = require('../models/ExchangeRequest');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Create a new skill exchange request
// @route   POST /api/exchanges
// @access  Private
const createExchangeRequest = async (req, res, next) => {
  try {
    const { receiverId, offeredSkill, wantedSkill, message } = req.body;

    if (!receiverId || !offeredSkill || !wantedSkill) {
      return errorResponse(res, 400, 'Receiver, offered skill, and wanted skill are required.');
    }

    if (receiverId.toString() === req.user._id.toString()) {
      return errorResponse(res, 400, 'You cannot send an exchange request to yourself.');
    }

    const receiverUser = await User.findById(receiverId);
    if (!receiverUser || !receiverUser.isActive) {
      return errorResponse(res, 404, 'Receiver user profile not found.');
    }

    // Check if duplicate pending request already exists
    const existingRequest = await ExchangeRequest.findOne({
      sender: req.user._id,
      receiver: receiverId,
      status: { $in: ['Pending', 'Accepted', 'In Progress'] },
    });

    if (existingRequest) {
      return errorResponse(
        res,
        400,
        `An active exchange request with ${receiverUser.name} already exists.`
      );
    }

    const exchange = await ExchangeRequest.create({
      sender: req.user._id,
      receiver: receiverId,
      offeredSkill,
      wantedSkill,
      message: message || `Hi ${receiverUser.name}, I would love to exchange ${offeredSkill} for ${wantedSkill}!`,
    });

    const populated = await ExchangeRequest.findById(exchange._id)
      .populate('sender', 'name email avatar location averageRating')
      .populate('receiver', 'name email avatar location averageRating');

    return successResponse(res, 201, 'Exchange request sent successfully', populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's exchange requests (Sent & Received)
// @route   GET /api/exchanges
// @access  Private
const getUserExchangeRequests = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const requests = await ExchangeRequest.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate('sender', 'name email avatar location averageRating experienceLevel')
      .populate('receiver', 'name email avatar location averageRating experienceLevel')
      .sort({ updatedAt: -1 });

    const received = requests.filter((r) => r.receiver._id.toString() === userId.toString());
    const sent = requests.filter((r) => r.sender._id.toString() === userId.toString());

    return successResponse(res, 200, 'Exchange requests fetched', {
      all: requests,
      received,
      sent,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update exchange request status (Accept, Reject, Complete, Cancel)
// @route   PUT /api/exchanges/:id/status
// @access  Private
const updateExchangeStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Accepted', 'Rejected', 'In Progress', 'Completed', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return errorResponse(res, 400, 'Invalid exchange status.');
    }

    const exchange = await ExchangeRequest.findById(req.params.id);

    if (!exchange) {
      return errorResponse(res, 404, 'Exchange request not found.');
    }

    const userId = req.user._id.toString();
    const isSender = exchange.sender.toString() === userId;
    const isReceiver = exchange.receiver.toString() === userId;

    if (!isSender && !isReceiver && req.user.role !== 'admin') {
      return errorResponse(res, 403, 'Not authorized to modify this exchange request.');
    }

    const previousStatus = exchange.status;
    exchange.status = status;
    await exchange.save();

    // If status changed to Completed, increment completedExchanges count
    if (status === 'Completed' && previousStatus !== 'Completed') {
      await User.findByIdAndUpdate(exchange.sender, { $inc: { completedExchanges: 1 } });
      await User.findByIdAndUpdate(exchange.receiver, { $inc: { completedExchanges: 1 } });
    }

    const updated = await ExchangeRequest.findById(exchange._id)
      .populate('sender', 'name email avatar location averageRating')
      .populate('receiver', 'name email avatar location averageRating');

    return successResponse(res, 200, `Exchange request marked as ${status}`, updated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createExchangeRequest,
  getUserExchangeRequests,
  updateExchangeStatus,
};
