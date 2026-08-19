import neo4j from 'neo4j-driver';
import { env, hasDbCredentials } from './env.js';

let driver = null;

/** Creates (once) the official Neo4j driver pointed at CognoDB. */
export function getDriver() {
  if (!hasDbCredentials()) return null;
  if (!driver) {
    try {
      driver = neo4j.driver(
        env.cognodbUri,
        neo4j.auth.basic(env.cognodbUsername, env.cognodbPassword),
        {
          maxConnectionLifetime: 3 * 60 * 60 * 1000,
          maxTransactionRetryTime: 3000,
          connectionTimeout: 10000,
        },
      );
    } catch (err) {
      // A malformed COGNODB_URI throws here. Surface it as a configuration
      // problem instead of a generic 500 further up the stack.
      throw new DatabaseUnavailableError(
        `CognoDB connection could not be created: ${err.message}. Check COGNODB_URI in server/.env.`,
        { cause: err },
      );
    }
  }
  return driver;
}

/** How long a single query may take before we treat CognoDB as unreachable. */
const QUERY_TIMEOUT_MS = 10000;

/**
 * Runs a parameterized Cypher statement and returns the raw records.
 * All queries in this codebase pass user input through `params` — never via
 * string concatenation — so this is the only place session.run is called.
 */
export async function runQuery(cypher, params = {}) {
  const d = getDriver();
  if (!d) {
    throw new DatabaseUnavailableError(
      'CognoDB is not configured yet. Add COGNODB_URI, COGNODB_USERNAME and COGNODB_PASSWORD to server/.env, then run "npm run seed".',
    );
  }
  const session = d.session();
  try {
    const result = await withTimeout(session.run(cypher, params), QUERY_TIMEOUT_MS);
    return result.records;
  } catch (err) {
    throw wrapQueryError(err, cypher);
  } finally {
    // Closing is best-effort, but a repeated failure here means leaked sessions,
    // so it must be visible in the logs rather than swallowed.
    try {
      await session.close();
    } catch (closeErr) {
      console.warn(`[database] failed to close session: ${closeErr.message}`);
    }
  }
}

/** Driver/network failures become a 503 with a safe message; everything else propagates as-is. */
function wrapQueryError(err, cypher) {
  const firstLine = String(cypher).trim().split('\n')[0];
  console.error(`[database] query failed (${firstLine}…): ${err.code || err.name} ${err.message}`);

  if (err instanceof DatabaseUnavailableError) return err;

  const code = String(err.code || '');
  const isUnavailable =
    code === 'ServiceUnavailable' ||
    code === 'SessionExpired' ||
    code.includes('Security.Unauthorized') ||
    code.includes('Security.AuthenticationRateLimit') ||
    code.includes('TransientError') ||
    err.code === 'ECONNREFUSED' ||
    err.code === 'ENOTFOUND';

  if (isUnavailable || err.name === 'QueryTimeoutError') {
    return new DatabaseUnavailableError('CognoDB is currently unavailable. Please try again in a moment.', {
      cause: err,
    });
  }
  return err;
}

/** Best-effort connectivity check used by /api/health and the seed script. */
export async function verifyConnection() {
  let d;
  try {
    d = getDriver();
  } catch (err) {
    // A broken configuration must still produce a health report, not a throw.
    console.warn(`[database] driver could not be created: ${err.message}`);
    return { ok: false, configured: true, message: err.message, code: err.code };
  }
  if (!d) {
    return {
      ok: false,
      configured: false,
      message: 'CognoDB credentials are not set in server/.env.',
    };
  }
  try {
    await withTimeout(d.verifyConnectivity(), 8000);
    return { ok: true, configured: true, message: 'Connected to CognoDB' };
  } catch (err) {
    console.warn(`[database] connectivity check failed: ${err.code || err.name} ${err.message}`);
    return { ok: false, configured: true, message: err.message, code: err.code };
  }
}

export async function closeDriver() {
  if (!driver) return;
  const d = driver;
  driver = null;
  try {
    await d.close();
  } catch (err) {
    console.warn(`[database] failed to close driver: ${err.message}`);
  }
}

/** Rejects if the promise does not settle within `ms`. */
function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error(`CognoDB did not respond within ${ms}ms`);
      err.name = 'QueryTimeoutError';
      reject(err);
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/** Error used when CognoDB is unreachable or unconfigured. Carries a safe, user-facing message. */
export class DatabaseUnavailableError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = 'DatabaseUnavailableError';
    this.status = 503;
    this.code = 'DATABASE_UNAVAILABLE';
    this.expose = true;
  }
}
