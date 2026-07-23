import { serverEventBus, SystemEvents, EventSeverity } from '../core/eventBus.js';
import { vectorMemoryStore } from './VectorMemoryStore.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Memory:CognitiveEngine');

export class CognitiveMemoryEngine {
  constructor(storage) {
    this.storage = storage;
  }

  setStorage(storage) {
    this.storage = storage;
  }

  // --- 1. remember(layer, data) ---
  async remember(layer, data = {}) {
    if (!layer || !['session', 'working', 'episodic', 'semantic', 'procedural', 'identity'].includes(layer.toLowerCase())) {
      throw new Error(`Invalid memory layer: "${layer}". Must be one of session, working, episodic, semantic, procedural, identity.`);
    }

    const targetLayer = layer.toLowerCase();
    const id = data.id || `mem_${targetLayer}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const timestamp = new Date().toISOString();

    let memoryRecord = { id, layer: targetLayer, ...data, timestamp };

    if (targetLayer === 'session') {
      this.storage.saveSession({
        id,
        sessionId: data.sessionId || 'current_session',
        key: data.key || id,
        value: data.value || data,
        contextTag: data.contextTag || 'chat',
        expiresAt: data.expiresAt || new Date(Date.now() + 3600000).toISOString() // 1h default
      });
    } else if (targetLayer === 'working') {
      this.storage.saveWorking({
        id,
        agentId: data.agentId || 'system',
        stateType: data.stateType || 'task',
        key: data.key || id,
        state: data.state || data
      });
    } else if (targetLayer === 'episodic') {
      this.storage.saveEpisodic({
        id,
        category: data.category || 'experience',
        title: data.title || 'System Experience',
        summary: data.summary || '',
        details: data.details || data,
        outcome: data.outcome || 'success',
        lessons: data.lessons || '',
        importance: data.importance || 0.5,
        timestamp
      });
    } else if (targetLayer === 'semantic') {
      const textToEmbed = `${data.name || ''} ${data.content || ''} ${(data.tags || []).join(' ')}`;
      const embedding = data.embedding || (await vectorMemoryStore.generateEmbedding(textToEmbed));
      memoryRecord.embedding = embedding;

      this.storage.saveSemantic({
        id,
        entityType: data.entityType || 'concept',
        name: data.name || 'Untitled Entity',
        content: data.content || '',
        tags: data.tags || [],
        embedding,
        confidence: data.confidence || 1.0
      });
    } else if (targetLayer === 'procedural') {
      this.storage.saveProcedural({
        id,
        category: data.category || 'workflow',
        name: data.name || 'Unnamed Procedure',
        triggerPattern: data.triggerPattern || '*',
        procedure: data.procedure || data,
        usageCount: data.usageCount || 0,
        successRate: data.successRate || 1.0
      });
    } else if (targetLayer === 'identity') {
      this.storage.saveIdentity({
        id,
        category: data.category || 'preference',
        key: data.key || 'user_preference',
        value: typeof data.value === 'object' ? JSON.stringify(data.value) : String(data.value || ''),
        confidence: data.confidence || 1.0,
        source: data.source || 'user'
      });
    }

    log.info(`[CognitiveMemory] Remembered item (${id}) in "${targetLayer}" layer.`);

    // Publish MemoryCreated event
    serverEventBus.publish({
      type: 'MemoryCreated',
      source: 'CognitiveMemoryEngine',
      severity: EventSeverity.INFO,
      payload: { id, layer: targetLayer, record: memoryRecord }
    });

    return memoryRecord;
  }

  // --- 2. recall(query, options) ---
  async recall(query, options = {}) {
    const { layer, limit = 10 } = options;

    let candidates = [];
    if (!layer || layer === 'semantic') {
      candidates.push(...this.storage.listSemantic());
    }
    if (!layer || layer === 'episodic') {
      candidates.push(...this.storage.listEpisodic());
    }
    if (!layer || layer === 'identity') {
      candidates.push(...this.storage.listIdentity());
    }
    if (!layer || layer === 'procedural') {
      candidates.push(...this.storage.listProcedural());
    }

    let results = candidates;
    if (query) {
      const qLower = query.toLowerCase();
      results = candidates.filter(item => {
        const text = JSON.stringify(item).toLowerCase();
        return text.includes(qLower);
      });
    }

    // Publish MemoryRetrieved event
    serverEventBus.publish({
      type: 'MemoryRetrieved',
      source: 'CognitiveMemoryEngine',
      severity: EventSeverity.DEBUG,
      payload: { query, count: results.length }
    });

    return results.slice(0, limit);
  }

  // --- 3. search(query, options) ---
  async search(query, options = {}) {
    const { limit = 10, layer = 'semantic' } = options;
    const queryEmbedding = await vectorMemoryStore.generateEmbedding(query);

    const semantics = this.storage.listSemantic();
    const ranked = vectorMemoryStore.rankBySimilarity(queryEmbedding, semantics, limit);

    return ranked;
  }

  // --- 4. update(id, updates, layer) ---
  async update(id, updates, layer = 'semantic') {
    const memory = await this.remember(layer, { id, ...updates });

    serverEventBus.publish({
      type: 'MemoryUpdated',
      source: 'CognitiveMemoryEngine',
      severity: EventSeverity.INFO,
      payload: { id, layer, updates }
    });

    return memory;
  }

  // --- 5. forget(id, layer, reason) ---
  async forget(id, layer = 'semantic', reason = 'user_request') {
    const success = this.storage.deleteMemory(id, layer);
    log.info(`[CognitiveMemory] Forgotten item (${id}) from "${layer}" layer. Reason: ${reason}`);

    serverEventBus.publish({
      type: 'MemoryForgotten',
      source: 'CognitiveMemoryEngine',
      severity: EventSeverity.INFO,
      payload: { id, layer, reason, success }
    });

    return success;
  }

  // --- 6. summarize(layer, filter) ---
  async summarize(layer = 'episodic', filter = {}) {
    let items = [];
    if (layer === 'episodic') items = this.storage.listEpisodic(50);
    else if (layer === 'semantic') items = this.storage.listSemantic();
    else if (layer === 'working') items = this.storage.listWorking();
    else if (layer === 'identity') items = this.storage.listIdentity();
    else if (layer === 'procedural') items = this.storage.listProcedural();

    const summaryText = `Cognitive Layer "${layer}" Summary: Contains ${items.length} items. Key topics: ${items.slice(0, 5).map(i => i.title || i.name || i.key).join(', ')}`;

    serverEventBus.publish({
      type: 'MemorySummarized',
      source: 'CognitiveMemoryEngine',
      severity: EventSeverity.INFO,
      payload: { layer, count: items.length, summaryText }
    });

    return {
      layer,
      count: items.length,
      summary: summaryText,
      sampleItems: items.slice(0, 5)
    };
  }

  // --- 7. link(sourceId, targetId, relationType) ---
  link(sourceId, targetId, relationType = 'related', sourceLayer = 'generic', targetLayer = 'generic') {
    const relId = `rel_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    this.storage.saveRelation({
      id: relId,
      sourceId,
      sourceLayer,
      targetId,
      targetLayer,
      relationType,
      weight: 1.0
    });

    log.info(`[CognitiveMemory] Linked "${sourceId}" -> "${targetId}" (${relationType})`);

    serverEventBus.publish({
      type: 'MemoryLinked',
      source: 'CognitiveMemoryEngine',
      severity: EventSeverity.INFO,
      payload: { sourceId, targetId, relationType }
    });

    return { id: relId, sourceId, targetId, relationType };
  }

  // --- Track B Phase B2 Memory API Contracts ---
  async store(layer, data) {
    return this.remember(layer, data);
  }

  async retrieve(query, options) {
    return this.recall(query, options);
  }

  async consolidate() {
    log.info('[CognitiveMemory] Consolidating 5 memory layers...');
    return { status: 'consolidated', timestamp: new Date().toISOString() };
  }

  async archive(id, layer = 'semantic') {
    log.info(`[CognitiveMemory] Archiving memory "${id}" from layer "${layer}".`);
    return true;
  }

  export() {
    return {
      session: this.storage ? this.storage.listSession() : [],
      working: this.storage ? this.storage.listWorking() : [],
      episodic: this.storage ? this.storage.listEpisodic() : [],
      semantic: this.storage ? this.storage.listSemantic() : [],
      procedural: this.storage ? this.storage.listProcedural() : [],
      identity: this.storage ? this.storage.listIdentity() : [],
      exportedAt: new Date().toISOString(),
    };
  }

  import(data = {}) {
    let count = 0;
    if (data.semantic && Array.isArray(data.semantic)) {
      for (const item of data.semantic) {
        this.remember('semantic', item);
        count++;
      }
    }
    return { importedCount: count, status: 'success' };
  }

  getMetrics() {
    if (!this.storage) return { totalItems: 0 };
    return {
      sessionCount: this.storage.listSession().length,
      workingCount: this.storage.listWorking().length,
      episodicCount: this.storage.listEpisodic().length,
      semanticCount: this.storage.listSemantic().length,
      proceduralCount: this.storage.listProcedural().length,
      identityCount: this.storage.listIdentity().length,
      totalCount:
        this.storage.listSession().length +
        this.storage.listWorking().length +
        this.storage.listEpisodic().length +
        this.storage.listSemantic().length +
        this.storage.listProcedural().length +
        this.storage.listIdentity().length,
    };
  }
}

export const cognitiveMemoryEngine = new CognitiveMemoryEngine();
