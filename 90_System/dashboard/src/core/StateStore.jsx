import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial Centralized App State
const initialAppState = {
  // 1. Operating Mode & Navigation State
  workspace: {
    activeMode: 'OBSERVE', // 'OBSERVE' | 'THINK' | 'RESEARCH' | 'BUILD' | 'REVIEW' | 'FOCUS'
    activeSubsystem: 'mission',
    inspectorOpen: true,
    inspectorTarget: null, // { type: 'agent' | 'memory' | 'node' | 'goal' | 'project', id: string, data: object }
    consoleOpen: true,
    consoleFilter: 'ALL',
    commandPaletteOpen: false,
  },

  // 2. AI Runtime & MPAL State
  ai: {
    providers: [],
    activeProvider: 'gemini',
    activeModel: 'gemini-1.5-flash',
    aiState: 'IDLE', // 'IDLE' | 'PERCEIVING' | 'THINKING' | 'PLANNING' | 'EXECUTING' | 'LEARNING' | 'REVIEWING'
    currentSessionId: null,
    reasoningTrace: [],
  },

  // 3. Cognitive Memory State
  memory: {
    stats: { sessionCount: 0, workingCount: 0, episodicCount: 0, semanticCount: 0, proceduralCount: 0, identityCount: 0 },
    recentMemories: [],
  },

  // 4. Executive Planner & Agent State
  planner: {
    activePlan: null,
    goals: [],
    agentStats: { total: 0, running: 0, completed: 0, failed: 0 },
  },

  // 5. System Telemetry State
  system: {
    sseConnected: true,
    tickCount: 0,
    insights: [],
    learningMetrics: {},
    logs: [],
  }
};

function stateReducer(state, action) {
  switch (action.type) {
    case 'SET_ACTIVE_MODE':
      return { ...state, workspace: { ...state.workspace, activeMode: action.payload } };
    case 'SET_ACTIVE_SUBSYSTEM':
      return { ...state, workspace: { ...state.workspace, activeSubsystem: action.payload } };
    case 'TOGGLE_INSPECTOR':
      return { ...state, workspace: { ...state.workspace, inspectorOpen: action.payload ?? !state.workspace.inspectorOpen } };
    case 'SET_INSPECTOR_TARGET':
      return { ...state, workspace: { ...state.workspace, inspectorTarget: action.payload, inspectorOpen: true } };
    case 'TOGGLE_CONSOLE':
      return { ...state, workspace: { ...state.workspace, consoleOpen: action.payload ?? !state.workspace.consoleOpen } };
    case 'SET_CONSOLE_FILTER':
      return { ...state, workspace: { ...state.workspace, consoleFilter: action.payload } };
    case 'TOGGLE_COMMAND_PALETTE':
      return { ...state, workspace: { ...state.workspace, commandPaletteOpen: action.payload ?? !state.workspace.commandPaletteOpen } };
    case 'SET_AI_STATE':
      return { ...state, ai: { ...state.ai, aiState: action.payload } };
    case 'SET_PROVIDERS':
      return { ...state, ai: { ...state.ai, providers: action.payload } };
    case 'SET_ACTIVE_PROVIDER':
      return { ...state, ai: { ...state.ai, activeProvider: action.payload } };
    case 'SET_DASHBOARD_DATA':
      return {
        ...state,
        system: {
          ...state.system,
          tickCount: action.payload.tickCount || state.system.tickCount,
          insights: action.payload.insights || state.system.insights,
          learningMetrics: action.payload.learning || state.system.learningMetrics,
        },
        ai: {
          ...state.ai,
          reasoningTrace: action.payload.recentReasoning || state.ai.reasoningTrace,
        }
      };
    case 'ADD_LOG':
      return {
        ...state,
        system: {
          ...state.system,
          logs: [action.payload, ...state.system.logs].slice(0, 100) // Keep last 100 logs
        }
      };
    case 'SET_SSE_CONNECTED':
      return { ...state, system: { ...state.system, sseConnected: action.payload } };
    default:
      return state;
  }
}

const AppStateContext = createContext();

export function AppStateProvider({ children }) {
  const [state, dispatch] = useReducer(stateReducer, initialAppState);

  // Poll Cognitive Dashboard & Providers on mount
  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/cognitive/dashboard');
        if (res.ok) {
          const data = await res.json();
          dispatch({ type: 'SET_DASHBOARD_DATA', payload: data });
        }
      } catch (err) {
        console.error('Failed to fetch cognitive dashboard:', err);
      }
    }

    async function fetchProviders() {
      try {
        const res = await fetch('/api/providers');
        if (res.ok) {
          const data = await res.json();
          dispatch({ type: 'SET_PROVIDERS', payload: data.providers || [] });
        }
      } catch (err) {
        console.error('Failed to fetch MPAL providers:', err);
      }
    }

    fetchDashboard();
    fetchProviders();
    const interval = setInterval(fetchDashboard, 5000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard Shortcuts (Ctrl+K for Command Palette, Ctrl+B for Inspector)
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        dispatch({ type: 'TOGGLE_COMMAND_PALETTE' });
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        dispatch({ type: 'TOGGLE_INSPECTOR' });
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) throw new Error('useAppState must be used within AppStateProvider');
  return context;
}
