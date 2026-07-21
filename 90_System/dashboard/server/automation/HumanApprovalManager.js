import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Automation:HumanApprovalManager');

export class HumanApprovalManager {
  constructor() {
    this.emergencyStopActive = false;
    this.approvalQueue = new Map();
  }

  setEmergencyStop(active = true) {
    this.emergencyStopActive = active;
    log.warn(`Emergency Stop ${active ? 'ACTIVATED' : 'DEACTIVATED'}!`);
  }

  isEmergencyStopActive() {
    return this.emergencyStopActive;
  }

  requestApproval({ automationId, name, actionSummary }) {
    if (this.emergencyStopActive) {
      log.error(`Approval rejected for "${name}": Emergency Stop is ACTIVE!`);
      return { status: 'rejected', reason: 'Emergency Stop Active' };
    }

    const id = `auto_appr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const record = { id, automationId, name, actionSummary, status: 'pending', requestedAt: new Date().toISOString() };
    this.approvalQueue.set(id, record);

    log.info(`Enqueued automation approval "${id}" for "${name}" (${actionSummary})`);
    return record;
  }

  listPending() {
    return Array.from(this.approvalQueue.values()).filter(a => a.status === 'pending');
  }
}

export const humanApprovalManager = new HumanApprovalManager();
