import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Governance:Storage');

export class GovernanceStorage {
  constructor(dbInstance) {
    this.db = dbInstance || null;
    this.initTables();
  }

  initTables() {
    if (!this.db) return;
    try {
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS governance_policies (
          id TEXT PRIMARY KEY,
          name TEXT,
          action TEXT,
          effect TEXT,
          priority INTEGER,
          policy_json TEXT
        );
      `);

      this.db.exec(`
        CREATE TABLE IF NOT EXISTS governance_audit_logs (
          audit_id TEXT PRIMARY KEY,
          category TEXT,
          action TEXT,
          requester TEXT,
          decision TEXT,
          timestamp TEXT
        );
      `);

      log.info('GovernanceStorage SQLite tables initialized.');
    } catch (err) {
      log.error(`Failed to initialize governance tables: ${err.message}`);
    }
  }

  saveAudit(entry) {
    if (!this.db || !entry) return;
    try {
      const stmt = this.db.prepare(`
        INSERT INTO governance_audit_logs (audit_id, category, action, requester, decision, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      stmt.run(entry.auditId, entry.category, entry.action, entry.requester, entry.decision, entry.timestamp);
      log.debug(`Saved governance audit log "${entry.auditId}" to SQLite.`);
    } catch (err) {
      log.error(`Error saving audit log: ${err.message}`);
    }
  }
}
