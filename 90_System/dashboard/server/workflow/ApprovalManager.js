import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Workflow:ApprovalManager');

export class ApprovalManager {
  constructor() {
    this.pendingApprovals = new Map();
  }

  requestApproval({ instanceId, stepId, actionName, description = '' }) {
    const approvalId = `appr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const record = {
      approvalId,
      instanceId,
      stepId,
      actionName,
      description,
      status: 'pending', // 'pending', 'approved', 'rejected'
      requestedAt: now
    };

    this.pendingApprovals.set(approvalId, record);
    log.info(`Approval requested for instance "${instanceId}" step "${stepId}": ${actionName} (${approvalId})`);
    return record;
  }

  approve(approvalId) {
    const record = this.pendingApprovals.get(approvalId);
    if (!record) return false;

    record.status = 'approved';
    record.approvedAt = new Date().toISOString();
    log.info(`Approved request "${approvalId}" for action: ${record.actionName}`);
    return true;
  }

  reject(approvalId, reason = '') {
    const record = this.pendingApprovals.get(approvalId);
    if (!record) return false;

    record.status = 'rejected';
    record.reason = reason;
    record.rejectedAt = new Date().toISOString();
    log.info(`Rejected request "${approvalId}" for action: ${record.actionName}`);
    return true;
  }

  listPending() {
    return Array.from(this.pendingApprovals.values()).filter(a => a.status === 'pending');
  }
}

export const approvalManager = new ApprovalManager();
