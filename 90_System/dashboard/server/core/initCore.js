import { serverEventBus } from './eventBus.js';
import { serverContextEngine } from './contextEngine.js';
import { serverServiceRegistry } from './serviceRegistry.js';
import { serverAgentManager } from './agentManager.js';
import { serverSkillRegistry } from './skillRegistry.js';
import { companionEngine } from './companionEngine.js';
import { cognitiveCoreKernel } from './CognitiveCoreKernel.js';
import { SystemEvents, ServiceNames, AgentStatus } from './types.js';

export function initializeAegisCore() {
  console.log('----------------------------------------------------');
  console.log('⚡ Initializing AEGISOS Core Architecture (Phase 1)...');
  console.log('----------------------------------------------------');

  // 1. Register CognitiveCoreKernel in ServiceRegistry
  serverServiceRegistry.register('CognitiveCoreKernel', {
    name: 'Unified Cognitive Operating System Kernel',
    status: 'running',
    cognitiveCoreKernel,
  });

  // 2. Register Default Service Stubs
  serverServiceRegistry.register(ServiceNames.DATABASE, { name: 'SQLite Database', status: 'active' });
  serverServiceRegistry.register(ServiceNames.WATCHER, { name: 'Chokidar Vault Observer', status: 'active' });
  serverServiceRegistry.register(ServiceNames.RAG, { name: 'Local Vector RAG Engine', status: 'active' });
  serverServiceRegistry.register(ServiceNames.CHAT, { name: 'Ollama/Gemini Model Router', status: 'active' });

  // 3. Register Standard AEGISOS Skills Framework
  const defaultSkills = [
    {
      id: 'summarize',
      name: 'Summarize Concept Notes',
      category: 'Synthesis',
      description: 'Generates atomic summaries of raw lecture text and notes.'
    },
    {
      id: 'search_notes',
      name: 'Search Vault Notes',
      category: 'Retrieval',
      description: 'Queries subject MOCs and concept markdown files.'
    },
    {
      id: 'generate_flashcards',
      name: 'Generate Spaced Cards',
      category: 'Learning',
      description: 'Extracts :: and ?? active recall flashcard pairs.'
    },
    {
      id: 'refactor_notes',
      name: 'Refactor Notes Structure',
      category: 'Ingestion',
      description: 'Applies YAML frontmatter, LaTeX math syntax, and subject categorization.'
    },
    {
      id: 'commit_to_vault',
      name: 'Commit Note to Vault',
      category: 'Storage',
      description: 'Writes markdown atomic files to 10_Subjects/ subfolders.'
    },
    {
      id: 'review_flashcards',
      name: 'Review Flashcards (SM-2)',
      category: 'Memory',
      description: 'Calculates SuperMemo-2 intervals and due dates for active recall.'
    }
  ];

  defaultSkills.forEach(skill => serverSkillRegistry.registerSkill(skill));

  // 4. Register Standard AEGISOS Agents Framework
  const defaultAgents = [
    {
      id: 'agent_librarian',
      name: 'Librarian Agent',
      role: 'File Ingestion & Vault Filing',
      capabilities: ['refactor_notes', 'commit_to_vault', 'search_notes'],
      enabled: true
    },
    {
      id: 'agent_coprocessor',
      name: 'Coprocessor Agent',
      role: 'Multi-AI Synthesis & Refinement',
      capabilities: ['summarize', 'generate_flashcards', 'refactor_notes'],
      enabled: true
    },
    {
      id: 'agent_reviewer',
      name: 'Reviewer Agent',
      role: 'Spaced Repetition & Daily Briefing',
      capabilities: ['review_flashcards', 'search_notes'],
      enabled: true
    }
  ];

  defaultAgents.forEach(agent => serverAgentManager.register(agent));

  // 5. Start Persistent AI Companion Loop
  companionEngine.start();
  serverServiceRegistry.register(ServiceNames.COMPANION, {
    name: 'AI Companion Loop Engine',
    status: 'running',
    companionEngine
  });

  // 6. Publish System Boot Event
  serverEventBus.publish(SystemEvents.APPLICATION_STARTED, {
    timestamp: new Date().toISOString(),
    version: 'AEGISOS-v1.0.0 (GA)',
    status: 'initialized'
  }, { subsystem: 'Kernel', severity: 'INFO' });

  console.log('[AEGISOS Core] EventBus, CognitiveCoreKernel, CompanionEngine, ServiceRegistry active.');
  return {
    eventBus: serverEventBus,
    contextEngine: serverContextEngine,
    serviceRegistry: serverServiceRegistry,
    agentManager: serverAgentManager,
    skillRegistry: serverSkillRegistry,
    companionEngine,
    cognitiveCoreKernel,
  };
}
