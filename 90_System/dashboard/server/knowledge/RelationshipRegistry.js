import { aegisLogger } from '../core/logger.js';
import { KnowledgeRelation } from './types.js';

const log = aegisLogger.child('Knowledge:RelationshipRegistry');

export class RelationshipRegistry {
  constructor() {
    this.relationships = new Map();
  }

  addRelationship(sourceId, targetId, relation = KnowledgeRelation.RELATED_TO, weight = 1.0, metadata = {}) {
    if (!sourceId || !targetId || sourceId === targetId) return null;

    const relId = `${sourceId}->${relation}->${targetId}`;
    const now = new Date().toISOString();

    const record = {
      id: relId,
      sourceId,
      targetId,
      relation,
      weight,
      confidence: metadata.confidence || 1.0,
      source: metadata.source || 'system',
      metadata,
      createdAt: now
    };

    this.relationships.set(relId, record);
    log.debug(`Registered relationship: ${relId}`);
    return record;
  }

  getRelationshipsForEntity(entityId) {
    return Array.from(this.relationships.values()).filter(r =>
      r.sourceId === entityId || r.targetId === entityId
    );
  }

  getOutgoingRelationships(entityId) {
    return Array.from(this.relationships.values()).filter(r => r.sourceId === entityId);
  }

  getIncomingRelationships(entityId) {
    return Array.from(this.relationships.values()).filter(r => r.targetId === entityId);
  }

  listRelationships() {
    return Array.from(this.relationships.values());
  }
}

export const relationshipRegistry = new RelationshipRegistry();
