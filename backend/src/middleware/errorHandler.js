function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Not found' });
}

function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;
  const message = statusCode >= 500 ? 'Internal server error' : error.message;

  if (statusCode >= 500) {
    console.error('[ErrorHandler]', error.message);
  }

  res.status(statusCode).json({ error: message });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
