require('dotenv').config();

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

function requireEnv(name, fallback = undefined) {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const config = {
  nodeEnv,
  isProduction,
  port: Number(process.env.PORT) || 5000,
  databaseUrl: requireEnv('DATABASE_URL', isProduction ? undefined : 'postgresql://localhost:5432/appointment_booking'),
  jwtSecret: requireEnv('JWT_SECRET', isProduction ? undefined : 'dev-secret-change-in-production'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  mistralApiKey: process.env.MISTRAL_API_KEY || '',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

if (isProduction && config.jwtSecret === 'dev-secret-change-in-production') {
  throw new Error('JWT_SECRET must be set to a strong value in production');
}

module.exports = config;
