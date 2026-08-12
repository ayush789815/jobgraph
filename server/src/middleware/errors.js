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

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const expose = err.expose === true || status < 500;

  if (status >= 500) {
    // Log the real diagnostic server-side; never leak it to the client.
    console.error(`[error] ${req.method} ${req.originalUrl} -> ${err.message}`);
    if (err.stack) console.error(err.stack.split('\n').slice(0, 4).join('\n'));
  }

  const message = expose
    ? err.message
    : 'Something went wrong on our side. Please try again in a moment.';

  res.status(status).json({ message, code });
}
