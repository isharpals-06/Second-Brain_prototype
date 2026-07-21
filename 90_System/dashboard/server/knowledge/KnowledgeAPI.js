import { entityRegistry } from './EntityRegistry.js';
import { relationshipRegistry } from './RelationshipRegistry.js';
import { graphQueryEngine } from './GraphQueryEngine.js';
import { semanticIndex } from './SemanticIndex.js';
import { graphUpdateEngine } from './GraphUpdateEngine.js';

class KnowledgeAPI {
  getEntities(type = null) {
    if (type) return entityRegistry.findByType(type);
    return entityRegistry.listEntities();
  }

  getEntity(id) {
    const entity = entityRegistry.getEntity(id);
    if (!entity) return null;
    const relationships = relationshipRegistry.getRelationshipsForEntity(id);
    return {
      ...entity,
      relationships
    };
  }

  getRelationships() {
    return relationshipRegistry.listRelationships();
  }

  async query(queryParams = {}) {
    return await graphQueryEngine.hybridQuery(queryParams);
  }

  async search(queryText, topK = 5) {
    return await semanticIndex.search(queryText, topK);
  }

  getMetrics() {
    return {
      entityCount: entityRegistry.listEntities().length,
      relationshipCount: relationshipRegistry.listRelationships().length,
      vectorCount: semanticIndex.getMetrics().totalVectors,
      updatesProcessed: graphUpdateEngine.updateCount
    };
  }
}

export const knowledgeAPI = new KnowledgeAPI();
export { KnowledgeAPI };
