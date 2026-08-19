import 'dotenv/config';

/**
 * Central place for environment configuration.
 * Credentials are only ever read from environment variables — never hard-coded.
 */
const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

export const env = {
  cognodbUri: process.env.COGNODB_URI || '',
  cognodbUsername: process.env.COGNODB_USERNAME || 'cognodb',
  cognodbPassword: process.env.COGNODB_PASSWORD || '',
  port: Number(process.env.PORT) || 4000,
  // Outside production an unset CLIENT_ORIGIN allows any origin for convenience.
  // In production it must be an explicit allow-list: a wildcard would let any
  // site call the API from a visitor's browser.
  clientOrigin: process.env.CLIENT_ORIGIN || (isProduction ? '' : '*'),
  nodeEnv,
  isProduction,
};

/**
 * Origins allowed to call the API from a browser.
 * Returns null when every origin is allowed (development default).
 */
export function allowedOrigins() {
  if (env.clientOrigin === '*') return null;
  return env.clientOrigin
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** True only when enough configuration exists to open a database connection. */
export function hasDbCredentials() {
  return Boolean(env.cognodbUri && env.cognodbPassword);
}
