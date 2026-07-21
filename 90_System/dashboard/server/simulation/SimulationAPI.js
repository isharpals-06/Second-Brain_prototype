import { simulationRuntime } from './SimulationRuntime.js';

class SimulationAPI {
  constructor() {
    this.storage = null;
  }

  setStorage(storageInstance) {
    this.storage = storageInstance;
  }

  simulatePlan(plan) {
    const report = simulationRuntime.runSimulation(plan);
    if (report && this.storage) {
      this.storage.saveReport(report);
    }
    return report;
  }

  listReports() {
    return this.storage ? this.storage.listReports() : [];
  }

  getReport(simulationId) {
    return this.storage ? this.storage.getReport(simulationId) : null;
  }

  getMetrics() {
    const reports = this.listReports();
    const approved = reports.filter(r => r.approvalStatus === 'Approved').length;
    const rejected = reports.filter(r => r.approvalStatus === 'Rejected').length;
    const totalLatency = reports.reduce((sum, r) => sum + (r.latencyMs || 0), 0);

    return {
      simulationsExecuted: reports.length,
      approvedPlans: approved,
      rejectedPlans: rejected,
      avgLatencyMs: reports.length > 0 ? Math.round(totalLatency / reports.length) : 0
    };
  }
}

export const simulationAPI = new SimulationAPI();
export { SimulationAPI };
