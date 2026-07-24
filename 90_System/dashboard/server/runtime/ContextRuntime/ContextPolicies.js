import { ContextPolicyEnum } from './ContextTypes.js';

export class ContextPolicies {
  constructor() {
    this.activePolicy = ContextPolicyEnum.BALANCED;
  }

  getPolicy() {
    return this.activePolicy;
  }

  setPolicy(policyName) {
    if (Object.values(ContextPolicyEnum).includes(policyName)) {
      this.activePolicy = policyName;
      return true;
    }
    return false;
  }

  applyPolicy(blocks = []) {
    if (this.activePolicy === ContextPolicyEnum.MINIMAL) {
      return blocks.filter(b => (b.priority || 5) <= 1);
    }
    if (this.activePolicy === ContextPolicyEnum.MAXIMUM) {
      return blocks;
    }
    // BALANCED default
    return blocks.filter(b => (b.priority || 5) <= 3);
  }
}

export const contextPolicies = new ContextPolicies();
