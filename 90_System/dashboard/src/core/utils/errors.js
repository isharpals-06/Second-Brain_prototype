/**
 * AEGISOS Client Error Framework
 */

export const ErrorCodes = Object.freeze({
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  SERVICE_ERROR: 'SERVICE_ERROR',
  AGENT_ERROR: 'AGENT_ERROR',
  SKILL_ERROR: 'SKILL_ERROR',
  EVENT_ERROR: 'EVENT_ERROR',
  CONTEXT_ERROR: 'CONTEXT_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  NOT_FOUND: 'NOT_FOUND',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR'
});

export class AegisError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'AegisError';
    this.code = code || ErrorCodes.SYSTEM_ERROR;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}
