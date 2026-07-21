import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Knowledge:VectorStoreProvider');

function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dot = 0.0, normA = 0.0, normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export class VectorStoreProvider {
  constructor() {
    this.vectors = new Map(); // id -> { vector, metadata }
  }

  upsertVector(id, vector, metadata = {}) {
    if (!id || !vector) return;
    this.vectors.set(id, { vector, metadata, updatedAt: new Date().toISOString() });
    log.debug(`Upserted vector for entity "${id}"`);
  }

  searchVector(queryVector, topK = 5, filterFn = null) {
    if (!queryVector || this.vectors.size === 0) return [];

    const results = [];
    for (const [id, item] of this.vectors.entries()) {
      if (filterFn && !filterFn(item.metadata)) continue;

      const score = cosineSimilarity(queryVector, item.vector);
      results.push({ id, score, metadata: item.metadata });
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  deleteVector(id) {
    this.vectors.delete(id);
  }

  size() {
    return this.vectors.size;
  }
}

export const vectorStoreProvider = new VectorStoreProvider();
