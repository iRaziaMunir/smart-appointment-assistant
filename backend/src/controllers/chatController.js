const chatService = require('../services/chatService');
const {
  serializeChatSessionRecord,
  serializeChatMessageRecord,
  serializeBookingState,
} = require('../utils/serializers');

async function createChatSession(req, res) {
  const chatSession = await chatService.createChatSession(req.authenticatedUser.id);
  res.status(201).json({ session: serializeChatSessionRecord(chatSession) });
}

async function getChatMessages(req, res) {
  const { sessionId } = req.params;
  const { chatSession, chatMessages } = await chatService.getChatSessionMessages(
    req.authenticatedUser.id,
    sessionId
  );

  res.json({
    messages: chatMessages.map(serializeChatMessageRecord),
    bookingState: serializeBookingState(chatSession.bookingState),
  });
}

async function sendChatMessage(req, res) {
  const { sessionId } = req.params;
  const { message } = req.body;

  const conversationResult = await chatService.sendChatMessage(
    req.authenticatedUser.id,
    sessionId,
    message
  );

  res.json({
    reply: conversationResult.reply,
    intent: conversationResult.intent,
    bookingState: serializeBookingState(conversationResult.bookingState),
    readyToBook: conversationResult.readyToBook,
    provider: conversationResult.provider,
  });
}

module.exports = {
  createChatSession,
  getChatMessages,
  sendChatMessage,
};
