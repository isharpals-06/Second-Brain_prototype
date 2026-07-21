# AEGISOS Phase 17 — Unified Startup Flow

```
┌─────────────────────────────────────────────────────────┐
│                      Boot Loader                        │
│          `initializeAegisCore()` (Kernel Core)          │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│              Database Engine Initialization             │
│            `node:sqlite` (`DatabaseSync`)               │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│           Platform Subsystems Initialization            │
│  (Sentinel, World Model, Knowledge, Planner, Sim,       │
│   Agent Runtime, Tool HAL, Workflow, Memory OS,         │
│   Governance, Automation, Production Diagnostics)       │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│               REST API Endpoints Mount                  │
│             `/api/*` Subsystem API Routes               │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│             Static Serving & SPA Fallback               │
│    `express.static(dist)` + `app.get('*', index.html)`   │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    Cockpit Launch                       │
│    Server listening on `http://localhost:3010` (60 FPS) │
└─────────────────────────────────────────────────────────┘
```
