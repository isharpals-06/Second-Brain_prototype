/**
 * AEGISOS Tool Runtime — Type Definitions
 */

export const ToolCategory = Object.freeze({
  FILESYSTEM: 'filesystem',
  TERMINAL: 'terminal',
  GIT: 'git',
  SQLITE: 'sqlite',
  MCP: 'mcp',
  WEB_SEARCH: 'web_search',
  RAG: 'rag',
  LLM: 'llm',
  CLIPBOARD: 'clipboard'
});

export const ExecutionStatus = Object.freeze({
  QUEUED: 'queued',
  RUNNING: 'running',
  SUCCESS: 'success',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  TIMEOUT: 'timeout',
  PERMISSION_DENIED: 'permission_denied'
});

export const PermissionPolicy = Object.freeze({
  ALLOW: 'allow',
  DENY: 'deny',
  ASK_USER: 'ask_user'
});
