const User = require('../models/User');
const Skill = require('../models/Skill');
const { PUBLIC_PROFILE_FIELDS } = require('../utils/userFields');

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

// Matching used to load and score every active user on each request. It now
// scores only users who share a related skill, with hard caps on every step.
const MATCH_DEFAULT_LIMIT = 20;
const MATCH_MAX_LIMIT = 50;
const MATCH_CANDIDATE_CAP = 500;
const MATCH_RELATED_SKILL_CAP = 500;
const MATCH_QUERY_TIMEOUT_MS = 2000;
const CATALOG_CACHE_MS = 60 * 1000;

// Skill names change rarely, so the catalog used to expand fuzzy matches is
// read at most once a minute per process instead of once per request.
let catalogCache = { loadedAt: 0, skills: [] };
let catalogLoading = null;

const loadSkillCatalog = async () => {
  if (Date.now() - catalogCache.loadedAt < CATALOG_CACHE_MS) return catalogCache.skills;

  if (!catalogLoading) {
    catalogLoading = Skill.find({}, 'name')
      .lean()
      .maxTimeMS(MATCH_QUERY_TIMEOUT_MS)
      .then((rows) => {
        catalogCache = {
          loadedAt: Date.now(),
          skills: rows.map((row) => ({ id: row._id, norm: normalize(row.name) })).filter((s) => s.norm),
        };
        return catalogCache.skills;
      })
      .finally(() => {
        catalogLoading = null;
      });
  }

  return catalogLoading;
};

// Catalog skills that isSkillMatch would pair with any of `skills`, so the
// candidate query keeps the fuzzy behaviour ("React" also finds "React.js").
const relatedSkillIds = (skills, catalog) => {
  const names = skills.map((skill) => normalize(typeof skill === 'object' ? skill?.name : skill)).filter(Boolean);
  if (!names.length) return [];

  const ids = [];
  for (const entry of catalog) {
    if (names.some((name) => name === entry.norm || name.includes(entry.norm) || entry.norm.includes(name))) {
      ids.push(entry.id);
      if (ids.length >= MATCH_RELATED_SKILL_CAP) break;
    }
  }
  return ids;
};

/**
 * Get the best recommended matches for a given user ID.
 * Returns at most `limit` matches and examines at most MATCH_CANDIDATE_CAP users.
 */
const getMatchesForUser = async (currentUserId, { limit: rawLimit } = {}) => {
  const limit = Math.min(Math.max(Number.parseInt(rawLimit, 10) || MATCH_DEFAULT_LIMIT, 1), MATCH_MAX_LIMIT);
  const empty = { matches: [], meta: { limit, candidatesConsidered: 0, candidateCapReached: false } };

  const currentUser = await User.findById(currentUserId)
    .populate('skillsOffered')
    .populate('skillsWanted');

  if (!currentUser) return empty;

  const catalog = await loadSkillCatalog();
  const canTeachIds = relatedSkillIds(currentUser.skillsOffered || [], catalog);
  const wantsIds = relatedSkillIds(currentUser.skillsWanted || [], catalog);

  const overlap = [];
  if (canTeachIds.length) overlap.push({ skillsWanted: { $in: canTeachIds } });
  if (wantsIds.length) overlap.push({ skillsOffered: { $in: wantsIds } });
  if (!overlap.length) return empty;

  // Only users who could teach or learn something from this user
  const candidates = await User.find({
    _id: { $ne: currentUserId },
    isActive: true,
    role: 'user',
    $or: overlap,
  })
    .select(PUBLIC_PROFILE_FIELDS)
    .populate('skillsOffered')
    .populate('skillsWanted')
    .sort({ _id: -1 })
    .limit(MATCH_CANDIDATE_CAP)
    .maxTimeMS(MATCH_QUERY_TIMEOUT_MS);

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

  // Highest compatibility first; ties go to the newer account so order is stable
  matches.sort((a, b) => b.score - a.score || (b.user._id.toString() > a.user._id.toString() ? 1 : -1));

  return {
    matches: matches.slice(0, limit),
    meta: {
      limit,
      candidatesConsidered: candidates.length,
      // When reached, results are the best of the newest MATCH_CANDIDATE_CAP
      // overlapping users, not a ranking of everyone.
      candidateCapReached: candidates.length === MATCH_CANDIDATE_CAP,
    },
  };
};

module.exports = {
  calculateMatchScore,
  getMatchesForUser,
  relatedSkillIds,
  MATCH_CANDIDATE_CAP,
  MATCH_MAX_LIMIT,
};
