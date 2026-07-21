import { RiskLevel } from './types.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Simulation:RiskAnalyzer');

export class RiskAnalyzer {
  analyzeRisk(plan, permissionsResult) {
    let riskLevel = RiskLevel.LOW;
    const riskFactors = [];

    if (!permissionsResult.isPermitted) {
      riskLevel = RiskLevel.HIGH;
      riskFactors.push('Requires ungranted or restricted permissions');
    }

    if (plan.requiredTools && plan.requiredTools.includes('delete_file')) {
      riskLevel = RiskLevel.MEDIUM;
      riskFactors.push('Contains file deletion tasks (data loss risk)');
    }

    if (riskFactors.length === 0) {
      riskFactors.push('Standard low-risk virtual plan execution');
      riskLevel = RiskLevel.NEGLIGIBLE;
    }

    log.debug(`Risk analysis completed. Assigned risk level: "${riskLevel}"`);
    return {
      riskLevel,
      riskFactors
    };
  }
}

export const riskAnalyzer = new RiskAnalyzer();
