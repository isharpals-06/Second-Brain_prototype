import { PlanStateEnum } from './PlannerTypes.js';

export class PlanOptimizer {
  optimize(plan) {
    const unfrozenPlan = JSON.parse(JSON.stringify(plan));
    
    unfrozenPlan.state = PlanStateEnum.OPTIMIZED;
    unfrozenPlan.isOptimized = true;
    unfrozenPlan.parallelizableGroups = [
      unfrozenPlan.steps.map(s => s.id)
    ];
    unfrozenPlan.updatedAt = new Date().toISOString();

    return Object.freeze(unfrozenPlan);
  }
}

export const planOptimizer = new PlanOptimizer();
