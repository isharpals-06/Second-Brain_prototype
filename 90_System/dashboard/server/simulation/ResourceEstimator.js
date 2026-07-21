import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Simulation:ResourceEstimator');

export class ResourceEstimator {
  estimateResources(plan) {
    const taskCount = plan?.tasks?.length || 1;

    const estimated = {
      cpuUsagePercent: Math.min(100, 15 * taskCount),
      ramUsageMb: 128 * taskCount,
      diskUsageMb: 10 * taskCount,
      estimatedDurationSec: 5 * taskCount,
      estimatedApiCostUsd: 0.002 * taskCount
    };

    log.debug(`Estimated resources: CPU ${estimated.cpuUsagePercent}%, RAM ${estimated.ramUsageMb}MB, Duration ${estimated.estimatedDurationSec}s`);
    return estimated;
  }
}

export const resourceEstimator = new ResourceEstimator();
