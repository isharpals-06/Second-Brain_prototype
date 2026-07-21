import { ScenarioType } from './types.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Simulation:ScenarioEngine');

export class ScenarioEngine {
  generateScenarios(plan) {
    const scenarios = [
      {
        id: `scen_nominal_${plan.id}`,
        type: ScenarioType.NOMINAL,
        title: 'Nominal Plan Execution',
        description: 'All tasks complete under standard system conditions without network or resource failures.'
      },
      {
        id: `scen_failure_${plan.id}`,
        type: ScenarioType.FAILURE_CASE,
        title: 'Task Execution Timeout',
        description: 'Simulates a network timeout during skill registration or doc index download.'
      },
      {
        id: `scen_edge_${plan.id}`,
        type: ScenarioType.EDGE_CASE,
        title: 'Resource Constraints & Memory Surge',
        description: 'Simulates execution during high RAM usage condition.'
      }
    ];

    log.debug(`Generated ${scenarios.length} simulation scenarios for plan "${plan.id}"`);
    return scenarios;
  }
}

export const scenarioEngine = new ScenarioEngine();
