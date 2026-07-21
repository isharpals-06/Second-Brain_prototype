import { aegisLogger } from '../core/logger.js';
import { config } from '../config/index.js';

const log = aegisLogger.child('Knowledge:EmbeddingService');

export class EmbeddingService {
  constructor() {
    this.ollamaUrl = config.ollamaUrl;
    this.modelName = 'nomic-embed-text';
    this.dim = 64;
  }

  async generateEmbedding(text) {
    if (!text || typeof text !== 'string') return new Array(this.dim).fill(0);

    try {
      const response = await fetch(`${this.ollamaUrl}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: this.modelName, prompt: text.substring(0, 2000) })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.embedding && Array.isArray(data.embedding)) {
          return data.embedding;
        }
      }
    } catch (_) {}

    // Fallback deterministic feature hash vector generator when offline/unsupported
    return this.generateFallbackVector(text);
  }

  generateFallbackVector(text) {
    const vec = new Array(this.dim).fill(0);
    const cleaned = text.toLowerCase();
    for (let i = 0; i < cleaned.length; i++) {
      const charCode = cleaned.charCodeAt(i);
      const idx = (charCode * (i + 1)) % this.dim;
      vec[idx] += 0.05;
    }
    // Normalize vector
    const norm = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
    return norm > 0 ? vec.map(v => v / norm) : vec;
  }
}

export const embeddingService = new EmbeddingService();
