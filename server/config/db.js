const mongoose = require('mongoose');

let mongoMemoryServerInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skillswap';

  try {
    // Attempt connecting to configured URI (Local MongoDB or Atlas)
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);

    // If database is empty, automatically seed initial demo data
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[MongoDB] Empty database detected. Auto-seeding initial demo records...');
      const seedDatabase = require('../seed');
      await seedDatabase(false);
    }
  } catch (error) {
    console.warn(`[MongoDB] Primary connection to ${uri} failed: ${error.message}`);
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
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    }
  }
};

module.exports = connectDB;
