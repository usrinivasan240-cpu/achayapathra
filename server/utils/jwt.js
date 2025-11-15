const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }
  return process.env.JWT_SECRET;
};

const getExpiresIn = () => process.env.JWT_EXPIRES_IN || '1d';

const signToken = (payload, options = {}) =>
  jwt.sign(payload, getJwtSecret(), { expiresIn: getExpiresIn(), ...options });

const verifyToken = (token) => jwt.verify(token, getJwtSecret());

module.exports = {
  signToken,
  verifyToken,
};
