/**
 * AEGISOS Agent Runtime — Type Definitions
 */

export const AgentStatus = Object.freeze({
  REGISTERED: 'registered',
  INITIALIZED: 'initialized',
  RUNNING: 'running',
  PAUSED: 'paused',
  STOPPED: 'stopped',
  FAILED: 'failed',
  DISPOSED: 'disposed'
});

export const MessageType = Object.freeze({
  REQUEST: 'request',
  RESPONSE: 'response',
  BROADCAST: 'broadcast',
  EVENT: 'event',
  NOTIFICATION: 'notification',
  HEARTBEAT: 'heartbeat',
  ERROR: 'error',
  ACK: 'ack'
});

export const CapabilityType = Object.freeze({
  RESEARCH: 'research',
  SUMMARIZATION: 'summarization',
  CODE_GEN: 'code_gen',
  DEBUGGING: 'debugging',
  PLANNING: 'planning',
  MEMORY: 'memory',
  DOCUMENTATION: 'documentation'
});
