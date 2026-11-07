const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    exchange: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExchangeRequest',
      required: true,
    },
    proposer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    topic: {
      type: String,
      required: [true, 'Session topic or skill focus is required'],
      trim: true,
      maxlength: [200, 'Session topic cannot exceed 200 characters'],
    },
    date: {
      type: String,
      required: [true, 'Session date is required'],
      maxlength: [50, 'Session date cannot exceed 50 characters'],
    },
    time: {
      type: String,
      required: [true, 'Session time is required'],
      maxlength: [50, 'Session time cannot exceed 50 characters'],
    },
    message: {
      type: String,
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: ['Proposed', 'Accepted', 'Rejected', 'Completed', 'Cancelled'],
      default: 'Proposed',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Session', sessionSchema);
