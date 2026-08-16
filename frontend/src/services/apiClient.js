const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

function getStoredAccessToken() {
  return localStorage.getItem('accessToken');
}

async function apiRequest(path, options = {}) {
  const requestHeaders = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const accessToken = getStoredAccessToken();
  if (accessToken) {
    requestHeaders.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: requestHeaders,
  });

  const responseBody = await response.json().catch(() => ({}));

  if (response.status === 401 && unauthorizedHandler) {
    unauthorizedHandler();
  }

  if (!response.ok) {
    throw new Error(responseBody.error || 'Request failed');
  }

  return responseBody;
}

export const apiClient = {
  register: (payload) =>
    apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),

  login: (payload) =>
    apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),

  getCurrentUser: () => apiRequest('/auth/me'),

  createChatSession: () => apiRequest('/chat/sessions', { method: 'POST' }),

  getChatMessages: (sessionId) => apiRequest(`/chat/sessions/${sessionId}/messages`),

  sendChatMessage: (sessionId, messageText) =>
    apiRequest(`/chat/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message: messageText }),
    }),

  getAppointments: () => apiRequest('/appointments'),

  createAppointment: (payload) =>
    apiRequest('/appointments', { method: 'POST', body: JSON.stringify(payload) }),

  createAppointmentFromChat: (sessionId, payload) =>
    apiRequest(`/appointments/from-chat/${sessionId}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
