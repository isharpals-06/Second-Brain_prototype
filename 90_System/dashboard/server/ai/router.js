import { providerRegistry } from './providerRegistry.js';
import { modelManager } from './modelManager.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('AI:Router');

export class AIRouter {
  async resolveRoute(options = {}) {
    const { category = 'conversation', provider: requestedProvider, model: requestedModel } = options;

    // 1. If explicit provider & model specified and provider is available
    if (requestedProvider && requestedModel) {
      const prov = providerRegistry.getProvider(requestedProvider);
      if (prov && prov.isAvailable()) {
        return { provider: prov, model: requestedModel };
      }
      log.warn(`Requested provider "${requestedProvider}" unavailable. Routing to fallback...`);
    }

    // 2. Check user preference for category
    const pref = modelManager.getPreference(category);
    if (pref) {
      const prefProv = providerRegistry.getProvider(pref.provider);
      if (prefProv && prefProv.isAvailable()) {
        return { provider: prefProv, model: pref.model };
      }
    }

    // 3. Dynamic Fallback: Find any available provider with requested capability
    const available = providerRegistry.getAvailableProviders();
    for (const prov of available) {
      const models = await prov.listModels();
      const match = models.find(m => m.capabilities && m.capabilities.includes(category));
      if (match) {
        log.info(`Routed category "${category}" to fallback provider "${prov.id}" (Model: ${match.id})`);
        return { provider: prov, model: match.id };
      }
    }

    // 4. Ultimate Fallback: Default available provider with default model
    const defaultProv = providerRegistry.getDefaultProvider();
    if (defaultProv && defaultProv.isAvailable()) {
      const models = await defaultProv.listModels();
      const defaultModel = models.length > 0 ? models[0].id : 'gemini-1.5-flash';
      return { provider: defaultProv, model: defaultModel };
    }

    throw new Error('No AI Providers available. Check API key configurations or local Ollama instance.');
  }
}

export const aiRouter = new AIRouter();
