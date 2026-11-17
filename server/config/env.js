// Published in earlier versions of the README and .env examples, so anyone can
// forge tokens signed with it. It stays here only so it can be refused.
const PUBLIC_JWT_SECRETS = ['skillswap_super_secret_jwt_key_2026_academic_project'];
const MIN_JWT_SECRET_LENGTH = 32;

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < MIN_JWT_SECRET_LENGTH || PUBLIC_JWT_SECRETS.includes(secret)) {
    throw new Error(
      `JWT_SECRET must be a private random value of at least ${MIN_JWT_SECRET_LENGTH} characters. ` +
        `Generate one with: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
    );
  }

  return secret;
};

// Demo accounts have published passwords, so seeding and the embedded database
// need an explicit opt-in, and only in an environment named as local. Anything
// else, including an unset or misspelled NODE_ENV, counts as a real deployment.
const DEMO_ENVIRONMENTS = ['development', 'test'];

const isDemoDataEnabled = () =>
  DEMO_ENVIRONMENTS.includes(process.env.NODE_ENV) && process.env.ENABLE_DEMO_DATA === 'true';

// Seeded accounts that a real database must never contain.
const DEMO_ADMIN_EMAIL = 'admin@skillswap.com';

// Express trusts this many proxy hops when it reads the client IP from
// X-Forwarded-For. Too high lets clients spoof their IP and dodge rate limits,
// so anything other than a whole number is refused rather than guessed at.
const getTrustProxy = () => {
  const raw = (process.env.TRUST_PROXY || '').trim();
  if (raw === '') return false;

  if (!/^\d+$/.test(raw) || Number(raw) > 10) {
    throw new Error(
      `TRUST_PROXY must be the number of reverse proxies in front of the app (0-10), got "${raw}".`
    );
  }

  return Number(raw) || false;
};

const isLocalEnvironment = () => DEMO_ENVIRONMENTS.includes(process.env.NODE_ENV);

const intFromEnv = (name, defaultValue, min, max) => {
  const raw = (process.env[name] || '').trim();
  if (raw === '') return defaultValue;
  if (!/^\d+$/.test(raw) || Number(raw) < min || Number(raw) > max) {
    throw new Error(`${name} must be a whole number from ${min} to ${max}, got "${raw}".`);
  }
  return Number(raw);
};

const boolFromEnv = (name, defaultValue) => {
  const raw = (process.env[name] || '').trim().toLowerCase();
  if (raw === '') return defaultValue;
  if (raw !== 'true' && raw !== 'false') throw new Error(`${name} must be true or false, got "${raw}".`);
  return raw === 'true';
};

// MongoDB driver settings. Each server process opens up to maxPoolSize
// connections, so size it as (database connection limit / number of
// processes) with headroom. Local runs fail over to the embedded database
// quickly; deployments wait longer for a replica set election.
const getMongoOptions = () => {
  const local = isLocalEnvironment();
  const options = {
    maxPoolSize: intFromEnv('MONGO_MAX_POOL_SIZE', 20, 1, 500),
    minPoolSize: intFromEnv('MONGO_MIN_POOL_SIZE', 0, 0, 500),
    serverSelectionTimeoutMS: intFromEnv('MONGO_SERVER_SELECTION_TIMEOUT_MS', local ? 2500 : 10000, 500, 120000),
    socketTimeoutMS: intFromEnv('MONGO_SOCKET_TIMEOUT_MS', 45000, 1000, 600000),
    waitQueueTimeoutMS: intFromEnv('MONGO_WAIT_QUEUE_TIMEOUT_MS', 10000, 100, 120000),
    // Deployments build indexes with `npm run db:indexes` before release
    // rather than on every startup, where a large build would block the app
    autoIndex: boolFromEnv('MONGO_AUTO_INDEX', local),
  };

  if (options.minPoolSize > options.maxPoolSize) {
    throw new Error('MONGO_MIN_POOL_SIZE cannot be larger than MONGO_MAX_POOL_SIZE.');
  }

  return options;
};

module.exports = {
  getJwtSecret,
  isDemoDataEnabled,
  DEMO_ADMIN_EMAIL,
  getTrustProxy,
  getMongoOptions,
  isLocalEnvironment,
};
