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
// need an explicit opt-in and are never available in production.
const isDemoDataEnabled = () =>
  process.env.NODE_ENV !== 'production' && process.env.ENABLE_DEMO_DATA === 'true';

module.exports = { getJwtSecret, isDemoDataEnabled };
