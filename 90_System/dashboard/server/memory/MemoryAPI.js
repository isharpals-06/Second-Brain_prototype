import { memoryStore } from './MemoryStore.js';
import { retrievalEngine } from './RetrievalEngine.js';
import { consolidationEngine } from './ConsolidationEngine.js';
import { reflectionEngine } from './ReflectionEngine.js';
import { forgettingEngine } from './ForgettingEngine.js';
import { experienceStore } from './ExperienceStore.js';

class MemoryAPI {
  search(params = {}) {
    return retrievalEngine.search(params);
  }

  listRecent(limit = 10) {
    const list = memoryStore.listMemories();
    list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return list.slice(0, limit);
  }

  listImportant(limit = 10) {
    const list = memoryStore.listMemories();
    list.sort((a, b) => b.importance - a.importance);
    return list.slice(0, limit);
  }

  storeMemory(data) {
    return memoryStore.createMemory(data);
  }

  consolidate() {
    return consolidationEngine.consolidateMemories();
  }

  reflect() {
    return reflectionEngine.generateReflectionReport();
  }

  forget(id, reason) {
    return forgettingEngine.forgetMemory(id, reason);
  }

  listExperiences() {
    return experienceStore.listExperiences();
  }

  getMetrics() {
    const all = memoryStore.listMemories();
    return {
      totalMemories: all.length,
      activeMemories: all.filter(m => m.lifecycleStatus === 'active').length,
      consolidatedMemories: all.filter(m => m.lifecycleStatus === 'consolidated').length,
      totalExperiences: experienceStore.listExperiences().length,
      forgettingAuditLogsCount: forgettingEngine.getAuditLogs().length
    };
  }
}

export const memoryAPI = new MemoryAPI();
export { MemoryAPI };
