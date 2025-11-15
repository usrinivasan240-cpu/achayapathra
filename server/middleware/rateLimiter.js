const rateLimit = require('express-rate-limit');

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
const maxRequests = Number(process.env.RATE_LIMIT_MAX || 100);

const apiRateLimiter = rateLimit({
  windowMs,
  max: maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});

module.exports = apiRateLimiter;
