# AEGISOS — Agent & Subagent Architecture (docs/008-Agent-System.md)
**Document Version:** 1.0  
**Status:** CONSTITUTIONAL MANDATE  

---

## 1. Agent Lifecycle & Execution Pipeline

```text
  [Planner Decomposes Goal]
             │
             ▼
  [Agent Runtime Scheduler] ──► Allocates Subagent Instance
             │
             ▼
  [Security Checkpoint] ──► Checks Tool & File Permissions
             │
             ▼
  [Execution Engine] ──► Executes Steps & Invokes Tools
             │
             ▼
  [Reflection Pass] ──► Measures Reliability & Writes Procedural Memory
```

---

## 2. Subagent Roles & Permission Boundaries

1. **Research Subagents:** Read-only tools for searching codebases, reading files, and extracting entities.
2. **Build Subagents:** Read/write tools for editing code, creating components, and running test commands.
3. **Audit Subagents:** Read-only security scanners inspecting permissions, lint rules, and architectural compliance.

Subagents append execution logs directly to `ReasoningEngine` and broadcast progress to the `EventBus`.
