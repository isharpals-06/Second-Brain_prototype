# AEGISOS Phase 17 — Canonical Route Map

## Canonical Entry Point

- `GET /`: Serves AEGIS Cockpit Mission Control SPA (`dist/index.html`).
- `GET /*`: Client-side SPA navigation fallback.

---

## Unified Subsystem REST API Map

- `/api/system/*`: System Health, Diagnostics & Version Metadata
- `/api/sentinel/*`: Perception Observers & Normalized Event Feed
- `/api/world/*`: World Model State, Session Engine & Project Timelines
- `/api/knowledge/*`: Knowledge Graph Entities, Properties & Vector Index
- `/api/planner/*`: Executive Planner Goals, Intents & Plans
- `/api/simulation/*`: Virtual Sandbox Reports, Risk Analysis & Plan Scoring
- `/api/agents/*`: Agent Runtime Process Lifecycles & Scheduling
- `/api/tools/*`: Hardware Abstraction Layer (HAL) Execution & Permission Gateways
- `/api/workflows/*`: Workflow State Machine, Step Executor & Checkpoints
- `/api/memory/*`: Memory OS Multi-Type Store, Retrieval & Reflection Reports
- `/api/governance/*`: Governance & Trust Policies, Audit Log & Security Monitor
- `/api/automation/*`: Autonomy Levels (L0-L4), Triggers, Schedulers & Rollbacks
