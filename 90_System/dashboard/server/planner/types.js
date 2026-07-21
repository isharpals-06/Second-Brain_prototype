/**
 * AEGISOS Executive Planner — Type Definitions
 */

export const PriorityLevel = Object.freeze({
  CRITICAL: 'Critical',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
  DEFERRED: 'Deferred'
});

export const GoalStatus = Object.freeze({
  PROPOSED: 'proposed',
  ACTIVE: 'active',
  BLOCKED: 'blocked',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned'
});

export const PlanStatus = Object.freeze({
  DRAFT: 'draft',
  VALIDATED: 'validated',
  REJECTED: 'rejected',
  SUPERSEDED: 'superseded'
});

export const ConstraintType = Object.freeze({
  OFFLINE_MODE: 'offline_mode',
  MISSING_TOOL: 'missing_tool',
  RESOURCE_LIMIT: 'resource_limit',
  PERMISSION_RESTRICTION: 'permission_restriction',
  TIME_CONSTRAINT: 'time_constraint'
});
