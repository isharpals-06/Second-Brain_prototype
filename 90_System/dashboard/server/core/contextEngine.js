import { serverEventBus } from './eventBus.js';
import { SystemEvents } from './types.js';
import { aegisLogger } from './logger.js';

const log = aegisLogger.child('ContextEngine');

class ContextEngine {
  constructor() {
    this.initialState = new Map([
      ['activeProject', 'AEGISOS'],
      ['activeWorkspace', 'SecondBrain'],
      ['activeNote', null],
      ['activeRepository', 'Second-Brain_prototype'],
      ['currentModel', 'gemini-2.5-flash'],
      ['activeProvider', 'gemini'],
      ['activeConversationId', null],
      ['userState', { status: 'online', role: 'architect' }],
      ['systemHealth', { status: 'healthy', uptimeStart: new Date().toISOString() }]
    ]);

    this.context = new Map(this.initialState);
    this.listeners = new Map();
  }

  /**
   * Read value for a specific context key.
   * @param {string} key 
   * @returns {any}
   */
  get(key) {
    return this.context.get(key);
  }

  /**
   * Update single context key and emit event.
   * @param {string} key 
   * @param {any} value 
   */
  set(key, value) {
    const oldValue = this.context.get(key);
    if (oldValue === value) return;

    this.context.set(key, value);

    const keyListeners = this.listeners.get(key);
    if (keyListeners) {
      keyListeners.forEach(cb => {
        try {
          cb(value, oldValue);
        } catch (err) {
          log.error(`Listener error for key "${key}": ${err.message}`);
        }
      });
    }

    if (key === 'currentModel') {
      serverEventBus.publish(SystemEvents.MODEL_CHANGED, { model: value, provider: this.get('activeProvider') });
    } else if (key === 'activeProject') {
      serverEventBus.publish(SystemEvents.PROJECT_OPENED, { project: value });
    }
  }

  /**
   * Atomic batch update of multiple context keys.
   * @param {Object} updates 
   */
  setMany(updates = {}) {
    if (typeof updates !== 'object' || updates === null) return;
    Object.entries(updates).forEach(([k, v]) => this.set(k, v));
  }

  /**
   * Reset key back to initial default value.
   * @param {string} key 
   */
  reset(key) {
    if (this.initialState.has(key)) {
      this.set(key, this.initialState.get(key));
    }
  }

  /**
   * Export immutable snapshot of current context state.
   * @returns {Object}
   */
  snapshot() {
    return this.getAll();
  }

  /**
   * Restore state from a snapshot.
   * @param {Object} snapshotObject 
   */
  restore(snapshotObject) {
    if (snapshotObject && typeof snapshotObject === 'object') {
      this.setMany(snapshotObject);
    }
  }

  /**
   * Return copy of all runtime context parameters.
   * @returns {Object}
   */
  getAll() {
    const result = {};
    for (const [k, v] of this.context.entries()) {
      result[k] = v;
    }
    return result;
  }

  /**
   * Subscribe to state updates for a specific key.
   * @param {string} key 
   * @param {Function} callback 
   * @returns {Function} Unsubscribe callback
   */
  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);
    return () => {
      if (this.listeners.has(key)) {
        this.listeners.get(key).delete(callback);
      }
    };
  }
}

export const serverContextEngine = new ContextEngine();
export { ContextEngine };
