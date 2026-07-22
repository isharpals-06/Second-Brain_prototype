# AEGISOS Phase 18 — Frontend Architecture Specification

This document details the rearchitected frontend layout, state model, and workspace system of AEGISOS v1.0.0.

---

## 1. Architectural Overview

AEGISOS adopts a **Single Operating System Shell Architecture** (`CockpitShell`). The application layout is no longer a standalone Study Dashboard; it is a unified AI Operating System shell housing 10 dedicated Workspaces.

```
+-----------------------------------------------------------------------------------+
| TopBar: System Status | Breadcrumbs | Global Spotlight Trigger | Quick Actions     |
+-------------------+-------------------------------------------+-------------------+
| Sidebar           | Main Workspace Canvas                     | Right Inspector   |
| - Core            |                                           |                   |
|   Mission Control | - Mission Control Telemetry Matrix        | - Active Focus    |
|   Knowledge       | - Knowledge Suite (Notes, Chat, Brief)    | - System Diags    |
| - Subsystems      | - Executive Planner Queue                 | - Governance Gate |
|   Planner         | - Agent Process Runtime                   |                   |
|   Agents          | - Memory OS & Reflection Engine           |                   |
|   Memory          | - Workflow State Machine                  |                   |
|   Workflows       | - Autonomous Automation                   |                   |
|   Automation      | - Governance & Policy Rules               |                   |
|   Governance      | - Tool Runtime HAL                        |                   |
|   Tools           | - System Settings                         |                   |
| - System          |                                           |                   |
|   Settings        |                                           |                   |
+-------------------+-------------------------------------------+-------------------+
| BottomConsole: Docked System Event Stream & Telemetry Output                      |
+-----------------------------------------------------------------------------------+
```

---

## 2. Shell Components

- **CockpitShell (`src/components/shell/CockpitShell.jsx`)**: The master container controlling top-level layout, workspace routing state, command palette triggers, and docked console states.
- **TopBar (`src/components/shell/TopBar.jsx`)**: Displays AEGISOS version breadcrumbs, connection health, LLM provider status, command spotlight trigger (`Ctrl+K`), system backup action, and console/inspector toggles.
- **Sidebar (`src/components/shell/Sidebar.jsx`)**: Left navigation drawer categorizing 10 system workspaces under **Core**, **Subsystems**, and **System**.
- **CommandPalette (`src/components/shell/CommandPalette.jsx`)**: `Ctrl+K` command spotlight enabling instant keyboard navigation, note searches, and system action execution.
- **RightInspector (`src/components/shell/RightInspector.jsx`)**: Context-sensitive side drawer for active workspace diagnostics, policy status, and telemetry details.
- **BottomConsole (`src/components/shell/BottomConsole.jsx`)**: Docked, collapsible terminal streaming live Sentinel perception events, workflow state transitions, and server logs.

---

## 3. Workspace System

Existing study features are preserved inside **KnowledgeWorkspace** without breaking changes:
- `DailyBrief.jsx` — AI-generated daily study agenda & system brief
- `DashboardOverview.jsx` — Course overview & recent vault notes
- `NotesExplorer.jsx` — Obsidian markdown vault reader & graph viewer
- `AIChatConsole.jsx` — Multi-model cognitive chat & contextual RAG
- `CoprocessorConsole.jsx` — PDF slide parser & atomic note generator
- `FlashcardsView.jsx` — SM-2 spaced repetition active recall cards
