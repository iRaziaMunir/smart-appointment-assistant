const { REQUIRED_BOOKING_FIELDS, BOOKING_STATE_FIELDS } = require('../../constants/bookingFields');

const MISSING_FIELD_LABELS = {
  [BOOKING_STATE_FIELDS.SERVICE_TITLE]: 'service or reason for the visit',
  [BOOKING_STATE_FIELDS.APPOINTMENT_DATE]: 'date',
  [BOOKING_STATE_FIELDS.START_TIME]: 'time',
};

function mergeBookingState(currentState = {}, extractedFields = {}) {
  const mergedState = { ...currentState };

  for (const [fieldName, fieldValue] of Object.entries(extractedFields)) {
    if (fieldValue != null && fieldValue !== '') {
      mergedState[fieldName] = fieldValue;
    }
  }

  const allowedFields = Object.values(BOOKING_STATE_FIELDS);
  return allowedFields.reduce((normalizedState, fieldName) => {
    if (mergedState[fieldName] != null && mergedState[fieldName] !== '') {
      normalizedState[fieldName] = mergedState[fieldName];
    }
    return normalizedState;
  }, {});
}

function getMissingRequiredFields(bookingState = {}) {
  return REQUIRED_BOOKING_FIELDS.filter((fieldName) => !bookingState[fieldName]).map(
    (fieldName) => MISSING_FIELD_LABELS[fieldName]
  );
}

function isBookingDraftComplete(bookingState = {}) {
  return REQUIRED_BOOKING_FIELDS.every((fieldName) => Boolean(bookingState[fieldName]));
}

function validateExtractedFields(extractedFields = {}) {
  const sanitizedFields = {};

  if (typeof extractedFields.title === 'string') {
    const serviceTitle = extractedFields.title.trim();
    if (serviceTitle && serviceTitle.toLowerCase() !== 'null') {
      sanitizedFields.title = serviceTitle.slice(0, 255);
    }
  }

  if (typeof extractedFields.appointment_date === 'string') {
    const appointmentDate = extractedFields.appointment_date.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate)) {
      const [year, month, day] = appointmentDate.split('-').map(Number);
      const parsedDate = new Date(year, month - 1, day);
      if (
        parsedDate.getFullYear() === year &&
        parsedDate.getMonth() === month - 1 &&
        parsedDate.getDate() === day
      ) {
        sanitizedFields.appointment_date = appointmentDate;
      }
    }
  }

  if (typeof extractedFields.start_time === 'string') {
    const startTime = extractedFields.start_time.trim();
    const timeMatch = startTime.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
    if (timeMatch) {
      sanitizedFields.start_time = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
    }
  }

  if (typeof extractedFields.description === 'string') {
    const description = extractedFields.description.trim();
    if (description && description.toLowerCase() !== 'null') {
      sanitizedFields.description = description.slice(0, 2000);
    }
  }

  return sanitizedFields;
}

module.exports = {
  mergeBookingState,
  getMissingRequiredFields,
  isBookingDraftComplete,
  validateExtractedFields,
};
