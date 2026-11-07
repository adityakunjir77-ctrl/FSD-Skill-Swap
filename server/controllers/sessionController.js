const Session = require('../models/Session');
const ExchangeRequest = require('../models/ExchangeRequest');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { USER_SUMMARY_FIELDS } = require('../utils/userFields');

const SCHEDULABLE_EXCHANGE_STATUSES = ['Accepted', 'In Progress'];

// Current status -> next status -> who may make that change
const SESSION_TRANSITIONS = {
  Proposed: { Accepted: ['partner'], Rejected: ['partner'], Cancelled: ['proposer'] },
  Accepted: { Completed: ['proposer', 'partner'], Cancelled: ['proposer', 'partner'] },
};

const populateSession = (query) =>
  query
    .populate('proposer', USER_SUMMARY_FIELDS)
    .populate('partner', USER_SUMMARY_FIELDS)
    .populate('exchange');

// @desc    Propose/Schedule a new exchange session
// @route   POST /api/sessions
// @access  Private
const createSession = async (req, res, next) => {
  try {
    const { exchangeId, topic, date, time, message } = req.body;

    if (!exchangeId || !topic || !date || !time) {
      return errorResponse(res, 400, 'Exchange ID, topic, date, and time are required.');
    }

    const exchange = await ExchangeRequest.findById(exchangeId);
    if (!exchange) {
      return errorResponse(res, 404, 'Associated exchange request not found.');
    }

    const userId = req.user._id.toString();
    const isSender = exchange.sender.toString() === userId;
    const isReceiver = exchange.receiver.toString() === userId;

    if (!isSender && !isReceiver) {
      return errorResponse(res, 403, 'Not authorized to schedule sessions for this exchange.');
    }

    if (!SCHEDULABLE_EXCHANGE_STATUSES.includes(exchange.status)) {
      return errorResponse(res, 409, 'Sessions can only be scheduled on an active exchange.');
    }

    const session = await Session.create({
      exchange: exchangeId,
      proposer: req.user._id,
      partner: isSender ? exchange.receiver : exchange.sender,
      topic,
      date,
      time,
      message: message || '',
    });

    const populated = await populateSession(Session.findById(session._id));

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

    const sessions = await populateSession(
      Session.find({ $or: [{ proposer: userId }, { partner: userId }] })
    ).sort({ createdAt: -1 });

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

    const userId = req.user._id.toString();
    const isProposer = session.proposer.toString() === userId;
    const isPartner = session.partner.toString() === userId;

    if (!isProposer && !isPartner) {
      return errorResponse(res, 403, 'Not authorized to modify this session.');
    }

    const allowedRoles = SESSION_TRANSITIONS[session.status]?.[status];
    if (!allowedRoles) {
      return errorResponse(res, 409, `A session that is ${session.status} cannot be marked ${status}.`);
    }

    if (!allowedRoles.includes(isProposer ? 'proposer' : 'partner')) {
      return errorResponse(res, 403, `You cannot mark this session ${status}.`);
    }

    // Matching on the current status makes concurrent changes safe
    const updated = await populateSession(
      Session.findOneAndUpdate(
        { _id: session._id, status: session.status },
        { status },
        { new: true }
      )
    );

    if (!updated) {
      return errorResponse(res, 409, 'This session was just updated. Please refresh and try again.');
    }

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
