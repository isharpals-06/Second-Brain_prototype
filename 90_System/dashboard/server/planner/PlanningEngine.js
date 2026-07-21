import { intentEngine } from './IntentEngine.js';
import { goalEngine } from './GoalEngine.js';
import { priorityEngine } from './PriorityEngine.js';
import { planValidator } from './PlanValidator.js';
import { PlanStatus } from './types.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Planner:PlanningEngine');

export class PlanningEngine {
  constructor() {
    this.plans = new Map();
  }

  generatePlanForGoal(goalId) {
    const goal = goalEngine.getGoal(goalId);
    if (!goal) return null;

    const intent = intentEngine.getIntent();
    const priorities = priorityEngine.evaluatePriorities();
    const goalPriority = priorities.find(p => p.goalId === goalId)?.evaluatedLevel || goal.priority;

    const planId = `plan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const plan = {
      id: planId,
      timestamp: now,
      goalId: goal.id,
      goalTitle: goal.title,
      priority: goalPriority,
      intent: intent.primaryIntent,
      contextSnapshot: {
        intentCategory: intent.category,
        estimatedDurationMin: goal.estimatedDurationMin
      },
      objectives: [
        {
          id: 'obj_1',
          title: `Fulfill objective for ${goal.title}`,
          status: 'pending'
        }
      ],
      tasks: [
        {
          id: 'task_1',
          title: 'Review system context & requirements',
          steps: ['Read instruction spec', 'Verify component state'],
          requiredResources: goal.relatedResources || [],
          requiredSkills: ['summarize', 'search_notes'],
          suggestedAgents: ['Librarian Agent']
        },
        {
          id: 'task_2',
          title: 'Synthesize architecture deliverables',
          steps: ['Generate markdown architecture docs', 'Expose REST APIs'],
          requiredResources: [],
          requiredSkills: ['refactor_notes', 'commit_to_vault'],
          suggestedAgents: ['Coprocessor Agent']
        }
      ],
      requiredSkills: ['summarize', 'search_notes', 'refactor_notes', 'commit_to_vault'],
      suggestedAgents: ['Librarian Agent', 'Coprocessor Agent'],
      requiredTools: ['read_file', 'write_file'],
      confidence: 0.94,
      reasoningTrace: [
        `Inferred intent: "${intent.primaryIntent}"`,
        `Goal priority evaluated as "${goalPriority}"`,
        `Identified 2 core objectives and 2 sub-tasks`
      ],
      validationStatus: PlanStatus.DRAFT,
      version: '1.0.0'
    };

    // Validate plan
    const validation = planValidator.validatePlan(plan);
    plan.validationStatus = validation.isValid ? PlanStatus.VALIDATED : PlanStatus.REJECTED;

    this.plans.set(planId, plan);
    log.info(`Generated plan "${planId}" for goal "${goal.title}" (Status: ${plan.validationStatus})`);
    return plan;
  }

  getPlan(planId) {
    return this.plans.get(planId) || null;
  }

  listPlans() {
    return Array.from(this.plans.values());
  }
}

export const planningEngine = new PlanningEngine();
