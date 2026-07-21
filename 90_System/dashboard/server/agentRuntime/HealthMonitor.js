import { agentRegistry } from './AgentRegistry.js';
import { recoveryManager } from './RecoveryManager.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('AgentRuntime:HealthMonitor');

export class HealthMonitor {
  constructor() {
    this.intervalId = null;
    this.checkIntervalMs = 30000; // 30 seconds
  }

  start() {
    log.info('Starting AgentRuntime HealthMonitor loop (30s interval)...');
    this.intervalId = setInterval(() => this.checkAgentHealth(), this.checkIntervalMs);
  }

  stop() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  checkAgentHealth() {
    const agents = agentRegistry.listAgents();
    const now = Date.now();

    agents.forEach(agent => {
      // Refresh heartbeat for active running agents
      if (agent.status() === 'running') {
        agent.heartbeat();
      }

      const lastBeat = new Date(agent.lastHeartbeat).getTime();
      const elapsed = now - lastBeat;

      if (elapsed > 60000 && agent.status() === 'running') {
        log.warn(`Agent "${agent.name}" (${agent.id}) heartbeat timed out! Triggering recovery...`);
        recoveryManager.recoverAgent(agent.id, 'Heartbeat Timeout');
      }
    });
  }
}

export const healthMonitor = new HealthMonitor();
