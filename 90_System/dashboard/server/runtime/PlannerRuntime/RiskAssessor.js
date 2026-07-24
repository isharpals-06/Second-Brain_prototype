export class RiskAssessor {
  assess(mission, taskGraph) {
    const flags = [];
    let riskLevel = 'LOW';

    if (mission.category === 'Coding' || mission.category === 'Automation') {
      flags.push('File write operations require permission scope checks');
      riskLevel = 'MEDIUM';
    }

    if (taskGraph.nodeCount > 10) {
      flags.push('High step count may increase execution latency');
      riskLevel = 'MEDIUM';
    }

    return {
      riskLevel,
      safetyFlags: flags,
      requiresApproval: riskLevel === 'HIGH',
      assessedAt: new Date().toISOString(),
    };
  }
}

export const riskAssessor = new RiskAssessor();
