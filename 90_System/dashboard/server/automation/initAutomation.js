import { AutomationStorage } from './AutomationStorage.js';
import { automationAPI } from './AutomationAPI.js';
import { eventAutomationEngine } from './EventEngine.js';
import { serverServiceRegistry } from '../core/serviceRegistry.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Automation:Bootstrapper');

export function initializeAutomationPlatform(dbInstance) {
  console.log('----------------------------------------------------');
  console.log('🤖 Initializing AEGISOS Automation Platform (v0.9.0)...');
  console.log('----------------------------------------------------');

  // 1. Initialize SQLite Storage
  const storage = new AutomationStorage(dbInstance);
  automationAPI.setStorage(storage);

  // 2. Start Event Engine Stream Listener
  eventAutomationEngine.start();

  // 3. Register AutomationPlatform Service in ServiceRegistry
  serverServiceRegistry.register('AutomationPlatform', {
    name: 'Automation Platform',
    status: 'running',
    automationAPI
  });

  log.info('[Automation Platform] Trigger Engine, Scheduler, Policy Executor, Human Approval & Rollback Manager active.');

  return {
    automationAPI,
    storage
  };
}
