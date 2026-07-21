# AEGISOS v0.1.5 — Architecture Guide

## Overview

AEGISOS v0.1.5 hardens the core service-oriented architecture established in Phase 1. It ensures strict dependency boundaries, standardized error logging, environment configuration separation, atomic state context management, lazy service loading, and versioned skill permissions.

---

## 1. Architectural Layers & Boundaries

```
┌────────────────────────────────────────────────────────────────────────┐
│                               UI Layer                                 │
│                   (React 19 Components & Custom Hooks)                  │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │  (Consumes via useAegis())
┌──────────────────────────────────▼─────────────────────────────────────┐
│                          Core Architectural Bus                        │
├───────────────────┬───────────────────┬───────────────────┬────────────┤
│     EventBus      │   ContextEngine   │   AgentManager    │SkillReg... │
│ (Schema Catalog)  │(Atomic Updates)   │(Health & Metrics) │(Perms/Ver) │
└─────────┬─────────┴─────────┬─────────┴─────────┬─────────┴───────┬────┘
          │                   │                   │                 │
┌─────────▼───────────────────▼───────────────────▼─────────────────▼────┐
│                        Service Registry Layer                          │
│                (Lazy Loading & Dependency Injection)                   │
├───────────────────┬───────────────────┬───────────────────┬────────────┤
│     Database      │      Watcher      │        RAG        │Model Router│
└───────────────────┴───────────────────┴───────────────────┴────────────┘
```

### Dependency Rules:
1. **Core -> UI**: Core modules NEVER import React or UI components.
2. **Services -> UI**: Services NEVER depend on components.
3. **Agents -> React**: Agent lifecycle modules NEVER import React.
4. **Business Logic**: Pure JavaScript modules decoupled from UI rendering.

---

## 2. Subsystem Validation & Hardening

### Event Bus (`EventBus`)
- **Type Catalog**: Programmatic event discovery via `getEventCatalog()`.
- **Leak Detection**: Warns if event listeners exceed max threshold (25).
- **Error Boundaries**: Subscriber exceptions caught and logged without crashing execution.

### Context Engine (`ContextEngine`)
- **Atomic Batch Updates**: `setMany(object)` updates multiple keys simultaneously.
- **State Snapshots**: `snapshot()` and `restore(snapshot)` enable state recovery.
- **Default Reset**: `reset(key)` reverts keys back to initial default values.

### Agent Manager (`AgentManager`)
- **Capability Discovery**: `findByCapability(capability)` retrieves matching enabled agents.
- **Heartbeat & Health**: `checkHealth(maxStaleMs)` identifies unresponsive agents.
- **Metrics Tracking**: `recordTaskExecution(agentId, success, durationMs)` tracks agent performance.

### Service Registry (`ServiceRegistry`)
- **Lazy Instantiation**: `registerLazy(name, factoryFn, dependencies)` defers initialization until first request.
- **Dependency Resolution**: Injects dependent services into factories automatically.
- **Ordered Lifecycle**: Safe initialization and graceful shutdown (`stopAll()`).

### Skill Registry (`SkillRegistry`)
- **Versioning**: Every skill metadata includes semantic `version` string (e.g. `'1.0.0'`).
- **Permissions Framework**: Skills define `requiredPermissions` array.
- **Permission Checking**: `validatePermissions(id, userPermissions)` enforces permission scopes.

---

## 3. Configuration & Error Standardization

- **Config Layer**: `server/config/index.js` separates `development`, `testing`, and `production` flags.
- **Logger**: `AegisLogger` provides formatted timestamped log levels (`DEBUG`, `INFO`, `WARN`, `ERROR`).
- **Error Framework**: `AegisError` categorizes failures by `ErrorCodes` (`SERVICE_ERROR`, `AGENT_ERROR`, `SKILL_ERROR`, etc.).
