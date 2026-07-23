import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('AI:ProviderRegistry');

export class ProviderRegistry {
  constructor() {
    this.providers = new Map();
    this.defaultProviderId = 'gemini';
  }

  registerProvider(provider) {
    if (!provider || !provider.id) {
      throw new Error('Invalid provider instance');
    }
    this.providers.set(provider.id, provider);
    log.info(`Registered Model Provider: "${provider.name}" (${provider.id})`);
  }

  getProvider(id) {
    return this.providers.get(id) || null;
  }

  listProviders() {
    return Array.from(this.providers.values()).map(p => p.health());
  }

  getAvailableProviders() {
    return Array.from(this.providers.values()).filter(p => p.isAvailable());
  }

  setDefaultProvider(id) {
    if (this.providers.has(id)) {
      this.defaultProviderId = id;
      log.info(`Set default AI Model Provider to "${id}"`);
      return true;
    }
    return false;
  }

  getDefaultProvider() {
    const prov = this.getProvider(this.defaultProviderId);
    if (prov && prov.isAvailable()) return prov;

    // Fallback to first available provider if default is offline
    const available = this.getAvailableProviders();
    return available.length > 0 ? available[0] : prov;
  }

  async checkAllHealth() {
    const results = [];
    for (const provider of this.providers.values()) {
      try {
        await provider.initialize();
      } catch (err) {
        provider.available = false;
        provider.lastError = err.message;
      }
      results.push(provider.health());
    }
    return results;
  }
}

export const providerRegistry = new ProviderRegistry();
