export class FrontendEventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);
    return () => this.off(eventType, callback);
  }

  off(eventType, callback) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).delete(callback);
    }
  }

  emit(eventType, payload = {}) {
    if (this.listeners.has(eventType)) {
      for (const callback of this.listeners.get(eventType)) {
        try {
          callback(payload);
        } catch (err) {
          console.error(`Error handling event "${eventType}":`, err);
        }
      }
    }
  }
}

export const eventBus = new FrontendEventBus();
