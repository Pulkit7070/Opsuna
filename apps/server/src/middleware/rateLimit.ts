import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const executeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15, // 15 execution requests per minute (Gemini free tier limit)
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many execution requests, please wait before trying again',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
