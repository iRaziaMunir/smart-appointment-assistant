const appointmentRepository = require('../repositories/appointmentRepository');
const chatRepository = require('../repositories/chatRepository');
const { normalizeAppointmentDateInput } = require('../utils/serializers');
const { isBookingDraftComplete } = require('./ai/bookingStateService');

async function listUserAppointments(userId) {
  return appointmentRepository.findAllByUserId(userId);
}

async function getUserAppointmentById(userId, appointmentId) {
  const appointmentRecord = await appointmentRepository.findByIdForUser(appointmentId, userId);
  if (!appointmentRecord) {
    const error = new Error('Appointment not found');
    error.statusCode = 404;
    throw error;
  }
  return appointmentRecord;
}

async function createManualAppointment(userId, appointmentPayload) {
  return appointmentRepository.createAppointment({
    userId,
    title: appointmentPayload.title,
    description: appointmentPayload.description || null,
    appointmentDate: normalizeAppointmentDateInput(appointmentPayload.appointmentDate),
    startTime: appointmentPayload.startTime,
    endTime: appointmentPayload.endTime || null,
  });
}

async function createAppointmentFromChatSession(userId, sessionId, appointmentPayload) {
  const chatSession = await chatRepository.findSessionForUser(sessionId, userId);
  if (!chatSession) {
    const error = new Error('Chat session not found');
    error.statusCode = 404;
    throw error;
  }

  const bookingState = chatSession.bookingState || {};
  if (!isBookingDraftComplete(bookingState)) {
    const error = new Error('Booking details are incomplete. Continue the chat before confirming.');
    error.statusCode = 400;
    throw error;
  }

  const createdAppointment = await appointmentRepository.createAppointment({
    userId,
    title: appointmentPayload.title,
    description: appointmentPayload.description || null,
    appointmentDate: normalizeAppointmentDateInput(appointmentPayload.appointmentDate),
    startTime: appointmentPayload.startTime,
    endTime: appointmentPayload.endTime || null,
  });

  await chatRepository.completeSession(sessionId);
  return createdAppointment;
}

module.exports = {
  listUserAppointments,
  getUserAppointmentById,
  createManualAppointment,
  createAppointmentFromChatSession,
};
