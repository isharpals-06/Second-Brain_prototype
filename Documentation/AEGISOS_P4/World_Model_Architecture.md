# AEGISOS v0.3.0 — ADR-003: World Model Engine Architecture

## Overview

The World Model Engine is the living understanding layer of AEGISOS. It receives continuous perception events from Sentinel Core via the `EventBus`, deterministically correlates them into real-time state, maintains an internal relationship graph, tracks user activity sessions, and provides a unified `ContextAPI` facade.

**Core Rule**: The World Model Engine DOES NOT use LLM reasoning, DOES NOT plan, and DOES NOT execute user tasks. Its sole responsibility is maintaining a real-time, deterministic representation of reality.

---

## Subsystem Architecture

```
                               ┌────────────────────────────────┐
                               │         Sentinel Core          │
                               │      (Perception Events)       │
                               └───────────────┬────────────────┘
                                               │
                               ┌───────────────▼────────────────┐
                               │           Event Bus            │
                               └───────────────┬────────────────┘
                                               │
┌──────────────────────────────────────────────▼──────────────────────────────────────────────┐
│                                     World Model Runtime                                     │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                         Event Correlation Engine (Pattern Matcher)                          │
├───────────────┬───────────────┬───────────────┬───────────────┬───────────────┬─────────────┤
│ State Manager │Session Engine │Timeline Engine│ Relationship  │Project Manager│ Workspace   │
│ (Snapshots)   │ (Auto Detect) │ (Append Log)  │ Engine(Graph) │ & Repos       │ Manager     │
├───────────────┴───────────────┴───────────────┴───────────────┴───────────────┴─────────────┤
│                              Unified Context API Facade                                     │
└──────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                               │
                               ┌───────────────▼────────────────┐
                               │    Future Executive Planner    │
                               │     & Agent Runtime Engine     │
                               └────────────────────────────────┘
```

---

## Core Components

### 1. Event Correlation Engine (`server/worldModel/EventCorrelationEngine.js`)
- Subscribes to `sentinel:*` and internal `SystemEvents`.
- Deterministically infers activity types without LLM calls.
- Updates state managers and graph structures in real time.

### 2. Session Engine (`server/worldModel/SessionEngine.js`)
- Automatically detects user session categories: `Coding Session`, `Study Session`, `Research Session`, `Writing Session`, `Reading Session`, `Browsing Session`, `Idle Session`.
- Tracks `startTime`, `durationMs`, `resourcesUsed`, `notesCreated`, and `documentsAccessed`.

### 3. Relationship Engine (`server/worldModel/RelationshipEngine.js`)
- Directed Adjacency Graph mapping relationships between `pdf`, `project`, `note`, `conversation`, `repo`, and `task` nodes.
- Relations: `CONTAINS`, `REFERENCES`, `GENERATED_FROM`, `DEPENDS_ON`, `ASSOCIATED_WITH`.

### 4. Timeline Engine (`server/worldModel/TimelineEngine.js`)
- Append-only activity stream with category filtering, time range replays, and JSON export.

### 5. Project & Workspace Managers (`ProjectManager.js` & `WorkspaceManager.js`)
- Tracks active project (`SecondBrain`), Git branch, recent files, open directories, and workspace history.

### 6. State Manager & Snapshot Manager (`StateManager.js` & `SnapshotManager.js`)
- Manages `currentState`, `previousState`, state diffs, and persists snapshots to SQLite (`world_model_snapshots` table).

### 7. Unified Context API (`ContextAPI.js`)
- Single source of truth query facade for future agents & REST endpoints.
