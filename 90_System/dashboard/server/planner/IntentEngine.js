import { contextAPI } from '../worldModel/ContextAPI.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Planner:IntentEngine');

export class IntentEngine {
  constructor() {
    this.currentIntent = {
      primaryIntent: 'Working on AEGISOS System Development',
      confidence: 0.95,
      category: 'coding',
      evidence: ['VS Code opened on AEGISOS repository', 'Recent commits to main branch'],
      updatedAt: new Date().toISOString()
    };

    this.intentHistory = [this.currentIntent];
  }

  evaluateIntent() {
    const sessionData = contextAPI.getSession();
    const projectData = contextAPI.getProjects();
    const activeSession = sessionData.currentSession;
    const activeProject = projectData.activeProject;

    let primaryIntent = 'General System Usage';
    let confidence = 0.8;
    let category = 'general';
    const evidence = [];

    if (activeSession) {
      if (activeSession.type === 'Coding Session') {
        primaryIntent = `Developing software for ${activeProject?.name || 'Project'}`;
        confidence = 0.92;
        category = 'coding';
        evidence.push(`Active session is "Coding Session"`);
        evidence.push(`Primary project: ${activeProject?.name}`);
      } else if (activeSession.type === 'Study Session') {
        primaryIntent = `Studying university course notes & reviewing flashcards`;
        confidence = 0.90;
        category = 'study';
        evidence.push(`Active session is "Study Session"`);
        evidence.push(`Spaced repetition cards being reviewed`);
      } else if (activeSession.type === 'Research Session') {
        primaryIntent = `Researching technical documents & papers`;
        confidence = 0.88;
        category = 'research';
        evidence.push(`Active session is "Research Session"`);
      }
    }

    const updatedIntent = {
      primaryIntent,
      confidence,
      category,
      evidence,
      updatedAt: new Date().toISOString()
    };

    if (updatedIntent.primaryIntent !== this.currentIntent.primaryIntent) {
      this.currentIntent = updatedIntent;
      this.intentHistory.push(updatedIntent);
      log.info(`User Intent inferred: "${primaryIntent}" (Confidence: ${confidence})`);
    }

    return this.currentIntent;
  }

  getIntent() {
    return this.evaluateIntent();
  }

  getHistory() {
    return this.intentHistory;
  }
}

export const intentEngine = new IntentEngine();
