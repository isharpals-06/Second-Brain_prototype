# AEGISOS — Target Project Structure Specification (docs/010-Project-Structure.md)
**Document Version:** 1.0  
**Status:** CONSTITUTIONAL MANDATE  

---

## Target Repository Hierarchy

```text
SecondBrain/
├── docs/                     # Governing Constitutional Documentation
│   ├── 000-Vision.md
│   ├── 001-Design-Principles.md
│   ├── 002-Brand.md
│   ├── 003-Interaction-Language.md
│   ├── 004-Design-System.md
│   ├── 005-Frontend-Architecture.md
│   ├── 006-Backend-Architecture.md
│   ├── 007-Memory-System.md
│   ├── 008-Agent-System.md
│   ├── 009-Engineering-Standards.md
│   ├── 010-Project-Structure.md
│   ├── 011-Roadmap.md
│   ├── ADR/                  # Architecture Decision Records
│   └── RFC/                  # Request For Comments
│
└── 90_System/dashboard/      # Core Application Subsystem
    ├── server/               # AI Operating System Backend Runtime
    │   ├── core/             # Kernel, companionEngine, ReasoningEngine, Insights, Learning
    │   ├── memory/           # 6-Layer Memory Engine, Consolidation, Vectors
    │   ├── knowledge/        # Dynamic Graph, Knowledge Extractor, RAG Retrieval
    │   ├── providers/        # MPAL Layer (Ollama, Gemini, OpenRouter, HF)
    │   ├── planner/          # PlanningEngine & replanning
    │   ├── agentRuntime/     # Subagent scheduler & execution
    │   ├── toolRuntime/      # Tool sandbox & permission registry
    │   └── sentinel/         # Environmental observers
    │
    └── src/                  # Cockpit Frontend Shell
        ├── components/
        │   ├── shell/        # CockpitShell, Header, Rail, Inspector, Console
        │   ├── modes/        # Observe, Think, Research, Build, Review, Focus
        │   ├── control/      # System Control Center
        │   └── shared/       # TelemetryCard, StatusChip, MonospacedTerminal
        ├── core/             # EventBus, StateStore, ServiceRegistry
        └── styles/           # tokens.css, global.css
```
