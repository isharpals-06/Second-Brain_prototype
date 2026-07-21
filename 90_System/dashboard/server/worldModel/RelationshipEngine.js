import { aegisLogger } from '../core/logger.js';
import { NodeType, RelationType } from './types.js';

const log = aegisLogger.child('WorldModel:RelationshipEngine');

export class RelationshipEngine {
  constructor() {
    this.nodes = new Map();
    this.edges = new Set();
    this.adjacencyList = new Map();
  }

  addNode(id, type = NodeType.NOTE, label = '', metadata = {}) {
    if (!id) return null;
    if (!this.nodes.has(id)) {
      const node = {
        id,
        type,
        label: label || id,
        metadata,
        createdAt: new Date().toISOString()
      };
      this.nodes.set(id, node);
      this.adjacencyList.set(id, new Set());
      log.debug(`Added graph node "${id}" (${type})`);
    } else {
      // Update metadata
      const node = this.nodes.get(id);
      node.metadata = { ...node.metadata, ...metadata };
    }
    return this.nodes.get(id);
  }

  addEdge(sourceId, targetId, relation = RelationType.ASSOCIATED_WITH, weight = 1) {
    if (!sourceId || !targetId || sourceId === targetId) return;

    // Ensure nodes exist
    if (!this.nodes.has(sourceId)) this.addNode(sourceId, NodeType.NOTE, sourceId);
    if (!this.nodes.has(targetId)) this.addNode(targetId, NodeType.NOTE, targetId);

    const edgeKey = `${sourceId}->${relation}->${targetId}`;
    const edge = { source: sourceId, target: targetId, relation, weight, id: edgeKey };

    this.edges.add(edgeKey);
    this.adjacencyList.get(sourceId).add(edgeKey);
    log.debug(`Added graph edge: ${edgeKey}`);
    return edge;
  }

  getNeighbors(nodeId) {
    if (!this.adjacencyList.has(nodeId)) return [];
    const edgeKeys = Array.from(this.adjacencyList.get(nodeId));
    return edgeKeys.map(key => {
      const parts = key.split('->');
      return {
        targetId: parts[2],
        relation: parts[1],
        targetNode: this.nodes.get(parts[2])
      };
    });
  }

  exportGraph() {
    const nodes = Array.from(this.nodes.values());
    const edges = Array.from(this.edges).map(key => {
      const [source, relation, target] = key.split('->');
      return { source, target, relation };
    });
    return { nodes, edges };
  }

  getMetrics() {
    return {
      nodeCount: this.nodes.size,
      edgeCount: this.edges.size
    };
  }
}

export const relationshipEngine = new RelationshipEngine();
