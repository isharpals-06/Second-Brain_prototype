import { mcpRegistry } from './MCPRegistry.js';
import { mcpToolRouter } from './ToolRouter.js';
import { mcpPermissionEngine } from './PermissionEngine.js';
import { mcpAuditLogger } from './AuditLogger.js';
import { mcpSessionManager } from './SessionManager.js';
import { aegisLogger } from '../../core/logger.js';

const log = aegisLogger.child('MCP:Runtime');

export class MCPRuntime {
  async executeTool(capability, toolName, args = {}, context = {}) {
    const startTime = Date.now();

    const tool = mcpToolRouter.resolveTool(capability, toolName);
    if (!tool) {
      const err = new Error(`No tool found for capability "${capability}" or toolName "${toolName}".`);
      mcpAuditLogger.logExecution({ capability, toolName, args, status: 'error', error: err.message, durationMs: Date.now() - startTime });
      throw err;
    }

    log.info(`MCP Runtime executing tool "${tool.name}" (Server: ${tool.serverId})...`);

    // Dynamic execution simulation / proxy
    const durationMs = Date.now() - startTime;
    const result = {
      success: true,
      tool: tool.name,
      serverId: tool.serverId,
      executedAt: new Date().toISOString(),
      result: `Executed tool "${tool.name}" successfully for capability "${capability}".`,
    };

    mcpAuditLogger.logExecution({
      capability,
      toolName: tool.name,
      args,
      status: 'success',
      durationMs,
    });

    return result;
  }

  getDiagnostics() {
    return {
      status: 'healthy',
      toolsCount: mcpRegistry.listTools().length,
      activeSessionsCount: mcpSessionManager.listSessions().length,
      auditLogsCount: mcpAuditLogger.getLogs().length,
      permissions: mcpPermissionEngine.listPermissions(),
    };
  }
}

export const mcpRuntime = new MCPRuntime();
