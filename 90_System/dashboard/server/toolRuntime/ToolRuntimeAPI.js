import { toolRegistry } from './ToolRegistry.js';
import { executionEngine } from './ExecutionEngine.js';

class ToolRuntimeAPI {
  constructor() {
    this.storage = null;
  }

  setStorage(storageInstance) {
    this.storage = storageInstance;
  }

  listTools() {
    return toolRegistry.listTools().map(t => t.metadata());
  }

  getTool(id) {
    const tool = toolRegistry.getTool(id);
    return tool ? tool.metadata() : null;
  }

  async executeTool(toolId, input = {}) {
    const result = await executionEngine.executeTool(toolId, input);
    if (this.storage) {
      this.storage.saveExecution(result);
    }
    return result;
  }

  getHistory() {
    return this.storage ? this.storage.getLogs() : [];
  }

  getMetrics() {
    const logs = this.getHistory();
    const successes = logs.filter(l => l.status === 'success').length;
    const failures = logs.filter(l => l.status !== 'success').length;
    const totalDuration = logs.reduce((sum, l) => sum + (l.durationMs || 0), 0);

    return {
      registeredToolsCount: toolRegistry.listTools().length,
      totalExecutions: logs.length,
      successCount: successes,
      failureCount: failures,
      successRatePercent: logs.length > 0 ? Math.round((successes / logs.length) * 100) : 100,
      avgDurationMs: logs.length > 0 ? Math.round(totalDuration / logs.length) : 0
    };
  }
}

export const toolRuntimeAPI = new ToolRuntimeAPI();
export { ToolRuntimeAPI };
