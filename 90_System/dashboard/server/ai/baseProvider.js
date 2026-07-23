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
    this.log = aegisLogger.child(`Provider:${id}`);
  }

  async initialize() {
    throw new Error(`initialize() not implemented for provider ${this.id}`);
  }

  isAvailable() {
    return this.available;
  }

  async listModels() {
    return [];
  }

  async generate(options = {}) {
    throw new Error(`generate() not implemented for provider ${this.id}`);
  }

  async stream(options = {}) {
    throw new Error(`stream() not implemented for provider ${this.id}`);
  }

  async embeddings(options = {}) {
    throw new Error(`embeddings() not implemented for provider ${this.id}`);
  }

  health() {
    return {
      providerId: this.id,
      name: this.name,
      available: this.available,
      lastChecked: this.lastChecked,
      lastError: this.lastError,
      latencyMs: this.latencyMs
    };
  }

  async shutdown() {
    this.available = false;
  }
}
