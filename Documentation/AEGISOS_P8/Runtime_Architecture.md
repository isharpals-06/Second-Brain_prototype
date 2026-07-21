# AEGISOS v0.5.0 — ADR-007: Agent Runtime Architecture

## Overview

The Agent Runtime is the operating environment responsible for hosting, scheduling, supervising, coordinating, isolating, and monitoring intelligent agents within AEGISOS. Agents are treated like **processes** inside an operating system.

**STRICT PRINCIPLES**:
- Agents NEVER directly control the operating system or execute real tools (real tool execution belongs to ADR-008 Tool Runtime).
- Agents NEVER directly communicate with one another. All interaction passes through the Runtime Message Router.

---

## Subsystem Architecture

```
                               ┌────────────────────────────────┐
                               │   Decision Simulation Engine   │
                               │        (Validated Plan)        │
                               └───────────────┬────────────────┘
                                               │
                               ┌───────────────▼────────────────┐
                               │         Agent Runtime          │
                               └───────────────┬────────────────┘
                                               │
┌──────────────────────────────────────────────┴──────────────────────────────────────────────┐
│                                    Agent Runtime Modules                                    │
├─────────────────────┬─────────────────────┬─────────────────────┬───────────────────────────┤
│   Agent Registry    │  Lifecycle Manager  │   Agent Scheduler   │      Message Router       │
│  (Agent Metadata)   │(Process Transitions)│  (Priority Queues)  │  (Mediated Communication) │
├─────────────────────┼─────────────────────┼─────────────────────┼───────────────────────────┤
│ Capability Registry │  Resource Manager   │  Permission Engine  │  Health & Recovery Mgr    │
│(Dynamic Capabilities│  (CPU/RAM Quotas)   │(Permission Enforcement(Heartbeat & Auto Restart)  │
└─────────────────────┴─────────────────────┴─────────────────────┴───────────────────────────┘
                                               │
                               ┌───────────────▼────────────────┐
                               │       Runtime API Facade       │
                               │         (/api/agents/*)        │
                               └────────────────────────────────┘
```

---

## Core Modules

### 1. Agent Base Interface (`AgentBase.js`)
- Enforces standard lifecycle interface: `register()`, `initialize()`, `start()`, `pause()`, `resume()`, `stop()`, `dispose()`, `heartbeat()`, `status()`, `health()`, `capabilities()`, `permissions()`.

### 2. Agent Registry (`AgentRegistry.js`)
- Registers system agents: `Librarian Agent`, `Coprocessor Agent`, `Reviewer Agent`, `Research Agent`, `Monitoring Agent`.

### 3. Lifecycle Manager (`LifecycleManager.js`)
- Controls process state transitions (`start`, `pause`, `resume`, `stop`, `restart`) with complete failure isolation.

### 4. Agent Scheduler (`AgentScheduler.js`)
- Priority and FIFO task queues managing task execution states (`pending`, `running`, `completed`, `failed`).

### 5. Message Router (`MessageRouter.js`)
- Mediates all inter-agent messages (`Request`, `Response`, `Broadcast`, `Event`, `Notification`, `Heartbeat`).

### 6. Capability Registry (`CapabilityRegistry.js`)
- Dynamic registration and lookup of agent capabilities (`Research`, `Summarization`, `Code Generation`, `Debugging`, `Planning`).

### 7. Resource Manager (`ResourceManager.js`)
- Allocates CPU, RAM, and LLM model access quotas, preventing resource exhaustion.

### 8. Permission Engine (`PermissionEngine.js`)
- Checks and enforces explicit action permissions (`read_file`, `write_file`, `git_commit`).

### 9. Health Monitor & Recovery Manager (`HealthMonitor.js` & `RecoveryManager.js`)
- `HealthMonitor`: 30-second heartbeat check loop.
- `RecoveryManager`: Automatic crash recovery and isolated restart (up to 3 attempts).

### 10. Agent Storage (`AgentStorage.js`)
- Persists agent runtime states to SQLite table `agent_runtime_states`.
