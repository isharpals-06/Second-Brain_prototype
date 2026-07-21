import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Automation:AnalyticsEngine');

export class AnalyticsEngine {
  constructor() {
    this.history = [];
  }

  recordExecution({ automationId, status, durationMs, error = null }) {
    this.history.push({
      automationId,
      status,
      durationMs,
      error,
      timestamp: new Date().toISOString()
    });
    log.debug(`Recorded execution analytics for "${automationId}" (${status})`);
  }

  getAnalytics() {
    const total = this.history.length;
    const completed = this.history.filter(h => h.status === 'completed').length;
    const failed = this.history.filter(h => h.status === 'failed').length;

    return {
      totalExecutions: total,
      completedCount: completed,
      failedCount: failed,
      successRatePercent: total > 0 ? Math.round((completed / total) * 100) : 100,
      estimatedTimeSavedHours: Math.round(total * 0.25 * 10) / 10
    };
  }
}

export const analyticsEngine = new AnalyticsEngine();
