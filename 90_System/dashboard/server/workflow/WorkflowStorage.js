import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Workflow:Storage');

export class WorkflowStorage {
  constructor(dbInstance) {
    this.db = dbInstance || null;
    this.initTables();
  }

  initTables() {
    if (!this.db) return;
    try {
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS workflow_instances (
          id TEXT PRIMARY KEY,
          workflow_id TEXT,
          name TEXT,
          state TEXT,
          instance_json TEXT,
          updated_at TEXT
        );
      `);

      this.db.exec(`
        CREATE TABLE IF NOT EXISTS workflow_checkpoints (
          id TEXT PRIMARY KEY,
          instance_id TEXT,
          step_index INTEGER,
          checkpoint_json TEXT,
          timestamp TEXT
        );
      `);

      log.info('WorkflowStorage SQLite tables initialized.');
    } catch (err) {
      log.error(`Failed to initialize workflow tables: ${err.message}`);
    }
  }

  saveInstance(instance) {
    if (!this.db || !instance) return;
    try {
      const stmt = this.db.prepare(`
        INSERT INTO workflow_instances (id, workflow_id, name, state, instance_json, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET state=excluded.state, instance_json=excluded.instance_json, updated_at=excluded.updated_at
      `);
      stmt.run(instance.id, instance.workflowId, instance.name, instance.state, JSON.stringify(instance), instance.updatedAt);
      log.debug(`Saved workflow instance "${instance.id}" to SQLite.`);
    } catch (err) {
      log.error(`Error saving workflow instance: ${err.message}`);
    }
  }
}
