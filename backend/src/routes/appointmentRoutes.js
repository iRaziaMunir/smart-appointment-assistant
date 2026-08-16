const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const validateRequest = require('../middleware/validateRequest');
const authenticateRequest = require('../middleware/authenticate');
const appointmentController = require('../controllers/appointmentController');
const { appointmentValidationRules } = require('../validations/appointmentValidations');

const appointmentRouter = express.Router();

appointmentRouter.use(authenticateRequest);

appointmentRouter.get('/', asyncHandler(appointmentController.listAppointments));

appointmentRouter.get('/:appointmentId', asyncHandler(appointmentController.getAppointmentById));

appointmentRouter.post(
  '/',
  appointmentValidationRules,
  validateRequest,
  asyncHandler(appointmentController.createAppointment)
);

appointmentRouter.post(
  '/from-chat/:sessionId',
  appointmentValidationRules,
  validateRequest,
  asyncHandler(appointmentController.createAppointmentFromChat)
);

module.exports = appointmentRouter;
