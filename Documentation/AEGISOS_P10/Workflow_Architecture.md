# AEGISOS v0.6.0 — ADR-009: Workflow Orchestration Platform (WOP) Architecture

## Overview

The Workflow Orchestration Platform (WOP) coordinates agents, tools, approvals, conditions, retries, branching, checkpoints, and execution state across AEGISOS.

**STRICT PRINCIPLE**:
- WOP does NOT perform planning (Executive Planner does that).
- WOP does NOT implement tools (Tool Runtime HAL does that).
- WOP does NOT host agents (Agent Runtime does that).
- WOP **orchestrates** them declaratively.

---

## Subsystem Architecture

```
                               ┌────────────────────────────────┐
                               │       Executive Planner        │
                               │        (Validated Plan)        │
                               └───────────────┬────────────────┘
                                               │
                               ┌───────────────▼────────────────┐
                               │Workflow Orchestration Platform │
                               └───────────────┬────────────────┘
                                               │
┌──────────────────────────────────────────────┴──────────────────────────────────────────────┐
│                                  Workflow Platform Modules                                  │
├─────────────────────┬─────────────────────┬─────────────────────┬───────────────────────────┤
│  Workflow Registry  │  StateMachine Engine│    Step Executor    │     Approval Manager      │
│(Declarative Templates(Explicit Transitions)│(Agent/Tool Execution│(Manual/Automatic Gates)   │
├─────────────────────┼─────────────────────┼─────────────────────┼───────────────────────────┤
│ Checkpoint Manager  │    Retry Manager    │    Event Bridge     │     Workflow Storage      │
│(Resumable Snapshots)│(Exponential Backoff)│(Perception Listener)│ (SQLite Instances & Logs) │
└─────────────────────┴─────────────────────┴─────────────────────┴───────────────────────────┘
                                               │
                               ┌───────────────▼────────────────┐
                               │      Workflow API Facade       │
                               │       (/api/workflows/*)       │
                               └────────────────────────────────┘
```

---

## Core Modules

### 1. State Machine (`StateMachine.js`)
- Manages explicit state transitions (`PENDING`, `READY`, `RUNNING`, `WAITING`, `PAUSED`, `APPROVED`, `REJECTED`, `RETRYING`, `COMPLETED`, `FAILED`, `CANCELLED`, `TIMED_OUT`).

### 2. Step Executor (`StepExecutor.js`)
- Executes individual steps:
  - `Agent Step`: Invokes Agent Runtime (`agentRuntimeAPI.startAgent`).
  - `Tool Step`: Executes hardware abstraction tool via Tool Runtime (`toolRuntimeAPI.executeTool`).
  - `Approval Step`: Enqueues manual/automatic gate in `ApprovalManager`.
  - `Checkpoint Step`: Captures snapshot in `CheckpointManager`.

### 3. Workflow Registry (`WorkflowRegistry.js`)
- Registers declarative workflow definitions (`Research Paper Pipeline`, `Git Feature Workflow`, `System Health Inspection`).

### 4. Approval Manager (`ApprovalManager.js`)
- Manages approval gates for sensitive actions (e.g. `delete_file`, `git_commit`, `deploy`).

### 5. Checkpoint Manager (`CheckpointManager.js`)
- Persists workflow state, completed steps, variables, and outputs to support resumability.

### 6. Retry Manager (`RetryManager.js`)
- Manages step retry attempts with exponential backoff (2s, 4s, 8s).

### 7. Workflow Scheduler (`WorkflowScheduler.js`)
- Drives step loops sequentially or in parallel branches.

### 8. Event Bridge (`EventBridge.js`)
- Listens to EventBus perception events and triggers matching workflows.

### 9. SQLite Storage (`WorkflowStorage.js`)
- Persists workflow instances and checkpoints in SQLite tables `workflow_instances` and `workflow_checkpoints`.
