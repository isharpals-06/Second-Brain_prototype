import { cognitiveMemoryEngine } from './initMemory.js';
import { documentIngestionEngine } from './initMemory.js';

class MemoryAPI {
  // --- Backward Compatible Facade Methods ---
  search(params = {}) {
    const query = typeof params === 'string' ? params : (params.query || params.term || '');
    return cognitiveMemoryEngine.recall(query, params);
  }

  listRecent(limit = 10) {
    return cognitiveMemoryEngine.storage.listEpisodic(limit);
  }

  listImportant(limit = 10) {
    const semantics = cognitiveMemoryEngine.storage.listSemantic();
    return semantics.slice(0, limit);
  }

  storeMemory(data) {
    const layer = data.layer || (data.type === 'experience' ? 'episodic' : 'semantic');
    return cognitiveMemoryEngine.remember(layer, data);
  }

  consolidate() {
    return cognitiveMemoryEngine.summarize('episodic');
  }

  reflect() {
    return cognitiveMemoryEngine.summarize('identity');
  }

  forget(id, reason = 'user_request', layer = 'semantic') {
    return cognitiveMemoryEngine.forget(id, layer, reason);
  }

  listExperiences() {
    return cognitiveMemoryEngine.storage.listEpisodic();
  }

  getMetrics() {
    const sessionCount = cognitiveMemoryEngine.storage.purgeExpiredSessions();
    const working = cognitiveMemoryEngine.storage.listWorking();
    const episodic = cognitiveMemoryEngine.storage.listEpisodic();
    const semantic = cognitiveMemoryEngine.storage.listSemantic();
    const procedural = cognitiveMemoryEngine.storage.listProcedural();
    const identity = cognitiveMemoryEngine.storage.listIdentity();

    return {
      architecture: 'AEGISOS Cognitive Memory Foundation (v1.3.0)',
      layers: {
        session: sessionCount,
        working: working.length,
        episodic: episodic.length,
        semantic: semantic.length,
        procedural: procedural.length,
        identity: identity.length
      },
      totalMemories: working.length + episodic.length + semantic.length + procedural.length + identity.length
    };
  }

  // --- Unified Cognitive Memory API (v1.3.0) ---
  remember(layer, data) {
    return cognitiveMemoryEngine.remember(layer, data);
  }

  recall(query, options) {
    return cognitiveMemoryEngine.recall(query, options);
  }

  update(id, updates, layer) {
    return cognitiveMemoryEngine.update(id, updates, layer);
  }

  summarize(layer, filter) {
    return cognitiveMemoryEngine.summarize(layer, filter);
  }

  link(sourceId, targetId, relationType, sourceLayer, targetLayer) {
    return cognitiveMemoryEngine.link(sourceId, targetId, relationType, sourceLayer, targetLayer);
  }

  unlink(sourceId, targetId, relationType) {
    return cognitiveMemoryEngine.unlink(sourceId, targetId, relationType);
  }

  ingestDocument(filePath, options) {
    return documentIngestionEngine.ingestFile(filePath, options);
  }
}

export const memoryAPI = new MemoryAPI();
export { MemoryAPI };
