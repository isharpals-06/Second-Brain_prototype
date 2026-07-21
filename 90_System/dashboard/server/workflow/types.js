/**
 * AEGISOS Workflow Orchestration Platform (WOP) — Type Definitions
 */

export const WorkflowState = Object.freeze({
  PENDING: 'pending',
  READY: 'ready',
  RUNNING: 'running',
  WAITING: 'waiting',
  PAUSED: 'paused',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  RETRYING: 'retrying',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  TIMED_OUT: 'timed_out'
});

export const StepType = Object.freeze({
  AGENT: 'agent',
  TOOL: 'tool',
  DECISION: 'decision',
  CONDITION: 'condition',
  LOOP: 'loop',
  PARALLEL: 'parallel',
  APPROVAL: 'approval',
  CHECKPOINT: 'checkpoint'
});
