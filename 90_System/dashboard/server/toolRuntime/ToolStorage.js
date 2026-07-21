import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('ToolRuntime:Storage');

export class ToolStorage {
  constructor(dbInstance) {
    this.db = dbInstance || null;
    this.logs = [];
    this.initTable();
  }

  initTable() {
    if (!this.db) return;
    try {
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS tool_execution_logs (
          execution_id TEXT PRIMARY KEY,
          tool_id TEXT,
          status TEXT,
          duration_ms INTEGER,
          log_json TEXT,
          timestamp TEXT
        );
      `);
      log.info('ToolStorage SQLite table initialized.');
    } catch (err) {
      log.error(`Failed to initialize tool execution table: ${err.message}`);
    }
  }

  saveExecution(result) {
    if (!result || !result.executionId) return;

    this.logs.push(result);

    if (this.db) {
      try {
        const stmt = this.db.prepare(`
          INSERT INTO tool_execution_logs (execution_id, tool_id, status, duration_ms, log_json, timestamp)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        stmt.run(result.executionId, result.toolId, result.status, result.durationMs, JSON.stringify(result), result.timestamp);
        log.debug(`Saved tool execution log "${result.executionId}" to SQLite.`);
      } catch (err) {
        log.error(`Error saving tool execution log: ${err.message}`);
      }
    }
  }

  getLogs() {
    return this.logs;
  }
}
