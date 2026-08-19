/**
 * Error helpers.
 *  - AppError: an expected error (validation, not found) with a client-safe message.
 *  - asyncHandler: wraps async controllers so rejected promises reach the error handler.
 *  - errorHandler: the single place that converts errors into JSON responses.
 *    Internal (500) errors are logged with details server-side but only a generic
 *    message is sent to the browser. Errors marked `expose` (validation, 503 DB
 *    unavailable) may show their message.
 */
export class AppError extends Error {
  constructor(message, status = 400, code = 'BAD_REQUEST') {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.expose = true;
  }
}

export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

export function notFoundHandler(req, res) {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found`, code: 'NOT_FOUND' });
}

export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const code = typeof err.code === 'string' ? err.code : 'INTERNAL_ERROR';
  const expose = err.expose === true || status < 500;

  if (status >= 500 && expose) {
    // Expected infrastructure problem (CognoDB down/unconfigured): one line is
    // enough, a stack trace would only add noise.
    console.warn(`[warn] ${req.method} ${req.originalUrl} -> ${code}: ${err.message}`);
  } else if (status >= 500) {
    // Log the real diagnostic server-side; never leak it to the client.
    console.error(`[error] ${req.method} ${req.originalUrl} -> ${err.message}`);
    if (err.stack) console.error(err.stack.split('\n').slice(0, 4).join('\n'));
    if (err.cause) console.error(`[error] caused by: ${err.cause.code || err.cause.name}: ${err.cause.message}`);
  }

  // Once a response has started streaming we can no longer rewrite it as JSON;
  // hand the error back to Express instead of throwing inside this handler.
  if (res.headersSent) {
    return next(err);
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body is not valid JSON.', code: 'INVALID_JSON' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body is too large.', code: 'PAYLOAD_TOO_LARGE' });
  }

  const message =
    (expose && err.message) || 'Something went wrong on our side. Please try again in a moment.';

  res.status(status).json({ message, code });
}
