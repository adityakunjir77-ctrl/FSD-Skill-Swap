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
    },
    date: {
      type: String,
      required: [true, 'Session date is required'],
    },
    time: {
      type: String,
      required: [true, 'Session time is required'],
    },
    message: {
      type: String,
      trim: true,
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
