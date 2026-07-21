import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Governance:AuditEngine');

export class AuditEngine {
  constructor() {
    this.auditLogs = [];
  }

  recordAudit({ category, action, requester, decision, details = {} }) {
    const auditId = `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const entry = {
      auditId,
      category, // 'permission', 'tool', 'workflow', 'plan', 'secret'
      action,
      requester,
      decision,
      details,
      timestamp: new Date().toISOString()
    };

    this.auditLogs.push(entry);
    log.info(`Audit Entry Recorded [${category}] ${action} by ${requester} -> ${decision} (${auditId})`);
    return entry;
  }

  listAuditLogs() {
    return this.auditLogs;
  }
}

export const auditEngine = new AuditEngine();
