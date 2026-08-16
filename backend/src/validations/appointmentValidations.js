const { body } = require('express-validator');

const appointmentValidationRules = [
  body('title').trim().notEmpty(),
  body('appointmentDate').isISO8601().toDate(),
  body('startTime').matches(/^([01]\d|2[0-3]):[0-5]\d$/),
  body('description').optional().trim(),
  body('endTime').optional().matches(/^([01]\d|2[0-3]):[0-5]\d$/),
];

module.exports = {
  appointmentValidationRules,
};
