const mongoose = require('mongoose');

// MongoDB transactions need a replica set or sharded cluster. Production should
// run one (see SkillSwap_Scalability_and_Multi_Tenancy_Plan). A standalone
// local mongod cannot, so writes there fall back to running one after another,
// and the counter reconciliation job repairs any drift a crash leaves behind.
let transactionsSupported = false;
let warnedFallback = false;

const detectTransactionSupport = async () => {
  try {
    const hello = await mongoose.connection.db.admin().command({ hello: 1 });
    transactionsSupported = Boolean(hello.setName) || hello.msg === 'isdbgrid';
  } catch (error) {
    transactionsSupported = false;
  }

  if (!transactionsSupported) {
    console.warn(
      '[MongoDB] Transactions unavailable: this server is not a replica set. Related writes will not be atomic.'
    );
  }

  return transactionsSupported;
};

// Runs `work(session)` inside a transaction, retrying on transient errors as the
// driver recommends. `work` may run more than once, so it must only write to the
// database through `session`. Without transaction support, `session` is null.
const runInTransaction = async (work) => {
  if (!transactionsSupported) {
    if (!warnedFallback && process.env.NODE_ENV === 'production') {
      console.error('[MongoDB] Running a multi-document write without a transaction in production.');
      warnedFallback = true;
    }
    return work(null);
  }

  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await work(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
};

module.exports = { detectTransactionSupport, runInTransaction };
