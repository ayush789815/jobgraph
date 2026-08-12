import 'dotenv/config';

/**
 * Central place for environment configuration.
 * Credentials are only ever read from environment variables — never hard-coded.
 */
export const env = {
  cognodbUri: process.env.COGNODB_URI || '',
  cognodbUsername: process.env.COGNODB_USERNAME || 'cognodb',
  cognodbPassword: process.env.COGNODB_PASSWORD || '',
  port: Number(process.env.PORT) || 4000,
  clientOrigin: process.env.CLIENT_ORIGIN || '*',
  nodeEnv: process.env.NODE_ENV || 'development',
};

/** True only when enough configuration exists to open a database connection. */
export function hasDbCredentials() {
  return Boolean(env.cognodbUri && env.cognodbPassword);
}
