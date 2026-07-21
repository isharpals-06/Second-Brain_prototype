import { serverEventBus } from '../core/eventBus.js';
import { entityRegistry } from './EntityRegistry.js';
import { relationshipRegistry } from './RelationshipRegistry.js';
import { semanticIndex } from './SemanticIndex.js';
import { EntityType, KnowledgeRelation } from './types.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Knowledge:GraphUpdateEngine');

export class GraphUpdateEngine {
  constructor() {
    this.updateCount = 0;
  }

  start() {
    log.info('Subscribing GraphUpdateEngine to EventBus stream...');

    serverEventBus.subscribe('sentinel:event', (event) => this.handlePerceptionEvent(event));
    serverEventBus.subscribe('NOTE_CREATED', (payload) => this.handleNoteCreated(payload));
  }

  handlePerceptionEvent(event) {
    const { category, payload } = event;
    if (!payload) return;

    this.updateCount += 1;

    if (category === 'filesystem' || category === 'vault') {
      const filePath = payload.filePath || '';
      const filename = payload.filename || payload.noteName || '';
      const type = filePath.endsWith('.pdf') ? EntityType.PDF : EntityType.NOTE;

      if (filePath) {
        // Register file entity
        entityRegistry.registerEntity({
          id: filePath,
          type,
          label: filename,
          uri: filePath
        });

        // Register default relationship to main project
        entityRegistry.registerEntity({ id: 'SecondBrain', type: EntityType.PROJECT, label: 'SecondBrain' });
        relationshipRegistry.addRelationship('SecondBrain', filePath, KnowledgeRelation.CONTAINS);

        // Asynchronously add to semantic index
        semanticIndex.indexItem(filePath, filename, { type, filePath }).catch(() => {});
      }
    } else if (category === 'git') {
      const repoName = 'Second-Brain_prototype';
      entityRegistry.registerEntity({ id: repoName, type: EntityType.REPOSITORY, label: repoName });
      relationshipRegistry.addRelationship('SecondBrain', repoName, KnowledgeRelation.USES);
    }
  }

  handleNoteCreated(payload) {
    if (payload && payload.note) {
      const filePath = payload.note;
      entityRegistry.registerEntity({ id: filePath, type: EntityType.NOTE, label: filePath });
      relationshipRegistry.addRelationship('SecondBrain', filePath, KnowledgeRelation.CONTAINS);
    }
  }
}

export const graphUpdateEngine = new GraphUpdateEngine();
