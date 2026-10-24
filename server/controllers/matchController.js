const { getMatchesForUser } = require('../services/matchingService');
const { successResponse } = require('../utils/apiResponse');

// @desc    Get recommended matches for logged-in user
// @route   GET /api/matches
// @access  Private
const getRecommendedMatches = async (req, res, next) => {
  try {
    const matches = await getMatchesForUser(req.user._id);
    return successResponse(res, 200, 'Recommended skill matches retrieved', matches);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendedMatches,
};
