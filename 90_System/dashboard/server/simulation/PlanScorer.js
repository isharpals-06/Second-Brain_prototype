import { ApprovalStatus } from './types.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Simulation:PlanScorer');

export class PlanScorer {
  scorePlan(plan, prediction, riskAnalysis, permissionsResult) {
    let score = 90;
    const scoreTrace = [];

    score += Math.round((prediction.successProbability - 0.8) * 50);
    scoreTrace.push(`Success probability impact: ${(prediction.successProbability * 100).toFixed(0)}%`);

    if (riskAnalysis.riskLevel === 'High') {
      score -= 30;
      scoreTrace.push('High risk penalty (-30)');
    } else if (riskAnalysis.riskLevel === 'Critical') {
      score -= 50;
      scoreTrace.push('Critical risk penalty (-50)');
    }

    if (!permissionsResult.isPermitted) {
      score -= 25;
      scoreTrace.push('Unpermitted actions penalty (-25)');
    }

    const finalScore = Math.max(0, Math.min(100, score));

    let approvalStatus = ApprovalStatus.APPROVED;
    if (finalScore < 50) {
      approvalStatus = ApprovalStatus.REJECTED;
    } else if (finalScore < 75) {
      approvalStatus = ApprovalStatus.CONDITIONAL_APPROVAL;
    }

    log.debug(`Plan scored: ${finalScore}/100 -> Status: "${approvalStatus}"`);
    return {
      finalScore,
      approvalStatus,
      scoreTrace
    };
  }
}

export const planScorer = new PlanScorer();
