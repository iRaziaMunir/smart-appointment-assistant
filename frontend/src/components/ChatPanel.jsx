import { useState, useEffect, useRef } from 'react';
import { apiClient } from '../services/apiClient';
import AppointmentForm from './AppointmentForm';

const WELCOME_MESSAGE = {
  id: 'welcome-message',
  role: 'assistant',
  content:
    "Hi! I'm Smart Appointment Assistant. Tell me what you'd like to book — for example, a haircut tomorrow at 3 PM.",
};

const SUGGESTION_PROMPTS = [
  'I need a haircut tomorrow at 3 PM',
  'Book a checkup next Monday',
];

export default function ChatPanel({ onAppointmentBooked }) {
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [bookingDraft, setBookingDraft] = useState({});
  const [isReadyToConfirm, setIsReadyToConfirm] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    async function initializeChatSession() {
      try {
        const { session } = await apiClient.createChatSession();
        setActiveSessionId(session.id);
        setChatMessages([WELCOME_MESSAGE]);
      } catch (error) {
        setErrorMessage(error.message);
      }
    }

    initializeChatSession();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isSendingMessage]);

  async function sendMessage(messageText) {
    if (!messageText.trim() || !activeSessionId || isSendingMessage) return;

    const userMessageText = messageText.trim();
    const optimisticUserMessage = {
      id: `temp-user-${Date.now()}`,
      role: 'user',
      content: userMessageText,
    };

    setMessageInput('');
    setErrorMessage('');
    setChatMessages((previousMessages) => [...previousMessages, optimisticUserMessage]);
    setIsSendingMessage(true);

    try {
      const conversationResponse = await apiClient.sendChatMessage(activeSessionId, userMessageText);

      setChatMessages((previousMessages) => [
        ...previousMessages,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: conversationResponse.reply,
        },
      ]);
      setBookingDraft(conversationResponse.bookingState || {});
      setIsReadyToConfirm(conversationResponse.readyToBook);
    } catch (error) {
      setErrorMessage(error.message);
      setChatMessages((previousMessages) => previousMessages.slice(0, -1));
      setMessageInput(userMessageText);
    } finally {
      setIsSendingMessage(false);
      inputRef.current?.focus();
    }
  }

  function handleSendMessage(event) {
    event.preventDefault();
    sendMessage(messageInput);
  }

  function handleBookingConfirmed() {
    setIsReadyToConfirm(false);
    setBookingDraft({});
    setChatMessages((previousMessages) => [
      ...previousMessages,
      {
        id: `assistant-success-${Date.now()}`,
        role: 'assistant',
        content: 'Your appointment has been booked successfully! You can find it in My Appointments.',
      },
    ]);
    onAppointmentBooked?.();
  }

  const hasPartialBookingDraft = Boolean(
    bookingDraft.title || bookingDraft.appointmentDate || bookingDraft.startTime
  );
  const showSuggestions = chatMessages.length <= 1 && !isSendingMessage;

  return (
    <section className="chat-shell">
      <header className="chat-header">
        <div className="chat-header-identity">
          <div className="assistant-avatar" aria-hidden="true">
            AI
          </div>
          <div>
            <h2>Smart Appointment Assistant</h2>
            <p className="chat-status">
              <span className="status-dot" />
              Online · ready to book
            </p>
          </div>
        </div>
      </header>

      <div className="chat-messages" role="log" aria-live="polite">
        {chatMessages.map((message) => (
          <div key={message.id} className={`message-row ${message.role}`}>
            {message.role === 'assistant' && (
              <div className="assistant-avatar small" aria-hidden="true">
                AI
              </div>
            )}
            <div className={`message-bubble ${message.role}`}>{message.content}</div>
          </div>
        ))}

        {isSendingMessage && (
          <div className="message-row assistant">
            <div className="assistant-avatar small" aria-hidden="true">
              AI
            </div>
            <div className="message-bubble assistant typing">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {showSuggestions && (
        <div className="suggestion-row">
          {SUGGESTION_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="suggestion-chip"
              onClick={() => sendMessage(prompt)}
              disabled={!activeSessionId || isSendingMessage}
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {(isReadyToConfirm || hasPartialBookingDraft) && (
        <div className="chat-booking-drawer">
          <AppointmentForm
            sessionId={activeSessionId}
            initialBookingData={bookingDraft}
            isReadyToConfirm={isReadyToConfirm}
            onBookingSuccess={handleBookingConfirmed}
          />
        </div>
      )}

      {errorMessage && <div className="error-message chat-error">{errorMessage}</div>}

      <form className="composer" onSubmit={handleSendMessage}>
        <input
          ref={inputRef}
          type="text"
          value={messageInput}
          onChange={(event) => setMessageInput(event.target.value)}
          placeholder="Ask Smart Appointment Assistant to book something..."
          disabled={!activeSessionId || isSendingMessage}
          aria-label="Chat message"
        />
        <button
          type="submit"
          className="btn btn-primary composer-send"
          disabled={!activeSessionId || isSendingMessage || !messageInput.trim()}
        >
          Send
        </button>
      </form>
    </section>
  );
}
