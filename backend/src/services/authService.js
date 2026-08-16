const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
const { generateAccessToken } = require('../utils/jwtToken');

async function registerUser({ email, password, fullName }) {
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    const error = new Error('Email already registered');
    error.statusCode = 409;
    throw error;
  }

  const createdUser = await userRepository.createUser({
    email,
    password,
    fullName,
  });

  return {
    accessToken: generateAccessToken(createdUser),
    user: createdUser,
  };
}

async function loginUser({ email, password }) {
  const userRecord = await userRepository.findByEmail(email);
  if (!userRecord) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, userRecord.passwordHash);
  if (!isPasswordValid) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  return {
    accessToken: generateAccessToken(userRecord),
    user: {
      id: userRecord.id,
      email: userRecord.email,
      fullName: userRecord.fullName,
      createdAt: userRecord.createdAt,
    },
  };
}

async function getAuthenticatedUserProfile(userId) {
  const userRecord = await userRepository.findById(userId);
  if (!userRecord) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return userRecord;
}

module.exports = {
  registerUser,
  loginUser,
  getAuthenticatedUserProfile,
};
