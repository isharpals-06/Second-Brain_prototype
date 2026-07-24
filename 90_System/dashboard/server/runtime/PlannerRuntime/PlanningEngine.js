import { dependencyResolver } from './DependencyResolver.js';
import { capabilityResolver } from './CapabilityResolver.js';
import { resourcePlanner } from './ResourcePlanner.js';
import { approvalPlanner } from './ApprovalPlanner.js';
import { planningPolicies } from './PlanningPolicies.js';
import { plannerEvents, PlannerEventTypes } from './PlannerEvents.js';
import { aegisLogger } from '../../core/logger.js';

const log = aegisLogger.child('Planner:Engine');

export class PlanningEngine {
  generateExecutionPlan(mission) {
    log.info(`Generating Execution Plan for Mission "${mission.id}"`);
    plannerEvents.emit(PlannerEventTypes.PLANNING_STARTED, { missionId: mission.id });

    const taskGraph = mission.taskGraph || { nodes: [], edges: [] };

    // 1. Dependency Resolution
    const dependencies = dependencyResolver.resolveDependencies(taskGraph);
    plannerEvents.emit(PlannerEventTypes.DEPENDENCY_RESOLVED, dependencies);

    // 2. Capability Assignment
    const capabilities = capabilityResolver.assignCapabilities(taskGraph.nodes, mission.category);
    plannerEvents.emit(PlannerEventTypes.CAPABILITY_ASSIGNED, capabilities);

    // 3. Resource Planning
    const resourceEstimates = resourcePlanner.estimateResources(taskGraph.nodes, mission.category);

    // 4. Approval Planning
    const approvals = approvalPlanner.planApprovals(taskGraph.nodes, mission.intent);
    if (approvals.hasCheckpoints) {
      plannerEvents.emit(PlannerEventTypes.APPROVAL_CHECKPOINT_ADDED, approvals);
    }

    const planId = `plan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const executionPlan = {
      id: planId,
      missionId: mission.id,
      planningTimestamp: new Date().toISOString(),
      executionStrategy: planningPolicies.getPolicies().preferParallelExecution ? 'PARALLEL_DAG' : 'SEQUENTIAL',
      taskOrder: dependencies.sequentialOrder,
      parallelGroups: dependencies.parallelGroups,
      blockedTasks: dependencies.blockedTasks,
      approvalGates: approvals.checkpoints,
      requiredCapabilities: capabilities.requiredCapabilities,
      capabilityAssignments: capabilities.assignments,
      resourceEstimates,
      estimatedRuntimeSeconds: resourceEstimates.estimatedDurationSeconds,
      estimatedCostUSD: resourceEstimates.estimatedCostUSD,
      riskScore: approvals.hasCheckpoints ? 0.65 : 0.15,
      confidenceScore: dependencies.isValid ? 0.95 : 0.40,
    };

    const immutablePlan = Object.freeze(executionPlan);
    plannerEvents.emit(PlannerEventTypes.EXECUTION_PLAN_CREATED, immutablePlan);
    plannerEvents.emit(PlannerEventTypes.PLANNING_COMPLETED, immutablePlan);

    return immutablePlan;
  }
}

export const planningEngine = new PlanningEngine();
