const bcrypt = require('bcryptjs');
const { prisma } = require('../config/database');

const PASSWORD_SALT_ROUNDS = 10;

async function findByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
  });
}

async function findById(userId) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      createdAt: true,
    },
  });
}

async function createUser({ email, password, fullName }) {
  const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

  return prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      createdAt: true,
    },
  });
}

module.exports = {
  findByEmail,
  findById,
  createUser,
};
