const User = require('../models/User');
const Skill = require('../models/Skill');
const { buildSearchTokens, normalizeName } = require('../utils/searchTokens');

// Fills the prefix-search fields on records saved before they existed. New and
// edited records get them from the model hooks; this covers the rest. It only
// touches records that lack the fields, so after the first run it does nothing.

const BATCH_SIZE = 500;

const backfill = async (model, filter, fields, compute) => {
  let updated = 0;
  let lastId = null;

  for (;;) {
    const rows = await model
      .find(lastId ? { $and: [filter, { _id: { $gt: lastId } }] } : filter)
      .select(fields)
      .sort({ _id: 1 })
      .limit(BATCH_SIZE)
      .lean();

    if (!rows.length) break;
    lastId = rows[rows.length - 1]._id;

    const result = await model.bulkWrite(
      rows.map((row) => ({ updateOne: { filter: { _id: row._id }, update: { $set: compute(row) } } })),
      { ordered: false }
    );
    updated += result.modifiedCount;
  }

  return updated;
};

const backfillSearchFields = async () => {
  const users = await backfill(User, { searchTokens: { $exists: false } }, 'name bio location', (u) => ({
    searchTokens: buildSearchTokens(u.name, u.bio, u.location),
  }));

  const skills = await backfill(
    Skill,
    { $or: [{ normalizedName: { $exists: false } }, { searchTokens: { $exists: false } }] },
    'name',
    (s) => ({ normalizedName: normalizeName(s.name), searchTokens: buildSearchTokens(s.name) })
  );

  return { users, skills };
};

// Runs once after startup, in the background
const runSearchBackfill = async () => {
  try {
    const { users, skills } = await backfillSearchFields();
    if (users || skills) console.log(`[Search] Indexed ${users} users and ${skills} skills for prefix search.`);
  } catch (error) {
    console.error('[Search] Backfill failed:', error.message);
  }
};

module.exports = { backfillSearchFields, runSearchBackfill };
