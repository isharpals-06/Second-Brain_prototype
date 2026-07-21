import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Memory:Storage');

export class MemoryStorage {
  constructor(dbInstance) {
    this.db = dbInstance || null;
    this.initTables();
  }

  initTables() {
    if (!this.db) return;
    try {
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS memory_objects (
          id TEXT PRIMARY KEY,
          type TEXT,
          title TEXT,
          summary TEXT,
          importance REAL,
          confidence REAL,
          score REAL,
          memory_json TEXT,
          timestamp TEXT
        );
      `);

      this.db.exec(`
        CREATE TABLE IF NOT EXISTS experience_records (
          exp_id TEXT PRIMARY KEY,
          category TEXT,
          title TEXT,
          outcome TEXT,
          experience_json TEXT,
          timestamp TEXT
        );
      `);

      log.info('MemoryStorage SQLite tables initialized.');
    } catch (err) {
      log.error(`Failed to initialize memory tables: ${err.message}`);
    }
  }

  saveMemory(memory) {
    if (!this.db || !memory) return;
    try {
      const stmt = this.db.prepare(`
        INSERT INTO memory_objects (id, type, title, summary, importance, confidence, score, memory_json, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET summary=excluded.summary, score=excluded.score, memory_json=excluded.memory_json
      `);
      stmt.run(memory.id, memory.type, memory.title, memory.summary, memory.importance, memory.confidence, memory.score, JSON.stringify(memory), memory.timestamp);
      log.debug(`Saved memory "${memory.id}" to SQLite.`);
    } catch (err) {
      log.error(`Error saving memory object: ${err.message}`);
    }
  }
}
