import { env } from '../config/env.js';

/**
 * Baseline response headers for a JSON API. Keeps browsers from sniffing
 * content types, framing responses, or leaking full URLs as referrers.
 */
export function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
  if (env.nodeEnv === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  }
  next();
}

/**
 * Fixed-window, in-memory rate limiter keyed by client IP.
 * The API is unauthenticated and every request fans out into multi-hop graph
 * traversals, so a cap keeps a single client from exhausting the database.
 * Single-process only — good enough for one Render instance; move to a shared
 * store if the API is ever scaled horizontally.
 */
export function rateLimit({ windowMs = 60_000, max = 120 } = {}) {
  const hits = new Map();

  function sweep(now) {
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key);
    }
  }

  return (req, res, next) => {
    const now = Date.now();
    if (hits.size > 10_000) sweep(now);

    const key = req.ip || req.socket.remoteAddress || 'unknown';
    let entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }
    entry.count += 1;

    res.setHeader('RateLimit-Limit', String(max));
    res.setHeader('RateLimit-Remaining', String(Math.max(0, max - entry.count)));
    res.setHeader('RateLimit-Reset', String(Math.ceil((entry.resetAt - now) / 1000)));

    if (entry.count > max) {
      res.setHeader('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({
        message: 'Too many requests. Please slow down and try again shortly.',
        code: 'RATE_LIMITED',
      });
    }
    next();
  };
}
