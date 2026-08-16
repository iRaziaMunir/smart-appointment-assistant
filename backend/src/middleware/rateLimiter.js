const rateLimit = require('express-rate-limit');

const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later' },
});

const authenticationRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many auth attempts, please try again later' },
});

const chatMessageRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many chat messages, please slow down' },
});

module.exports = {
  generalRateLimiter,
  authenticationRateLimiter,
  chatMessageRateLimiter,
};
