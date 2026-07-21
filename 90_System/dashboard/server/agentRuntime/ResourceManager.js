import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('AgentRuntime:ResourceManager');

export class ResourceManager {
  constructor() {
    this.limits = {
      maxConcurrentAgents: 10,
      maxMemoryPerAgentMb: 512,
      maxCpuPercentPerAgent: 25,
      allowedModels: ['gemini-2.5-flash', 'qwen3.6', 'mixtral']
    };

    this.allocations = new Map();
  }

  allocateResource(agentId, resourceType, amount) {
    this.allocations.set(`${agentId}:${resourceType}`, amount);
    log.debug(`Allocated ${amount} of ${resourceType} to agent "${agentId}"`);
    return true;
  }

  getResourceLimits() {
    return this.limits;
  }
}

export const resourceManager = new ResourceManager();
