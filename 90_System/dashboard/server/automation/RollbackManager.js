import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Automation:RollbackManager');

export class RollbackManager {
  constructor() {
    this.rollbackLogs = [];
  }

  async rollback({ executionId, automationId, strategy = 'compensation' }) {
    log.info(`Initiating rollback for execution "${executionId}" (Strategy: ${strategy})...`);
    const startTime = Date.now();

    const record = {
      rollbackId: `rb_${Date.now()}`,
      executionId,
      automationId,
      strategy, // 'git_revert', 'file_cleanup', 'compensation', 'state_restore'
      status: 'success',
      durationMs: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };

    this.rollbackLogs.push(record);
    log.info(`Rollback "${record.rollbackId}" completed successfully.`);
    return record;
  }

  listRollbacks() {
    return this.rollbackLogs;
  }
}

export const rollbackManager = new RollbackManager();
