import app from './app.js';
import { env } from './config/env.js';
import { closeDriver, verifyConnection } from './config/database.js';

const server = app.listen(env.port, () => {
  console.log(`JobGraph API listening on http://localhost:${env.port}`);
  // Non-blocking: report DB status at boot so a missing .env is obvious.
  verifyConnection().then((db) => {
    if (db.ok) {
      console.log('  ✔ CognoDB connection verified');
    } else {
      console.warn(`  ⚠ CognoDB unavailable: ${db.message}`);
      console.warn('    The API still starts so the frontend can show a friendly offline state.');
      console.warn('    Fix server/.env and run "npm run seed" when ready.');
    }
  });
});

async function shutdown() {
  console.log('\nShutting down…');
  await closeDriver();
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
