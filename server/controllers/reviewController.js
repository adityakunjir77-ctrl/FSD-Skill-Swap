const Review = require('../models/Review');
const ExchangeRequest = require('../models/ExchangeRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Submit a rating and review for a completed exchange
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res, next) => {
  try {
    const { exchangeId, rating, feedback } = req.body;
    const reviewerId = req.user._id;

    if (!exchangeId || !rating || !feedback) {
      return errorResponse(res, 400, 'Exchange ID, rating (1-5), and feedback are required.');
    }

    const exchange = await ExchangeRequest.findById(exchangeId);
    if (!exchange) {
      return errorResponse(res, 404, 'Exchange request not found.');
    }

    const isSender = exchange.sender.toString() === reviewerId.toString();
    const isReceiver = exchange.receiver.toString() === reviewerId.toString();

    if (!isSender && !isReceiver) {
      return errorResponse(res, 403, 'You were not a participant in this exchange.');
    }

    const revieweeId = isSender ? exchange.receiver : exchange.sender;

    // Check if review already exists
    const existingReview = await Review.findOne({
      exchange: exchangeId,
      reviewer: reviewerId,
    });

    if (existingReview) {
      return errorResponse(res, 400, 'You have already submitted a review for this exchange.');
    }

    const review = await Review.create({
      exchange: exchangeId,
      reviewer: reviewerId,
      reviewee: revieweeId,
      rating: Number(rating),
      feedback: feedback.trim(),
    });

    // Recalculate average rating & total reviews for reviewee
    const allReviews = await Review.find({ reviewee: revieweeId });
    const totalReviews = allReviews.length;
    const averageRating =
      allReviews.reduce((acc, r) => acc + r.rating, 0) / (totalReviews || 1);

    await User.findByIdAndUpdate(revieweeId, {
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews,
    });

    // Create Notification
    await Notification.create({
      recipient: revieweeId,
      sender: reviewerId,
      type: 'review_added',
      title: 'New Rating & Review Received',
      message: `${req.user.name} rated your exchange ${rating} stars: "${feedback.trim().slice(0, 40)}..."`,
      link: '/profile',
    });

    const populated = await Review.findById(review._id)
      .populate('reviewer', 'name avatar')
      .populate('reviewee', 'name avatar');

    return successResponse(res, 201, 'Review submitted successfully', populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews received by a specific user
// @route   GET /api/reviews/user/:userId
// @access  Public
const getUserReviews = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const reviews = await Review.find({ reviewee: userId })
      .populate('reviewer', 'name email avatar location')
      .populate('exchange', 'offeredSkill wantedSkill')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'User reviews retrieved', reviews);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getUserReviews,
};
