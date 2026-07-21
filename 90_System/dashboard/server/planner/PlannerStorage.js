import { goalEngine } from './GoalEngine.js';
import { planningEngine } from './PlanningEngine.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Planner:PlannerStorage');

export class PlannerStorage {
  constructor(dbInstance) {
    this.db = dbInstance || null;
    this.initTables();
  }

  initTables() {
    if (!this.db) return;
    try {
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS planner_goals (
          id TEXT PRIMARY KEY,
          title TEXT,
          description TEXT,
          priority TEXT,
          status TEXT,
          goal_json TEXT,
          created_at TEXT,
          updated_at TEXT
        );
      `);

      this.db.exec(`
        CREATE TABLE IF NOT EXISTS planner_plans (
          id TEXT PRIMARY KEY,
          goal_id TEXT,
          priority TEXT,
          validation_status TEXT,
          plan_json TEXT,
          timestamp TEXT
        );
      `);

      log.info('PlannerStorage SQLite tables initialized.');
    } catch (err) {
      log.error(`Failed to initialize planner tables: ${err.message}`);
    }
  }

  persistAll() {
    if (!this.db) return;
    try {
      const stmtGoal = this.db.prepare(`
        INSERT INTO planner_goals (id, title, description, priority, status, goal_json, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          title=excluded.title,
          priority=excluded.priority,
          status=excluded.status,
          goal_json=excluded.goal_json,
          updated_at=excluded.updated_at
      `);

      for (const g of goalEngine.listGoals()) {
        stmtGoal.run(g.id, g.title, g.description, g.priority, g.status, JSON.stringify(g), g.createdAt, g.updatedAt);
      }

      const stmtPlan = this.db.prepare(`
        INSERT INTO planner_plans (id, goal_id, priority, validation_status, plan_json, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET validation_status=excluded.validation_status
      `);

      for (const p of planningEngine.listPlans()) {
        stmtPlan.run(p.id, p.goalId, p.priority, p.validationStatus, JSON.stringify(p), p.timestamp);
      }

      log.debug('Planner goals & plans persisted to SQLite.');
    } catch (err) {
      log.error(`Error persisting PlannerStorage: ${err.message}`);
    }
  }

  loadFromDatabase() {
    if (!this.db) return;
    try {
      const goals = this.db.prepare(`SELECT goal_json FROM planner_goals`).all();
      goals.forEach(r => {
        const obj = JSON.parse(r.goal_json);
        goalEngine.createGoal(obj);
      });
      log.info(`Loaded ${goals.length} goals from SQLite.`);
    } catch (err) {
      log.warn(`Could not load planner records: ${err.message}`);
    }
  }
}
