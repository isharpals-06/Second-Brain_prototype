import { serverEventBus } from './eventBus.js';
import { SystemEvents, AgentStatus } from './types.js';

class AgentManager {
  constructor() {
    this.agents = new Map();
  }

  /**
   * Register a new AI Agent definition.
   * @param {Object} agentDef 
   */
  register(agentDef) {
    if (!agentDef || !agentDef.id || !agentDef.name) {
      throw new Error('[AgentManager] Agent definition must include "id" and "name".');
    }

    const record = {
      id: agentDef.id,
      name: agentDef.name,
      role: agentDef.role || 'Assistant',
      status: AgentStatus.REGISTERED,
      enabled: agentDef.enabled !== false,
      lastHeartbeat: new Date().toISOString(),
      capabilities: agentDef.capabilities || [],
      metadata: agentDef.metadata || {}
    };

    this.agents.set(agentDef.id, record);
    console.log(`[AgentManager] Agent "${agentDef.name}" (${agentDef.id}) registered.`);

    serverEventBus.publish(SystemEvents.AGENT_REGISTERED, record);
    return record;
  }

  /**
   * Unregister an agent.
   * @param {string} agentId 
   */
  unregister(agentId) {
    if (this.agents.has(agentId)) {
      const agent = this.agents.get(agentId);
      agent.status = AgentStatus.UNREGISTERED;
      this.agents.delete(agentId);

      serverEventBus.publish(SystemEvents.AGENT_STATUS_CHANGED, { id: agentId, status: AgentStatus.UNREGISTERED });
    }
  }

  /**
   * Enable an agent.
   * @param {string} agentId 
   */
  enable(agentId) {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.enabled = true;
      agent.status = AgentStatus.IDLE;
      serverEventBus.publish(SystemEvents.AGENT_STATUS_CHANGED, { id: agentId, status: AgentStatus.IDLE, enabled: true });
    }
  }

  /**
   * Disable an agent.
   * @param {string} agentId 
   */
  disable(agentId) {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.enabled = false;
      agent.status = AgentStatus.DISABLED;
      serverEventBus.publish(SystemEvents.AGENT_STATUS_CHANGED, { id: agentId, status: AgentStatus.DISABLED, enabled: false });
    }
  }

  /**
   * Record an agent heartbeat ping.
   * @param {string} agentId 
   */
  heartbeat(agentId) {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.lastHeartbeat = new Date().toISOString();
    }
  }

  /**
   * Retrieve status of a specific agent.
   * @param {string} agentId 
   * @returns {Object|null}
   */
  status(agentId) {
    return this.agents.get(agentId) || null;
  }

  /**
   * List all registered agents.
   * @returns {Array<Object>}
   */
  list() {
    return Array.from(this.agents.values());
  }
}

export const serverAgentManager = new AgentManager();
export { AgentManager, AgentStatus };
