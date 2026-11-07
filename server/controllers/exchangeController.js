const ExchangeRequest = require('../models/ExchangeRequest');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { USER_SUMMARY_FIELDS } = require('../utils/userFields');

// Current status -> next status -> who may make that change. Statuses missing
// from the table (Rejected, Completed, Cancelled) are final.
const EXCHANGE_TRANSITIONS = {
  Pending: { Accepted: ['receiver'], Rejected: ['receiver'], Cancelled: ['sender'] },
  Accepted: { 'In Progress': ['sender', 'receiver'], Cancelled: ['sender', 'receiver'] },
  'In Progress': { Completed: ['sender', 'receiver'], Cancelled: ['sender', 'receiver'] },
};

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
      .populate('sender', USER_SUMMARY_FIELDS)
      .populate('receiver', USER_SUMMARY_FIELDS);

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

    const populatedRequests = await ExchangeRequest.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate('sender', USER_SUMMARY_FIELDS)
      .populate('receiver', USER_SUMMARY_FIELDS)
      .sort({ updatedAt: -1 });

    // Skip exchanges whose other party was deleted by an admin
    const requests = populatedRequests.filter((r) => r.sender && r.receiver);

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

    const allowedRoles = EXCHANGE_TRANSITIONS[exchange.status]?.[status];
    if (!allowedRoles) {
      return errorResponse(res, 409, `An exchange that is ${exchange.status} cannot be marked ${status}.`);
    }

    const callerRole = isSender ? 'sender' : 'receiver';
    if (req.user.role !== 'admin' && !allowedRoles.includes(callerRole)) {
      return errorResponse(res, 403, `You cannot mark this exchange ${status}.`);
    }

    // Matching on the current status means only one of several concurrent
    // requests can win, so the counters below are incremented exactly once
    const updated = await ExchangeRequest.findOneAndUpdate(
      { _id: exchange._id, status: exchange.status },
      { status },
      { new: true }
    )
      .populate('sender', USER_SUMMARY_FIELDS)
      .populate('receiver', USER_SUMMARY_FIELDS);

    if (!updated) {
      return errorResponse(res, 409, 'This exchange was just updated. Please refresh and try again.');
    }

    if (status === 'Completed') {
      await User.updateMany(
        { _id: { $in: [exchange.sender, exchange.receiver] } },
        { $inc: { completedExchanges: 1 } }
      );
    }

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
