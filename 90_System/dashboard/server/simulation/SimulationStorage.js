import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Simulation:Storage');

export class SimulationStorage {
  constructor(dbInstance) {
    this.db = dbInstance || null;
    this.reports = new Map();
    this.initTable();
  }

  initTable() {
    if (!this.db) return;
    try {
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS simulation_reports (
          simulation_id TEXT PRIMARY KEY,
          plan_id TEXT,
          approval_status TEXT,
          final_score INTEGER,
          report_json TEXT,
          timestamp TEXT
        );
      `);
      log.info('SimulationStorage SQLite table initialized.');
    } catch (err) {
      log.error(`Failed to initialize simulation table: ${err.message}`);
    }
  }

  saveReport(report) {
    if (!report || !report.simulationId) return;

    this.reports.set(report.simulationId, report);

    if (this.db) {
      try {
        const stmt = this.db.prepare(`
          INSERT INTO simulation_reports (simulation_id, plan_id, approval_status, final_score, report_json, timestamp)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(simulation_id) DO UPDATE SET approval_status=excluded.approval_status
        `);
        stmt.run(report.simulationId, report.planId, report.approvalStatus, report.finalScore, JSON.stringify(report), report.timestamp);
        log.debug(`Saved simulation report "${report.simulationId}" to SQLite.`);
      } catch (err) {
        log.error(`Error saving simulation report: ${err.message}`);
      }
    }
  }

  listReports() {
    return Array.from(this.reports.values());
  }

  getReport(simulationId) {
    return this.reports.get(simulationId) || null;
  }
}
