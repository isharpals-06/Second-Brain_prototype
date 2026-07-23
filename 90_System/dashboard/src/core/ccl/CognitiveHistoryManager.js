export class CognitiveHistoryManager {
  constructor() {
    this.history = JSON.parse(localStorage.getItem('aegisos_ccl_history') || '[]');
  }

  add(entry) {
    const record = {
      id: `hist_${Date.now()}`,
      query: entry.query,
      intent: entry.intent,
      timestamp: new Date().toISOString(),
    };
    this.history.unshift(record);
    this.history = this.history.slice(0, 50); // Keep last 50 entries
    localStorage.setItem('aegisos_ccl_history', JSON.stringify(this.history));
  }

  getRecent(limit = 10) {
    return this.history.slice(0, limit);
  }

  clear() {
    this.history = [];
    localStorage.removeItem('aegisos_ccl_history');
  }
}

export const cognitiveHistoryManager = new CognitiveHistoryManager();
