import { entityRegistry } from './EntityRegistry.js';
import { relationshipRegistry } from './RelationshipRegistry.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Knowledge:KnowledgeStorage');

export class KnowledgeStorage {
  constructor(dbInstance) {
    this.db = dbInstance || null;
    this.initTables();
  }

  initTables() {
    if (!this.db) return;
    try {
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS knowledge_entities (
          id TEXT PRIMARY KEY,
          type TEXT,
          label TEXT,
          uri TEXT,
          properties_json TEXT,
          created_at TEXT,
          updated_at TEXT
        );
      `);

      this.db.exec(`
        CREATE TABLE IF NOT EXISTS knowledge_relationships (
          id TEXT PRIMARY KEY,
          source_id TEXT,
          target_id TEXT,
          relation TEXT,
          weight REAL,
          metadata_json TEXT,
          created_at TEXT
        );
      `);

      log.info('KnowledgeStorage SQLite tables initialized.');
    } catch (err) {
      log.error(`Failed to initialize knowledge tables: ${err.message}`);
    }
  }

  persistAll() {
    if (!this.db) return;
    try {
      const stmtEntity = this.db.prepare(`
        INSERT INTO knowledge_entities (id, type, label, uri, properties_json, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          label=excluded.label,
          properties_json=excluded.properties_json,
          updated_at=excluded.updated_at
      `);

      for (const e of entityRegistry.listEntities()) {
        stmtEntity.run(e.id, e.type, e.label, e.uri, JSON.stringify(e.properties), e.createdAt, e.updatedAt);
      }

      const stmtRel = this.db.prepare(`
        INSERT INTO knowledge_relationships (id, source_id, target_id, relation, weight, metadata_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET weight=excluded.weight
      `);

      for (const r of relationshipRegistry.listRelationships()) {
        stmtRel.run(r.id, r.sourceId, r.targetId, r.relation, r.weight, JSON.stringify(r.metadata), r.createdAt);
      }

      log.debug('Knowledge entities & relationships persisted to SQLite.');
    } catch (err) {
      log.error(`Error persisting KnowledgeStorage: ${err.message}`);
    }
  }

  loadFromDatabase() {
    if (!this.db) return;
    try {
      const entities = this.db.prepare(`SELECT * FROM knowledge_entities`).all();
      entities.forEach(r => {
        entityRegistry.registerEntity({
          id: r.id,
          type: r.type,
          label: r.label,
          uri: r.uri,
          properties: JSON.parse(r.properties_json || '{}')
        });
      });

      const rels = this.db.prepare(`SELECT * FROM knowledge_relationships`).all();
      rels.forEach(r => {
        relationshipRegistry.addRelationship(r.source_id, r.target_id, r.relation, r.weight, JSON.parse(r.metadata_json || '{}'));
      });

      log.info(`Loaded ${entities.length} entities and ${rels.length} relationships from SQLite.`);
    } catch (err) {
      log.warn(`Could not load existing knowledge records: ${err.message}`);
    }
  }
}
