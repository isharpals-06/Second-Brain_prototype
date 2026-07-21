import { permissionValidator } from './PermissionValidator.js';
import { conflictDetector } from './ConflictDetector.js';
import { resourceEstimator } from './ResourceEstimator.js';
import { riskAnalyzer } from './RiskAnalyzer.js';
import { outcomePredictor } from './OutcomePredictor.js';
import { planScorer } from './PlanScorer.js';
import { scenarioEngine } from './ScenarioEngine.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Simulation:Runtime');

export class SimulationRuntime {
  runSimulation(plan) {
    if (!plan || !plan.id) return null;

    const startTime = Date.now();
    log.info(`Running virtual simulation for plan "${plan.id}"...`);

    // 1. Permission Validation
    const permissions = permissionValidator.validatePermissions(plan.requiredTools || []);

    // 2. Conflict Detection
    const conflicts = conflictDetector.detectConflicts(plan);

    // 3. Resource Estimation
    const resources = resourceEstimator.estimateResources(plan);

    // 4. Risk Analysis
    const risk = riskAnalyzer.analyzeRisk(plan, permissions);

    // 5. Outcome Prediction
    const prediction = outcomePredictor.predictOutcome(plan, risk, conflicts);

    // 6. Plan Scoring
    const scoring = planScorer.scorePlan(plan, prediction, risk, permissions);

    // 7. Scenario Generation
    const scenarios = scenarioEngine.generateScenarios(plan);

    const simulationId = `sim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const report = {
      simulationId,
      timestamp: now,
      planId: plan.id,
      planTitle: plan.goalTitle || plan.id,
      scenarios,
      predictedOutcome: prediction.predictedOutcome,
      successProbability: prediction.successProbability,
      confidence: prediction.confidenceScore,
      risks: risk,
      permissions,
      conflicts,
      resources,
      finalScore: scoring.finalScore,
      approvalStatus: scoring.approvalStatus,
      scoreTrace: scoring.scoreTrace,
      explanation: `Plan evaluated with score ${scoring.finalScore}/100. Approval Status: ${scoring.approvalStatus}. Predicted success rate: ${(prediction.successProbability * 100).toFixed(0)}%.`,
      latencyMs: Date.now() - startTime
    };

    log.info(`Completed virtual simulation "${simulationId}" in ${report.latencyMs}ms. Status: ${report.approvalStatus}`);
    return report;
  }
}

export const simulationRuntime = new SimulationRuntime();
