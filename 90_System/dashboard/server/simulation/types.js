/**
 * AEGISOS Decision Simulation Engine (DSE) — Type Definitions
 */

export const RiskLevel = Object.freeze({
  CRITICAL: 'Critical',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
  NEGLIGIBLE: 'Negligible'
});

export const ScenarioType = Object.freeze({
  NOMINAL: 'nominal',
  FAILURE_CASE: 'failure_case',
  EDGE_CASE: 'edge_case',
  ALTERNATIVE: 'alternative'
});

export const ApprovalStatus = Object.freeze({
  APPROVED: 'Approved',
  CONDITIONAL_APPROVAL: 'Conditional Approval',
  REJECTED: 'Rejected'
});
