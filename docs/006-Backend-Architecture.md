# AEGISOS — Backend Architecture Specification (docs/006-Backend-Architecture.md)
**Document Version:** 1.0  
**Status:** CONSTITUTIONAL MANDATE  

---

## 1. Backend Subsystem Map

The backend (`server/`) operates as a persistent, event-driven AI runtime:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   EXPRESS HTTP & SSE API                               │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                             MODEL PROVIDER MANAGER (MPAL)                              │
│                 (Ollama | Gemini | OpenRouter | Hugging Face)                         │
├──────────────────────────┬──────────────────────────┬──────────────────────────────────┤
│ CONTINUOUS COGNITIVE LOOP│ COGNITIVE MEMORY ENGINE  │ KNOWLEDGE EXTRACTION ENGINE      │
│ (companionEngine.js)     │ (6 Layer SQLite Store)   │ (Dynamic Knowledge Graph)        │
├──────────────────────────┼──────────────────────────┼──────────────────────────────────┤
│ SENTINEL OBSERVER REGISTRY│ EXECUTIVE PLANNER ENGINE │ PROCEDURAL REFLECTION ENGINE     │
│ (Filesystem, Repos, State)│ (Goal Decomposition)     │ (Plan Performance Audits)        │
├──────────────────────────┼──────────────────────────┼──────────────────────────────────┤
│ AUTONOMOUS INSIGHTS ENGINE│ SELF-LEARNING ENGINE    │ TOOL RUNTIME & SECURITY SANDBOX  │
│ (Semantic Scan, Graph)   │ (Reliability Optimization│ (Execution Engine, Permissions)   │
└──────────────────────────┴──────────────────────────┴──────────────────────────────────┘
```

---

## 2. Platform Directories & Roles

- `server/core/`: Kernel logic, `companionEngine.js`, `ReasoningEngine.js`, `AutonomousInsightsEngine.js`, `SelfLearningEngine.js`, `EventBus.js`, `logger.js`.
- `server/memory/`: `CognitiveMemoryEngine.js`, `MemoryConsolidationEngine.js`, `VectorMemoryStore.js`, `MemoryStorage.js`.
- `server/knowledge/`: `KnowledgeExtractor.js`, `DynamicKnowledgeGraph.js`, `HybridRetrievalEngine.js`, `DocumentIngestionEngine.js`.
- `server/providers/`: MPAL provider implementations (`geminiProvider.js`, `ollamaProvider.js`, `openrouterProvider.js`, `huggingfaceProvider.js`, `providerRegistry.js`).
- `server/planner/`: `PlanningEngine.js` for task decomposition and adaptive replanning.
- `server/agentRuntime/`: `AgentExecutionManager.js` and subagent scheduling.
- `server/toolRuntime/`: Tool registration, execution sandboxing, and security permission grants.
- `server/sentinel/`: Observers for filesystem, git repositories, and system metrics.
