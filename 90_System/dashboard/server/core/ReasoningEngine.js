import { serverEventBus, SystemEvents, EventSeverity } from './eventBus.js';
import { aegisLogger } from './logger.js';

const log = aegisLogger.child('Core:ReasoningEngine');

export class ReasoningEngine {
  constructor(dbInstance) {
    this.db = dbInstance || null;
    this.history = [];
    this.initTables();
  }

  setDatabase(dbInstance) {
    this.db = dbInstance;
    this.initTables();
  }

  initTables() {
    if (!this.db) return;
    try {
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS reasoning_sessions (
          id TEXT PRIMARY KEY,
          goal TEXT NOT NULL,
          context_json TEXT,
          memories_json TEXT,
          knowledge_json TEXT,
          steps_json TEXT,
          decision TEXT,
          confidence REAL,
          summary TEXT,
          created_at TEXT NOT NULL
        );
      `);
      log.info('ReasoningEngine SQLite tables initialized.');
    } catch (err) {
      log.error(`Failed to initialize reasoning tables: ${err.message}`);
    }
  }

  async startReasoningSession(goal, inputContext = {}) {
    const id = `rs_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const now = new Date().toISOString();

    const session = {
      id,
      goal,
      context: inputContext,
      retrievedMemories: [],
      knowledgeReferences: [],
      intermediateSteps: [
        { step: 1, action: 'Goal Analysis', thoughts: `Analyzing goal: "${goal}"`, timestamp: now }
      ],
      decision: null,
      confidence: 0.0,
      summary: null,
      createdAt: now
    };

    this.history.push(session);
    if (this.history.length > 50) this.history.shift();

    log.info(`[ReasoningSession] Started session "${id}" for goal: "${goal}"`);

    serverEventBus.publish({
      type: 'ReasoningCreated',
      source: 'ReasoningEngine',
      severity: EventSeverity.INFO,
      payload: { id, goal }
    });

    return session;
  }

  addStep(sessionId, action, thoughts) {
    const session = this.history.find(s => s.id === sessionId);
    if (!session) return;
    const stepNum = session.intermediateSteps.length + 1;
    session.intermediateSteps.push({
      step: stepNum,
      action,
      thoughts,
      timestamp: new Date().toISOString()
    });
    log.debug(`[ReasoningSession] Session "${sessionId}" Step ${stepNum}: ${action}`);
  }

  completeReasoningSession(sessionId, decisionData = {}) {
    const session = this.history.find(s => s.id === sessionId);
    if (!session) return null;

    session.decision = decisionData.decision || 'PROCEED';
    session.confidence = decisionData.confidence !== undefined ? decisionData.confidence : 0.9;
    session.summary = decisionData.summary || `Reasoning complete for "${session.goal}". Action: ${session.decision}`;
    session.retrievedMemories = decisionData.memories || session.retrievedMemories;
    session.knowledgeReferences = decisionData.knowledge || session.knowledgeReferences;

    // Persist session into SQLite
    if (this.db) {
      try {
        const stmt = this.db.prepare(`
          INSERT INTO reasoning_sessions (id, goal, context_json, memories_json, knowledge_json, steps_json, decision, confidence, summary, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET decision=excluded.decision, confidence=excluded.confidence, summary=excluded.summary, steps_json=excluded.steps_json
        `);
        stmt.run(
          session.id,
          session.goal,
          JSON.stringify(session.context),
          JSON.stringify(session.retrievedMemories),
          JSON.stringify(session.knowledgeReferences),
          JSON.stringify(session.intermediateSteps),
          session.decision,
          session.confidence,
          session.summary,
          session.createdAt
        );
      } catch (err) {
        log.error(`Failed to persist reasoning session: ${err.message}`);
      }
    }

    serverEventBus.publish({
      type: 'ReasoningCompleted',
      source: 'ReasoningEngine',
      severity: EventSeverity.INFO,
      payload: { id: session.id, goal: session.goal, decision: session.decision, confidence: session.confidence }
    });

    log.info(`[ReasoningSession] Completed session "${sessionId}" with decision "${session.decision}" (${(session.confidence * 100).toFixed(0)}% confidence).`);
    return session;
  }

  getRecentSessions(limit = 10) {
    if (this.db) {
      try {
        const stmt = this.db.prepare('SELECT * FROM reasoning_sessions ORDER BY created_at DESC LIMIT ?');
        return stmt.all(limit).map(r => ({
          ...r,
          context: r.context_json ? JSON.parse(r.context_json) : {},
          retrievedMemories: r.memories_json ? JSON.parse(r.memories_json) : [],
          knowledgeReferences: r.knowledge_json ? JSON.parse(r.knowledge_json) : [],
          intermediateSteps: r.steps_json ? JSON.parse(r.steps_json) : []
        }));
      } catch (_) {}
    }
    return this.history.slice(-limit).reverse();
  }
}

export const reasoningEngine = new ReasoningEngine();
