import { mcpRegistry } from './MCPRegistry.js';
import { mcpPermissionEngine } from './PermissionEngine.js';
import { aegisLogger } from '../../core/logger.js';

const log = aegisLogger.child('MCP:ToolRouter');

export class MCPToolRouter {
  resolveTool(capability, requestedToolName) {
    if (requestedToolName) {
      const tool = mcpRegistry.getTool(requestedToolName);
      if (tool) return tool;
    }

    const availableTools = mcpRegistry.findToolsForCapability(capability);
    if (availableTools.length > 0) {
      log.info(`Resolved capability "${capability}" to tool "${availableTools[0].name}".`);
      return availableTools[0];
    }

    return null;
  }
}

export const mcpToolRouter = new MCPToolRouter();
