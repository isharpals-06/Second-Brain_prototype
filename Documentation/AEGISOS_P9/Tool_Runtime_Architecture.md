# AEGISOS v0.5.5 — ADR-008: Tool Runtime Architecture

## Overview

The Tool Runtime is the hardware abstraction layer (HAL) of AEGISOS and the ONLY subsystem allowed to interact with external resources (Filesystem, Terminal, Git, SQLite, RAG, Ollama LLM, MCP servers, Web Search).

**STRICT PRINCIPLE**: Agents NEVER call tools directly. Agents submit Tool Requests (`ToolRequest`). The Tool Runtime validates, schedules, sandboxes, executes, monitors, and normalizes outputs.

---

## Subsystem Architecture

```
                               ┌────────────────────────────────┐
                               │         Agent Runtime          │
                               │        (Tool Requests)         │
                               └───────────────┬────────────────┘
                                               │
                               ┌───────────────▼────────────────┐
                               │     Tool Runtime HAL Layer     │
                               └───────────────┬────────────────┘
                                               │
┌──────────────────────────────────────────────┴──────────────────────────────────────────────┐
│                                      Tool Runtime Modules                                   │
├─────────────────────┬─────────────────────┬─────────────────────┬───────────────────────────┤
│    Tool Registry    │    Tool Manager     │  Execution Engine   │    Permission Gateway     │
│(Filesystem, Git, LLM│(Registration/Load)  │ (Execution Queue)   │ (Permission Enforcement)  │
├─────────────────────┼─────────────────────┼─────────────────────┼───────────────────────────┤
│  Resource Gateway   │   Sandbox Manager   │   Result Pipeline   │       Tool Storage        │
│(Access & Path Checks│(Dry Run & Read Only)│(Normalized Output)  │(SQLite Execution Logs)    │
└─────────────────────┴─────────────────────┴─────────────────────┴───────────────────────────┘
                                               │
                               ┌───────────────▼────────────────┐
                               │        Tool API Facade         │
                               │         (/api/tools/*)         │
                               └────────────────────────────────┘
```

---

## Core Modules

### 1. Standard Tool Interface (`ToolBase.js`)
- Enforces standard lifecycle interface: `register()`, `initialize()`, `validate()`, `prepare()`, `execute()`, `cancel()`, `cleanup()`, `dispose()`, `health()`, `metadata()`, `version()`, `capabilities()`, `permissions()`.

### 2. Built-in Tools (`server/toolRuntime/tools/`)
- `FileReadTool.js` (Filesystem category)
- `FileWriteTool.js` (Filesystem category)
- `GitStatusTool.js` (Git category)
- `VaultSearchTool.js` (RAG category)

### 3. Tool Registry & Manager (`ToolRegistry.js` & `ToolManager.js`)
- Maintains tool categories and instances.

### 4. Permission Gateway (`PermissionGateway.js`)
- Evaluates execution permissions against policies (`Allow`, `Deny`, `Ask User`).

### 5. Resource Gateway (`ResourceGateway.js`)
- Validates path security, memory limits, and credentials.

### 6. Sandbox Manager (`SandboxManager.js`)
- Virtual sandbox modes (`Standard`, `Dry Run`, `Read-only Mode`).

### 7. Execution Engine (`ExecutionEngine.js`)
- Orchestrates pipeline: `ToolRequest -> PermissionGateway -> ResourceGateway -> SandboxManager -> ToolBase.execute() -> ResultPipeline`.

### 8. Result Pipeline (`ResultPipeline.js`)
- Formats normalized tool output DTOs (`executionId`, `toolId`, `status`, `durationMs`, `output`, `artifacts`, `errors`).

### 9. SQLite Storage (`ToolStorage.js`)
- Persists execution logs in SQLite table `tool_execution_logs`.
