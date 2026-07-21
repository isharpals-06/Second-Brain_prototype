/**
 * AEGISOS Automation Platform — Type Definitions
 */

export const AutonomyLevel = Object.freeze({
  L0_OBSERVATION: 'L0_observation',
  L1_RECOMMENDATION: 'L1_recommendation', // Default
  L2_APPROVAL: 'L2_approval',
  L3_AUTOMATIC_TRUSTED: 'L3_automatic_trusted',
  L4_CONTEXT_AWARE: 'L4_context_aware'
});

export const TriggerType = Object.freeze({
  TIME: 'time',
  CRON: 'cron',
  FILESYSTEM: 'filesystem',
  GIT: 'git',
  MEMORY: 'memory',
  EVENT: 'event'
});

export const AutomationStatus = Object.freeze({
  IDLE: 'idle',
  SCHEDULED: 'scheduled',
  SIMULATING: 'simulating',
  WAITING_APPROVAL: 'waiting_approval',
  EXECUTING: 'executing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  ROLLED_BACK: 'rolled_back',
  DISABLED: 'disabled'
});
