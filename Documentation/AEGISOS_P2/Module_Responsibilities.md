# AEGISOS v0.1.5 — Module Responsibilities Matrix

## Core Server Modules (`90_System/dashboard/server/`)

| Module Path | Primary Responsibility | Input / Exports |
| :--- | :--- | :--- |
| `server/config/index.js` | Environment configuration manager (`dev`, `test`, `prod`) | Exports `config` object |
| `server/core/logger.js` | Formatted structured logger (`DEBUG`, `INFO`, `WARN`, `ERROR`) | Exports `aegisLogger`, `Logger` |
| `server/core/errors.js` | Standardized error classes and error codes | Exports `AegisError`, `ErrorCodes` |
| `server/core/types.js` | System event names, service names, and agent state constants | Exports `SystemEvents`, `ServiceNames`, `AgentStatus` |
| `server/core/eventBus.js` | Server-side pub/sub event distribution & event catalog | Exports `serverEventBus`, `EventBus` |
| `server/core/contextEngine.js` | Centralized server runtime state management & snapshots | Exports `serverContextEngine`, `ContextEngine` |
| `server/core/serviceRegistry.js` | Service registration, lazy loading, and dependency injection | Exports `serverServiceRegistry`, `ServiceRegistry` |
| `server/core/agentManager.js` | Agent lifecycle management, health checks, and task metrics | Exports `serverAgentManager`, `AgentManager` |
| `server/core/skillRegistry.js` | Capability registration, skill versioning, and permission checks | Exports `serverSkillRegistry`, `SkillRegistry` |
| `server/core/initCore.js` | Server boot initializer wiring default services, agents & skills | Exports `initializeAegisCore` |

---

## Core Client Modules (`90_System/dashboard/src/`)

| Module Path | Primary Responsibility | Input / Exports |
| :--- | :--- | :--- |
| `src/config/index.js` | Client environment configuration parameters | Exports `clientConfig` |
| `src/core/utils/logger.js` | Browser console structured logger | Exports `aegisClientLogger`, `ClientLogger` |
| `src/core/utils/errors.js` | Client-side AegisError class and error codes | Exports `AegisError`, `ErrorCodes` |
| `src/types/index.js` | Client event names, service names, and state constants | Exports `SystemEvents`, `ServiceNames`, `AgentStatus` |
| `src/core/eventBus/EventBus.js` | Client-side event bus engine | Exports `clientEventBus`, `ClientEventBus` |
| `src/core/context/ContextEngine.js` | Client-side runtime context manager | Exports `clientContextEngine`, `ClientContextEngine` |
| `src/core/services/ServiceRegistry.js` | Client-side service registry | Exports `clientServiceRegistry`, `ClientServiceRegistry` |
| `src/core/agents/AgentManager.js` | Client-side agent lifecycle registry | Exports `clientAgentManager`, `ClientAgentManager` |
| `src/core/skills/SkillRegistry.js` | Client-side capability registry | Exports `clientSkillRegistry`, `ClientSkillRegistry` |
| `src/core/context/AegisContext.jsx` | React Context provider exposing `useAegis()` hook | Exports `AegisProvider`, `useAegis` |
