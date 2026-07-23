import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Platform:MCPManager');

export class MCPManager {
  constructor() {
    this.servers = new Map();
    this.registerDefaults();
  }

  registerDefaults() {
    const defaultMCPServers = [
      { id: 'graphify', label: 'Graphify Knowledge MCP Server', status: 'online', toolsCount: 10, path: 'C:\\Users\\ishar\\.gemini\\antigravity-cli\\mcp\\graphify' },
      { id: 'stitch', label: 'Stitch UI Design System MCP Server', status: 'online', toolsCount: 16, path: 'C:\\Users\\ishar\\.gemini\\antigravity-cli\\mcp\\stitch' },
    ];

    for (const server of defaultMCPServers) {
      this.servers.set(server.id, server);
    }
  }

  registerServer(id, serverConfig) {
    this.servers.set(id, { id, status: 'online', ...serverConfig });
    log.info(`MCP Server "${id}" registered.`);
  }

  listServers() {
    return Array.from(this.servers.values());
  }

  getServer(id) {
    return this.servers.get(id) || null;
  }
}

export const mcpManager = new MCPManager();
