import { agentRegistry } from './AgentRegistry.js';
import { lifecycleManager } from './LifecycleManager.js';
import { agentScheduler } from './AgentScheduler.js';
import { capabilityRegistry } from './CapabilityRegistry.js';
import { messageRouter } from './MessageRouter.js';
import { recoveryManager } from './RecoveryManager.js';

class AgentRuntimeAPI {
  listAgents() {
    return agentRegistry.listAgents().map(a => a.getMetrics());
  }

  getAgent(id) {
    const agent = agentRegistry.getAgent(id);
    return agent ? agent.getMetrics() : null;
  }

  startAgent(id) {
    return lifecycleManager.startAgent(id);
  }

  pauseAgent(id) {
    return lifecycleManager.pauseAgent(id);
  }

  resumeAgent(id) {
    return lifecycleManager.resumeAgent(id);
  }

  stopAgent(id) {
    return lifecycleManager.stopAgent(id);
  }

  restartAgent(id) {
    return lifecycleManager.restartAgent(id);
  }

  getQueueStatus() {
    return agentScheduler.getQueueStatus();
  }

  getCapabilities() {
    return capabilityRegistry.listCapabilities();
  }

  getMessages(receiverId = null) {
    return messageRouter.getMessages(receiverId);
  }

  getRecoveryLog() {
    return recoveryManager.getRecoveryLog();
  }

  getMetrics() {
    const agents = agentRegistry.listAgents();
    const running = agents.filter(a => a.status() === 'running').length;
    const queue = agentScheduler.getQueueStatus();

    return {
      totalAgents: agents.length,
      runningAgents: running,
      pendingTasks: queue.pending,
      completedTasks: queue.completed,
      healthScore: agents.length > 0 ? Math.round((running / agents.length) * 100) : 100
    };
  }
}

export const agentRuntimeAPI = new AgentRuntimeAPI();
export { AgentRuntimeAPI };
