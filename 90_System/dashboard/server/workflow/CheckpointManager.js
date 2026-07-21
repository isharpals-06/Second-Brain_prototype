import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Workflow:CheckpointManager');

export class CheckpointManager {
  constructor() {
    this.checkpoints = new Map();
  }

  createCheckpoint(instance) {
    if (!instance || !instance.id) return null;

    const checkpointId = `chk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const snapshot = {
      checkpointId,
      instanceId: instance.id,
      workflowId: instance.workflowId,
      state: instance.state,
      currentStepIndex: instance.currentStepIndex,
      variables: { ...instance.variables },
      completedSteps: [...instance.completedSteps],
      timestamp: now
    };

    if (!this.checkpoints.has(instance.id)) {
      this.checkpoints.set(instance.id, []);
    }
    this.checkpoints.get(instance.id).push(snapshot);

    log.debug(`Saved checkpoint "${checkpointId}" for workflow instance "${instance.id}" (Step index: ${instance.currentStepIndex})`);
    return snapshot;
  }

  getLatestCheckpoint(instanceId) {
    const list = this.checkpoints.get(instanceId);
    if (!list || list.length === 0) return null;
    return list[list.length - 1];
  }
}

export const checkpointManager = new CheckpointManager();
