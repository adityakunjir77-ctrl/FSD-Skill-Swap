const mongoose = require('mongoose');
const { isDemoDataEnabled, DEMO_ADMIN_EMAIL } = require('./env');

let mongoMemoryServerInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skillswap';

  try {
    // Attempt connecting to configured URI (Local MongoDB or Atlas)
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);

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
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServerInstance = await MongoMemoryServer.create();
      const embeddedUri = mongoMemoryServerInstance.getUri();

      const conn = await mongoose.connect(embeddedUri);
      console.log(`[MongoDB] Embedded in-memory MongoDB online: ${conn.connection.host}`);

      // Auto-seed demo dataset into memory instance
      const seedDatabase = require('../seed');
      await seedDatabase(true);

      // Clean shutdown handler
      process.on('SIGINT', async () => {
        if (mongoMemoryServerInstance) {
          await mongoMemoryServerInstance.stop();
        }
        process.exit(0);
      });
    } catch (memErr) {
      console.error('[MongoDB] Fatal error initializing embedded database:', memErr.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
