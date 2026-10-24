const User = require('../models/User');

/**
 * Normalizes skill names for fuzzy / keyphrase comparison
 */
const normalize = (str) => {
  if (!str) return '';
  return str.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
};

/**
 * Checks if two skill objects/strings match (exact or keyphrase substring)
 */
const isSkillMatch = (skillA, skillB) => {
  const nameA = typeof skillA === 'object' ? skillA.name : skillA;
  const nameB = typeof skillB === 'object' ? skillB.name : skillB;

  const normA = normalize(nameA);
  const normB = normalize(nameB);

  if (!normA || !normB) return false;

  return normA === normB || normA.includes(normB) || normB.includes(normA);
};

/**
 * Calculate compatibility between current user (userA) and potential partner (userB)
 */
const calculateMatchScore = (userA, userB) => {
  const offersA = userA.skillsOffered || [];
  const wantedA = userA.skillsWanted || [];

  const offersB = userB.skillsOffered || [];
  const wantedB = userB.skillsWanted || [];

  // Skills User A can teach User B (A offers, B wants)
  const youCanTeach = [];
  offersA.forEach((skA) => {
    const matchedB = wantedB.find((skB) => isSkillMatch(skA, skB));
    if (matchedB) {
      const nameA = typeof skA === 'object' ? skA.name : skA;
      if (!youCanTeach.includes(nameA)) {
        youCanTeach.push(nameA);
      }
    }
  });

  // Skills User B can teach User A (B offers, A wants)
  const theyCanTeach = [];
  offersB.forEach((skB) => {
    const matchedA = wantedA.find((skA) => isSkillMatch(skB, skA));
    if (matchedA) {
      const nameB = typeof skB === 'object' ? skB.name : skB;
      if (!theyCanTeach.includes(nameB)) {
        theyCanTeach.push(nameB);
      }
    }
  });

  // Calculate Score
  let score = 0;
  const teachCount = youCanTeach.length;
  const learnCount = theyCanTeach.length;

  if (teachCount > 0 && learnCount > 0) {
    // High Reciprocal 2-Way Match!
    score = 70 + Math.min(30, (teachCount + learnCount - 2) * 10);
  } else if (teachCount > 0 || learnCount > 0) {
    // 1-Way Partial Match
    score = 40 + Math.min(25, (teachCount + learnCount - 1) * 10);
  } else {
    // Base potential match if categories overlap
    score = 15;
  }

  return {
    score: Math.min(100, Math.max(10, Math.round(score))),
    youCanTeach,
    theyCanTeach,
    isReciprocal: teachCount > 0 && learnCount > 0,
  };
};

/**
 * Get all recommended user matches for a given user ID
 */
const getMatchesForUser = async (currentUserId) => {
  const currentUser = await User.findById(currentUserId)
    .populate('skillsOffered')
    .populate('skillsWanted');

  if (!currentUser) return [];

  // Find all other active users
  const candidates = await User.find({
    _id: { $ne: currentUserId },
    isActive: true,
  })
    .select('-password')
    .populate('skillsOffered')
    .populate('skillsWanted');

  const matches = candidates.map((candidate) => {
    const matchData = calculateMatchScore(currentUser, candidate);
    return {
      user: candidate,
      score: matchData.score,
      youCanTeach: matchData.youCanTeach,
      theyCanTeach: matchData.theyCanTeach,
      isReciprocal: matchData.isReciprocal,
    };
  });

  // Sort by highest compatibility score first
  return matches.sort((a, b) => b.score - a.score);
};

module.exports = {
  calculateMatchScore,
  getMatchesForUser,
};
