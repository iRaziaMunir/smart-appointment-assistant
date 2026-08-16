const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const validateRequest = require('../middleware/validateRequest');
const authenticateRequest = require('../middleware/authenticate');
const { authenticationRateLimiter } = require('../middleware/rateLimiter');
const authController = require('../controllers/authController');
const {
  registerValidationRules,
  loginValidationRules,
} = require('../validations/authValidations');

const authRouter = express.Router();

authRouter.post(
  '/register',
  authenticationRateLimiter,
  registerValidationRules,
  validateRequest,
  asyncHandler(authController.registerUser)
);

authRouter.post(
  '/login',
  authenticationRateLimiter,
  loginValidationRules,
  validateRequest,
  asyncHandler(authController.loginUser)
);

authRouter.get('/me', authenticateRequest, asyncHandler(authController.getCurrentUser));

module.exports = authRouter;
