import { serverEventBus } from './eventBus.js';
import { SystemEvents, AgentStatus } from './types.js';
import { aegisLogger } from './logger.js';
import { AegisError, ErrorCodes } from './errors.js';

const log = aegisLogger.child('AgentManager');

class AgentManager {
  constructor() {
    this.agents = new Map();
  }

  /**
   * Register an AI Agent definition.
   * @param {Object} agentDef 
   */
  register(agentDef) {
    if (!agentDef || !agentDef.id || !agentDef.name) {
      throw new AegisError(ErrorCodes.AGENT_ERROR, 'Agent definition must include "id" and "name".');
    }

    const record = {
      id: agentDef.id,
      name: agentDef.name,
      role: agentDef.role || 'Assistant',
      status: AgentStatus.REGISTERED,
      enabled: agentDef.enabled !== false,
      lastHeartbeat: new Date().toISOString(),
      capabilities: agentDef.capabilities || [],
      metrics: {
        tasksExecuted: 0,
        tasksFailed: 0,
        avgDurationMs: 0
      },
      metadata: agentDef.metadata || {}
    };

    this.agents.set(agentDef.id, record);
    log.info(`Agent "${agentDef.name}" (${agentDef.id}) registered.`);

    serverEventBus.publish(SystemEvents.AGENT_REGISTERED, record);
    return record;
  }

  unregister(agentId) {
    if (this.agents.has(agentId)) {
      const agent = this.agents.get(agentId);
      agent.status = AgentStatus.UNREGISTERED;
      this.agents.delete(agentId);

      serverEventBus.publish(SystemEvents.AGENT_STATUS_CHANGED, { id: agentId, status: AgentStatus.UNREGISTERED });
    }
  }

  enable(agentId) {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.enabled = true;
      agent.status = AgentStatus.IDLE;
      serverEventBus.publish(SystemEvents.AGENT_STATUS_CHANGED, { id: agentId, status: AgentStatus.IDLE, enabled: true });
    }
  }

  disable(agentId) {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.enabled = false;
      agent.status = AgentStatus.DISABLED;
      serverEventBus.publish(SystemEvents.AGENT_STATUS_CHANGED, { id: agentId, status: AgentStatus.DISABLED, enabled: false });
    }
  }

  heartbeat(agentId) {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.lastHeartbeat = new Date().toISOString();
    }
  }

  /**
   * Filter agents by required capability.
   * @param {string} capability 
   * @returns {Array<Object>}
   */
  findByCapability(capability) {
    return Array.from(this.agents.values()).filter(agent =>
      agent.enabled && agent.capabilities.includes(capability)
    );
  }

  /**
   * Record task execution metrics for an agent.
   * @param {string} agentId 
   * @param {boolean} success 
   * @param {number} durationMs 
   */
  recordTaskExecution(agentId, success = true, durationMs = 0) {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.metrics.tasksExecuted += 1;
      if (!success) agent.metrics.tasksFailed += 1;
      const total = agent.metrics.tasksExecuted;
      agent.metrics.avgDurationMs = Math.round(((agent.metrics.avgDurationMs * (total - 1)) + durationMs) / total);
    }
  }

  /**
   * Health check across all registered agents.
   * @param {number} maxStaleMs Default 60000ms (1 minute)
   * @returns {Array<Object>} List of stale or un-responsive agents
   */
  checkHealth(maxStaleMs = 60000) {
    const now = Date.now();
    const staleAgents = [];

    this.agents.forEach(agent => {
      const last = new Date(agent.lastHeartbeat).getTime();
      if (agent.enabled && (now - last > maxStaleMs)) {
        staleAgents.push(agent);
      }
    });

    return staleAgents;
  }

  status(agentId) {
    return this.agents.get(agentId) || null;
  }

  list() {
    return Array.from(this.agents.values());
  }
}

export const serverAgentManager = new AgentManager();
export { AgentManager, AgentStatus };
