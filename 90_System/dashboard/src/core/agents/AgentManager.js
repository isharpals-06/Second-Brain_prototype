import { clientEventBus } from '../eventBus/EventBus.js';
import { SystemEvents, AgentStatus } from '../../types/index.js';

class ClientAgentManager {
  constructor() {
    this.agents = new Map();
  }

  register(agentDef) {
    if (!agentDef || !agentDef.id || !agentDef.name) {
      throw new Error('[ClientAgentManager] Agent definition must include id and name.');
    }

    const record = {
      id: agentDef.id,
      name: agentDef.name,
      role: agentDef.role || 'Assistant',
      status: AgentStatus.REGISTERED,
      enabled: agentDef.enabled !== false,
      lastHeartbeat: new Date().toISOString(),
      capabilities: agentDef.capabilities || []
    };

    this.agents.set(agentDef.id, record);
    clientEventBus.publish(SystemEvents.AGENT_REGISTERED, record);
    return record;
  }

  unregister(agentId) {
    if (this.agents.has(agentId)) {
      this.agents.delete(agentId);
      clientEventBus.publish(SystemEvents.AGENT_STATUS_CHANGED, { id: agentId, status: AgentStatus.UNREGISTERED });
    }
  }

  enable(agentId) {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.enabled = true;
      agent.status = AgentStatus.IDLE;
      clientEventBus.publish(SystemEvents.AGENT_STATUS_CHANGED, { id: agentId, status: AgentStatus.IDLE, enabled: true });
    }
  }

  disable(agentId) {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.enabled = false;
      agent.status = AgentStatus.DISABLED;
      clientEventBus.publish(SystemEvents.AGENT_STATUS_CHANGED, { id: agentId, status: AgentStatus.DISABLED, enabled: false });
    }
  }

  status(agentId) {
    return this.agents.get(agentId) || null;
  }

  list() {
    return Array.from(this.agents.values());
  }
}

export const clientAgentManager = new ClientAgentManager();
export { ClientAgentManager, AgentStatus };
