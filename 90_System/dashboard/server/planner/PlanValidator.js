import { constraintEngine } from './ConstraintEngine.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Planner:PlanValidator');

export class PlanValidator {
  validatePlan(plan) {
    const errors = [];
    const warnings = [];

    if (!plan || !plan.id || !plan.goalId) {
      errors.push('Plan is missing required fields (id or goalId)');
      return { isValid: false, errors, warnings };
    }

    if (!plan.tasks || !Array.isArray(plan.tasks) || plan.tasks.length === 0) {
      errors.push('Plan contains no executable tasks');
    }

    // Check constraints
    const constraints = constraintEngine.evaluateConstraints();
    if (plan.requiredTools) {
      plan.requiredTools.forEach(tool => {
        if (constraints.restrictedActions.includes(tool)) {
          errors.push(`Plan requires restricted tool "${tool}"`);
        }
      });
    }

    const isValid = errors.length === 0;
    log.debug(`Validated plan "${plan.id}": ${isValid ? 'VALID' : 'INVALID'} (${errors.length} errors)`);
    return { isValid, errors, warnings };
  }
}

export const planValidator = new PlanValidator();
