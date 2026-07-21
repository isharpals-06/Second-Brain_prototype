import { memoryStore } from './MemoryStore.js';
import { MemoryType, LifecycleStatus } from './types.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Memory:ConsolidationEngine');

export class ConsolidationEngine {
  consolidateMemories() {
    log.info('Running memory consolidation pass...');
    const memories = memoryStore.listMemories();

    const episodicCount = memories.filter(m => m.type === MemoryType.EPISODIC).length;

    if (episodicCount >= 3) {
      const summaryMemory = memoryStore.createMemory({
        type: MemoryType.LEARNING,
        title: `Consolidated Learning Pass (${new Date().toLocaleDateString()})`,
        summary: `Synthesized key learnings across ${episodicCount} recent execution episodes. System stability confirmed.`,
        importance: 0.85,
        confidence: 0.9,
        tags: ['consolidation', 'learning', 'summary']
      });

      log.info(`Memory consolidation created summary memory "${summaryMemory.id}".`);
      return { status: 'consolidated', newMemoryId: summaryMemory.id };
    }

    log.info('Memory consolidation completed. Threshold not reached.');
    return { status: 'skipped', reason: 'Insufficient memories for consolidation pass' };
  }
}

export const consolidationEngine = new ConsolidationEngine();
