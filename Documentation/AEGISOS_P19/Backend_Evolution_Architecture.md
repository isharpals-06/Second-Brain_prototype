# AEGISOS Phase 19 — Backend Evolution Architecture Specification

This document details the transformation of the AEGISOS backend from a passive REST API into a **continuously running, event-driven AI Operating System runtime**.

---

## 1. Architectural Transformation Summary

| Component | Legacy / Scaffolding State | Evolved AEGISOS Runtime State |
| :--- | :--- | :--- |
| **Event Pipeline** | Basic topic callbacks | Standardized envelope with `id`, `event`, `timestamp`, `correlationId`, `subsystem`, `severity`, `payload` + Wildcard Subscriber Stream |
| **Real-Time Streaming** | Polling endpoints | Server-Sent Events (SSE) stream on `/api/stream/events` and `/api/aegis/stream` |
| **AI Orchestration** | Idle stub | Persistent AI Companion Loop (`CompanionEngine.js`) running continuous Observe-Analyze-Plan-Remember ticks |
| **Agent Runtime** | Simulated `setTimeout(..., 100)` mock timers | Real task execution queue (`AgentScheduler.js`), retries (up to 3x), real tool handlers, event publishing (`AGENT_STARTED`, `AGENT_COMPLETED`, `AGENT_FAILED`) |
| **Executive Planner** | Hardcoded goals & draft plans | Real dependency graph, priority scoring, event publishing (`PLANNER_UPDATED`), auto-enqueueing to Agent Runtime |
| **Memory OS** | In-memory Map | Persistent SQLite storage (`aegis_memories` table) bound to `MemoryStore.js`, emitting `MEMORY_CREATED` events |
| **Governance Gate** | Basic rule matcher | Mandatory permission evaluation (`ALLOW`/`DENY`) & audit trail logging (`AuditEngine.js`) |
| **Process Lifecycle** | Default Node termination | Graceful shutdown handlers (`SIGINT`, `SIGTERM`), DB connection cleanup, uncaught exception handlers |

---

## 2. Event Envelope Specification

Every event published via `serverEventBus.publish(event, payload, meta)` strictly complies with the following structure:

```json
{
  "id": "evt_1784731318516_zaft",
  "event": "COMPANION_SUGGESTION",
  "timestamp": "2026-07-22T14:41:58.516Z",
  "correlationId": "corr_1784731318516_ke6s",
  "subsystem": "Companion",
  "severity": "INFO",
  "payload": {
    "title": "Automated Vault Embedded Search Sync",
    "description": "Refresh local RAG vector cache for newly modified study notes.",
    "subsystem": "Knowledge",
    "autoExecute": true
  }
}
```

---

## 3. Real-Time Telemetry Endpoints

- **`GET /api/stream/events` / `GET /api/aegis/stream`**: Server-Sent Events stream delivering real-time platform telemetry directly to connected clients.
- **`GET /api/companion/reasoning`**: Exposes the continuous AI reasoning trace history.
- **`GET /api/companion/suggestions`**: Exposes pending autonomous system suggestions.
