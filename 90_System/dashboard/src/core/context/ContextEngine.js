import { clientEventBus } from '../eventBus/EventBus.js';
import { SystemEvents } from '../../types/index.js';

class ClientContextEngine {
  constructor() {
    this.context = new Map([
      ['activeProject', 'AEGISOS'],
      ['activeWorkspace', 'SecondBrain'],
      ['activeNote', null],
      ['activeRepository', 'Second-Brain_prototype'],
      ['currentModel', 'gemini-2.5-flash'],
      ['activeProvider', 'gemini'],
      ['activeConversationId', null],
      ['userState', { status: 'online', role: 'architect' }]
    ]);

    this.listeners = new Map();
  }

  get(key) {
    return this.context.get(key);
  }

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
          console.error(`[ClientContextEngine] Listener error for key "${key}":`, err);
        }
      });
    }

    if (key === 'currentModel') {
      clientEventBus.publish(SystemEvents.MODEL_CHANGED, { model: value });
    } else if (key === 'activeProject') {
      clientEventBus.publish(SystemEvents.PROJECT_OPENED, { project: value });
    }
  }

  getAll() {
    const result = {};
    for (const [k, v] of this.context.entries()) {
      result[k] = v;
    }
    return result;
  }

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

export const clientContextEngine = new ClientContextEngine();
export { ClientContextEngine };
