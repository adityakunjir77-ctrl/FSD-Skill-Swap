const Review = require('../models/Review');
const ExchangeRequest = require('../models/ExchangeRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { runInTransaction } = require('../utils/transactions');

const MAX_PUBLIC_REVIEWS = 100;

// Adds one rating to the running sum and count, then derives the average, all
// in a single update. Accounts saved before ratingSum existed start from the
// stored average times count until the reconciliation job sets exact values.
const addRatingUpdate = (stars) => [
  {
    $set: {
      ratingSum: {
        $add: [
          { $ifNull: ['$ratingSum', { $multiply: ['$averageRating', '$totalReviews'] }] },
          stars,
        ],
      },
      totalReviews: { $add: [{ $ifNull: ['$totalReviews', 0] }, 1] },
    },
  },
  { $set: { averageRating: { $round: [{ $divide: ['$ratingSum', '$totalReviews'] }, 1] } } },
];

// @desc    Submit a rating and review for a completed exchange
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res, next) => {
  try {
    const { exchangeId, rating, feedback } = req.body;
    const reviewerId = req.user._id;

    const stars = Number(rating);

    if (!exchangeId || !Number.isInteger(stars) || stars < 1 || stars > 5 || typeof feedback !== 'string' || !feedback.trim()) {
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

    if (exchange.status !== 'Completed') {
      return errorResponse(res, 409, 'Reviews can only be left once an exchange is completed.');
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

    // The review and the reviewee's rating counters commit together, so a crash
    // or retry cannot leave one without the other. The unique (exchange,
    // reviewer) index rejects a concurrent duplicate and aborts the transaction.
    const review = await runInTransaction(async (session) => {
      const [created] = await Review.create(
        [
          {
            exchange: exchange._id,
            reviewer: reviewerId,
            reviewee: revieweeId,
            rating: stars,
            feedback: feedback.trim(),
          },
        ],
        { session }
      );

      await User.updateOne({ _id: revieweeId }, addRatingUpdate(stars), { session });
      return created;
    });

    // Create Notification
    await Notification.create({
      recipient: revieweeId,
      sender: reviewerId,
      type: 'review_added',
      title: 'New Rating & Review Received',
      message: `${req.user.name} rated your exchange ${stars} stars: "${feedback.trim().slice(0, 40)}..."`,
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
      .populate('reviewer', 'name avatar location')
      .populate('exchange', 'offeredSkill wantedSkill')
      .sort({ createdAt: -1 })
      .limit(MAX_PUBLIC_REVIEWS);

    return successResponse(res, 200, 'User reviews retrieved', reviews);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getUserReviews,
};
