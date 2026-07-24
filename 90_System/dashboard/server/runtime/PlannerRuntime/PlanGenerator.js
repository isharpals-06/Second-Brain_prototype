import { PlanStateEnum } from './PlannerTypes.js';

export class PlanGenerator {
  generatePlan(mission, capabilities, cost, risk) {
    const planId = `plan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    const steps = (mission.taskGraph?.nodes || []).map((node, idx) => ({
      stepIndex: idx + 1,
      id: node.id,
      description: node.label,
      assignedAgent: idx === 0 ? 'ContextAgent' : idx === 1 ? 'ExecutionAgent' : 'ReviewerAgent',
      requiredCapability: node.type === 'ANALYSIS' ? 'reasoning' : 'text_generation',
      status: 'PENDING',
    }));

    const plan = {
      id: planId,
      missionId: mission.id,
      state: PlanStateEnum.RESOLVED,
      steps,
      stepCount: steps.length,
      capabilities,
      costEstimate: cost,
      riskAssessment: risk,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return Object.freeze(plan);
  }
}

export const planGenerator = new PlanGenerator();
