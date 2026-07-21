# AEGISOS v0.2.0 — ADR-002: Sentinel Core Architecture

## Overview

Sentinel Core is the continuous perception layer (eyes & ears) of AEGISOS. It observes digital environment events (files, notes, workspace, git repository, system clipboard, and hardware metrics) and converts them into standardized, normalized events published directly to the central `EventBus`.

**Core Rule**: Sentinel Core never performs reasoning, decision making, or task execution. It ONLY observes and publishes events.

---

## Subsystem Architecture

```
                               ┌────────────────────────────────┐
                               │           AEGISOS              │
                               │          Event Bus             │
                               └───────────────▲────────────────┘
                                               │
┌──────────────────────────────────────────────┴──────────────────────────────────────────────┐
│                                       Sentinel Runtime                                      │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│  Observer Manager (Lifecycle & Auto-Restart)  │  Observer Registry (Dynamic Registration)  │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                             Concrete Observers (BaseObserver)                               │
├───────────────┬───────────────┬───────────────┬───────────────┬───────────────┬─────────────┤
│ File Observer │ Vault Observer│ Workspace Obs │ Git Observer  │ Clipboard Obs │ System Obs  │
└───────────────┴───────────────┴───────────────┴───────────────┴───────────────┴─────────────┘
```

---

## Core Components

### 1. BaseObserver (`server/sentinel/observers/BaseObserver.js`)
- Shared abstract base class for all perception observers.
- Enforces standardized lifecycle: `initialize()`, `start()`, `pause()`, `resume()`, `stop()`, `status()`, `health()`, `dispose()`.
- Standardized event emitter: `emitEvent(category, priority, payload)`.

### 2. Observer Registry (`server/sentinel/ObserverRegistry.js`)
- Dynamic registration repository (`register`, `unregister`, `get`, `list`).
- Stores metadata, category, permissions, and status.

### 3. Observer Manager & Health Monitor (`server/sentinel/ObserverManager.js`)
- Lifecycle orchestrator.
- **Fault-Tolerant Isolation**: Evaluates observer health every 30 seconds. Automatically attempts up to 3 restarts if an observer fails. One crashed observer never impacts other observers or Sentinel Core.

### 4. Normalized Event Schema (`server/sentinel/eventSchema.js`)
Every perception event strictly follows the schema:
- `id`: `evt_<timestamp>_<rand>`
- `timestamp`: ISO-8601 string
- `source`: `'sentinel'`
- `observer`: Observer ID (e.g. `'file_observer'`)
- `category`: `'filesystem' | 'vault' | 'workspace' | 'git' | 'clipboard' | 'system'`
- `priority`: `'low' | 'medium' | 'high' | 'critical'`
- `payload`: Event-specific data object
- `version`: `'1.0.0'`
- `correlationId`: Transaction tracking ID
