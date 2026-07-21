import { intentEngine } from './IntentEngine.js';
import { goalEngine } from './GoalEngine.js';
import { priorityEngine } from './PriorityEngine.js';
import { planningEngine } from './PlanningEngine.js';
import { decisionEngine } from './DecisionEngine.js';
import { recommendationEngine } from './RecommendationEngine.js';
import { constraintEngine } from './ConstraintEngine.js';

class PlannerAPI {
  getIntent() {
    return intentEngine.getIntent();
  }

  getGoals(status = null) {
    return goalEngine.listGoals(status);
  }

  createGoal(goalData) {
    return goalEngine.createGoal(goalData);
  }

  getPriorities() {
    return priorityEngine.evaluatePriorities();
  }

  getPlans() {
    return planningEngine.listPlans();
  }

  generatePlan(goalId) {
    return planningEngine.generatePlanForGoal(goalId);
  }

  getRecommendations() {
    return recommendationEngine.generateRecommendations();
  }

  getDecisions() {
    return decisionEngine.evaluateAlternatives();
  }

  getConstraints() {
    return constraintEngine.evaluateConstraints();
  }

  getMetrics() {
    return {
      goalsCount: goalEngine.listGoals().length,
      plansCount: planningEngine.listPlans().length,
      recommendationsCount: recommendationEngine.generateRecommendations().length,
      activeIntent: intentEngine.getIntent().primaryIntent,
      confidence: intentEngine.getIntent().confidence
    };
  }
}

export const plannerAPI = new PlannerAPI();
export { PlannerAPI };
