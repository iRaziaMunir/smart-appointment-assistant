const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const validateRequest = require('../middleware/validateRequest');
const authenticateRequest = require('../middleware/authenticate');
const { chatMessageRateLimiter } = require('../middleware/rateLimiter');
const chatController = require('../controllers/chatController');
const { chatMessageValidationRules } = require('../validations/chatValidations');

const chatRouter = express.Router();

chatRouter.use(authenticateRequest);

chatRouter.post('/sessions', asyncHandler(chatController.createChatSession));

chatRouter.get('/sessions/:sessionId/messages', asyncHandler(chatController.getChatMessages));

chatRouter.post(
  '/sessions/:sessionId/messages',
  chatMessageRateLimiter,
  chatMessageValidationRules,
  validateRequest,
  asyncHandler(chatController.sendChatMessage)
);

module.exports = chatRouter;
