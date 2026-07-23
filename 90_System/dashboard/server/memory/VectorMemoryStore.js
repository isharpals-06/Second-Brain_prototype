import { providerManager } from '../ai/providerManager.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Memory:VectorStore');

export class VectorMemoryStore {
  cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) {
      return 0;
    }
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async generateEmbedding(text) {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return [];
    }
    try {
      const res = await providerManager.embeddings({ text });
      return res.embedding || [];
    } catch (err) {
      log.warn(`Embedding generation failed: ${err.message}. Using fallback zero vector.`);
      return [];
    }
  }

  rankBySimilarity(queryEmbedding, items, limit = 10) {
    if (!queryEmbedding || queryEmbedding.length === 0) {
      return items.slice(0, limit);
    }

    const scored = items.map(item => {
      const sim = this.cosineSimilarity(queryEmbedding, item.embedding || []);
      return { ...item, vectorScore: sim };
    });

    scored.sort((a, b) => b.vectorScore - a.vectorScore);
    return scored.slice(0, limit);
  }
}

export const vectorMemoryStore = new VectorMemoryStore();
