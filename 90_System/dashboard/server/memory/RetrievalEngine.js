import { memoryStore } from './MemoryStore.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Memory:RetrievalEngine');

export class RetrievalEngine {
  search({ query = '', type = null, minImportance = 0, limit = 10 }) {
    const all = memoryStore.listMemories();
    const qLower = query.toLowerCase();

    let matches = all.filter(m => {
      if (type && m.type !== type) return false;
      if (m.importance < minImportance) return false;

      if (!query) return true;

      const inTitle = m.title.toLowerCase().includes(qLower);
      const inSummary = m.summary.toLowerCase().includes(qLower);
      const inTags = m.tags.some(t => t.toLowerCase().includes(qLower));

      return inTitle || inSummary || inTags;
    });

    // Rank by composite score descending
    matches.sort((a, b) => b.score - a.score);

    const results = matches.slice(0, limit);
    log.info(`Memory search for "${query}" matched ${results.length} memories.`);
    return results;
  }
}

export const retrievalEngine = new RetrievalEngine();
