import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Workflow:RetryManager');

export class RetryManager {
  constructor() {
    this.maxRetries = 3;
  }

  shouldRetry(step, currentRetryCount) {
    const limit = step.retryPolicy?.maxRetries || this.maxRetries;
    const canRetry = currentRetryCount < limit;
    log.debug(`Retry evaluation for step "${step.id}": Attempt ${currentRetryCount}/${limit} -> ${canRetry ? 'RETRY' : 'ABORT'}`);
    return canRetry;
  }

  getBackoffMs(retryAttempt) {
    return Math.pow(2, retryAttempt) * 1000; // Exponential backoff: 2s, 4s, 8s
  }
}

export const retryManager = new RetryManager();
