import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Governance:SecretManager');

export class SecretManager {
  constructor() {
    this.secrets = new Map([
      ['sec_gemini_key', { keyName: 'GEMINI_API_KEY', maskedValue: 'AQ.Ab8RN6KqC1mV...', category: 'api_key' }],
      ['sec_ollama_url', { keyName: 'OLLAMA_HOST', maskedValue: 'http://localhost:11434', category: 'endpoint' }]
    ]);
  }

  getSecretMetadata(id) {
    return this.secrets.get(id) || null;
  }

  listSecretsMetadata() {
    return Array.from(this.secrets.entries()).map(([id, sec]) => ({
      secretId: id,
      keyName: sec.keyName,
      maskedValue: sec.maskedValue,
      category: sec.category
    }));
  }
}

export const secretManager = new SecretManager();
