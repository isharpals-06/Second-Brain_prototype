import { aegisLogger } from '../core/logger.js';

export class BaseProvider {
  constructor(id, name, options = {}) {
    this.id = id;
    this.name = name;
    this.options = options;
    this.available = false;
    this.lastChecked = null;
    this.lastError = null;
    this.latencyMs = 0;
    this.capabilities = options.capabilities || ['text_generation'];
    this.log = aegisLogger.child(`Provider:${id}`);
  }

  async initialize() {
    throw new Error(`initialize() not implemented for provider ${this.id}`);
  }

  isAvailable() {
    return this.available;
  }

  supportsCapability(capability) {
    return this.capabilities.includes(capability);
  }

  async listModels() {
    return [];
  }

  async generate(options = {}) {
    throw new Error(`generate() not implemented for provider ${this.id}`);
  }

  async chat(options = {}) {
    return this.generate(options);
  }

  async stream(options = {}) {
    throw new Error(`stream() not implemented for provider ${this.id}`);
  }

  async embeddings(options = {}) {
    throw new Error(`embeddings() not implemented for provider ${this.id}`);
  }

  async vision(options = {}) {
    throw new Error(`vision() not implemented for provider ${this.id}`);
  }

  async imageGeneration(options = {}) {
    throw new Error(`imageGeneration() not implemented for provider ${this.id}`);
  }

  async toolCalling(options = {}) {
    throw new Error(`toolCalling() not implemented for provider ${this.id}`);
  }

  async reasoning(options = {}) {
    return this.generate(options);
  }

  tokenCount(text = '') {
    return Math.ceil(text.length / 4);
  }

  estimateCost(tokenCount = 0) {
    return 0; // Local / zero cost by default
  }

  cancel(requestId) {
    return true;
  }

  health() {
    return {
      providerId: this.id,
      name: this.name,
      available: this.available,
      lastChecked: this.lastChecked,
      lastError: this.lastError,
      latencyMs: this.latencyMs,
      capabilities: this.capabilities,
    };
  }

  async shutdown() {
    this.available = false;
  }
}
