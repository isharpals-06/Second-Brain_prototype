export class CommandRegistry {
  constructor() {
    this.commands = new Map();
    this.registerDefaults();
  }

  register(command) {
    if (!command.id || !command.label) return;
    this.commands.set(command.id, command);
  }

  registerDefaults() {
    const defaults = [
      { id: 'mode_observe', category: 'MODE', label: 'Switch to OBSERVE Mode', keywords: ['observe', 'monitor', 'sentinel'], action: (dispatch) => dispatch({ type: 'SET_ACTIVE_MODE', payload: 'OBSERVE' }) },
      { id: 'mode_think', category: 'MODE', label: 'Switch to THINK Mode (Cognitive Canvas)', keywords: ['think', 'canvas', 'reasoning'], action: (dispatch) => dispatch({ type: 'SET_ACTIVE_MODE', payload: 'THINK' }) },
      { id: 'mode_research', category: 'MODE', label: 'Switch to RESEARCH Mode (Knowledge Web)', keywords: ['research', 'knowledge', 'graph', 'vault'], action: (dispatch) => dispatch({ type: 'SET_ACTIVE_MODE', payload: 'RESEARCH' }) },
      { id: 'mode_build', category: 'MODE', label: 'Switch to BUILD Mode (Executive Planner)', keywords: ['build', 'planner', 'agent', 'tasks'], action: (dispatch) => dispatch({ type: 'SET_ACTIVE_MODE', payload: 'BUILD' }) },
      { id: 'mode_review', category: 'MODE', label: 'Switch to REVIEW Mode (Reflection & Audit)', keywords: ['review', 'reflection', 'audit', 'diff'], action: (dispatch) => dispatch({ type: 'SET_ACTIVE_MODE', payload: 'REVIEW' }) },
      { id: 'mode_focus', category: 'MODE', label: 'Switch to FOCUS Mode (Single-Intent Synthesis)', keywords: ['focus', 'deep', 'synthesis'], action: (dispatch) => dispatch({ type: 'SET_ACTIVE_MODE', payload: 'FOCUS' }) },
      { id: 'agent_research', category: 'AGENT', label: 'Delegate to Research Agent', keywords: ['agent', 'research', 'explore'], action: async (dispatch, payload) => { await fetch('/api/agents/dispatch', { method: 'POST', body: JSON.stringify({ agent: 'research', prompt: payload }) }); } },
      { id: 'memory_consolidate', category: 'MEMORY', label: 'Trigger Memory Consolidation Pass', keywords: ['memory', 'consolidate', 'prune'], action: async () => { await fetch('/api/cognitive/consolidate', { method: 'POST' }); } },
      { id: 'system_control', category: 'SYSTEM', label: 'Open System Control Center', keywords: ['system', 'control', 'settings', 'config'], action: (dispatch) => dispatch({ type: 'SET_ACTIVE_SUBSYSTEM', payload: 'control' }) },
    ];

    for (const cmd of defaults) {
      this.register(cmd);
    }
  }

  search(query) {
    if (!query) return Array.from(this.commands.values());
    const q = query.toLowerCase();
    return Array.from(this.commands.values()).filter(c =>
      c.label.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      (c.keywords && c.keywords.some(k => k.toLowerCase().includes(q)))
    );
  }
}

export const commandRegistry = new CommandRegistry();
