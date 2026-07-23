import { KnowledgeStorage } from './KnowledgeStorage.js';
import { graphUpdateEngine } from './GraphUpdateEngine.js';
import { knowledgeAPI } from './KnowledgeAPI.js';
import { dynamicKnowledgeGraph } from './DynamicKnowledgeGraph.js';
import { projectUserIntelligence } from './ProjectUserIntelligence.js';
import { semanticIntelligenceEngine } from './SemanticIntelligenceEngine.js';
import { serverServiceRegistry } from '../core/serviceRegistry.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Knowledge:Bootstrapper');

export function initializeKnowledgeSubsystem(dbInstance) {
  console.log('----------------------------------------------------');
  console.log('🕸️ Initializing AEGISOS Knowledge Graph & Semantic Index (v0.3.8)...');
  console.log('----------------------------------------------------');

  // 1. Bind SQLite database instance to Dynamic Knowledge Graph & User Model
  dynamicKnowledgeGraph.setDatabase(dbInstance);
  projectUserIntelligence.setDatabase(dbInstance);

  // 2. Initialize SQLite Knowledge Persistence & load previous records
  const storage = new KnowledgeStorage(dbInstance);
  storage.loadFromDatabase();

  // 3. Run initial Semantic Intelligence pass
  semanticIntelligenceEngine.runSemanticPass();

  // 4. Start Graph Update Engine (subscribes to EventBus)
  graphUpdateEngine.start();

  // 5. Register KnowledgeGraph Service in ServiceRegistry
  serverServiceRegistry.register('KnowledgeGraph', {
    name: 'Knowledge Graph & Semantic Index Runtime',
    status: 'running',
    knowledgeAPI,
    dynamicKnowledgeGraph,
    projectUserIntelligence,
  });

  log.info('[Knowledge Graph] Entity Registry, Property Graph, Vector Index & Hybrid Query Engine active.');

  return {
    knowledgeAPI,
    storage,
    updateEngine: graphUpdateEngine,
    dynamicKnowledgeGraph,
    projectUserIntelligence,
  };
}
