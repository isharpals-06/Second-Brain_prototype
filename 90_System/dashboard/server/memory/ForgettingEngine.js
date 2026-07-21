import { memoryStore } from './MemoryStore.js';
import { LifecycleStatus } from './types.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Memory:ForgettingEngine');

export class ForgettingEngine {
  constructor() {
    this.deletionAuditLogs = [];
  }

  forgetMemory(memoryId, reason = 'User requested deletion') {
    const memory = memoryStore.getMemory(memoryId);
    if (!memory) return false;

    memory.lifecycleStatus = LifecycleStatus.DELETED;
    const auditRecord = {
      auditId: `audit_${Date.now()}`,
      memoryId,
      title: memory.title,
      reason,
      timestamp: new Date().toISOString()
    };

    this.deletionAuditLogs.push(auditRecord);
    log.info(`Memory "${memoryId}" marked as DELETED. Audit logged (${auditRecord.auditId}).`);
    return true;
  }

  getAuditLogs() {
    return this.deletionAuditLogs;
  }
}

export const forgettingEngine = new ForgettingEngine();
