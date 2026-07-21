import { agentRegistry } from './AgentRegistry.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('AgentRuntime:LifecycleManager');

export class LifecycleManager {
  startAll() {
    log.info('Starting all registered agents...');
    const agents = agentRegistry.listAgents();
    agents.forEach(agent => {
      try {
        agent.start();
      } catch (err) {
        log.error(`Error starting agent "${agent.name}": ${err.message}`);
      }
    });
  }

  stopAll() {
    log.info('Stopping all running agents...');
    const agents = agentRegistry.listAgents();
    agents.forEach(agent => {
      try {
        agent.stop();
      } catch (err) {
        log.error(`Error stopping agent "${agent.name}": ${err.message}`);
      }
    });
  }

  startAgent(id) {
    const agent = agentRegistry.getAgent(id);
    if (!agent) return false;
    return agent.start();
  }

  pauseAgent(id) {
    const agent = agentRegistry.getAgent(id);
    if (!agent) return false;
    return agent.pause();
  }

  resumeAgent(id) {
    const agent = agentRegistry.getAgent(id);
    if (!agent) return false;
    return agent.resume();
  }

  stopAgent(id) {
    const agent = agentRegistry.getAgent(id);
    if (!agent) return false;
    return agent.stop();
  }

  restartAgent(id) {
    const agent = agentRegistry.getAgent(id);
    if (!agent) return false;
    agent.stop();
    agent.restartCount += 1;
    return agent.start();
  }
}

export const lifecycleManager = new LifecycleManager();
