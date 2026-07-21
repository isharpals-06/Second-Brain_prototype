# AEGISOS v0.9.0 — ADR-013: Automation Platform Architecture

## Overview

The Automation Platform is responsible for initiating, scheduling, supervising, and recovering autonomous workflows based on user intent, governance policies, context, and system state.

**STRICT PRINCIPLE**: Autonomy must always remain explainable, observable, and interruptible. Every automation request is verified through Governance & Trust and Decision Simulation before execution.

---

## Subsystem Architecture

```
                               ┌────────────────────────────────┐
                               │       Governance & Trust       │
                               │        & User Cockpit          │
                               └───────────────┬────────────────┘
                                               │
                               ┌───────────────▼────────────────┐
                               │      Automation Platform       │
                               └───────────────┬────────────────┘
                                               │
┌──────────────────────────────────────────────┴──────────────────────────────────────────────┐
│                                   Automation Subsystem Modules                              │
├─────────────────────┬─────────────────────┬─────────────────────┬───────────────────────────┤
│ Automation Registry │   Trigger Engine    │Automation Scheduler │    Policy-aware Executor  │
│(Declarative Templates(Multi-Event Listener)│(Cron & Interval Jobs│ (Pre-Execution Verification│
├─────────────────────┼─────────────────────┼─────────────────────┼───────────────────────────┤
│Human Approval Manager│  Rollback Manager  │  Analytics Engine   │    Automation Storage     │
│(Human-in-the-Loop)  │ (Git/State Restore) │(Time Saved & Metrics│(SQLite Definitions & History│
└─────────────────────┴─────────────────────┴─────────────────────┴───────────────────────────┘
                                               │
                               ┌───────────────▼────────────────┐
                               │ Workflow Orchestration Platform│
                               │      (Step State Machine)      │
                               └────────────────────────────────┘
```

---

## Core Modules

### 1. Trigger Engine (`TriggerEngine.js`)
- Evaluates triggers across time, calendar, filesystem, git events, memory reflections, system startup, and custom triggers.

### 2. Automation Scheduler (`Scheduler.js`)
- Manages cron and interval schedules with timezone awareness, pause, and resume capabilities.

### 3. Policy-Aware Executor (`PolicyExecutor.js`)
- Pre-execution gatekeeper validating Governance policies, entity trust scores, and Decision Simulation risk checks before proceeding.

### 4. Human Approval Manager (`HumanApprovalManager.js`)
- Enforces human-in-the-loop approval gates (`Always ask`, `Ask on sensitive actions`, `Emergency stop`).

### 5. Rollback Manager (`RollbackManager.js`)
- Executes automated or manual rollbacks (`Git revert`, `File cleanup`, `Workflow compensation`, `State restore`).

### 6. Analytics Engine (`AnalyticsEngine.js`)
- Tracks execution counts, average duration, failure causes, time saved, approval rates, and rollback rates.

### 7. SQLite Storage (`AutomationStorage.js`)
- Persists automation definitions and history logs in SQLite tables `automation_definitions` and `automation_history`.
