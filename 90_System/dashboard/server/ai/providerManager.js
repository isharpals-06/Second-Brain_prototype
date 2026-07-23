import { providerRegistry } from './providerRegistry.js';
import { modelManager } from './modelManager.js';
import { aiRouter } from './router.js';
import { serverEventBus, SystemEvents, EventSeverity } from '../core/eventBus.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('AI:ProviderManager');

export class ProviderManager {
  constructor() {
    this.telemetry = {
      totalRequests: 0,
      totalTokens: 0,
      totalErrors: 0,
      providerStats: {}
    };
  }

  recordTelemetry(providerId, latencyMs, tokens = 0, isError = false) {
    this.telemetry.totalRequests += 1;
    this.telemetry.totalTokens += tokens;
    if (isError) this.telemetry.totalErrors += 1;

    if (!this.telemetry.providerStats[providerId]) {
      this.telemetry.providerStats[providerId] = { requests: 0, errors: 0, totalMs: 0, avgMs: 0, tokens: 0 };
    }

    const stats = this.telemetry.providerStats[providerId];
    stats.requests += 1;
    if (isError) stats.errors += 1;
    stats.totalMs += latencyMs;
    stats.tokens += tokens;
    stats.avgMs = Math.round(stats.totalMs / stats.requests);
  }

  async generate(options = {}) {
    const route = await aiRouter.resolveRoute(options);
    const { provider, model } = route;

    log.info(`Executing generate() via Provider "${provider.id}" (Model: ${model})`);

    try {
      const result = await provider.generate({ ...options, model });
      this.recordTelemetry(provider.id, result.latencyMs, result.usage?.totalTokens || 0, false);
      return result;
    } catch (err) {
      log.error(`Primary generation failed on provider "${provider.id}": ${err.message}. Attempting failover...`);
      this.recordTelemetry(provider.id, 0, 0, true);

      // Attempt automatic failover to default provider
      const fallbackProv = providerRegistry.getDefaultProvider();
      if (fallbackProv && fallbackProv.id !== provider.id) {
        log.info(`Failing over generation to fallback provider "${fallbackProv.id}"`);
        const fallbackModels = await fallbackProv.listModels();
        const fbModel = fallbackModels[0]?.id || 'gemini-1.5-flash';
        const fbResult = await fallbackProv.generate({ ...options, model: fbModel });
        this.recordTelemetry(fallbackProv.id, fbResult.latencyMs, fbResult.usage?.totalTokens || 0, false);
        return fbResult;
      }
      throw err;
    }
  }

  async stream(options = {}) {
    const route = await aiRouter.resolveRoute(options);
    const { provider, model } = route;

    log.info(`Executing stream() via Provider "${provider.id}" (Model: ${model})`);

    try {
      await provider.stream({ ...options, model });
      this.recordTelemetry(provider.id, 100, 0, false);
    } catch (err) {
      log.error(`Streaming failed on provider "${provider.id}": ${err.message}`);
      this.recordTelemetry(provider.id, 0, 0, true);
      throw err;
    }
  }

  async embeddings(options = {}) {
    // Force category to embeddings
    const route = await aiRouter.resolveRoute({ ...options, category: 'embeddings' });
    const { provider, model } = route;

    log.info(`Executing embeddings() via Provider "${provider.id}" (Model: ${model})`);

    try {
      const result = await provider.embeddings({ ...options, model });
      this.recordTelemetry(provider.id, result.latencyMs, 0, false);
      return result;
    } catch (err) {
      log.error(`Embeddings failed on provider "${provider.id}": ${err.message}. Attempting failover...`);
      this.recordTelemetry(provider.id, 0, 0, true);

      // Fallback to Ollama or Gemini for embeddings
      const available = providerRegistry.getAvailableProviders();
      for (const altProv of available) {
        if (altProv.id !== provider.id) {
          try {
            const altModels = await altProv.listModels();
            const embedModel = altModels.find(m => m.capabilities?.includes('embeddings'))?.id;
            if (embedModel) {
              log.info(`Failing over embeddings to provider "${altProv.id}" (Model: ${embedModel})`);
              const altResult = await altProv.embeddings({ ...options, model: embedModel });
              this.recordTelemetry(altProv.id, altResult.latencyMs, 0, false);
              return altResult;
            }
          } catch (_) {}
        }
      }
      throw err;
    }
  }

  getTelemetry() {
    return {
      ...this.telemetry,
      providers: providerRegistry.listProviders()
    };
  }
}

export const providerManager = new ProviderManager();
