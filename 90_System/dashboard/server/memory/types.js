/**
 * AEGISOS Memory OS — Type Definitions
 */

export const MemoryType = Object.freeze({
  SEMANTIC: 'semantic',
  PROCEDURAL: 'procedural',
  EPISODIC: 'episodic',
  CONVERSATION: 'conversation',
  PROJECT: 'project',
  RESEARCH: 'research',
  SKILL: 'skill',
  PREFERENCE: 'preference',
  WORKFLOW: 'workflow',
  AGENT_EXPERIENCE: 'agent_experience',
  ERROR: 'error',
  RECOVERY: 'recovery',
  LEARNING: 'learning'
});

export const LifecycleStatus = Object.freeze({
  ACTIVE: 'active',
  CONSOLIDATED: 'consolidated',
  ARCHIVED: 'archived',
  EXPIRED: 'expired',
  DELETED: 'deleted'
});
