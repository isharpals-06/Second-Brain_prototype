# AEGISOS — Phase 1: Architecture Specification

## Overview

AEGISOS evolves from a static knowledge base into a local-first AI Agent Operating System inspired by the JARVIS architecture. Phase 1 establishes the foundational service-oriented architecture, decoupling components and standardizing inter-layer communication without breaking existing functional features (Dashboard, Spaced Repetition, Chat, Coprocessor, SQLite, RAG, Chokidar Watcher).

---

## Architectural Layers

```
                                ┌───────────────────────────┐
                                │          UI Layer         │
                                │  (React 19 / AegisCtx)    │
                                └─────────────┬─────────────┘
                                              │
┌─────────────────────────────────────────────▼─────────────────────────────────────────────┐
│                                     AEGISOS Core Bus                                      │
├───────────────────┬───────────────────┬───────────────────┬───────────────────────────────┤
│    Event Bus      │  Context Engine   │   Agent Manager   │       Skill Registry          │
│ (Pub/Sub Engine)  │  (Runtime State)  │(Lifecycle Engine) │     (Reusable Capabilities)   │
└─────────┬─────────┴─────────┬─────────┴─────────┬─────────┴───────────────┬───────────────┘
          │                   │                   │                         │
┌─────────▼───────────────────▼───────────────────▼─────────────────────────▼───────────────┐
│                                   Service Registry Layer                                  │
├───────────────────┬───────────────────┬───────────────────┬───────────────────────────────┤
│ Database (SQLite) │ Vault Observer    │ Vector RAG Engine │ Model Router (Ollama/Gemini)  │
└───────────────────┴───────────────────┴───────────────────┴───────────────────────────────┘
```

---

## Core Components

### 1. Event Bus (`EventBus`)
- **Location**: `server/core/eventBus.js` & `src/core/eventBus/EventBus.js`
- **Purpose**: Provides a decoupled publish/subscribe event network across client and server.
- **Key Events**:
  - `APPLICATION_STARTED`, `APPLICATION_SHUTDOWN`
  - `NOTE_CREATED`, `NOTE_UPDATED`, `NOTE_DELETED`, `FILE_CHANGED`
  - `CHAT_MESSAGE`, `FLASHCARD_REVIEWED`, `MODEL_CHANGED`, `PROJECT_OPENED`
  - `SERVICE_STARTED`, `SERVICE_STOPPED`, `AGENT_REGISTERED`, `SKILL_EXECUTED`

### 2. Context Engine (`ContextEngine`)
- **Location**: `server/core/contextEngine.js` & `src/core/context/ContextEngine.js`
- **Purpose**: Centralized runtime state provider.
- **State Keys**: `activeProject`, `activeWorkspace`, `activeNote`, `activeRepository`, `currentModel`, `activeProvider`, `activeConversationId`, `userState`, `systemHealth`.

### 3. Agent Manager (`AgentManager`)
- **Location**: `server/core/agentManager.js` & `src/core/agents/AgentManager.js`
- **Purpose**: Lifecycle registration and status tracking for autonomous agents.
- **APIs**: `register()`, `unregister()`, `enable()`, `disable()`, `status()`, `heartbeat()`, `list()`.

### 4. Service Registry (`ServiceRegistry`)
- **Location**: `server/core/serviceRegistry.js` & `src/core/services/ServiceRegistry.js`
- **Purpose**: Enables dynamic discovery of internal services without hardcoded circular dependencies.
- **Registered Services**: `Database` (SQLite), `Watcher` (Chokidar), `RAG` (Vector Engine), `Chat` (Model Router).

### 5. Skill Registry (`SkillRegistry`)
- **Location**: `server/core/skillRegistry.js` & `src/core/skills/SkillRegistry.js`
- **Purpose**: Framework for registering and executing reusable AI agent capabilities.
- **Registered Capabilities**:
  - `summarize`: Summarizes raw note text.
  - `search_notes`: Queries subject MOCs and concept markdown files.
  - `generate_flashcards`: Extracts active recall flashcards (`::` / `??`).
  - `refactor_notes`: Formats YAML frontmatter and LaTeX math notation.
  - `commit_to_vault`: Writes atomic markdown notes to `10_Subjects/`.
  - `review_flashcards`: Calculates SM-2 interval and due dates for cards.

---

## API Layer Extensions

AEGISOS Phase 1 exposes standardized REST inspection endpoints:
- `GET /api/aegis/status` — Returns system health, registered services, active agents, available skills, and current context state.
- `GET /api/aegis/events` — Retrieves recent EventBus event logs.
- `GET /api/aegis/agents` — Returns list of registered agent definitions.
- `GET /api/aegis/skills` — Returns list of registered capabilities.
- `POST /api/aegis/skills/execute` — Executes a skill by ID with custom parameters.
- `POST /api/aegis/context` — Updates a context engine key-value pair.
