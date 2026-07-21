import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Automation:Storage');

export class AutomationStorage {
  constructor(dbInstance) {
    this.db = dbInstance || null;
    this.initTables();
  }

  initTables() {
    if (!this.db) return;
    try {
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS automation_definitions (
          id TEXT PRIMARY KEY,
          name TEXT,
          workflow_id TEXT,
          status TEXT,
          auto_json TEXT
        );
      `);

      this.db.exec(`
        CREATE TABLE IF NOT EXISTS automation_history (
          exec_id TEXT PRIMARY KEY,
          automation_id TEXT,
          status TEXT,
          duration_ms INTEGER,
          timestamp TEXT
        );
      `);

      log.info('AutomationStorage SQLite tables initialized.');
    } catch (err) {
      log.error(`Failed to initialize automation tables: ${err.message}`);
    }
  }

  saveExecution(autoId, status, durationMs) {
    if (!this.db) return;
    try {
      const execId = `auto_exec_${Date.now()}`;
      const stmt = this.db.prepare(`
        INSERT INTO automation_history (exec_id, automation_id, status, duration_ms, timestamp)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(execId, autoId, status, durationMs, new Date().toISOString());
      log.debug(`Saved automation execution "${execId}" to SQLite.`);
    } catch (err) {
      log.error(`Error saving automation execution: ${err.message}`);
    }
  }
}
