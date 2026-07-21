/**
 * AEGISOS Governance & Trust Platform — Type Definitions
 */

export const PolicyEffect = Object.freeze({
  ALLOW: 'allow',
  DENY: 'deny',
  ASK_USER: 'ask_user'
});

export const IdentityType = Object.freeze({
  USER: 'user',
  AGENT: 'agent',
  SERVICE: 'service',
  SYSTEM: 'system'
});

export const AlertSeverity = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
});
