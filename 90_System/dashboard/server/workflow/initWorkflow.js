import { WorkflowStorage } from './WorkflowStorage.js';
import { workflowAPI } from './WorkflowAPI.js';
import { eventBridge } from './EventBridge.js';
import { serverServiceRegistry } from '../core/serviceRegistry.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Workflow:Bootstrapper');

export function initializeWorkflowPlatform(dbInstance) {
  console.log('----------------------------------------------------');
  console.log('⚙️ Initializing AEGISOS Workflow Orchestration Platform (v0.6.0)...');
  console.log('----------------------------------------------------');

  // 1. Initialize SQLite Storage
  const storage = new WorkflowStorage(dbInstance);

  // 2. Start Event Bridge
  eventBridge.start();

  // 3. Run test workflow execution (System Health Inspection)
  workflowAPI.runWorkflow('wf_system_inspection');

  // 4. Register WorkflowOrchestrationPlatform Service in ServiceRegistry
  serverServiceRegistry.register('WorkflowOrchestrationPlatform', {
    name: 'Workflow Orchestration Platform',
    status: 'running',
    workflowAPI
  });

  log.info('[Workflow Platform] State Machine, Scheduler, Step Executor, Approval Manager & Checkpoints active.');

  return {
    workflowAPI,
    storage
  };
}
