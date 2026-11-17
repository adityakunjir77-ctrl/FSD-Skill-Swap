const { getMatchesForUser } = require('../services/matchingService');
const { successResponse } = require('../utils/apiResponse');

// @desc    Get recommended matches for logged-in user
// @route   GET /api/matches
// @access  Private
const getRecommendedMatches = async (req, res, next) => {
  try {
    const { matches, meta } = await getMatchesForUser(req.user._id, { limit: req.query.limit });
    return successResponse(res, 200, 'Recommended skill matches retrieved', matches, { meta });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendedMatches,
};
