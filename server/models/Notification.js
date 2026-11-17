const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      enum: [
        'request_sent',
        'request_accepted',
        'request_rejected',
        'new_message',
        'session_scheduled',
        'exchange_completed',
        'review_added',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    // The outbox event that created this notification, so a retried event
    // cannot create it twice
    sourceEvent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OutboxEvent',
    },
  },
  {
    timestamps: true,
  }
);

// Recent notifications and unread count
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index(
  { sourceEvent: 1 },
  { unique: true, partialFilterExpression: { sourceEvent: { $exists: true } } }
);

module.exports = mongoose.model('Notification', notificationSchema);
