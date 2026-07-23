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

  // --- Track B Phase B3 Graph APIs ---

  createNode(id, label, type, properties = {}) {
    return this.addNode(id, label, type, properties);
  }

  createEdge(sourceId, targetId, relation = 'RELATING_TO', weight = 1.0) {
    return this.addEdge(sourceId, targetId, relation, weight);
  }

  search(query, typeFilter = null) {
    if (!this.db) return [];
    let sql = 'SELECT * FROM graph_nodes WHERE label LIKE ? OR properties_json LIKE ?';
    const params = [`%${query}%`, `%${query}%`];
    if (typeFilter) {
      sql += ' AND type = ?';
      params.push(typeFilter);
    }
    const rows = this.db.prepare(sql).all(...params);
    return rows.map(r => ({ ...r, properties: JSON.parse(r.properties_json || '{}') }));
  }

  expand(nodeId, depth = 1) {
    if (!this.db) return { nodes: [], edges: [] };
    const neighbors = this.getNeighbors(nodeId);
    const edges = neighbors.map(n => ({
      id: n.id,
      sourceId: n.source_id,
      targetId: n.target_id,
      relation: n.relation,
      weight: n.weight
    }));

    const nodeIds = new Set([nodeId, ...neighbors.map(n => n.target_id), ...neighbors.map(n => n.source_id)]);
    const nodes = [];
    for (const nid of nodeIds) {
      const row = this.db.prepare('SELECT * FROM graph_nodes WHERE id = ?').get(nid);
      if (row) {
        nodes.push({ ...row, properties: JSON.parse(row.properties_json || '{}') });
      }
    }
    return { nodes, edges };
  }

  related(nodeId, relation = null) {
    if (!this.db) return [];
    let sql = 'SELECT * FROM graph_edges WHERE source_id = ? OR target_id = ?';
    const params = [nodeId, nodeId];
    if (relation) {
      sql += ' AND relation = ?';
      params.push(relation);
    }
    return this.db.prepare(sql).all(...params);
  }

  timeline(limit = 20) {
    if (!this.db) return [];
    const rows = this.db.prepare('SELECT * FROM graph_nodes ORDER BY created_at DESC LIMIT ?').all(limit);
    return rows.map(r => ({ ...r, properties: JSON.parse(r.properties_json || '{}') }));
  }

  merge(sourceNodeId, targetNodeId) {
    if (!this.db) return false;
    try {
      // Re-point edges from target to source
      this.db.prepare('UPDATE graph_edges SET source_id = ? WHERE source_id = ?').run(sourceNodeId, targetNodeId);
      this.db.prepare('UPDATE graph_edges SET target_id = ? WHERE target_id = ?').run(sourceNodeId, targetNodeId);
      // Delete target node
      this.db.prepare('DELETE FROM graph_nodes WHERE id = ?').run(targetNodeId);
      log.info(`Merged node "${targetNodeId}" into "${sourceNodeId}".`);
      return true;
    } catch (err) {
      log.error(`Failed to merge nodes: ${err.message}`);
      return false;
    }
  }

  removeNode(nodeId) {
    if (!this.db) return false;
    try {
      this.db.prepare('DELETE FROM graph_edges WHERE source_id = ? OR target_id = ?').run(nodeId, nodeId);
      this.db.prepare('DELETE FROM graph_nodes WHERE id = ?').run(nodeId);
      return true;
    } catch (err) {
      log.error(`Failed to remove node "${nodeId}": ${err.message}`);
      return false;
    }
  }

  getNodes(limit = 100) {
    if (!this.db) return [];
    const rows = this.db.prepare('SELECT * FROM graph_nodes ORDER BY created_at DESC LIMIT ?').all(limit);
    return rows.map(r => ({ ...r, properties: JSON.parse(r.properties_json || '{}') }));
  }

  getEdges(limit = 200) {
    if (!this.db) return [];
    return this.db.prepare('SELECT * FROM graph_edges ORDER BY created_at DESC LIMIT ?').all(limit);
  }
}

export const dynamicKnowledgeGraph = new DynamicKnowledgeGraph();
