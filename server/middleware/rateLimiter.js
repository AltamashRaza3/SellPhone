import rateLimit from "express-rate-limit";

/* ===============================
   GENERAL API RATE LIMIT
   =============================== */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per IP
  standardHeaders: true,
  legacyHeaders: false,
});

/* ===============================
   AUTH-SENSITIVE RATE LIMIT
   (Login / Order / Cart)
   =============================== */
export const strictLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 50, // 50 requests
  message: {
    message: "Too many requests. Please try again later.",
  },
});
