import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Simulation:OutcomePredictor');

export class OutcomePredictor {
  predictOutcome(plan, riskAnalysis, conflicts) {
    let successProbability = 0.95;
    const likelyBlockers = [];

    if (riskAnalysis.riskLevel === 'High' || riskAnalysis.riskLevel === 'Critical') {
      successProbability -= 0.30;
      likelyBlockers.push('High risk level / ungranted permissions');
    }

    if (conflicts.length > 0) {
      successProbability -= 0.20;
      likelyBlockers.push(...conflicts);
    }

    successProbability = Math.max(0.1, Math.min(1.0, successProbability));

    const prediction = {
      predictedOutcome: successProbability > 0.7 ? 'Successful Virtual Execution' : 'Likely Virtual Failure',
      successProbability: parseFloat(successProbability.toFixed(2)),
      confidenceScore: 0.90,
      likelyBlockers: likelyBlockers.length > 0 ? likelyBlockers : ['None detected']
    };

    log.debug(`Outcome predicted: "${prediction.predictedOutcome}" (Probability: ${prediction.successProbability})`);
    return prediction;
  }
}

export const outcomePredictor = new OutcomePredictor();
