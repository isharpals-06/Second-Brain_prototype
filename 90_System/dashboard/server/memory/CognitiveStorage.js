import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Memory:CognitiveStorage');

export class CognitiveStorage {
  constructor(dbInstance) {
    this.db = dbInstance || null;
    this.initTables();
  }

  setDatabase(dbInstance) {
    this.db = dbInstance;
    this.initTables();
  }

  initTables() {
    if (!this.db) return;
    try {
      // 1. Session Memory Table (expires automatically)
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS memory_session (
          id TEXT PRIMARY KEY,
          session_id TEXT NOT NULL,
          key TEXT NOT NULL,
          value_json TEXT,
          context_tag TEXT,
          expires_at TEXT,
          created_at TEXT NOT NULL
        );
      `);

      // 2. Working Memory Table (survives app restarts)
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS memory_working (
          id TEXT PRIMARY KEY,
          agent_id TEXT,
          state_type TEXT NOT NULL,
          key TEXT NOT NULL,
          state_json TEXT,
          updated_at TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
      `);

      // 3. Episodic Memory Table (experiences, events, workouts, reviews)
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS memory_episodic (
          id TEXT PRIMARY KEY,
          category TEXT NOT NULL,
          title TEXT NOT NULL,
          summary TEXT,
          details_json TEXT,
          outcome TEXT,
          lessons TEXT,
          importance REAL DEFAULT 0.5,
          timestamp TEXT NOT NULL
        );
      `);

      // 4. Semantic Memory Table (facts, entities, concepts)
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS memory_semantic (
          id TEXT PRIMARY KEY,
          entity_type TEXT NOT NULL,
          name TEXT NOT NULL,
          content TEXT,
          tags TEXT,
          embedding_json TEXT,
          confidence REAL DEFAULT 1.0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);

      // 5. Procedural Memory Table ("how-to", workflows, templates)
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS memory_procedural (
          id TEXT PRIMARY KEY,
          category TEXT NOT NULL,
          name TEXT NOT NULL,
          trigger_pattern TEXT,
          procedure_json TEXT,
          usage_count INTEGER DEFAULT 0,
          success_rate REAL DEFAULT 1.0,
          updated_at TEXT NOT NULL
        );
      `);

      // 6. Identity Memory Table (long-term preferences, habits, goals)
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS memory_identity (
          id TEXT PRIMARY KEY,
          category TEXT NOT NULL,
          key TEXT NOT NULL,
          value TEXT NOT NULL,
          confidence REAL DEFAULT 1.0,
          source TEXT,
          updated_at TEXT NOT NULL
        );
      `);

      // 7. Memory Relations / Links Graph Table
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS memory_relations (
          id TEXT PRIMARY KEY,
          source_id TEXT NOT NULL,
          source_layer TEXT NOT NULL,
          target_id TEXT NOT NULL,
          target_layer TEXT NOT NULL,
          relation_type TEXT NOT NULL,
          weight REAL DEFAULT 1.0,
          created_at TEXT NOT NULL
        );
      `);

      log.info('CognitiveStorage 6-Layer SQLite tables and relations graph initialized.');
    } catch (err) {
      log.error(`Failed to initialize cognitive memory tables: ${err.message}`);
    }
  }

  // --- Session Memory Operations ---
  saveSession(item) {
    if (!this.db) return;
    const stmt = this.db.prepare(`
      INSERT INTO memory_session (id, session_id, key, value_json, context_tag, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET value_json=excluded.value_json, expires_at=excluded.expires_at
    `);
    stmt.run(item.id, item.sessionId || 'default', item.key, JSON.stringify(item.value), item.contextTag || null, item.expiresAt || null, item.createdAt || new Date().toISOString());
  }

  getSession(id) {
    if (!this.db) return null;
    const stmt = this.db.prepare('SELECT * FROM memory_session WHERE id = ?');
    const row = stmt.get(id);
    if (!row) return null;
    return { ...row, value: row.value_json ? JSON.parse(row.value_json) : null };
  }

  purgeExpiredSessions() {
    if (!this.db) return 0;
    const now = new Date().toISOString();
    const stmt = this.db.prepare('DELETE FROM memory_session WHERE expires_at IS NOT NULL AND expires_at < ?');
    const info = stmt.run(now);
    return info.changes || 0;
  }

  // --- Working Memory Operations ---
  saveWorking(item) {
    if (!this.db) return;
    const stmt = this.db.prepare(`
      INSERT INTO memory_working (id, agent_id, state_type, key, state_json, updated_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET state_json=excluded.state_json, updated_at=excluded.updated_at
    `);
    const now = new Date().toISOString();
    stmt.run(item.id, item.agentId || 'system', item.stateType || 'general', item.key, JSON.stringify(item.state), now, item.createdAt || now);
  }

  getWorking(key) {
    if (!this.db) return null;
    const stmt = this.db.prepare('SELECT * FROM memory_working WHERE key = ? OR id = ?');
    const row = stmt.get(key, key);
    if (!row) return null;
    return { ...row, state: row.state_json ? JSON.parse(row.state_json) : null };
  }

  listWorking() {
    if (!this.db) return [];
    const stmt = this.db.prepare('SELECT * FROM memory_working ORDER BY updated_at DESC');
    return stmt.all().map(r => ({ ...r, state: r.state_json ? JSON.parse(r.state_json) : null }));
  }

  // --- Episodic Memory Operations ---
  saveEpisodic(item) {
    if (!this.db) return;
    const stmt = this.db.prepare(`
      INSERT INTO memory_episodic (id, category, title, summary, details_json, outcome, lessons, importance, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET summary=excluded.summary, details_json=excluded.details_json, outcome=excluded.outcome, lessons=excluded.lessons
    `);
    stmt.run(item.id, item.category || 'general', item.title, item.summary || '', JSON.stringify(item.details || {}), item.outcome || 'completed', item.lessons || '', item.importance || 0.5, item.timestamp || new Date().toISOString());
  }

  listEpisodic(limit = 20) {
    if (!this.db) return [];
    const stmt = this.db.prepare('SELECT * FROM memory_episodic ORDER BY timestamp DESC LIMIT ?');
    return stmt.all(limit).map(r => ({ ...r, details: r.details_json ? JSON.parse(r.details_json) : {} }));
  }

  // --- Semantic Memory Operations ---
  saveSemantic(item) {
    if (!this.db) return;
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO memory_semantic (id, entity_type, name, content, tags, embedding_json, confidence, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET content=excluded.content, tags=excluded.tags, embedding_json=excluded.embedding_json, updated_at=excluded.updated_at
    `);
    const tagsStr = Array.isArray(item.tags) ? item.tags.join(',') : (item.tags || '');
    stmt.run(item.id, item.entityType || 'concept', item.name, item.content || '', tagsStr, JSON.stringify(item.embedding || []), item.confidence || 1.0, item.createdAt || now, now);
  }

  listSemantic() {
    if (!this.db) return [];
    const stmt = this.db.prepare('SELECT * FROM memory_semantic ORDER BY updated_at DESC');
    return stmt.all().map(r => ({ ...r, embedding: r.embedding_json ? JSON.parse(r.embedding_json) : [], tags: r.tags ? r.tags.split(',') : [] }));
  }

  // --- Procedural Memory Operations ---
  saveProcedural(item) {
    if (!this.db) return;
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO memory_procedural (id, category, name, trigger_pattern, procedure_json, usage_count, success_rate, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET procedure_json=excluded.procedure_json, usage_count=excluded.usage_count, success_rate=excluded.success_rate, updated_at=excluded.updated_at
    `);
    stmt.run(item.id, item.category || 'workflow', item.name, item.triggerPattern || '*', JSON.stringify(item.procedure || {}), item.usageCount || 0, item.successRate || 1.0, now);
  }

  listProcedural() {
    if (!this.db) return [];
    const stmt = this.db.prepare('SELECT * FROM memory_procedural ORDER BY usage_count DESC');
    return stmt.all().map(r => ({ ...r, procedure: r.procedure_json ? JSON.parse(r.procedure_json) : {} }));
  }

  // --- Identity Memory Operations ---
  saveIdentity(item) {
    if (!this.db) return;
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO memory_identity (id, category, key, value, confidence, source, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET value=excluded.value, confidence=excluded.confidence, updated_at=excluded.updated_at
    `);
    stmt.run(item.id, item.category || 'preference', item.key, item.value, item.confidence || 1.0, item.source || 'user', now);
  }

  listIdentity() {
    if (!this.db) return [];
    const stmt = this.db.prepare('SELECT * FROM memory_identity ORDER BY category, key');
    return stmt.all();
  }

  // --- Memory Link Graph Operations ---
  saveRelation(rel) {
    if (!this.db) return;
    const stmt = this.db.prepare(`
      INSERT INTO memory_relations (id, source_id, source_layer, target_id, target_layer, relation_type, weight, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET weight=excluded.weight
    `);
    stmt.run(rel.id, rel.sourceId, rel.sourceLayer || 'generic', rel.targetId, rel.targetLayer || 'generic', rel.relationType || 'related', rel.weight || 1.0, new Date().toISOString());
  }

  deleteRelation(sourceId, targetId, relationType) {
    if (!this.db) return;
    const stmt = this.db.prepare('DELETE FROM memory_relations WHERE source_id = ? AND target_id = ? AND relation_type = ?');
    stmt.run(sourceId, targetId, relationType);
  }

  getRelations(nodeId) {
    if (!this.db) return [];
    const stmt = this.db.prepare('SELECT * FROM memory_relations WHERE source_id = ? OR target_id = ?');
    return stmt.all(nodeId, nodeId);
  }

  deleteMemory(id, layer) {
    if (!this.db) return false;
    const tableName = `memory_${layer}`;
    try {
      const stmt = this.db.prepare(`DELETE FROM ${tableName} WHERE id = ?`);
      const res = stmt.run(id);
      return res.changes > 0;
    } catch (_) {
      return false;
    }
  }
}
