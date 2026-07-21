import { policyEngine } from './PolicyEngine.js';
import { trustEngine } from './TrustEngine.js';
import { identityManager } from './IdentityManager.js';
import { secretManager } from './SecretManager.js';
import { auditEngine } from './AuditEngine.js';
import { securityMonitor } from './SecurityMonitor.js';
import { complianceEngine } from './ComplianceEngine.js';
import { PolicyEffect, AlertSeverity } from './types.js';

class GovernanceAPI {
  listPolicies() {
    return policyEngine.listPolicies();
  }

  evaluate({ action, requester = 'agent', context = {} }) {
    const evaluation = policyEngine.evaluateRequest({ action, requester, context });

    // Record Audit Entry
    auditEngine.recordAudit({
      category: 'permission',
      action,
      requester,
      decision: evaluation.effect,
      details: { policyId: evaluation.policyId, reason: evaluation.reason }
    });

    // Update Trust Score & Generate Alert on Denial
    if (evaluation.effect === PolicyEffect.DENY) {
      trustEngine.recordOutcome(requester, false);
      securityMonitor.recordAlert({
        title: `Policy Violation: Action "${action}" Denied`,
        severity: AlertSeverity.MEDIUM,
        source: requester,
        description: `Requester "${requester}" attempted unauthorized action "${action}".`
      });
    } else {
      trustEngine.recordOutcome(requester, true);
    }

    return evaluation;
  }

  listTrustScores() {
    return trustEngine.listScores();
  }

  listAuditLogs() {
    return auditEngine.listAuditLogs();
  }

  listAlerts() {
    return securityMonitor.listAlerts();
  }

  listIdentities() {
    return identityManager.listIdentities();
  }

  listSecrets() {
    return secretManager.listSecretsMetadata();
  }

  getCompliance() {
    return complianceEngine.getComplianceStatus();
  }

  getMetrics() {
    const audits = auditEngine.listAuditLogs();
    const denied = audits.filter(a => a.decision === PolicyEffect.DENY).length;
    const scores = trustEngine.listScores();
    const avgTrust = scores.length > 0 ? scores.reduce((sum, s) => sum + s.trustScore, 0) / scores.length : 1.0;

    return {
      totalPolicies: policyEngine.listPolicies().length,
      totalAuditLogs: audits.length,
      deniedActionsCount: denied,
      totalSecurityAlerts: securityMonitor.listAlerts().length,
      avgSystemTrustScore: Math.round(avgTrust * 100) / 100
    };
  }
}

export const governanceAPI = new GovernanceAPI();
export { GovernanceAPI };
