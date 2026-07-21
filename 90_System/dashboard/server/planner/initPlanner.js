import { PlannerStorage } from './PlannerStorage.js';
import { planningEngine } from './PlanningEngine.js';
import { plannerAPI } from './PlannerAPI.js';
import { serverServiceRegistry } from '../core/serviceRegistry.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Planner:Bootstrapper');

export function initializeExecutivePlanner(dbInstance) {
  console.log('----------------------------------------------------');
  console.log('🧠 Initializing AEGISOS Executive Planner (v0.4.0)...');
  console.log('----------------------------------------------------');

  // 1. Initialize SQLite Planner Persistence
  const storage = new PlannerStorage(dbInstance);
  storage.loadFromDatabase();

  // 2. Auto-generate plan for active default goal
  planningEngine.generatePlanForGoal('goal_aegisos_core');

  // 3. Register ExecutivePlanner Service in ServiceRegistry
  serverServiceRegistry.register('ExecutivePlanner', {
    name: 'Executive Planner Strategic Reasoning Layer',
    status: 'running',
    plannerAPI
  });

  log.info('[Executive Planner] Intent Engine, Goal Engine, Priority Engine, Decision Engine & Plan Generator active (Thinking mode only).');

  return {
    plannerAPI,
    storage
  };
}
