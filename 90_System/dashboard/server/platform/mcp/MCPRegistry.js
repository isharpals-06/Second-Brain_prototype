import { aegisLogger } from '../../core/logger.js';

const log = aegisLogger.child('MCP:Registry');

export class MCPRegistry {
  constructor() {
    this.servers = new Map();
    this.tools = new Map();
    this.registerDefaults();
  }

  registerDefaults() {
    const defaultTools = [
      { name: 'query_graph', serverId: 'graphify', capability: 'knowledge_graph', description: 'Query Graphify knowledge graph' },
      { name: 'get_node', serverId: 'graphify', capability: 'knowledge_graph', description: 'Retrieve node details from Graphify' },
      { name: 'generate_screen_from_text', serverId: 'stitch', capability: 'ui_design', description: 'Generate Stitch UI mockups' },
      { name: 'create_design_system', serverId: 'stitch', capability: 'ui_design', description: 'Create Stitch Design System' },
    ];

    for (const tool of defaultTools) {
      this.tools.set(tool.name, tool);
    }
  }

  registerTool(tool) {
    this.tools.set(tool.name, tool);
    log.info(`Registered MCP Tool "${tool.name}" (Capability: ${tool.capability}).`);
  }

  getTool(toolName) {
    return this.tools.get(toolName) || null;
  }

  findToolsForCapability(capability) {
    return Array.from(this.tools.values()).filter(t => t.capability === capability);
  }

  listTools() {
    return Array.from(this.tools.values());
  }
}

export const mcpRegistry = new MCPRegistry();
