import { MemoryType, LifecycleStatus } from './types.js';
import { memoryScorer } from './MemoryScorer.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Memory:Store');

export class MemoryStore {
  constructor() {
    this.memories = new Map();
    this.initDefaultMemories();
  }

  initDefaultMemories() {
    const defaults = [
      {
        id: 'mem_arch_aegisos',
        type: MemoryType.LEARNING,
        title: 'AEGISOS Autonomous Subsystem Architecture',
        summary: 'AEGISOS core architecture follows strict layered decoupling across Sentinel, World Model, Knowledge Graph, Executive Planner, Simulation Engine, Agent Runtime, Tool Runtime HAL, Workflow Platform, and Memory OS.',
        timestamp: new Date().toISOString(),
        source: 'System Architecture Specification',
        confidence: 0.95,
        importance: 0.9,
        accessCount: 10,
        tags: ['architecture', 'aegisos', 'kernel'],
        lifecycleStatus: LifecycleStatus.ACTIVE
      },
      {
        id: 'mem_obsidian_notes',
        type: MemoryType.RESEARCH,
        title: 'Obsidian SecondBrain Vault Structure',
        summary: 'University course notes (OS, DSA, DBMS, ML, Cyber) are refined into atomic space-separated markdown files with YAML metadata, LaTeX math, and spaced-repetition flashcards.',
        timestamp: new Date().toISOString(),
        source: 'Vault Refinement Pipeline',
        confidence: 0.9,
        importance: 0.85,
        accessCount: 8,
        tags: ['obsidian', 'notes', 'vault'],
        lifecycleStatus: LifecycleStatus.ACTIVE
      }
    ];

    defaults.forEach(m => {
      m.score = memoryScorer.computeCompositeScore(m);
      this.memories.set(m.id, m);
    });

    log.info(`Initialized MemoryStore with ${this.memories.size} default memory entries.`);
  }

  createMemory(data) {
    const id = data.id || `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const record = {
      id,
      type: data.type || MemoryType.EPISODIC,
      title: data.title || 'Untitled Memory',
      summary: data.summary || '',
      timestamp: data.timestamp || now,
      source: data.source || 'user',
      confidence: data.confidence !== undefined ? data.confidence : 0.8,
      importance: data.importance !== undefined ? data.importance : 0.5,
      accessCount: 1,
      relatedProjects: data.relatedProjects || [],
      relatedSessions: data.relatedSessions || [],
      relatedAgents: data.relatedAgents || [],
      relatedWorkflows: data.relatedWorkflows || [],
      tags: data.tags || [],
      version: '1.0.0',
      lifecycleStatus: LifecycleStatus.ACTIVE
    };

    record.score = memoryScorer.computeCompositeScore(record);
    this.memories.set(id, record);

    log.info(`Created memory "${record.title}" (${id}) [Type: ${record.type}, Score: ${record.score}]`);
    return record;
  }

  getMemory(id) {
    const mem = this.memories.get(id);
    if (mem) {
      mem.accessCount += 1;
      mem.score = memoryScorer.computeCompositeScore(mem);
    }
    return mem || null;
  }

  listMemories() {
    return Array.from(this.memories.values()).filter(m => m.lifecycleStatus !== LifecycleStatus.DELETED);
  }
}

export const memoryStore = new MemoryStore();
