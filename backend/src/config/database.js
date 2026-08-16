const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

async function verifyConnection() {
  await prisma.$queryRaw`SELECT 1`;
}

async function disconnect() {
  await prisma.$disconnect();
}

async function withTransaction(callback) {
  return prisma.$transaction((transactionClient) => callback(transactionClient));
}

module.exports = {
  prisma,
  verifyConnection,
  disconnect,
  withTransaction,
};
