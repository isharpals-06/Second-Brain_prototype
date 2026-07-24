import { planningEngine } from './PlanningEngine.js';
import { plannerEvents, PlannerEventTypes } from './PlannerEvents.js';
import { runtimeStore } from '../RuntimeStore.js';
import { missionRuntime } from '../MissionRuntime.js';

export class PlannerRuntimeEngine {
  constructor() {
    this.plans = new Map();
  }

  planMission(missionId) {
    const mission = missionRuntime.getMission(missionId);
    if (!mission) {
      plannerEvents.emit(PlannerEventTypes.PLANNING_FAILED, { missionId, reason: 'Mission not found' });
      return null;
    }

    const plan = planningEngine.generateExecutionPlan(mission);
    this.plans.set(plan.id, plan);

    runtimeStore.updateState('executionPlanState', plan);
    runtimeStore.updateState('planningState', { activePlanId: plan.id, status: 'EXECUTION_PLAN_READY' });
    runtimeStore.updateState('dependencyGraphState', { sequentialOrder: plan.taskOrder, parallelGroups: plan.parallelGroups });
    runtimeStore.updateState('capabilityAssignmentsState', plan.capabilityAssignments);
    runtimeStore.updateState('approvalState', { approvalGates: plan.approvalGates });
    runtimeStore.updateState('resourceEstimatesState', plan.resourceEstimates);

    return plan;
  }

  getExecutionPlan(planId) {
    return this.plans.get(planId) || null;
  }

  getPlanByMissionId(missionId) {
    return Array.from(this.plans.values()).find(p => p.missionId === missionId) || null;
  }
}

export const plannerRuntimeEngine = new PlannerRuntimeEngine();
