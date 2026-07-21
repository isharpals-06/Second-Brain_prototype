import { aegisLogger } from '../core/logger.js';
import { SessionType } from './types.js';

const log = aegisLogger.child('WorldModel:SessionEngine');

export class SessionEngine {
  constructor() {
    this.currentSession = this.createSession(SessionType.IDLE);
    this.sessionHistory = [];
    this.idleTimer = null;
    this.idleTimeoutMs = 5 * 60 * 1000; // 5 minutes idle
  }

  createSession(type = SessionType.IDLE, primaryProject = 'AEGISOS') {
    return {
      id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      startTime: new Date().toISOString(),
      endTime: null,
      durationMs: 0,
      primaryProject,
      resourcesUsed: new Set(),
      notesCreated: new Set(),
      documentsAccessed: new Set(),
      activeEventsCount: 0
    };
  }

  recordActivity(sessionTypeHint, resourcePath = null, projectName = 'AEGISOS') {
    this.resetIdleTimer();

    // Check if session type changed
    if (this.currentSession.type !== sessionTypeHint && sessionTypeHint !== SessionType.IDLE) {
      this.transitionSession(sessionTypeHint, projectName);
    }

    this.currentSession.activeEventsCount += 1;
    if (resourcePath) {
      this.currentSession.resourcesUsed.add(resourcePath);
      if (resourcePath.endsWith('.md')) {
        this.currentSession.notesCreated.add(resourcePath);
      } else if (resourcePath.endsWith('.pdf')) {
        this.currentSession.documentsAccessed.add(resourcePath);
      }
    }
  }

  transitionSession(newType, primaryProject) {
    const now = new Date();
    this.currentSession.endTime = now.toISOString();
    this.currentSession.durationMs = now.getTime() - new Date(this.currentSession.startTime).getTime();

    // Export completed session record
    const completedRecord = {
      ...this.currentSession,
      resourcesUsed: Array.from(this.currentSession.resourcesUsed),
      notesCreated: Array.from(this.currentSession.notesCreated),
      documentsAccessed: Array.from(this.currentSession.documentsAccessed)
    };

    this.sessionHistory.push(completedRecord);
    log.info(`Session transitioned: "${completedRecord.type}" -> "${newType}" (Duration: ${Math.round(completedRecord.durationMs / 1000)}s)`);

    // Start new session
    this.currentSession = this.createSession(newType, primaryProject);
  }

  resetIdleTimer() {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => {
      if (this.currentSession.type !== SessionType.IDLE) {
        log.info('No activity detected for 5 minutes. Transitioning to Idle Session.');
        this.transitionSession(SessionType.IDLE, this.currentSession.primaryProject);
      }
    }, this.idleTimeoutMs);
  }

  getCurrentSession() {
    const now = Date.now();
    const duration = now - new Date(this.currentSession.startTime).getTime();
    return {
      ...this.currentSession,
      durationMs: duration,
      resourcesUsed: Array.from(this.currentSession.resourcesUsed),
      notesCreated: Array.from(this.currentSession.notesCreated),
      documentsAccessed: Array.from(this.currentSession.documentsAccessed)
    };
  }

  getHistory() {
    return this.sessionHistory;
  }
}

export const sessionEngine = new SessionEngine();
