const config = require('../../config/environment');
const { AI_PROVIDERS } = require('../../constants/conversationIntents');
const aiInteractionLogRepository = require('../../repositories/aiInteractionLogRepository');
const { requestMistralCompletion, parseMistralJsonResponse } = require('./mistralProvider');
const { buildRuleBasedAssistantResponse } = require('./ruleBasedExtractor');
const {
  mergeBookingState,
  validateExtractedFields,
  getMissingRequiredFields,
  isBookingDraftComplete,
} = require('./bookingStateService');

function buildAssistantReply(modelResult, updatedBookingState, isReadyToBook) {
  let assistantReply = modelResult.reply;

  if (isReadyToBook && !/confirm/i.test(assistantReply)) {
    assistantReply = `${assistantReply} Please confirm the details in the booking form to finish.`.trim();
  }

  if (!isReadyToBook && modelResult.ready_to_book) {
    const missingRequiredFields = getMissingRequiredFields(updatedBookingState);
    if (missingRequiredFields.length) {
      assistantReply = `I still need a valid ${missingRequiredFields.join(' and ')} before we can confirm.`;
    }
  }

  return assistantReply;
}

async function processConversationMessage({
  sessionId,
  userId,
  userMessage,
  conversationHistory,
  currentBookingState,
}) {
  const conversationMessages = conversationHistory
    .filter((message) => message.role === 'user' || message.role === 'assistant')
    .map((message) => ({ role: message.role, content: message.content }));

  conversationMessages.push({ role: 'user', content: userMessage });

  let modelResult;
  let aiProvider = AI_PROVIDERS.MISTRAL;

  if (config.mistralApiKey) {
    try {
      const rawModelResponse = await requestMistralCompletion(conversationMessages, currentBookingState);
      modelResult = parseMistralJsonResponse(rawModelResponse);
    } catch (error) {
      console.error('[ConversationService] Mistral failed, using fallback:', error.message);
      modelResult = buildRuleBasedAssistantResponse(userMessage, currentBookingState);
      aiProvider = AI_PROVIDERS.RULE_BASED_FALLBACK;
    }
  } else {
    console.warn('[ConversationService] No MISTRAL_API_KEY configured, using rule-based fallback');
    modelResult = buildRuleBasedAssistantResponse(userMessage, currentBookingState);
    aiProvider = AI_PROVIDERS.RULE_BASED_FALLBACK;
  }

  const validatedExtractedFields = validateExtractedFields(modelResult.extracted);
  const updatedBookingState = mergeBookingState(currentBookingState, validatedExtractedFields);
  const isReadyToBook = isBookingDraftComplete(updatedBookingState);
  const assistantReply = buildAssistantReply(modelResult, updatedBookingState, isReadyToBook);

  await aiInteractionLogRepository.createLog({
    sessionId,
    userId,
    promptSummary: userMessage.slice(0, 500),
    responseSummary: assistantReply.slice(0, 500),
    extractedData: {
      intent: modelResult.intent,
      ...validatedExtractedFields,
      readyToBook: isReadyToBook,
    },
    provider: aiProvider,
  });

  return {
    reply: assistantReply,
    intent: modelResult.intent,
    bookingState: updatedBookingState,
    readyToBook: isReadyToBook,
    provider: aiProvider,
  };
}

module.exports = {
  processConversationMessage,
};
