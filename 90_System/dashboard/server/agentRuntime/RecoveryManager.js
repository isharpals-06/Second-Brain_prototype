import { agentRegistry } from './AgentRegistry.js';
import { lifecycleManager } from './LifecycleManager.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('AgentRuntime:RecoveryManager');

export class RecoveryManager {
  constructor() {
    this.maxRestarts = 3;
    this.recoveryLog = [];
  }

  recoverAgent(agentId, reason = 'Unspecified Failure') {
    const agent = agentRegistry.getAgent(agentId);
    if (!agent) return false;

    const record = {
      agentId,
      agentName: agent.name,
      reason,
      restartAttempt: agent.restartCount + 1,
      timestamp: new Date().toISOString()
    };

    this.recoveryLog.push(record);

    if (agent.restartCount >= this.maxRestarts) {
      log.error(`Agent "${agent.name}" failed ${agent.restartCount} times. Reached max restarts limit. Marking as FAILED.`);
      agent._status = 'failed';
      agent._health = 'unhealthy';
      return false;
    }

    log.warn(`Recovering agent "${agent.name}" (Attempt ${agent.restartCount + 1}/${this.maxRestarts}). Reason: ${reason}`);
    return lifecycleManager.restartAgent(agentId);
  }

  getRecoveryLog() {
    return this.recoveryLog;
  }
}

export const recoveryManager = new RecoveryManager();
