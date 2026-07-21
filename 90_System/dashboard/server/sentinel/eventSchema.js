/**
 * AEGISOS Sentinel Core — Standard Event Schema & Builder
 */

export const EventPriority = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
});

export const EventCategory = Object.freeze({
  FILESYSTEM: 'filesystem',
  VAULT: 'vault',
  WORKSPACE: 'workspace',
  GIT: 'git',
  CLIPBOARD: 'clipboard',
  SYSTEM: 'system'
});

export function createSentinelEvent({
  observer,
  category,
  priority = EventPriority.LOW,
  payload = {},
  correlationId = null
}) {
  return {
    id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    timestamp: new Date().toISOString(),
    source: 'sentinel',
    observer,
    category,
    priority,
    payload,
    version: '1.0.0',
    correlationId: correlationId || `corr_${Date.now()}`
  };
}
