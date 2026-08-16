const app = require('./app');
const config = require('./config/environment');
const db = require('./config/database');

async function startServer() {
  try {
    await db.verifyConnection();
    console.log('[Database] Connection verified');
  } catch (error) {
    console.error('[Database] Failed to connect:', error.message);
    process.exit(1);
  }

  const server = app.listen(config.port, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${config.port}`);
  });

  function shutdown(signalName) {
    console.log(`[Server] Received ${signalName}, shutting down gracefully`);
    server.close(async () => {
      await db.disconnect();
      process.exit(0);
    });
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer();
