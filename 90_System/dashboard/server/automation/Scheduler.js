import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Automation:Scheduler');

export class AutomationScheduler {
  constructor() {
    this.scheduledJobs = new Map();
  }

  scheduleJob(automationId, cronExpression) {
    this.scheduledJobs.set(automationId, {
      cronExpression,
      status: 'scheduled',
      nextRun: new Date(Date.now() + 3600000).toISOString() // Scheduled 1hr from now
    });
    log.info(`Scheduled job for automation "${automationId}" with cron "${cronExpression}"`);
  }

  listScheduledJobs() {
    return Array.from(this.scheduledJobs.entries()).map(([id, job]) => ({
      automationId: id,
      ...job
    }));
  }
}

export const automationScheduler = new AutomationScheduler();
