// Builds the indexes declared in the Mongoose models. Deployments run this
// before releasing a new version (`npm run db:indexes`), because automatic
// index builds are off outside development: a large build at startup would
// block the app, and a failed one would go unnoticed.
//
//   npm run db:indexes            create missing indexes; report extra ones
//   npm run db:indexes -- --drop  also drop indexes no model declares
//
// Uses MONGO_URI and the same connection settings as the server.

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const { getMongoOptions } = require('../config/env');

const MODELS = ['User', 'Skill', 'ExchangeRequest', 'Session', 'Message', 'Review', 'Notification', 'OutboxEvent'];

const describe = (spec) => JSON.stringify(spec);

const syncIndexes = async ({ drop = false, log = console.log } = {}) => {
  const summary = [];

  for (const name of MODELS) {
    const model = require(path.join('..', 'models', name));
    await model.init(); // creates the collection if needed; does not build indexes when autoIndex is off
    const { toCreate, toDrop } = await model.diffIndexes();

    if (drop) {
      await model.syncIndexes(); // creates missing and drops undeclared indexes
    } else if (toCreate.length) {
      await model.createIndexes();
    }

    log(
      `[Indexes] ${name}: ${toCreate.length ? `created ${toCreate.map(describe).join(', ')}` : 'up to date'}` +
        (toDrop.length ? `; ${drop ? 'dropped' : 'not declared (kept)'}: ${toDrop.join(', ')}` : '')
    );
    summary.push({ model: name, created: toCreate.length, extra: toDrop.length, dropped: drop ? toDrop.length : 0 });
  }

  return summary;
};

if (require.main === module) {
  const drop = process.argv.includes('--drop');
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skillswap';

  (async () => {
    try {
      await mongoose.connect(uri, { ...getMongoOptions(), autoIndex: false });
      await syncIndexes({ drop });
      await mongoose.disconnect();
      process.exit(0);
    } catch (error) {
      console.error(`[Indexes] Failed: ${error.message}`);
      process.exit(1);
    }
  })();
}

module.exports = { syncIndexes, MODELS };
