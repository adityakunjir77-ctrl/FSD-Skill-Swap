const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    exchange: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExchangeRequest',
      required: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required (1 to 5 stars)'],
      min: 1,
      max: 5,
    },
    feedback: {
      type: String,
      required: [true, 'Feedback text is required'],
      trim: true,
      minlength: [5, 'Feedback must be at least 5 characters long'],
      maxlength: [1000, 'Feedback cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reviews from the same reviewer for the same exchange
reviewSchema.index({ exchange: 1, reviewer: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
