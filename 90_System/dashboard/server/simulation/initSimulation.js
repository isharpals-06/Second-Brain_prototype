import { SimulationStorage } from './SimulationStorage.js';
import { simulationAPI } from './SimulationAPI.js';
import { plannerAPI } from '../planner/PlannerAPI.js';
import { serverServiceRegistry } from '../core/serviceRegistry.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Simulation:Bootstrapper');

export function initializeSimulationEngine(dbInstance) {
  console.log('----------------------------------------------------');
  console.log('🔮 Initializing AEGISOS Decision Simulation Engine (v0.4.5)...');
  console.log('----------------------------------------------------');

  // 1. Initialize SQLite Simulation Persistence
  const storage = new SimulationStorage(dbInstance);
  simulationAPI.setStorage(storage);

  // 2. Run virtual simulation on existing active plans
  const plans = plannerAPI.getPlans();
  if (plans && plans.length > 0) {
    plans.forEach(plan => {
      simulationAPI.simulatePlan(plan);
    });
  }

  // 3. Register DecisionSimulationEngine Service in ServiceRegistry
  serverServiceRegistry.register('DecisionSimulationEngine', {
    name: 'Decision Simulation Engine (Mental Sandbox)',
    status: 'running',
    simulationAPI
  });

  log.info('[Decision Simulation Engine] Virtual Sandbox, Outcome Predictor, Risk Analyzer & Plan Scorer active.');

  return {
    simulationAPI,
    storage
  };
}
