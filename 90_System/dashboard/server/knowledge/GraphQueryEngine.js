import { entityRegistry } from './EntityRegistry.js';
import { relationshipRegistry } from './RelationshipRegistry.js';
import { semanticIndex } from './SemanticIndex.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Knowledge:GraphQueryEngine');

export class GraphQueryEngine {
  /**
   * Hybrid retrieval combining Graph Traversal + Vector Search + Metadata Filtering.
   */
  async hybridQuery({ queryText = '', entityType = null, relation = null, seedEntityId = null, topK = 5 }) {
    log.info(`Executing hybrid knowledge query: "${queryText}" (Seed: ${seedEntityId || 'none'})`);

    const results = [];
    const visited = new Set();

    // 1. Structured Graph Neighborhood Traversal (if seed entity provided)
    if (seedEntityId && entityRegistry.hasEntity(seedEntityId)) {
      visited.add(seedEntityId);
      const rels = relationshipRegistry.getRelationshipsForEntity(seedEntityId);
      rels.forEach(rel => {
        const otherId = rel.sourceId === seedEntityId ? rel.targetId : rel.sourceId;
        if (!visited.has(otherId)) {
          visited.add(otherId);
          const entity = entityRegistry.getEntity(otherId);
          if (entity && (!entityType || entity.type === entityType)) {
            results.push({
              entity,
              score: 0.9 * rel.weight,
              source: 'graph_traversal',
              relation: rel.relation
            });
          }
        }
      });
    }

    // 2. Semantic Vector Similarity Search (if query string provided)
    if (queryText) {
      const vectorMatches = await semanticIndex.search(queryText, topK, (meta) => {
        if (entityType && meta.type && meta.type !== entityType) return false;
        return true;
      });

      vectorMatches.forEach(match => {
        if (!visited.has(match.id)) {
          visited.add(match.id);
          const entity = entityRegistry.getEntity(match.id) || { id: match.id, label: match.id, metadata: match.metadata };
          results.push({
            entity,
            score: match.score,
            source: 'semantic_vector'
          });
        }
      });
    }

    // 3. Metadata Filtering fallback if empty
    if (results.length === 0 && entityType) {
      const entities = entityRegistry.findByType(entityType).slice(0, topK);
      entities.forEach(entity => {
        results.push({
          entity,
          score: 0.5,
          source: 'metadata_filter'
        });
      });
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }
}

export const graphQueryEngine = new GraphQueryEngine();
