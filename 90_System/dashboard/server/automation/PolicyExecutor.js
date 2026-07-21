import { governanceAPI } from '../governance/GovernanceAPI.js';
import { simulationAPI } from '../simulation/SimulationAPI.js';
import { PolicyEffect } from '../governance/types.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Automation:PolicyExecutor');

export class PolicyExecutor {
  async verifyAndPrepare(automation) {
    log.info(`Verifying policy & running virtual simulation for automation "${automation.name}"...`);

    // 1. Evaluate Governance Policy
    const pol = governanceAPI.evaluate({
      action: automation.workflowId || 'automation_execution',
      requester: `automation_${automation.id}`
    });

    if (pol.effect === PolicyEffect.DENY) {
      log.error(`Automation "${automation.name}" BLOCKED by Governance Policy (${pol.reason})`);
      return { isAllowed: false, reason: `Governance Policy Deny: ${pol.reason}` };
    }

    // 2. Run Decision Simulation Check
    const sim = simulationAPI.runSimulation({
      id: `sim_auto_${automation.id}`,
      steps: [{ title: automation.name, risk: 'low' }]
    });

    if (sim.status !== 'Approved') {
      log.error(`Automation "${automation.name}" BLOCKED by Simulation Risk Check`);
      return { isAllowed: false, reason: 'Decision Simulation Risk Verification Failed' };
    }

    log.info(`Automation "${automation.name}" passed governance policy & virtual simulation.`);
    return { isAllowed: true, simulationReportId: sim.reportId };
  }
}

export const policyExecutor = new PolicyExecutor();
