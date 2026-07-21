import { AgentStorage } from './AgentStorage.js';
import { lifecycleManager } from './LifecycleManager.js';
import { healthMonitor } from './HealthMonitor.js';
import { agentRuntimeAPI } from './AgentRuntimeAPI.js';
import { plannerAPI } from '../planner/PlannerAPI.js';
import { agentScheduler } from './AgentScheduler.js';
import { serverServiceRegistry } from '../core/serviceRegistry.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('AgentRuntime:Bootstrapper');

export function initializeAgentRuntime(dbInstance) {
  console.log('----------------------------------------------------');
  console.log('🤖 Initializing AEGISOS Agent Runtime (v0.5.0)...');
  console.log('----------------------------------------------------');

  // 1. Initialize SQLite Agent Storage
  const storage = new AgentStorage(dbInstance);
  storage.persistAll();

  // 2. Start all system agents
  lifecycleManager.startAll();

  // 3. Start Health Monitor loop (30s interval)
  healthMonitor.start();

  // 4. Enqueue validated plan tasks for scheduling
  const plans = plannerAPI.getPlans();
  if (plans && plans.length > 0) {
    plans.forEach(plan => {
      agentScheduler.enqueuePlanTasks(plan);
    });
  }

  // 5. Register AgentRuntime Service in ServiceRegistry
  serverServiceRegistry.register('AgentRuntime', {
    name: 'Agent Process & Lifecycle Runtime',
    status: 'running',
    agentRuntimeAPI
  });

  log.info('[Agent Runtime] Process Lifecycle, Scheduler, Message Router, Health Monitor & Recovery Manager active.');

  return {
    agentRuntimeAPI,
    storage,
    lifecycleManager,
    healthMonitor
  };
}
