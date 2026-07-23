import { vectorMemoryStore } from './VectorMemoryStore.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Memory:HybridRetrieval');

export class HybridRetrievalEngine {
  constructor(cognitiveStorage) {
    this.storage = cognitiveStorage;
  }

  setStorage(storage) {
    this.storage = storage;
  }

  async retrieveRankedContext(query, options = {}) {
    const {
      limit = 10,
      activeGoal = '',
      weights = { vector: 0.35, graph: 0.2, recency: 0.15, importance: 0.15, goalMatch: 0.15 }
    } = options;

    const queryEmbedding = await vectorMemoryStore.generateEmbedding(query);
    const now = Date.now();

    // Fetch candidate memories across Semantic and Episodic layers
    const semantics = this.storage ? this.storage.listSemantic() : [];
    const episodics = this.storage ? this.storage.listEpisodic() : [];
    const candidates = [...semantics, ...episodics];

    const qLower = (query + ' ' + activeGoal).toLowerCase();

    const scoredItems = candidates.map(item => {
      // 1. Vector similarity score
      const vecSim = vectorMemoryStore.cosineSimilarity(queryEmbedding, item.embedding || []);

      // 2. Keyword / Graph relevance score
      const text = `${item.name || item.title || ''} ${item.content || item.summary || ''} ${(item.tags || []).join(' ')}`.toLowerCase();
      let keywordScore = 0;
      if (qLower.split(' ').some(w => w.length > 3 && text.includes(w))) {
        keywordScore = 0.8;
      }

      // 3. Recency decay score
      const itemTime = item.timestamp || item.updated_at || item.created_at;
      const ageHours = itemTime ? Math.max(0, (now - new Date(itemTime).getTime()) / 3600000) : 100;
      const recencyScore = Math.exp(-ageHours / 168); // Decay over 1 week

      // 4. Importance score
      const importanceScore = item.importance || item.confidence || 0.5;

      // 5. Active Goal Match score
      let goalScore = 0;
      if (activeGoal && text.includes(activeGoal.toLowerCase())) {
        goalScore = 1.0;
      }

      // Compute weighted composite score
      const finalScore =
        weights.vector * vecSim +
        weights.graph * keywordScore +
        weights.recency * recencyScore +
        weights.importance * importanceScore +
        weights.goalMatch * goalScore;

      return {
        ...item,
        score: parseFloat(finalScore.toFixed(4)),
        scoresDetail: { vecSim, keywordScore, recencyScore, importanceScore, goalScore }
      };
    });

    scoredItems.sort((a, b) => b.score - a.score);
    const topResults = scoredItems.slice(0, limit);

    log.info(`HybridRetrieval returned ${topResults.length} ranked context items for query: "${query}"`);
    return topResults;
  }
}

export const hybridRetrievalEngine = new HybridRetrievalEngine();
