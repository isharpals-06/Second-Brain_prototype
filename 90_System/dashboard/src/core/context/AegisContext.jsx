import React, { createContext, useContext, useState, useEffect } from 'react';
import { clientEventBus } from '../eventBus/EventBus.js';
import { clientContextEngine } from './ContextEngine.js';
import { clientServiceRegistry } from '../services/ServiceRegistry.js';
import { clientAgentManager } from '../agents/AgentManager.js';
import { clientSkillRegistry } from '../skills/SkillRegistry.js';
import { SystemEvents, ServiceNames } from '../../types/index.js';

const AegisContext = createContext(null);

export const AegisProvider = ({ children }) => {
  const [contextState, setContextState] = useState(clientContextEngine.getAll());
  const [agents, setAgents] = useState([]);
  const [skills, setSkills] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    // 1. Register Client Default Services
    clientServiceRegistry.register(ServiceNames.DATABASE, { name: 'SQLite Database API' });
    clientServiceRegistry.register(ServiceNames.CHAT, { name: 'Model Router Client' });
    clientServiceRegistry.register(ServiceNames.RAG, { name: 'Local Vector Client' });

    // 2. Register Client Default Skills Framework
    const defaultSkills = [
      { id: 'summarize', name: 'Summarize Note', category: 'Synthesis' },
      { id: 'search_notes', name: 'Search Vault Notes', category: 'Retrieval' },
      { id: 'generate_flashcards', name: 'Generate Flashcards', category: 'Learning' },
      { id: 'refactor_notes', name: 'Refactor Notes', category: 'Ingestion' },
      { id: 'commit_to_vault', name: 'Commit to Vault', category: 'Storage' },
      { id: 'review_flashcards', name: 'Review Flashcards (SM-2)', category: 'Memory' }
    ];
    defaultSkills.forEach(s => clientSkillRegistry.registerSkill(s));

    // 3. Register Client Default Agents Framework
    const defaultAgents = [
      { id: 'agent_librarian', name: 'Librarian Agent', role: 'Filing & Ingestion' },
      { id: 'agent_coprocessor', name: 'Coprocessor Agent', role: 'Multi-AI Synthesis' },
      { id: 'agent_reviewer', name: 'Reviewer Agent', role: 'Spaced Repetition' }
    ];
    defaultAgents.forEach(a => clientAgentManager.register(a));

    // Sync initial state arrays
    setAgents(clientAgentManager.list());
    setSkills(clientSkillRegistry.listSkills());
    setServices(clientServiceRegistry.list());

    // Listen for model/project changes
    const unsubModel = clientContextEngine.subscribe('currentModel', (newVal) => {
      setContextState(prev => ({ ...prev, currentModel: newVal }));
    });
    const unsubProject = clientContextEngine.subscribe('activeProject', (newVal) => {
      setContextState(prev => ({ ...prev, activeProject: newVal }));
    });

    // Notify application started
    clientEventBus.publish(SystemEvents.APPLICATION_STARTED, {
      timestamp: new Date().toISOString(),
      environment: 'browser'
    });

    return () => {
      unsubModel();
      unsubProject();
    };
  }, []);

  const updateContext = (key, value) => {
    clientContextEngine.set(key, value);
    setContextState(clientContextEngine.getAll());
  };

  const executeSkill = async (skillId, params = {}) => {
    return await clientSkillRegistry.executeSkill(skillId, params, contextState);
  };

  const aegisValue = {
    eventBus: clientEventBus,
    contextEngine: clientContextEngine,
    serviceRegistry: clientServiceRegistry,
    agentManager: clientAgentManager,
    skillRegistry: clientSkillRegistry,
    contextState,
    updateContext,
    executeSkill,
    agents,
    skills,
    services
  };

  return (
    <AegisContext.Provider value={aegisValue}>
      {children}
    </AegisContext.Provider>
  );
};

export const useAegis = () => {
  const ctx = useContext(AegisContext);
  if (!ctx) {
    throw new Error('useAegis must be used within an AegisProvider component.');
  }
  return ctx;
};
