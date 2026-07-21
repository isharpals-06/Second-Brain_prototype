import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('WorldModel:SnapshotManager');

export class SnapshotManager {
  constructor(dbInstance) {
    this.db = dbInstance || null;
    this.initDatabase();
  }

  initDatabase() {
    if (!this.db) return;
    try {
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS world_model_snapshots (
          id TEXT PRIMARY KEY,
          timestamp TEXT,
          snapshot_json TEXT
        );
      `);
      log.info('World Model snapshots SQLite table ready.');
    } catch (err) {
      log.error(`Failed to init snapshots table: ${err.message}`);
    }
  }

  saveSnapshot(snapshot) {
    if (!this.db || !snapshot) return;
    try {
      const stmt = this.db.prepare(`
        INSERT INTO world_model_snapshots (id, timestamp, snapshot_json)
        VALUES (?, ?, ?)
      `);
      stmt.run(snapshot.id, snapshot.timestamp, JSON.stringify(snapshot.state));
      log.debug(`Saved snapshot ${snapshot.id} to SQLite.`);
    } catch (err) {
      log.error(`Error saving snapshot: ${err.message}`);
    }
  }

  loadRecentSnapshots(limit = 10) {
    if (!this.db) return [];
    try {
      const stmt = this.db.prepare(`
        SELECT id, timestamp, snapshot_json FROM world_model_snapshots
        ORDER BY timestamp DESC LIMIT ?
      `);
      const rows = stmt.all(limit);
      return rows.map(r => ({
        id: r.id,
        timestamp: r.timestamp,
        state: JSON.parse(r.snapshot_json)
      }));
    } catch (err) {
      log.error(`Error loading snapshots: ${err.message}`);
      return [];
    }
  }
}
