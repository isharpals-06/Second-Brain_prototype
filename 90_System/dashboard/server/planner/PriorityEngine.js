import { goalEngine } from './GoalEngine.js';
import { PriorityLevel } from './types.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Planner:PriorityEngine');

export class PriorityEngine {
  evaluatePriorities() {
    const goals = goalEngine.listGoals();
    const evaluated = goals.map(goal => {
      let score = 50;
      const reasons = [];

      if (goal.priority === PriorityLevel.CRITICAL) {
        score += 40;
        reasons.push('Marked as CRITICAL priority');
      } else if (goal.priority === PriorityLevel.HIGH) {
        score += 25;
        reasons.push('Marked as HIGH priority');
      }

      if (goal.status === 'active') {
        score += 15;
        reasons.push('Goal is currently active');
      }

      if (goal.dependencies && goal.dependencies.length > 0) {
        score -= 10;
        reasons.push(`Has ${goal.dependencies.length} pending dependencies`);
      }

      let evaluatedLevel = PriorityLevel.MEDIUM;
      if (score >= 80) evaluatedLevel = PriorityLevel.CRITICAL;
      else if (score >= 65) evaluatedLevel = PriorityLevel.HIGH;
      else if (score >= 40) evaluatedLevel = PriorityLevel.MEDIUM;
      else if (score >= 20) evaluatedLevel = PriorityLevel.LOW;
      else evaluatedLevel = PriorityLevel.DEFERRED;

      return {
        goalId: goal.id,
        title: goal.title,
        numericScore: Math.min(100, Math.max(0, score)),
        evaluatedLevel,
        reasons
      };
    });

    evaluated.sort((a, b) => b.numericScore - a.numericScore);
    return evaluated;
  }
}

export const priorityEngine = new PriorityEngine();
