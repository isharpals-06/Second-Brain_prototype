import { agentRegistry } from './AgentRegistry.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('AgentRuntime:Storage');

export class AgentStorage {
  constructor(dbInstance) {
    this.db = dbInstance || null;
    this.initTable();
  }

  initTable() {
    if (!this.db) return;
    try {
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS agent_runtime_states (
          id TEXT PRIMARY KEY,
          name TEXT,
          status TEXT,
          health TEXT,
          state_json TEXT,
          updated_at TEXT
        );
      `);
      log.info('AgentStorage SQLite table initialized.');
    } catch (err) {
      log.error(`Failed to initialize agent_runtime_states table: ${err.message}`);
    }
  }

  persistAll() {
    if (!this.db) return;
    try {
      const stmt = this.db.prepare(`
        INSERT INTO agent_runtime_states (id, name, status, health, state_json, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          status=excluded.status,
          health=excluded.health,
          state_json=excluded.state_json,
          updated_at=excluded.updated_at
      `);

      for (const agent of agentRegistry.listAgents()) {
        stmt.run(agent.id, agent.name, agent.status(), agent.health(), JSON.stringify(agent.getMetrics()), new Date().toISOString());
      }
      log.debug('Agent states persisted to SQLite.');
    } catch (err) {
      log.error(`Error persisting AgentStorage: ${err.message}`);
    }
  }
}
