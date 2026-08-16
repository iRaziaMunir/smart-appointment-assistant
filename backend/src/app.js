const express = require('express');
const cors = require('cors');
const config = require('./config/environment');
const requestLogger = require('./middleware/requestLogger');
const { generalRateLimiter } = require('./middleware/rateLimiter');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const authRouter = require('./routes/authRoutes');
const chatRouter = require('./routes/chatRoutes');
const appointmentRouter = require('./routes/appointmentRoutes');
const db = require('./config/database');

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(requestLogger);
app.use(generalRateLimiter);

app.get('/health', async (req, res) => {
  try {
    await db.verifyConnection();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch {
    res.status(503).json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
    });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/chat', chatRouter);
app.use('/api/appointments', appointmentRouter);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
