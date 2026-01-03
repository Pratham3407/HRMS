const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_in_production',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

module.exports = generateToken;

