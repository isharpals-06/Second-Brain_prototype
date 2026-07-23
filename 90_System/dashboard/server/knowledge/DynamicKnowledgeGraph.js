import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Knowledge:DynamicGraph');

export class DynamicKnowledgeGraph {
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
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS graph_nodes (
          id TEXT PRIMARY KEY,
          label TEXT NOT NULL,
          type TEXT NOT NULL,
          properties_json TEXT,
          created_at TEXT NOT NULL
        );
      `);

      this.db.exec(`
        CREATE TABLE IF NOT EXISTS graph_edges (
          id TEXT PRIMARY KEY,
          source_id TEXT NOT NULL,
          target_id TEXT NOT NULL,
          relation TEXT NOT NULL,
          weight REAL DEFAULT 1.0,
          created_at TEXT NOT NULL
        );
      `);

      log.info('DynamicKnowledgeGraph SQLite graph tables initialized.');
    } catch (err) {
      log.error(`Failed to initialize knowledge graph tables: ${err.message}`);
    }
  }

  addNode(id, label, type, properties = {}) {
    if (!this.db) return { id, label, type, properties };
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO graph_nodes (id, label, type, properties_json, created_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET label=excluded.label, properties_json=excluded.properties_json
    `);
    stmt.run(id, label, type, JSON.stringify(properties), now);
    return { id, label, type, properties, createdAt: now };
  }

  addEdge(sourceId, targetId, relation = 'LINKED_TO', weight = 1.0) {
    if (!this.db) return;
    const edgeId = `edge_${sourceId}_${targetId}_${relation}`;
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO graph_edges (id, source_id, target_id, relation, weight, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET weight=excluded.weight
    `);
    stmt.run(edgeId, sourceId, targetId, relation, weight, now);
    return { id: edgeId, sourceId, targetId, relation, weight };
  }

  getNeighbors(nodeId) {
    if (!this.db) return [];
    const stmt = this.db.prepare(`
      SELECT e.*, n.label as target_label, n.type as target_type
      FROM graph_edges e
      JOIN graph_nodes n ON e.target_id = n.id
      WHERE e.source_id = ?
      UNION
      SELECT e.*, n.label as target_label, n.type as target_type
      FROM graph_edges e
      JOIN graph_nodes n ON e.source_id = n.id
      WHERE e.target_id = ?
    `);
    return stmt.all(nodeId, nodeId);
  }

  getGraphSummary() {
    if (!this.db) return { nodeCount: 0, edgeCount: 0 };
    const nStmt = this.db.prepare('SELECT COUNT(*) as count FROM graph_nodes');
    const eStmt = this.db.prepare('SELECT COUNT(*) as count FROM graph_edges');
    return {
      nodeCount: nStmt.get().count,
      edgeCount: eStmt.get().count
    };
  }
}
