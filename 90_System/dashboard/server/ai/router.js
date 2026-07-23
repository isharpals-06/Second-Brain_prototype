import { providerRegistry } from './providerRegistry.js';
import { modelManager } from './modelManager.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('AI:Router');

export class AIRouter {
  constructor() {
    this.activePolicy = 'balanced'; // performance, quality, local_first, budget, privacy, balanced
  }

  setPolicy(policy) {
    this.activePolicy = policy;
    log.info(`Active routing policy updated to "${policy}".`);
  }

  getPolicy() {
    return this.activePolicy;
  }

  async resolveRoute(options = {}) {
    const { category = 'text_generation', provider: requestedProvider, model: requestedModel, policy = this.activePolicy } = options;

    // 1. Explicit request override
    if (requestedProvider && requestedModel) {
      const prov = providerRegistry.getProvider(requestedProvider);
      if (prov && prov.isAvailable()) {
        return { provider: prov, model: requestedModel };
      }
      log.warn(`Requested provider "${requestedProvider}" unavailable. Proceeding with routing policy "${policy}"...`);
    }

    // 2. Policy-driven selection
    const available = providerRegistry.getAvailableProviders();

    if (policy === 'privacy' || policy === 'local_first') {
      const ollama = providerRegistry.getProvider('ollama');
      if (ollama && ollama.isAvailable()) {
        const models = await ollama.listModels();
        if (models.length > 0) {
          log.info(`Routed via "${policy}" policy to local Ollama (${models[0].id}).`);
          return { provider: ollama, model: models[0].id };
        }
      }
      if (policy === 'privacy') {
        throw new Error('Privacy policy active but local provider (Ollama) is offline.');
      }
    }

    // 3. User category preference override
    const pref = modelManager.getPreference(category);
    if (pref) {
      const prefProv = providerRegistry.getProvider(pref.provider);
      if (prefProv && prefProv.isAvailable()) {
        return { provider: prefProv, model: pref.model };
      }
    }

    // 4. Default available provider selection
    for (const prov of available) {
      if (prov.supportsCapability && prov.supportsCapability(category)) {
        const models = await prov.listModels();
        if (models.length > 0) {
          return { provider: prov, model: models[0].id };
        }
      }
    }

    // 5. Ultimate Fallback
    const defaultProv = providerRegistry.getDefaultProvider();
    if (defaultProv && defaultProv.isAvailable()) {
      const models = await defaultProv.listModels();
      const defaultModel = models.length > 0 ? models[0].id : 'gemini-1.5-flash';
      return { provider: defaultProv, model: defaultModel };
    }

    throw new Error('No AI Providers available. Check API key configurations or local Ollama instance.');
  }

  async executeWithFailover(capability, promptOptions, routeOptions = {}) {
    const available = providerRegistry.getAvailableProviders();
    let lastErr = null;

    for (const prov of available) {
      try {
        const route = await this.resolveRoute({ category: capability, provider: prov.id, ...routeOptions });
        log.info(`Executing capability "${capability}" via provider "${route.provider.id}"...`);
        return await route.provider.generate({ ...promptOptions, model: route.model });
      } catch (err) {
        lastErr = err;
        log.warn(`Provider "${prov.id}" failed for capability "${capability}": ${err.message}. Failing over...`);
      }
    }

    throw new Error(`All providers failed for capability "${capability}". Last error: ${lastErr?.message}`);
  }
}

export const aiRouter = new AIRouter();
