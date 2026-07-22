import { intentEngine } from './IntentEngine.js';
import { goalEngine } from './GoalEngine.js';
import { priorityEngine } from './PriorityEngine.js';
import { planValidator } from './PlanValidator.js';
import { PlanStatus } from './types.js';
import { serverEventBus, SystemEvents, EventSeverity } from '../core/eventBus.js';
import { agentScheduler } from '../agentRuntime/AgentScheduler.js';
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
          type: 'telemetry_inspection',
          steps: ['Read instruction spec', 'Verify component state'],
          requiredResources: goal.relatedResources || [],
          requiredSkills: ['summarize', 'search_notes'],
          suggestedAgents: ['Librarian Agent']
        },
        {
          id: 'task_2',
          title: 'Synthesize architecture deliverables',
          type: 'tool_execution',
          toolId: 'tool_git_status',
          steps: ['Inspect repository state', 'Verify build stability'],
          requiredResources: [],
          requiredSkills: ['refactor_notes', 'commit_to_vault'],
          suggestedAgents: ['Coprocessor Agent']
        }
      ],
      requiredSkills: ['summarize', 'search_notes', 'refactor_notes', 'commit_to_vault'],
      suggestedAgents: ['Librarian Agent', 'Coprocessor Agent'],
      requiredTools: ['tool_git_status', 'tool_file_read'],
      confidence: 0.94,
      reasoningTrace: [
        `Inferred intent: "${intent.primaryIntent}"`,
        `Goal priority evaluated as "${goalPriority}"`,
        `Identified 2 core objectives and 2 executable tasks`
      ],
      validationStatus: PlanStatus.DRAFT,
      version: '1.0.0'
    };

    // Validate plan
    const validation = planValidator.validatePlan(plan);
    plan.validationStatus = validation.isValid ? PlanStatus.VALIDATED : PlanStatus.REJECTED;

    this.plans.set(planId, plan);
    log.info(`Generated plan "${planId}" for goal "${goal.title}" (Status: ${plan.validationStatus})`);

    // Auto-enqueue tasks into AgentScheduler if plan is validated
    if (plan.validationStatus === PlanStatus.VALIDATED) {
      agentScheduler.enqueuePlanTasks(plan);
    }

    // Publish event
    serverEventBus.publish(SystemEvents.PLANNER_UPDATED, {
      planId,
      goalId: goal.id,
      goalTitle: goal.title,
      status: plan.validationStatus,
      tasksCount: plan.tasks.length
    }, { subsystem: 'Planner', severity: EventSeverity.INFO });

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
