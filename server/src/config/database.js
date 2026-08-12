import neo4j from 'neo4j-driver';
import { env, hasDbCredentials } from './env.js';

let driver = null;

/** Creates (once) the official Neo4j driver pointed at CognoDB. */
export function getDriver() {
  if (!hasDbCredentials()) return null;
  if (!driver) {
    driver = neo4j.driver(
      env.cognodbUri,
      neo4j.auth.basic(env.cognodbUsername, env.cognodbPassword),
      {
        maxConnectionLifetime: 3 * 60 * 60 * 1000,
        maxTransactionRetryTime: 3000,
        connectionTimeout: 10000,
      },
    );
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
  } finally {
    await session.close().catch(() => {});
  }
}

/** Best-effort connectivity check used by /api/health and the seed script. */
export async function verifyConnection() {
  const d = getDriver();
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
    return { ok: false, configured: true, message: err.message };
  }
}

export async function closeDriver() {
  if (driver) {
    await driver.close().catch(() => {});
    driver = null;
  }
}

/** Rejects if the promise does not settle within `ms`. */
function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`CognoDB did not respond within ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/** Error used when CognoDB is unreachable or unconfigured. Carries a safe, user-facing message. */
export class DatabaseUnavailableError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DatabaseUnavailableError';
    this.status = 503;
    this.code = 'DATABASE_UNAVAILABLE';
    this.expose = true;
  }
}
