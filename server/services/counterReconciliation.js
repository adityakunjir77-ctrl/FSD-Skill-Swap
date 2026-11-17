const User = require('../models/User');
const Review = require('../models/Review');
const ExchangeRequest = require('../models/ExchangeRequest');

// Rating and completion counters on User are derived from Review and
// ExchangeRequest. They are updated atomically as things happen; this job
// recomputes them from the source records to repair any drift, for example
// writes made without transaction support, imports, or data from before
// ratingSum existed.

const BATCH_SIZE = 500;
const DEFAULT_AVERAGE_RATING = 5.0; // matches the User schema default
const RECONCILE_INTERVAL_MS = 24 * 60 * 60 * 1000;

const counterFields = 'ratingSum totalReviews averageRating completedExchanges';

const reconcileBatch = async (users) => {
  const ids = users.map((u) => u._id);

  const [ratings, completions] = await Promise.all([
    Review.aggregate([
      { $match: { reviewee: { $in: ids } } },
      { $group: { _id: '$reviewee', sum: { $sum: '$rating' }, count: { $sum: 1 } } },
      // Rounded by MongoDB, the same way the live review update rounds
      { $set: { average: { $round: [{ $divide: ['$sum', '$count'] }, 1] } } },
    ]),
    ExchangeRequest.aggregate([
      { $match: { status: 'Completed', $or: [{ sender: { $in: ids } }, { receiver: { $in: ids } }] } },
      { $project: { party: { $setUnion: [['$sender', '$receiver']] } } },
      { $unwind: '$party' },
      { $match: { party: { $in: ids } } },
      { $group: { _id: '$party', count: { $sum: 1 } } },
    ]),
  ]);

  const ratingFor = new Map(ratings.map((r) => [r._id.toString(), r]));
  const completedFor = new Map(completions.map((c) => [c._id.toString(), c.count]));

  const operations = [];
  for (const user of users) {
    const rating = ratingFor.get(user._id.toString());
    const expected = {
      ratingSum: rating ? rating.sum : 0,
      totalReviews: rating ? rating.count : 0,
      averageRating: rating ? rating.average : DEFAULT_AVERAGE_RATING,
      completedExchanges: completedFor.get(user._id.toString()) || 0,
    };

    const drifted = Object.keys(expected).some((key) => user[key] !== expected[key]);
    if (!drifted) continue;

    // Only overwrite counters that still hold the values read above. A review
    // or completion committed in the meantime changes them, the write is
    // skipped, and the next run picks the user up again.
    operations.push({
      updateOne: {
        filter: {
          _id: user._id,
          ratingSum: user.ratingSum ?? null,
          totalReviews: user.totalReviews ?? null,
          completedExchanges: user.completedExchanges ?? null,
        },
        update: { $set: expected },
      },
    });
  }

  if (!operations.length) return 0;
  const result = await User.bulkWrite(operations, { ordered: false });
  return result.modifiedCount;
};

const reconcileCounters = async () => {
  let checked = 0;
  let fixed = 0;
  let lastId = null;

  for (;;) {
    const users = await User.find(lastId ? { _id: { $gt: lastId } } : {})
      .select(counterFields)
      .sort({ _id: 1 })
      .limit(BATCH_SIZE)
      .lean();

    if (!users.length) break;
    lastId = users[users.length - 1]._id;
    checked += users.length;
    fixed += await reconcileBatch(users);
  }

  return { checked, fixed };
};

const runReconciliation = async () => {
  try {
    const { checked, fixed } = await reconcileCounters();
    if (fixed > 0) console.log(`[Counters] Reconciled ${fixed} of ${checked} user counters.`);
  } catch (error) {
    console.error('[Counters] Reconciliation failed:', error.message);
  }
};

// Runs once after startup, then daily. Each process runs its own schedule;
// the conditional writes make overlapping runs harmless.
const startCounterReconciliation = () => {
  runReconciliation();
  setInterval(runReconciliation, RECONCILE_INTERVAL_MS).unref();
};

module.exports = { reconcileCounters, startCounterReconciliation };
