function formatTimeValue(timeValue) {
  if (!timeValue) return null;
  if (timeValue instanceof Date) {
    return timeValue.toISOString().slice(11, 16);
  }
  return String(timeValue).slice(0, 5);
}

function formatDateValue(dateValue) {
  if (!dateValue) return null;
  if (dateValue instanceof Date) {
    return dateValue.toISOString().slice(0, 10);
  }
  return dateValue;
}

function serializeUserRecord(userRecord) {
  if (!userRecord) return null;
  return {
    id: userRecord.id,
    email: userRecord.email,
    fullName: userRecord.fullName,
    createdAt: userRecord.createdAt,
  };
}

function serializeAppointmentRecord(appointmentRecord) {
  if (!appointmentRecord) return null;
  return {
    id: appointmentRecord.id,
    title: appointmentRecord.title,
    description: appointmentRecord.description,
    appointmentDate: formatDateValue(appointmentRecord.appointmentDate),
    startTime: formatTimeValue(appointmentRecord.startTime),
    endTime: formatTimeValue(appointmentRecord.endTime),
    status: appointmentRecord.status,
    createdAt: appointmentRecord.createdAt,
    updatedAt: appointmentRecord.updatedAt,
  };
}

function serializeChatSessionRecord(sessionRecord) {
  if (!sessionRecord) return null;
  return {
    id: sessionRecord.id,
    status: sessionRecord.status,
    bookingState: serializeBookingState(sessionRecord.bookingState),
    createdAt: sessionRecord.createdAt,
    updatedAt: sessionRecord.updatedAt,
  };
}

function serializeChatMessageRecord(messageRecord) {
  if (!messageRecord) return null;
  return {
    id: messageRecord.id,
    role: messageRecord.role,
    content: messageRecord.content,
    createdAt: messageRecord.createdAt,
  };
}

function serializeBookingState(bookingState = {}) {
  const state = typeof bookingState === 'string' ? JSON.parse(bookingState) : bookingState;
  return {
    title: state.title ?? null,
    appointmentDate: state.appointment_date ?? null,
    startTime: state.start_time ?? null,
    description: state.description ?? null,
  };
}

function deserializeBookingState(apiBookingState = {}) {
  const payload = {};
  if (apiBookingState.title) payload.title = apiBookingState.title;
  if (apiBookingState.appointmentDate) payload.appointment_date = apiBookingState.appointmentDate;
  if (apiBookingState.startTime) payload.start_time = apiBookingState.startTime;
  if (apiBookingState.description) payload.description = apiBookingState.description;
  return payload;
}

function normalizeAppointmentDateInput(appointmentDate) {
  if (appointmentDate instanceof Date) {
    return appointmentDate.toISOString().split('T')[0];
  }
  return appointmentDate;
}

module.exports = {
  serializeUserRecord,
  serializeAppointmentRecord,
  serializeChatSessionRecord,
  serializeChatMessageRecord,
  serializeBookingState,
  deserializeBookingState,
  normalizeAppointmentDateInput,
};
