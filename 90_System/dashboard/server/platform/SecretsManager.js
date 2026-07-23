import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Platform:SecretsManager');

export class SecretsManager {
  constructor() {
    this.secrets = new Map();
    this.loadFromEnv();
  }

  loadFromEnv() {
    const envKeys = [
      'GEMINI_API_KEY',
      'GOOGLE_API_KEY',
      'OPENROUTER_API_KEY',
      'HF_API_KEY',
      'GITHUB_TOKEN',
      'ANTHROPIC_API_KEY',
      'OPENAI_API_KEY',
    ];

    for (const key of envKeys) {
      if (process.env[key]) {
        this.secrets.set(key, process.env[key]);
      }
    }
    log.info(`SecretsManager loaded ${this.secrets.size} credentials from environment variables.`);
  }

  getSecret(key) {
    return this.secrets.get(key) || process.env[key] || null;
  }

  setSecret(key, value) {
    this.secrets.set(key, value);
    process.env[key] = value;
    log.info(`Secret "${key}" updated at runtime.`);
    return true;
  }

  hasSecret(key) {
    return this.secrets.has(key) || Boolean(process.env[key]);
  }

  listSecretStatus() {
    const status = {};
    for (const [key] of this.secrets.entries()) {
      status[key] = 'configured';
    }
    return status;
  }
}

export const secretsManager = new SecretsManager();
