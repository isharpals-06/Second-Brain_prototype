import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('WorldModel:StateManager');

export class StateManager {
  constructor() {
    this.currentState = {
      activeWorkspace: 'C:\\Users\\ishar\\Projects\\SecondBrain',
      currentProject: 'SecondBrain',
      currentRepo: 'Second-Brain_prototype',
      currentBranch: 'main',
      currentSession: 'Idle Session',
      openFiles: [],
      openNotes: [],
      recentFiles: [],
      recentEvents: [],
      recentConversations: [],
      downloadedDocs: [],
      indexedDocs: [],
      runningServices: ['Database', 'Watcher', 'RAG', 'Chat', 'Sentinel'],
      runningAgents: ['Librarian Agent', 'Coprocessor Agent', 'Reviewer Agent'],
      systemHealth: 'healthy',
      connectedModels: ['gemini-2.5-flash', 'qwen3.6', 'mixtral'],
      activeProvider: 'gemini',
      currentVault: '10_Subjects',
      clipboardSnippet: '',
      lastUpdated: new Date().toISOString()
    };

    this.previousState = null;
    this.snapshots = [];
    this.maxSnapshots = 50;
  }

  getState() {
    return { ...this.currentState };
  }

  updateState(partialState = {}) {
    this.previousState = { ...this.currentState };
    this.currentState = {
      ...this.currentState,
      ...partialState,
      lastUpdated: new Date().toISOString()
    };
    log.debug('World State updated.');
    return this.currentState;
  }

  createSnapshot() {
    const snapshot = {
      id: `snap_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      state: { ...this.currentState }
    };
    this.snapshots.push(snapshot);
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }
    return snapshot;
  }

  diff() {
    if (!this.previousState) return {};
    const changes = {};
    Object.keys(this.currentState).forEach(k => {
      if (JSON.stringify(this.currentState[k]) !== JSON.stringify(this.previousState[k])) {
        changes[k] = { from: this.previousState[k], to: this.currentState[k] };
      }
    });
    return changes;
  }

  getSnapshots() {
    return this.snapshots;
  }
}

export const stateManager = new StateManager();
