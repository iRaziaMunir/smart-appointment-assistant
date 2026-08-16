const { prisma } = require('../config/database');

function parseDateString(dateString) {
  return new Date(`${dateString}T00:00:00.000Z`);
}

function parseTimeString(timeString) {
  if (!timeString) return null;
  return new Date(`1970-01-01T${timeString}:00.000Z`);
}

async function findAllByUserId(userId) {
  return prisma.appointment.findMany({
    where: { userId },
    orderBy: [{ appointmentDate: 'asc' }, { startTime: 'asc' }],
  });
}

async function findByIdForUser(appointmentId, userId) {
  return prisma.appointment.findFirst({
    where: {
      id: appointmentId,
      userId,
    },
  });
}

async function createAppointment({
  userId,
  title,
  description,
  appointmentDate,
  startTime,
  endTime = null,
}) {
  return prisma.appointment.create({
    data: {
      userId,
      title,
      description,
      appointmentDate: parseDateString(appointmentDate),
      startTime: parseTimeString(startTime),
      endTime: parseTimeString(endTime),
    },
  });
}

module.exports = {
  findAllByUserId,
  findByIdForUser,
  createAppointment,
};
