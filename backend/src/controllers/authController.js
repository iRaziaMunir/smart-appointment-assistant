const authService = require('../services/authService');
const { serializeUserRecord } = require('../utils/serializers');

async function registerUser(req, res) {
  const { email, password, fullName } = req.body;
  const authResult = await authService.registerUser({ email, password, fullName });

  res.status(201).json({
    token: authResult.accessToken,
    user: serializeUserRecord(authResult.user),
  });
}

async function loginUser(req, res) {
  const { email, password } = req.body;
  const authResult = await authService.loginUser({ email, password });

  res.json({
    token: authResult.accessToken,
    user: serializeUserRecord(authResult.user),
  });
}

async function getCurrentUser(req, res) {
  const userProfile = await authService.getAuthenticatedUserProfile(req.authenticatedUser.id);
  res.json({ user: serializeUserRecord(userProfile) });
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
};
