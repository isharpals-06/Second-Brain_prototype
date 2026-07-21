import { PolicyEffect } from './types.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Governance:PolicyEngine');

export class PolicyEngine {
  constructor() {
    this.policies = new Map();
    this.initDefaultPolicies();
  }

  initDefaultPolicies() {
    const defaults = [
      { id: 'pol_git_read', name: 'Allow Git Status Query', action: 'tool_git_status', effect: PolicyEffect.ALLOW, priority: 10 },
      { id: 'pol_file_read', name: 'Allow Vault File Read', action: 'tool_file_read', effect: PolicyEffect.ALLOW, priority: 10 },
      { id: 'pol_file_delete', name: 'Deny Direct File Deletion', action: 'tool_file_delete', effect: PolicyEffect.DENY, priority: 100 },
      { id: 'pol_file_write', name: 'Ask Approval on Write', action: 'tool_file_write', effect: PolicyEffect.ASK_USER, priority: 50 }
    ];

    defaults.forEach(p => this.policies.set(p.id, p));
    log.info(`Initialized PolicyEngine with ${this.policies.size} default declarative policies.`);
  }

  evaluateRequest({ action, requester = 'agent', context = {} }) {
    log.debug(`Evaluating policy for action "${action}" requested by "${requester}"...`);

    const matching = Array.from(this.policies.values())
      .filter(p => p.action === action || p.action === '*')
      .sort((a, b) => b.priority - a.priority);

    if (matching.length > 0) {
      const topPolicy = matching[0];
      log.info(`Policy match for "${action}": ${topPolicy.effect.toUpperCase()} (Policy: ${topPolicy.id})`);
      return { effect: topPolicy.effect, policyId: topPolicy.id, reason: topPolicy.name };
    }

    // Default Fallback
    return { effect: PolicyEffect.ALLOW, policyId: 'pol_default', reason: 'Default allow policy' };
  }

  listPolicies() {
    return Array.from(this.policies.values());
  }
}

export const policyEngine = new PolicyEngine();
