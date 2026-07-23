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

    // Risk Assessment
    const riskLevel = goal.title.toLowerCase().includes('delete') || goal.title.toLowerCase().includes('refactor') ? 'HIGH' : 'LOW';
    const requiresApproval = riskLevel === 'HIGH' || riskLevel === 'CRITICAL';

    // Goal Decomposition with Task Dependencies
    const tasks = [
      {
        id: 'task_1',
        title: 'Inspect context & dependencies',
        type: 'telemetry_inspection',
        dependsOn: [],
        risk: 'LOW',
        steps: ['Read instruction spec', 'Verify component state'],
        suggestedAgents: ['Librarian Agent']
      },
      {
        id: 'task_2',
        title: 'Execute core task operations',
        type: 'tool_execution',
        toolId: 'tool_git_status',
        dependsOn: ['task_1'],
        risk: riskLevel,
        requiresCheckpoint: requiresApproval,
        steps: ['Execute target operation', 'Gather runtime output'],
        suggestedAgents: ['Coprocessor Agent']
      },
      {
        id: 'task_3',
        title: 'Verify results & update memory',
        type: 'reflection',
        dependsOn: ['task_2'],
        risk: 'LOW',
        steps: ['Validate output correctness', 'Persist reflection to Procedural Memory'],
        suggestedAgents: ['Memory Agent']
      }
    ];

    // Alternative Fallback Plan (Plan B)
    const alternativePlan = {
      name: 'Fallback Strategy (Plan B)',
      strategy: 'Safe Read-Only State Inspection & Rollback Checkpoint',
      tasks: [
        { id: 'fallback_1', title: 'Capture System Snapshot', type: 'system_snapshot' },
        { id: 'fallback_2', title: 'Log Inspection Diagnostics', type: 'diagnostics' }
      ]
    };

    const plan = {
      id: planId,
      timestamp: now,
      goalId: goal.id,
      goalTitle: goal.title,
      priority: goalPriority,
      intent: intent.primaryIntent,
      riskLevel,
      requiresApproval,
      approvalStatus: requiresApproval ? 'PENDING_CHECKPOINT' : 'AUTO_APPROVED',
      contextSnapshot: {
        intentCategory: intent.category,
        estimatedDurationMin: goal.estimatedDurationMin
      },
      objectives: [
        { id: 'obj_1', title: `Decomposed Objectives for ${goal.title}`, status: 'pending' }
      ],
      tasks,
      alternativePlan,
      requiredSkills: ['summarize', 'search_notes', 'refactor_notes', 'commit_to_vault'],
      suggestedAgents: ['Librarian Agent', 'Coprocessor Agent', 'Memory Agent'],
      requiredTools: ['tool_git_status', 'tool_file_read'],
      confidence: 0.94,
      reasoningTrace: [
        `Inferred intent: "${intent.primaryIntent}"`,
        `Goal priority evaluated as "${goalPriority}"`,
        `Risk level assessed: "${riskLevel}" (Requires Approval: ${requiresApproval})`,
        `Generated 3-stage dependency task graph and Plan B fallback strategy`
      ],
      validationStatus: PlanStatus.DRAFT,
      version: '1.4.0'
    };

    // Validate plan
    const validation = planValidator.validatePlan(plan);
    plan.validationStatus = validation.isValid ? PlanStatus.VALIDATED : PlanStatus.REJECTED;

    this.plans.set(planId, plan);
    log.info(`Generated plan "${planId}" for goal "${goal.title}" (Risk: ${riskLevel}, Status: ${plan.validationStatus})`);

    // Auto-enqueue tasks into AgentScheduler if plan is validated
    if (plan.validationStatus === PlanStatus.VALIDATED) {
      agentScheduler.enqueuePlanTasks(plan);
    }

    // Publish event
    serverEventBus.publish(SystemEvents.PLANNER_UPDATED, {
      planId,
      goalId: goal.id,
      goalTitle: goal.title,
      riskLevel,
      status: plan.validationStatus,
      tasksCount: plan.tasks.length
    }, { subsystem: 'Planner', severity: EventSeverity.INFO });

    return plan;
  }

  replanPlan(planId, failureReason = 'Task execution failed') {
    const plan = this.plans.get(planId);
    if (!plan) return null;

    log.info(`Adaptive Replanning triggered for Plan "${planId}". Reason: ${failureReason}`);

    // Switch to Alternative Strategy tasks
    plan.tasks = [
      ...plan.alternativePlan.tasks.map((t, idx) => ({
        id: `replan_task_${idx + 1}`,
        title: t.title,
        type: t.type,
        dependsOn: idx > 0 ? [`replan_task_${idx}`] : [],
        steps: ['Executing adaptive fallback step']
      }))
    ];

    plan.version = `1.4.1-adaptive`;
    plan.reasoningTrace.push(`Adaptive Replanning triggered: ${failureReason}`);

    agentScheduler.enqueuePlanTasks(plan);
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
