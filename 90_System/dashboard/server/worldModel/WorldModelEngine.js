import { aegisLogger } from '../core/logger.js';
import { serverEventBus } from '../core/EventBus.js';

const log = aegisLogger.child('WorldModelEngine');

export class WorldModelEngine {
  constructor(dbInstance) {
    this.db = dbInstance || null;
    this.state = new Map();
    this.snapshots = [];
    this.initDatabase();
  }

  setDatabase(dbInstance) {
    this.db = dbInstance;
    this.initDatabase();
    this.loadStateFromDb();
  }

  initDatabase() {
    if (!this.db) return;
    try {
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS world_model_entities (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          label TEXT NOT NULL,
          attributes_json TEXT,
          relationships_json TEXT,
          history_json TEXT,
          confidence REAL DEFAULT 1.0,
          source TEXT,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS world_model_snapshots (
          id TEXT PRIMARY KEY,
          snapshot_json TEXT NOT NULL,
          timestamp TEXT NOT NULL
        );
      `);
      log.info('WorldModelEngine SQLite database tables initialized.');
    } catch (err) {
      log.error(`Failed to initialize WorldModel tables: ${err.message}`);
    }
  }

  loadStateFromDb() {
    if (!this.db) return;
    try {
      const rows = this.db.prepare('SELECT * FROM world_model_entities').all();
      for (const row of rows) {
        this.state.set(row.id, {
          id: row.id,
          type: row.type,
          label: row.label,
          attributes: JSON.parse(row.attributes_json || '{}'),
          relationships: JSON.parse(row.relationships_json || '[]'),
          history: JSON.parse(row.history_json || '[]'),
          confidence: row.confidence,
          source: row.source,
          updatedAt: row.updated_at,
        });
      }
      log.info(`Loaded ${this.state.size} entities into World Model state.`);
    } catch (err) {
      log.error(`Failed to load World Model state: ${err.message}`);
    }
  }

  observe(id, type, label, attributes = {}, source = 'sentinel') {
    const now = new Date().toISOString();
    const existing = this.state.get(id);

    const history = existing ? existing.history : [];
    if (existing) {
      history.push({ timestamp: existing.updatedAt, attributes: existing.attributes });
    }

    const entity = {
      id,
      type,
      label,
      attributes: { ...existing?.attributes, ...attributes },
      relationships: existing?.relationships || [],
      history: history.slice(-20), // Keep last 20 state transitions
      confidence: attributes.confidence || 1.0,
      source,
      updatedAt: now,
    };

    this.state.set(id, entity);

    if (this.db) {
      try {
        const stmt = this.db.prepare(`
          INSERT INTO world_model_entities (id, type, label, attributes_json, relationships_json, history_json, confidence, source, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            label=excluded.label,
            attributes_json=excluded.attributes_json,
            history_json=excluded.history_json,
            confidence=excluded.confidence,
            updated_at=excluded.updated_at
        `);
        stmt.run(
          id,
          type,
          label,
          JSON.stringify(entity.attributes),
          JSON.stringify(entity.relationships),
          JSON.stringify(entity.history),
          entity.confidence,
          source,
          now
        );
      } catch (err) {
        log.error(`Failed to persist entity "${id}": ${err.message}`);
      }
    }

    serverEventBus.publish({
      type: 'WorldModelObserved',
      source: 'WorldModelEngine',
      payload: { id, type, label, source }
    });
    return entity;
  }

  snapshot() {
    const now = new Date().toISOString();
    const snapshotId = `snap_${Date.now()}`;
    const data = Array.from(this.state.values());

    if (this.db) {
      try {
        const stmt = this.db.prepare('INSERT INTO world_model_snapshots (id, snapshot_json, timestamp) VALUES (?, ?, ?)');
        stmt.run(snapshotId, JSON.stringify(data), now);
      } catch (err) {
        log.error(`Failed to save snapshot: ${err.message}`);
      }
    }

    this.snapshots.push({ id: snapshotId, timestamp: now, count: data.length });
    return { snapshotId, timestamp: now, entityCount: data.length };
  }

  diff(previousSnapshotId) {
    // Return entity mutations since given snapshot or state history
    const current = Array.from(this.state.values());
    return {
      totalEntities: current.length,
      recentUpdates: current.filter(e => new Date(e.updatedAt) > new Date(Date.now() - 3600000))
    };
  }

  getState() {
    return Array.from(this.state.values());
  }

  getEntity(id) {
    return this.state.get(id) || null;
  }
}

export const worldModelEngine = new WorldModelEngine();
