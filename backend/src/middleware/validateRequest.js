const { validationResult } = require('express-validator');

function validateRequest(req, res, next) {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: validationErrors.array(),
    });
  }

  next();
}

module.exports = validateRequest;
