import { MemoryStorage } from './MemoryStorage.js';
import { memoryAPI } from './MemoryAPI.js';
import { serverServiceRegistry } from '../core/serviceRegistry.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Memory:Bootstrapper');

export function initializeMemoryPlatform(dbInstance) {
  console.log('----------------------------------------------------');
  console.log('🧠 Initializing AEGISOS Memory OS (v0.7.0)...');
  console.log('----------------------------------------------------');

  // 1. Initialize SQLite Storage
  const storage = new MemoryStorage(dbInstance);

  // 2. Initial Reflection Pass
  memoryAPI.reflect();

  // 3. Register MemoryOS Service in ServiceRegistry
  serverServiceRegistry.register('MemoryOS', {
    name: 'Memory OS Platform',
    status: 'running',
    memoryAPI
  });

  log.info('[Memory OS] Multi-Type Store, Scoring, Hybrid Retrieval, Consolidation & Reflection Engines active.');

  return {
    memoryAPI,
    storage
  };
}
