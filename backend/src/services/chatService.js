const db = require('../config/database');
const chatRepository = require('../repositories/chatRepository');
const { processConversationMessage } = require('./ai/conversationService');

async function createChatSession(userId) {
  return chatRepository.createSession(userId);
}

async function getChatSessionMessages(userId, sessionId) {
  const chatSession = await chatRepository.findSessionForUser(sessionId, userId);
  if (!chatSession) {
    const error = new Error('Session not found');
    error.statusCode = 404;
    throw error;
  }

  const chatMessages = await chatRepository.findMessagesBySessionId(sessionId);
  return {
    chatSession,
    chatMessages,
  };
}

async function sendChatMessage(userId, sessionId, messageText) {
  const chatSession = await chatRepository.findSessionForUser(sessionId, userId);
  if (!chatSession) {
    const error = new Error('Session not found');
    error.statusCode = 404;
    throw error;
  }

  const currentBookingState = chatSession.bookingState || {};

  return db.withTransaction(async (transactionClient) => {
    await chatRepository.insertMessage(
      { sessionId, role: 'user', content: messageText },
      transactionClient
    );

    const conversationHistory = await chatRepository.findMessagesBySessionId(sessionId, transactionClient);
    const priorMessages = conversationHistory.slice(0, -1);

    const conversationResult = await processConversationMessage({
      sessionId,
      userId,
      userMessage: messageText,
      conversationHistory: priorMessages,
      currentBookingState,
    });

    await chatRepository.insertMessage(
      { sessionId, role: 'assistant', content: conversationResult.reply },
      transactionClient
    );

    await chatRepository.updateBookingState(
      sessionId,
      conversationResult.bookingState,
      transactionClient
    );

    return conversationResult;
  });
}

module.exports = {
  createChatSession,
  getChatSessionMessages,
  sendChatMessage,
};
