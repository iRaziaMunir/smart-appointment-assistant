const config = require('../../config/environment');
const { CONVERSATION_INTENTS } = require('../../constants/conversationIntents');

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

function buildMistralSystemPrompt(bookingState) {
  const todayIsoDate = formatDateAsIso(getTodayAtMidnight());
  return `You are a Smart Appointment Assistant. Help users book appointments through natural conversation.

Today's date is ${todayIsoDate} (use this to resolve relative dates like "tomorrow", "next Monday").

Current booking draft (JSON): ${JSON.stringify(bookingState || {})}

Your responsibilities:
1. Detect intent: book_appointment, greeting, identity_question, other
2. For booking intents, extract structured fields when mentioned
3. Support multi-turn: remember fields already in the booking draft; only ask for what is still missing
4. NEVER create an appointment yourself — only extract data and ask the user to confirm via the booking form
5. Do NOT treat greetings or unrelated questions as booking requests

Extracted fields:
- title: service / reason (e.g. "Haircut", "Monthly Checkup")
- appointment_date: YYYY-MM-DD
- start_time: HH:MM 24-hour
- description: optional notes

Always respond in JSON only:
{
  "intent": "book_appointment" | "greeting" | "identity_question" | "other",
  "reply": "message to the user",
  "extracted": {
    "title": "string or null",
    "appointment_date": "YYYY-MM-DD or null",
    "start_time": "HH:MM or null",
    "description": "string or null"
  },
  "ready_to_book": false
}`;
}

async function requestMistralCompletion(conversationMessages, bookingState) {
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.mistralApiKey}`,
    },
    body: JSON.stringify({
      model: 'mistral-small-latest',
      messages: [
        { role: 'system', content: buildMistralSystemPrompt(bookingState) },
        ...conversationMessages,
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Mistral API error: ${response.status} - ${errorBody}`);
  }

  const responsePayload = await response.json();
  return responsePayload.choices[0].message.content;
}

function parseMistralJsonResponse(rawResponse) {
  try {
    const parsedResponse = JSON.parse(rawResponse);
    return {
      intent: parsedResponse.intent || CONVERSATION_INTENTS.OTHER,
      reply: parsedResponse.reply || 'How can I help you book an appointment?',
      extracted: parsedResponse.extracted || {},
      ready_to_book: Boolean(parsedResponse.ready_to_book),
    };
  } catch {
    return {
      intent: CONVERSATION_INTENTS.OTHER,
      reply: rawResponse,
      extracted: {},
      ready_to_book: false,
    };
  }
}

module.exports = {
  requestMistralCompletion,
  parseMistralJsonResponse,
};
