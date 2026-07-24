export const PlanStateEnum = {
  DRAFT: 'Draft',
  RESOLVED: 'Resolved',
  OPTIMIZED: 'Optimized',
  READY: 'Ready',
  EXECUTING: 'Executing',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
};

export const PlannerEventTypes = {
  PLANNER_STARTED: 'PlannerStarted',
  PLAN_GENERATED: 'PlanGenerated',
  PLAN_VALIDATED: 'PlanValidated',
  PLAN_OPTIMIZED: 'PlanOptimized',
  PLAN_FAILED: 'PlanFailed',
};
