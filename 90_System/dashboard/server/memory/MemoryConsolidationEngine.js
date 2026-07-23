import { serverEventBus, EventSeverity } from '../core/eventBus.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Memory:ConsolidationEngine');

export class MemoryConsolidationEngine {
  constructor(storage) {
    this.storage = storage;
  }

  setStorage(storage) {
    this.storage = storage;
  }

  async runConsolidationPass() {
    log.info('Running Cognitive Memory Consolidation & Pruning Pass...');
    if (!this.storage) {
      log.warn('MemoryConsolidationEngine storage not bound. Skipping.');
      return { purgedSessions: 0, mergedDuplicates: 0, totalSemantic: 0 };
    }

    // 1. Purge expired session memories
    const purgedSessions = this.storage.purgeExpiredSessions();

    // 2. Scan & Deduplicate Semantic Memories
    const semantics = this.storage.listSemantic();
    const seenNames = new Map();
    let mergedDuplicates = 0;

    for (const sem of semantics) {
      const normName = sem.name.toLowerCase().trim();
      if (seenNames.has(normName)) {
        const existing = seenNames.get(normName);
        // Merge content and increase confidence
        existing.content += `\n[Merged Record]: ${sem.content}`;
        existing.confidence = Math.min(1.0, existing.confidence + 0.1);
        this.storage.saveSemantic(existing);
        this.storage.deleteMemory(sem.id, 'semantic');
        mergedDuplicates += 1;
      } else {
        seenNames.set(normName, sem);
      }
    }

    const summary = {
      timestamp: new Date().toISOString(),
      purgedSessions,
      mergedDuplicates,
      totalSemantic: semantics.length - mergedDuplicates,
      status: 'healthy'
    };

    serverEventBus.publish({
      type: 'MemoryConsolidated',
      source: 'MemoryConsolidationEngine',
      severity: EventSeverity.INFO,
      payload: summary
    });

    log.info(`Memory Consolidation pass complete. Purged ${purgedSessions} expired sessions, merged ${mergedDuplicates} duplicates.`);
    return summary;
  }
}

export const memoryConsolidationEngine = new MemoryConsolidationEngine();
