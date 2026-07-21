import { eventCorrelationEngine } from './EventCorrelationEngine.js';
import { SnapshotManager } from './SnapshotManager.js';
import { stateManager } from './StateManager.js';
import { contextAPI } from './ContextAPI.js';
import { serverServiceRegistry } from '../core/serviceRegistry.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('WorldModel:Bootstrapper');

export function initializeWorldModelEngine(dbInstance) {
  console.log('----------------------------------------------------');
  console.log('🌐 Initializing AEGISOS World Model Engine (v0.3.0)...');
  console.log('----------------------------------------------------');

  // 1. Initialize SQLite Snapshot persistence
  const snapshotManager = new SnapshotManager(dbInstance);
  
  // Save initial boot snapshot
  const initialSnap = stateManager.createSnapshot();
  snapshotManager.saveSnapshot(initialSnap);

  // 2. Start Event Correlation Engine (subscribes to EventBus & Sentinel)
  eventCorrelationEngine.start();

  // 3. Register WorldModel Service in ServiceRegistry
  serverServiceRegistry.register('WorldModel', {
    name: 'World Model State & Correlation Runtime',
    status: 'running',
    contextAPI
  });

  log.info('[World Model Engine] Runtime, Relationship Graph, Timeline & Session Engines active.');

  return {
    contextAPI,
    snapshotManager,
    correlationEngine: eventCorrelationEngine
  };
}
