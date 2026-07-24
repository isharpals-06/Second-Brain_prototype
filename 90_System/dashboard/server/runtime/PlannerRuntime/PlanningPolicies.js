export class PlanningPolicies {
  constructor() {
    this.policies = {
      preferParallelExecution: true,
      minimizeContextSwitching: true,
      minimizeCost: false,
      preferLocalProviders: true,
      requireApprovalForDestructiveActions: true,
    };
  }

  getPolicies() {
    return { ...this.policies };
  }

  setPolicy(policyName, value) {
    if (this.policies.hasOwnProperty(policyName)) {
      this.policies[policyName] = Boolean(value);
      return true;
    }
    return false;
  }
}

export const planningPolicies = new PlanningPolicies();
