import { serverEventBus } from './eventBus.js';
import { SystemEvents } from './types.js';

class ContextEngine {
  constructor() {
    this.context = new Map([
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
   * Update value for a context key and publish change event.
   * @param {string} key 
   * @param {any} value 
   */
  set(key, value) {
    const oldValue = this.context.get(key);
    if (oldValue === value) return;

    this.context.set(key, value);

    // Notify key listeners
    const keyListeners = this.listeners.get(key);
    if (keyListeners) {
      keyListeners.forEach(cb => {
        try {
          cb(value, oldValue);
        } catch (err) {
          console.error(`[ContextEngine] Listener error for key "${key}":`, err);
        }
      });
    }

    // Trigger matching EventBus events
    if (key === 'currentModel') {
      serverEventBus.publish(SystemEvents.MODEL_CHANGED, { model: value, provider: this.get('activeProvider') });
    } else if (key === 'activeProject') {
      serverEventBus.publish(SystemEvents.PROJECT_OPENED, { project: value });
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
   * Subscribe to state updates for a specific context key.
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
