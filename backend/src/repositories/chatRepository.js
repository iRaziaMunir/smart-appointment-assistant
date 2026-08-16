const { prisma } = require('../config/database');

function getClient(transactionClient) {
  return transactionClient ?? prisma;
}

async function createSession(userId, transactionClient) {
  const client = getClient(transactionClient);
  return client.chatSession.create({
    data: {
      userId,
      status: 'active',
      bookingState: {},
    },
  });
}

async function findSessionForUser(sessionId, userId) {
  return prisma.chatSession.findFirst({
    where: {
      id: sessionId,
      userId,
    },
  });
}

async function updateBookingState(sessionId, bookingState, transactionClient) {
  const client = getClient(transactionClient);
  return client.chatSession.update({
    where: { id: sessionId },
    data: { bookingState },
  });
}

async function completeSession(sessionId, transactionClient) {
  const client = getClient(transactionClient);
  return client.chatSession.update({
    where: { id: sessionId },
    data: {
      status: 'completed',
      bookingState: {},
    },
  });
}

async function findMessagesBySessionId(sessionId, transactionClient) {
  const client = getClient(transactionClient);
  return client.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      role: true,
      content: true,
      createdAt: true,
    },
  });
}

async function insertMessage({ sessionId, role, content }, transactionClient) {
  const client = getClient(transactionClient);
  return client.chatMessage.create({
    data: {
      sessionId,
      role,
      content,
    },
    select: {
      id: true,
      role: true,
      content: true,
      createdAt: true,
    },
  });
}

module.exports = {
  createSession,
  findSessionForUser,
  updateBookingState,
  completeSession,
  findMessagesBySessionId,
  insertMessage,
};
