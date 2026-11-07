const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../config/env');

const JWT_ALGORITHM = 'HS256';

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, getJwtSecret(), {
    algorithm: JWT_ALGORITHM,
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, getJwtSecret(), { algorithms: [JWT_ALGORITHM] });
};

module.exports = generateToken;
module.exports.verifyToken = verifyToken;
