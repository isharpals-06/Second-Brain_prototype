import { aegisLogger } from '../../core/logger.js';

const log = aegisLogger.child('MCP:AuditLogger');

export class MCPAuditLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 500;
  }

  logExecution(entry = {}) {
    const record = {
      id: `mcp_log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      agentId: entry.agentId || 'system',
      capability: entry.capability || 'general_tool',
      toolName: entry.toolName || 'unknown_tool',
      args: entry.args || {},
      durationMs: entry.durationMs || 0,
      status: entry.status || 'success',
      error: entry.error || null,
    };

    this.logs.unshift(record);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }
    log.info(`Audit log recorded for tool "${record.toolName}" (${record.status}).`);
    return record;
  }

  getLogs(limit = 50) {
    return this.logs.slice(0, limit);
  }
}

export const mcpAuditLogger = new MCPAuditLogger();
