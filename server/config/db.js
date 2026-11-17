const mongoose = require('mongoose');
const { isDemoDataEnabled, DEMO_ADMIN_EMAIL, getMongoOptions } = require('./env');
const { detectTransactionSupport } = require('../utils/transactions');

let mongoMemoryServerInstance = null;

// With automatic index builds off, unique indexes (one account per email, one
// review per exchange, one notification per outbox event) exist only after
// `npm run db:indexes`. Say so loudly at startup if any are missing.
const warnAboutMissingIndexes = async () => {
  if (mongoose.get('autoIndex') !== false && mongoose.connection.config?.autoIndex !== false) return;

  const missing = [];
  for (const name of mongoose.modelNames()) {
    try {
      const { toCreate } = await mongoose.model(name).diffIndexes();
      if (toCreate.length) missing.push(`${name} (${toCreate.length})`);
    } catch (error) {
      missing.push(`${name} (could not check: ${error.message})`);
    }
  }

  if (missing.length) {
    console.error(
      `[MongoDB] Missing indexes on ${missing.join(', ')}. Unique constraints and query performance depend on them. ` +
        'Run "npm run db:indexes" in server/.'
    );
  }
};

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skillswap';

  try {
    // Attempt connecting to configured URI (Local MongoDB or Atlas)
    const conn = await mongoose.connect(uri, getMongoOptions());
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    await detectTransactionSupport();
    await warnAboutMissingIndexes();

    // If demo data is enabled and the database is empty, seed initial demo data
    if (isDemoDataEnabled()) {
      const User = require('../models/User');
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('[MongoDB] Empty database detected. Auto-seeding initial demo records...');
        const seedDatabase = require('../seed');
        await seedDatabase(false);
      }
    } else {
      // Older versions seeded this account everywhere. Its password is public, so
      // login refuses it outside demo mode; the row itself should be deleted.
      const User = require('../models/User');
      if (await User.exists({ email: DEMO_ADMIN_EMAIL })) {
        console.error(
          `[Security] This database contains the demo admin ${DEMO_ADMIN_EMAIL}, whose password is published. ` +
            'Sign-in is blocked for it while demo data is off. Delete it and any other seeded demo accounts.'
        );
      }
    }
  } catch (error) {
    console.warn(`[MongoDB] Primary connection failed: ${error.message}`);

    // The embedded database is demo-only, so never swap it in for a real one
    if (!isDemoDataEnabled()) {
      console.error('[MongoDB] Fatal: no database available. Set ENABLE_DEMO_DATA=true to use the embedded development database.');
      process.exit(1);
    }

    console.log('[MongoDB] Starting built-in embedded in-memory MongoDB engine...');

    try {
      // A one-node replica set, so transactions behave as they do in production
      const { MongoMemoryReplSet } = require('mongodb-memory-server');
      mongoMemoryServerInstance = await MongoMemoryReplSet.create({
        replSet: { count: 1, storageEngine: 'wiredTiger' },
      });
      const embeddedUri = mongoMemoryServerInstance.getUri();

      const conn = await mongoose.connect(embeddedUri, getMongoOptions());
      console.log(`[MongoDB] Embedded in-memory MongoDB online: ${conn.connection.host}`);
      await detectTransactionSupport();

      // Auto-seed demo dataset into memory instance
      const seedDatabase = require('../seed');
      await seedDatabase(true);
    } catch (memErr) {
      console.error('[MongoDB] Fatal error initializing embedded database:', memErr.message);
      process.exit(1);
    }
  }
};

// Closes the database connection, and the embedded server if one was started.
// Called during graceful shutdown in server.js.
const closeDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServerInstance) {
    await mongoMemoryServerInstance.stop();
    mongoMemoryServerInstance = null;
  }
};

module.exports = connectDB;
module.exports.closeDB = closeDB;
