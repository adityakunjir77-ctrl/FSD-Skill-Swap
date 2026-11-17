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

module.exports = { getJwtSecret, isDemoDataEnabled, DEMO_ADMIN_EMAIL, getTrustProxy };
