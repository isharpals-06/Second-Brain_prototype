import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Knowledge:ProjectUserIntelligence');

export class ProjectUserIntelligence {
  constructor(dbInstance) {
    this.db = dbInstance || null;
    this.userModel = {
      primaryObjectives: ['Evolve AEGISOS Cognitive Operating System', 'Build aerospace telemetry UI'],
      activeProjects: ['AEGISOS', 'SecondBrain'],
      preferredTools: ['Vite', 'React', 'Node.js', 'SQLite', 'Gemini'],
      workingHabits: 'Prefers concise monospaced telemetry, zero conversational filler, 0px sharp UI',
      codingStack: 'JavaScript (ESM), React 18, Express, CSS Custom Tokens',
    };
    this.initDatabase();
  }

  setDatabase(dbInstance) {
    this.db = dbInstance;
    this.initDatabase();
    this.loadUserModel();
  }

  initDatabase() {
    if (!this.db) return;
    try {
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS user_model_preferences (
          key TEXT PRIMARY KEY,
          value_json TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);
    } catch (err) {
      log.error(`Failed to initialize user_model tables: ${err.message}`);
    }
  }

  loadUserModel() {
    if (!this.db) return;
    try {
      const rows = this.db.prepare('SELECT * FROM user_model_preferences').all();
      for (const row of rows) {
        this.userModel[row.key] = JSON.parse(row.value_json);
      }
      log.info('User Model loaded from SQLite database.');
    } catch (err) {
      log.error(`Failed to load User Model: ${err.message}`);
    }
  }

  getUserModel() {
    return { ...this.userModel };
  }

  updateUserModel(key, value) {
    this.userModel[key] = value;
    const now = new Date().toISOString();

    if (this.db) {
      try {
        const stmt = this.db.prepare(`
          INSERT INTO user_model_preferences (key, value_json, updated_at)
          VALUES (?, ?, ?)
          ON CONFLICT(key) DO UPDATE SET value_json=excluded.value_json, updated_at=excluded.updated_at
        `);
        stmt.run(key, JSON.stringify(value), now);
      } catch (err) {
        log.error(`Failed to persist User Model key "${key}": ${err.message}`);
      }
    }

    return this.userModel;
  }
}

export const projectUserIntelligence = new ProjectUserIntelligence();
