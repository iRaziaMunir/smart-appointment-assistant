const appointmentService = require('../services/appointmentService');
const { serializeAppointmentRecord } = require('../utils/serializers');

async function listAppointments(req, res) {
  const appointmentRecords = await appointmentService.listUserAppointments(req.authenticatedUser.id);
  res.json({ appointments: appointmentRecords.map(serializeAppointmentRecord) });
}

async function getAppointmentById(req, res) {
  const appointmentRecord = await appointmentService.getUserAppointmentById(
    req.authenticatedUser.id,
    req.params.appointmentId
  );
  res.json({ appointment: serializeAppointmentRecord(appointmentRecord) });
}

async function createAppointment(req, res) {
  const createdAppointment = await appointmentService.createManualAppointment(
    req.authenticatedUser.id,
    req.body
  );
  res.status(201).json({ appointment: serializeAppointmentRecord(createdAppointment) });
}

async function createAppointmentFromChat(req, res) {
  const createdAppointment = await appointmentService.createAppointmentFromChatSession(
    req.authenticatedUser.id,
    req.params.sessionId,
    req.body
  );
  res.status(201).json({ appointment: serializeAppointmentRecord(createdAppointment) });
}

module.exports = {
  listAppointments,
  getAppointmentById,
  createAppointment,
  createAppointmentFromChat,
};
