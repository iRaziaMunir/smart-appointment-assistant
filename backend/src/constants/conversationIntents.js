const CONVERSATION_INTENTS = Object.freeze({
  BOOK_APPOINTMENT: 'book_appointment',
  GREETING: 'greeting',
  IDENTITY_QUESTION: 'identity_question',
  OTHER: 'other',
});

const AI_PROVIDERS = Object.freeze({
  MISTRAL: 'mistral',
  RULE_BASED_FALLBACK: 'fallback',
});

module.exports = {
  CONVERSATION_INTENTS,
  AI_PROVIDERS,
};
