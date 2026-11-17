const mongoose = require('mongoose');

// A side effect (notification, live socket event) recorded in the same
// transaction as the change that caused it, then carried out by the outbox
// worker. If the process dies after the commit, the event is still here and the
// worker retries it. The event's _id is its idempotency key.
const outboxEventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['notification.create', 'chat.message'],
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'done', 'failed'],
      default: 'pending',
    },
    attempts: {
      type: Number,
      default: 0,
    },
    // Earliest time the worker may (re)try the event
    availableAt: {
      type: Date,
      default: Date.now,
    },
    // A worker that claims an event holds it until this time; if it crashes,
    // another worker reclaims the event afterwards
    lockedUntil: Date,
    lastError: String,
    processedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Worker claims: due pending events, and processing events whose lock expired
outboxEventSchema.index({ status: 1, availableAt: 1 });
outboxEventSchema.index({ status: 1, lockedUntil: 1 });
// Delivered events are kept for a week for troubleshooting, then removed
outboxEventSchema.index({ processedAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

module.exports = mongoose.model('OutboxEvent', outboxEventSchema);
