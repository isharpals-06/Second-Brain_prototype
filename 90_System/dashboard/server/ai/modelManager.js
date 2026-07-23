import { providerRegistry } from './providerRegistry.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('AI:ModelManager');

export class ModelManager {
  constructor() {
    this.userPreferences = {
      defaultProvider: 'gemini',
      categoryDefaults: {
        coding: { provider: 'openrouter', model: 'anthropic/claude-3.5-sonnet' },
        reasoning: { provider: 'openrouter', model: 'deepseek/deepseek-r1' },
        conversation: { provider: 'gemini', model: 'gemini-1.5-flash' },
        embeddings: { provider: 'gemini', model: 'text-embedding-004' },
        planning: { provider: 'gemini', model: 'gemini-1.5-pro' },
        vision: { provider: 'gemini', model: 'gemini-1.5-pro' }
      }
    };
  }

  async listAllModels() {
    const allModels = [];
    const providers = providerRegistry.providers.values();

    for (const provider of providers) {
      if (provider.isAvailable()) {
        try {
          const models = await provider.listModels();
          allModels.push(...models);
        } catch (err) {
          log.warn(`Failed to list models for provider "${provider.id}": ${err.message}`);
        }
      }
    }
    return allModels;
  }

  async getModelsByCategory(category) {
    const models = await this.listAllModels();
    return models.filter(m => m.capabilities && m.capabilities.includes(category));
  }

  setCategoryPreference(category, providerId, modelId) {
    this.userPreferences.categoryDefaults[category] = { provider: providerId, model: modelId };
    log.info(`Updated category preference for "${category}": ${providerId} / ${modelId}`);
  }

  getPreference(category = 'conversation') {
    return this.userPreferences.categoryDefaults[category] || this.userPreferences.categoryDefaults.conversation;
  }
}

export const modelManager = new ModelManager();
