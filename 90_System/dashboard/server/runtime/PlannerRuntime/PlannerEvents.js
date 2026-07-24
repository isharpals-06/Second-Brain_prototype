import { runtimeEvents } from '../RuntimeEvents.js';
import { aegisLogger } from '../../core/logger.js';

const log = aegisLogger.child('Planner:Events');

export const PlannerEventTypes = {
  PLANNING_STARTED: 'PlanningStarted',
  PLANNING_UPDATED: 'PlanningUpdated',
  DEPENDENCY_RESOLVED: 'DependencyResolved',
  CAPABILITY_ASSIGNED: 'CapabilityAssigned',
  EXECUTION_PLAN_CREATED: 'ExecutionPlanCreated',
  APPROVAL_CHECKPOINT_ADDED: 'ApprovalCheckpointAdded',
  PLANNING_COMPLETED: 'PlanningCompleted',
  PLANNING_FAILED: 'PlanningFailed',
};

export class PlannerEvents {
  emit(eventType, payload = {}) {
    log.info(`Planner Event Emitted: [${eventType}]`);
    return runtimeEvents.emit(eventType, payload);
  }

  subscribe(eventType, listener) {
    return runtimeEvents.on(eventType, listener);
  }
}

export const plannerEvents = new PlannerEvents();
