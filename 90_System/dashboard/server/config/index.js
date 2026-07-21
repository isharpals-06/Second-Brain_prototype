import dotenv from 'dotenv';
dotenv.config();

const env = process.env.NODE_ENV || 'development';

const baseConfig = {
  env,
  port: parseInt(process.env.PORT || '3010', 10),
  ollamaUrl: process.env.OLLAMA_URL || 'http://127.0.0.1:11434',
  geminiApiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '',
  eventBusHistoryLimit: 100,
  agentHeartbeatIntervalMs: 30000,
  serviceTimeoutMs: 10000
};

const envConfigs = {
  development: {
    logLevel: 'DEBUG',
    enableBackups: true,
    enableWatcher: true,
    mockAI: false
  },
  testing: {
    logLevel: 'WARN',
    enableBackups: false,
    enableWatcher: false,
    mockAI: true
  },
  production: {
    logLevel: 'INFO',
    enableBackups: true,
    enableWatcher: true,
    mockAI: false
  }
};

export const config = Object.freeze({
  ...baseConfig,
  ...(envConfigs[env] || envConfigs.development)
});
