export function detectIntent(query) {
  if (!query || typeof query !== 'string') {
    return { type: 'SEARCH', category: 'General', confidence: 0.5, target: null };
  }

  const q = query.trim().toLowerCase();

  if (q.startsWith('research ') || q.includes('investigate') || q.includes('deep dive')) {
    return { type: 'DELEGATE_AGENT', category: 'Agent', agentId: 'agent_research', confidence: 0.95, target: 'Research Agent' };
  }

  if (q.startsWith('plan ') || q.includes('roadmap') || q.includes('feature plan')) {
    return { type: 'DELEGATE_AGENT', category: 'Agent', agentId: 'agent_planner', confidence: 0.95, target: 'Executive Planner Agent' };
  }

  if (q.startsWith('code ') || q.includes('bugfix') || q.includes('refactor')) {
    return { type: 'DELEGATE_AGENT', category: 'Agent', agentId: 'agent_coder', confidence: 0.95, target: 'Coding & Refactoring Agent' };
  }

  if (q.startsWith('mode ') || q.includes('switch to')) {
    const modeMatch = q.match(/(observe|think|research|build|review|focus)/i);
    return { type: 'NAVIGATION', category: 'Mode', targetMode: modeMatch ? modeMatch[0].toUpperCase() : 'OBSERVE', confidence: 0.9 };
  }

  if (q.startsWith('remember ') || q.startsWith('store ') || q.includes('save idea')) {
    return { type: 'MEMORY_ACTION', category: 'Memory', confidence: 0.9, target: 'Cognitive Memory Storage' };
  }

  if (q.startsWith('switch provider') || q.includes('use gemini') || q.includes('use ollama')) {
    return { type: 'SYSTEM_ACTION', category: 'Provider', confidence: 0.9, target: 'Model Provider Layer' };
  }

  if (q.startsWith('find ') || q.startsWith('search ') || q.includes('where is')) {
    return { type: 'UNIFIED_SEARCH', category: 'Knowledge', confidence: 0.85, target: 'Knowledge Graph & Vault' };
  }

  return { type: 'GENERAL_INTENT', category: 'Action', confidence: 0.7, target: 'System Engine' };
}
