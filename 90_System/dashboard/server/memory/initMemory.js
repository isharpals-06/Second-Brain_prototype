import { CognitiveStorage } from './CognitiveStorage.js';
import { CognitiveMemoryEngine } from './CognitiveMemoryEngine.js';
import { DocumentIngestionEngine } from './DocumentIngestionEngine.js';
import { memoryAPI } from './MemoryAPI.js';
import { memoryConsolidationEngine } from './MemoryConsolidationEngine.js';
import { hybridRetrievalEngine } from './HybridRetrievalEngine.js';
import { serverServiceRegistry } from '../core/serviceRegistry.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Memory:Bootstrapper');

export let cognitiveStorage = null;
export let cognitiveMemoryEngine = null;
export let documentIngestionEngine = null;

export function initializeMemoryPlatform(dbInstance) {
  console.log('----------------------------------------------------');
  console.log('🧠 Initializing AEGISOS Cognitive Memory Foundation (v1.3.0)...');
  console.log('----------------------------------------------------');

  // 1. Initialize 6-Layer Cognitive Storage
  cognitiveStorage = new CognitiveStorage(dbInstance);

  // 2. Initialize Cognitive Memory Engine
  cognitiveMemoryEngine = new CognitiveMemoryEngine(cognitiveStorage);

  // 3. Initialize Document Ingestion Engine
  documentIngestionEngine = new DocumentIngestionEngine(cognitiveMemoryEngine);

  // 4. Bind Storage to Engines
  memoryConsolidationEngine.setStorage(cognitiveStorage);
  hybridRetrievalEngine.setStorage(cognitiveStorage);

  // 5. Seed Essential Identity & Procedural Memory Baselines if empty
  seedMemoryBaselines(cognitiveStorage, cognitiveMemoryEngine);

  // 5. Register MemoryOS Service in ServiceRegistry
  serverServiceRegistry.register('MemoryOS', {
    name: 'Cognitive Memory Foundation',
    status: 'running',
    memoryAPI,
    cognitiveMemoryEngine,
    documentIngestionEngine,
    cognitiveStorage
  });

  log.info('[Memory OS] 6 Cognitive Memory Layers (Session, Working, Episodic, Semantic, Procedural, Identity) & Relation Graph active.');

  return {
    memoryAPI,
    cognitiveStorage,
    cognitiveMemoryEngine,
    documentIngestionEngine
  };
}

function seedMemoryBaselines(storage, engine) {
  try {
    const existingIdentity = storage.listIdentity();
    if (existingIdentity.length === 0) {
      engine.remember('identity', {
        category: 'preference',
        key: 'communication_style',
        value: 'Concise, architectural, direct',
        confidence: 1.0,
        source: 'system'
      });
      engine.remember('identity', {
        category: 'design_philosophy',
        key: 'ui_aesthetic',
        value: 'Glassmorphism, dark high-contrast mode, premium micro-animations',
        confidence: 1.0,
        source: 'system'
      });
      engine.remember('identity', {
        category: 'goal',
        key: 'system_vision',
        value: 'Evolve into a fully autonomous, persistent, event-driven AI Operating System',
        confidence: 1.0,
        source: 'system'
      });
    }

    const existingProcedural = storage.listProcedural();
    if (existingProcedural.length === 0) {
      engine.remember('procedural', {
        name: 'Standard Autonomous Bugfix Workflow',
        category: 'workflow',
        triggerPattern: 'bugfix:*',
        procedure: {
          steps: [
            'Observe error log and traceback',
            'Reproduce root cause with diagnostic check',
            'Apply targeted surgical fix',
            'Execute empirical verification command',
            'Commit cleanly to repository'
          ]
        },
        usageCount: 1,
        successRate: 1.0
      });
    }
  } catch (err) {
    log.warn(`Memory baselines seeding skipped: ${err.message}`);
  }
}
