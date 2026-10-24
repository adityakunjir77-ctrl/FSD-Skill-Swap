const Session = require('../models/Session');
const ExchangeRequest = require('../models/ExchangeRequest');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Propose/Schedule a new exchange session
// @route   POST /api/sessions
// @access  Private
const createSession = async (req, res, next) => {
  try {
    const { exchangeId, partnerId, topic, date, time, message } = req.body;

    if (!exchangeId || !partnerId || !topic || !date || !time) {
      return errorResponse(res, 400, 'Exchange ID, partner, topic, date, and time are required.');
    }

    const exchange = await ExchangeRequest.findById(exchangeId);
    if (!exchange) {
      return errorResponse(res, 404, 'Associated exchange request not found.');
    }

    const session = await Session.create({
      exchange: exchangeId,
      proposer: req.user._id,
      partner: partnerId,
      topic,
      date,
      time,
      message: message || '',
    });

    const populated = await Session.findById(session._id)
      .populate('proposer', 'name email avatar')
      .populate('partner', 'name email avatar')
      .populate('exchange');

    return successResponse(res, 201, 'Session proposed successfully', populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's scheduled sessions
// @route   GET /api/sessions
// @access  Private
const getUserSessions = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const sessions = await Session.find({
      $or: [{ proposer: userId }, { partner: userId }],
    })
      .populate('proposer', 'name email avatar location')
      .populate('partner', 'name email avatar location')
      .populate('exchange')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'Sessions retrieved successfully', sessions);
  } catch (error) {
    next(error);
  }
};

// @desc    Update session status (Accept, Reject, Complete, Cancel)
// @route   PUT /api/sessions/:id/status
// @access  Private
const updateSessionStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Accepted', 'Rejected', 'Completed', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return errorResponse(res, 400, 'Invalid session status.');
    }

    const session = await Session.findById(req.params.id);

    if (!session) {
      return errorResponse(res, 404, 'Session not found.');
    }

    session.status = status;
    await session.save();

    const updated = await Session.findById(session._id)
      .populate('proposer', 'name email avatar')
      .populate('partner', 'name email avatar')
      .populate('exchange');

    return successResponse(res, 200, `Session status updated to ${status}`, updated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSession,
  getUserSessions,
  updateSessionStatus,
};
