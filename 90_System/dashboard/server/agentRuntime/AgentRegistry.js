import { AgentBase } from './AgentBase.js';
import { CapabilityType } from './types.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('AgentRuntime:Registry');

export class ConcreteAgent extends AgentBase {
  constructor(config) {
    super(config);
  }
}

export class AgentRegistry {
  constructor() {
    this.agents = new Map();
    this.registerSystemAgents();
  }

  registerSystemAgents() {
    const defaultAgents = [
      {
        id: 'agent_librarian',
        name: 'Librarian Agent',
        description: 'Organizes vault notes, MOC maps, and document indexing',
        capabilities: [CapabilityType.DOCUMENTATION, CapabilityType.SUMMARIZATION],
        permissions: ['read_file', 'write_file', 'search_vault']
      },
      {
        id: 'agent_coprocessor',
        name: 'Coprocessor Agent',
        description: 'Assists with code generation, technical writing, and refactoring',
        capabilities: [CapabilityType.CODE_GEN, CapabilityType.DEBUGGING],
        permissions: ['read_file', 'write_file', 'git_commit']
      },
      {
        id: 'agent_reviewer',
        name: 'Reviewer Agent',
        description: 'Drives spaced repetition flashcard reviews and active recall',
        capabilities: [CapabilityType.MEMORY, CapabilityType.SUMMARIZATION],
        permissions: ['read_file', 'write_file']
      },
      {
        id: 'agent_research',
        name: 'Research Agent',
        description: 'Indexes PDFs, research papers, and web resources',
        capabilities: [CapabilityType.RESEARCH, CapabilityType.SUMMARIZATION],
        permissions: ['read_file', 'search_vault']
      },
      {
        id: 'agent_monitoring',
        name: 'Monitoring Agent',
        description: 'Observes system telemetry, process health, and RAM/CPU usage',
        capabilities: [CapabilityType.PLANNING],
        permissions: ['read_telemetry']
      }
    ];

    defaultAgents.forEach(cfg => {
      const agent = new ConcreteAgent(cfg);
      agent.register();
      agent.initialize();
      this.agents.set(agent.id, agent);
    });

    log.info(`Registered ${this.agents.size} system agents in AgentRegistry.`);
  }

  getAgent(id) {
    return this.agents.get(id) || null;
  }

  listAgents() {
    return Array.from(this.agents.values());
  }

  registerAgent(agentInstance) {
    if (!agentInstance || !agentInstance.id) return false;
    this.agents.set(agentInstance.id, agentInstance);
    log.info(`Registered custom agent "${agentInstance.name}" (${agentInstance.id})`);
    return true;
  }
}

export const agentRegistry = new AgentRegistry();
