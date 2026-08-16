const { CONVERSATION_INTENTS } = require('../../constants/conversationIntents');
const {
  mergeBookingState,
  getMissingRequiredFields,
  isBookingDraftComplete,
} = require('./bookingStateService');

function getTodayAtMidnight() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function formatDateAsIso(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDaysToDate(date, dayCount) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + dayCount);
  return nextDate;
}

function isGreetingMessage(messageText) {
  return /^(hi|hello|hey|good\s*(morning|afternoon|evening)|howdy|hola)\b[.!]?$/i.test(messageText.trim());
}

function isIdentityQuestionMessage(messageText) {
  const normalizedText = messageText.toLowerCase().trim();
  return (
    /\bwho are you\b/.test(normalizedText) ||
    /\bwhat are you\b/.test(normalizedText) ||
    /\bwhat (do|can) you do\b/.test(normalizedText) ||
    /\byour name\b/.test(normalizedText)
  );
}

function extractServiceTitle(messageText) {
  const knownServices = [
    { pattern: /\bmonthly\s+checkup\b/i, title: 'Monthly Checkup' },
    { pattern: /\bgeneral\s+checkup\b/i, title: 'General Checkup' },
    { pattern: /\bcheckup\b/i, title: 'Checkup' },
    { pattern: /\bconsultation\b/i, title: 'Consultation' },
    { pattern: /\bhaircut\b/i, title: 'Haircut' },
    { pattern: /\bhair\s*cut\b/i, title: 'Haircut' },
    { pattern: /\bcleaning\b/i, title: 'Cleaning' },
    { pattern: /\bdental\b/i, title: 'Dental Visit' },
    { pattern: /\bphysical\b/i, title: 'Physical Exam' },
  ];

  for (const servicePattern of knownServices) {
    if (servicePattern.pattern.test(messageText)) return servicePattern.title;
  }

  const bookingPhraseMatch = messageText.match(
    /\b(?:book|need|want|like|schedule)\s+(?:(?:a|an|my)\s+)?([a-z][a-z\s]{1,40}?)(?:\s+(?:on|for|at|tomorrow|today|next|this|sometime|around|in|the)\b|[.!]|$)/i
  );

  if (bookingPhraseMatch) {
    const rawServiceTitle = bookingPhraseMatch[1].trim().replace(/\s+/g, ' ');
    if (
      rawServiceTitle &&
      !/^(an?|the|appointment|appointments|visit|booking|slot|time)$/i.test(rawServiceTitle)
    ) {
      return rawServiceTitle.replace(/\b\w/g, (character) => character.toUpperCase());
    }
  }

  return null;
}

function extractAppointmentDate(messageText, referenceDate = getTodayAtMidnight()) {
  const normalizedText = messageText.toLowerCase();

  const isoDateMatch = messageText.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (isoDateMatch) return isoDateMatch[1];

  if (/\btoday\b/.test(normalizedText)) return formatDateAsIso(referenceDate);
  if (/\btomorrow\b/.test(normalizedText)) return formatDateAsIso(addDaysToDate(referenceDate, 1));

  const monthNameMap = {
    january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
    july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
  };

  const namedMonthMatch = messageText.match(
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s*(\d{4}))?\b/i
  );

  if (namedMonthMatch) {
    const monthIndex = monthNameMap[namedMonthMatch[1].toLowerCase()];
    const dayOfMonth = parseInt(namedMonthMatch[2], 10);
    let year = namedMonthMatch[3] ? parseInt(namedMonthMatch[3], 10) : referenceDate.getFullYear();
    let parsedDate = new Date(year, monthIndex, dayOfMonth);
    if (!namedMonthMatch[3] && parsedDate < referenceDate) {
      parsedDate = new Date(year + 1, monthIndex, dayOfMonth);
    }
    return formatDateAsIso(parsedDate);
  }

  return null;
}

function extractStartTime(messageText) {
  const normalizedText = messageText.toLowerCase();
  if (/\bsometime\b/.test(normalizedText) && !/\d/.test(normalizedText)) {
    return null;
  }

  const twelveHourMatch = messageText.match(
    /\b(?:around\s+|about\s+|at\s+)?(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)\b/i
  );
  if (twelveHourMatch) {
    let hour = parseInt(twelveHourMatch[1], 10);
    const minute = twelveHourMatch[2] ? parseInt(twelveHourMatch[2], 10) : 0;
    const period = twelveHourMatch[3].replace(/\./g, '').toLowerCase();
    if (period.startsWith('p') && hour < 12) hour += 12;
    if (period.startsWith('a') && hour === 12) hour = 0;
    if (hour > 23 || minute > 59) return null;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }

  const twentyFourHourMatch = messageText.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (twentyFourHourMatch) {
    return `${twentyFourHourMatch[1].padStart(2, '0')}:${twentyFourHourMatch[2]}`;
  }

  return null;
}

function appearsToBeBookingIntent(messageText, currentBookingState = {}) {
  const normalizedText = messageText.toLowerCase();
  if (
    /\b(book|appointment|schedule|reserve|haircut|checkup|consultation|visit)\b/.test(normalizedText) ||
    /\b(i need|i want|i'd like|i would like)\b/.test(normalizedText)
  ) {
    return true;
  }

  if (currentBookingState.title || currentBookingState.appointment_date || currentBookingState.start_time) {
    return Boolean(
      extractAppointmentDate(messageText) ||
        extractStartTime(messageText) ||
        extractServiceTitle(messageText) ||
        /\b(tomorrow|today|am|pm|morning|afternoon|evening)\b/i.test(messageText)
    );
  }

  return false;
}

function buildRuleBasedAssistantResponse(userMessage, currentBookingState = {}) {
  const trimmedMessage = userMessage.trim();
  const extractedFields = {
    title: null,
    appointment_date: null,
    start_time: null,
    description: null,
  };

  if (isGreetingMessage(trimmedMessage) && !appearsToBeBookingIntent(trimmedMessage, currentBookingState)) {
    return {
      intent: CONVERSATION_INTENTS.GREETING,
      reply: "Hello! I'm your appointment assistant. Tell me what you'd like to book, and when.",
      extracted: extractedFields,
      ready_to_book: false,
    };
  }

  if (isIdentityQuestionMessage(trimmedMessage)) {
    return {
      intent: CONVERSATION_INTENTS.IDENTITY_QUESTION,
      reply:
        "I'm a Smart Appointment Assistant. I help you book appointments by chatting — share the service, date, and time, and I'll gather the details for you to confirm.",
      extracted: extractedFields,
      ready_to_book: false,
    };
  }

  if (!appearsToBeBookingIntent(trimmedMessage, currentBookingState)) {
    return {
      intent: CONVERSATION_INTENTS.OTHER,
      reply:
        'I can help you book an appointment. For example: "I need a haircut tomorrow at 3 PM." What would you like to schedule?',
      extracted: extractedFields,
      ready_to_book: false,
    };
  }

  const serviceTitle = extractServiceTitle(trimmedMessage);
  const appointmentDate = extractAppointmentDate(trimmedMessage);
  const startTime = extractStartTime(trimmedMessage);

  if (serviceTitle) extractedFields.title = serviceTitle;
  if (appointmentDate) extractedFields.appointment_date = appointmentDate;
  if (startTime) extractedFields.start_time = startTime;

  const mergedPreviewState = mergeBookingState(currentBookingState, extractedFields);
  const missingRequiredFields = getMissingRequiredFields(mergedPreviewState);
  const isReadyToBook = missingRequiredFields.length === 0;

  let assistantReply;
  if (isReadyToBook) {
    assistantReply = `Got it — ${mergedPreviewState.title} on ${mergedPreviewState.appointment_date} at ${mergedPreviewState.start_time}. Please confirm the details in the booking form to finish.`;
  } else if (missingRequiredFields.length === 3) {
    assistantReply = "I'd be happy to help book that. What service do you need, and what date and time work for you?";
  } else {
    assistantReply = `Sure — I still need your ${missingRequiredFields.join(' and ')}.`;
  }

  return {
    intent: CONVERSATION_INTENTS.BOOK_APPOINTMENT,
    reply: assistantReply,
    extracted: extractedFields,
    ready_to_book: isReadyToBook,
  };
}

module.exports = {
  buildRuleBasedAssistantResponse,
  appearsToBeBookingIntent,
};
