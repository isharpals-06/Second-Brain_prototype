import { embeddingService } from './EmbeddingService.js';
import { vectorStoreProvider } from './VectorStoreProvider.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Knowledge:SemanticIndex');

export class SemanticIndex {
  constructor() {
    this.indexedCount = 0;
  }

  async indexItem(id, text, metadata = {}) {
    if (!id || !text) return null;

    try {
      const vector = await embeddingService.generateEmbedding(text);
      vectorStoreProvider.upsertVector(id, vector, {
        id,
        ...metadata,
        textSnippet: text.substring(0, 200)
      });
      this.indexedCount += 1;
      log.debug(`Indexed entity "${id}" in SemanticIndex.`);
      return true;
    } catch (err) {
      log.error(`Failed to index entity "${id}": ${err.message}`);
      return false;
    }
  }

  async search(queryText, topK = 5, metadataFilter = null) {
    if (!queryText) return [];
    const queryVector = await embeddingService.generateEmbedding(queryText);
    return vectorStoreProvider.searchVector(queryVector, topK, metadataFilter);
  }

  getMetrics() {
    return {
      indexedCount: this.indexedCount,
      totalVectors: vectorStoreProvider.size()
    };
  }
}

export const semanticIndex = new SemanticIndex();
