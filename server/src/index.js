import app from './app.js';
import { env } from './config/env.js';
import { closeDriver, verifyConnection } from './config/database.js';

/** How long a graceful shutdown may take before the process is forced to exit. */
const SHUTDOWN_TIMEOUT_MS = 10000;

const server = app.listen(env.port, () => {
  console.log(`JobGraph API listening on http://localhost:${env.port}`);
  // Non-blocking: report DB status at boot so a missing .env is obvious.
  verifyConnection()
    .then((db) => {
      if (db.ok) {
        console.log('  ✔ CognoDB connection verified');
      } else {
        console.warn(`  ⚠ CognoDB unavailable: ${db.message}`);
        console.warn('    The API still starts so the frontend can show a friendly offline state.');
        console.warn('    Fix server/.env and run "npm run seed" when ready.');
      }
    })
    .catch((err) => {
      // verifyConnection normally resolves; a rejection here means a
      // configuration error (e.g. a malformed COGNODB_URI) that would
      // otherwise become an unhandled rejection and kill the process.
      console.warn(`  ⚠ CognoDB check could not run: ${err.message}`);
    });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`✖ Port ${env.port} is already in use. Stop the other process or set PORT in server/.env.`);
  } else {
    console.error(`✖ Server failed to start: ${err.message}`);
  }
  process.exit(1);
});

let shuttingDown = false;

async function shutdown(reason, exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`\nShutting down (${reason})…`);

  const force = setTimeout(() => {
    console.error('✖ Shutdown timed out; forcing exit.');
    process.exit(exitCode || 1);
  }, SHUTDOWN_TIMEOUT_MS);
  force.unref();

  try {
    await closeDriver();
  } catch (err) {
    console.error(`✖ Error while closing the database driver: ${err.message}`);
  }

  server.close((err) => {
    if (err) console.error(`✖ Error while closing the HTTP server: ${err.message}`);
    clearTimeout(force);
    process.exit(err ? exitCode || 1 : exitCode);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// A bug that escapes every try/catch must be loud and must not leave the
// process running in an unknown state.
process.on('unhandledRejection', (reason) => {
  const err = reason instanceof Error ? reason : new Error(String(reason));
  console.error(`✖ Unhandled promise rejection: ${err.message}`);
  if (err.stack) console.error(err.stack);
  shutdown('unhandledRejection', 1);
});

process.on('uncaughtException', (err) => {
  console.error(`✖ Uncaught exception: ${err.message}`);
  if (err.stack) console.error(err.stack);
  shutdown('uncaughtException', 1);
});
