const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  message: {
    error: 'Demasiadas peticiones, intenta luego'
  }
});

module.exports = limiter;