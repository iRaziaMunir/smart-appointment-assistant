const jwt = require('jsonwebtoken');
const config = require('../config/environment');

function authenticateRequest(req, res, next) {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const accessToken = authorizationHeader.split(' ')[1];

  try {
    const tokenPayload = jwt.verify(accessToken, config.jwtSecret);
    req.authenticatedUser = {
      id: tokenPayload.userId,
      email: tokenPayload.email,
    };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = authenticateRequest;
