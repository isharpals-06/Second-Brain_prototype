/**
 * AEGISOS Client Configuration
 */

const isDev = import.meta.env.DEV;

export const clientConfig = Object.freeze({
  env: isDev ? 'development' : 'production',
  apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3010',
  eventHistoryLimit: 50,
  logLevel: isDev ? 'DEBUG' : 'INFO',
  heartbeatMs: 30000
});
