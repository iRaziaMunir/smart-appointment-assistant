function requestLogger(req, res, next) {
  const requestStartedAt = Date.now();

  res.on('finish', () => {
    const requestDurationMs = Date.now() - requestStartedAt;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${requestDurationMs}ms`
    );
  });

  next();
}

module.exports = requestLogger;
