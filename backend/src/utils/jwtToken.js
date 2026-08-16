const jwt = require('jsonwebtoken');
const config = require('../config/environment');

function generateAccessToken(userRecord) {
  return jwt.sign(
    { userId: userRecord.id, email: userRecord.email },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

module.exports = {
  generateAccessToken,
};
