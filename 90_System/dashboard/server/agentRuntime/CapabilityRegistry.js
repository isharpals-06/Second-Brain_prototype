import { agentRegistry } from './AgentRegistry.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('AgentRuntime:CapabilityRegistry');

export class CapabilityRegistry {
  listCapabilities() {
    const map = new Map();
    const agents = agentRegistry.listAgents();

    agents.forEach(agent => {
      const caps = agent.capabilities();
      caps.forEach(cap => {
        if (!map.has(cap)) map.set(cap, []);
        map.get(cap).push(agent.id);
      });
    });

    const result = [];
    for (const [capability, agentIds] of map.entries()) {
      result.push({ capability, agentIds });
    }
    return result;
  }

  findAgentsForCapability(capability) {
    const agents = agentRegistry.listAgents();
    return agents.filter(a => a.capabilities().includes(capability));
  }
}

export const capabilityRegistry = new CapabilityRegistry();
