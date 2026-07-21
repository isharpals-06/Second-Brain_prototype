import { FileReadTool } from './tools/FileReadTool.js';
import { FileWriteTool } from './tools/FileWriteTool.js';
import { GitStatusTool } from './tools/GitStatusTool.js';
import { VaultSearchTool } from './tools/VaultSearchTool.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('ToolRuntime:Registry');

export class ToolRegistry {
  constructor() {
    this.tools = new Map();
    this.registerBuiltInTools();
  }

  registerBuiltInTools() {
    const builtIn = [
      new FileReadTool(),
      new FileWriteTool(),
      new GitStatusTool(),
      new VaultSearchTool()
    ];

    builtIn.forEach(t => {
      t.register();
      t.initialize();
      this.tools.set(t.id, t);
    });

    log.info(`Registered ${this.tools.size} built-in tools in ToolRegistry.`);
  }

  getTool(id) {
    return this.tools.get(id) || null;
  }

  listTools() {
    return Array.from(this.tools.values());
  }

  registerTool(toolInstance) {
    if (!toolInstance || !toolInstance.id) return false;
    this.tools.set(toolInstance.id, toolInstance);
    log.info(`Registered custom tool "${toolInstance.name}" (${toolInstance.id})`);
    return true;
  }
}

export const toolRegistry = new ToolRegistry();
