# AEGISOS v0.7.0 — ADR-010: Memory OS Architecture

## Overview

Memory OS is the canonical long-term memory service for AEGISOS. It is responsible for storing, organizing, retrieving, consolidating, and evolving experience across the operating system.

**STRICT PRINCIPLE**: Memory becomes a first-class operating system service. No subsystem except Memory OS owns long-term memory.

---

## Subsystem Architecture

```
                               ┌────────────────────────────────┐
                               │   Workflow Orchestration      │
                               │        & Agent Runtime         │
                               └───────────────┬────────────────┘
                                               │
                               ┌───────────────▼────────────────┐
                               │          Memory OS HAL         │
                               └───────────────┬────────────────┘
                                               │
┌──────────────────────────────────────────────┴──────────────────────────────────────────────┐
│                                     Memory OS Subsystems                                    │
├─────────────────────┬─────────────────────┬─────────────────────┬───────────────────────────┤
│    Memory Store     │    Memory Scorer    │  Retrieval Engine   │   Consolidation Engine    │
│(Multi-Type Objects) │(Composite Scoring)  │  (Hybrid Ranking)   │ (Synthesized Knowledge)   │
├─────────────────────┼─────────────────────┼─────────────────────┼───────────────────────────┤
│  Reflection Engine  │  Forgetting Engine  │  Experience Store   │      Memory Storage       │
│(Lessons & Patterns) │(Audit-Logged Purge) │(Execution History)  │(SQLite Objects & Log DB)  │
└─────────────────────┴─────────────────────┴─────────────────────┴───────────────────────────┘
                                               │
                               ┌───────────────▼────────────────┐
                               │        Memory API Facade       │
                               │        (/api/memory/*)         │
                               └────────────────────────────────┘
```

---

## Core Modules

### 1. Multi-Type Memory Store (`MemoryStore.js`)
- Supports `Semantic`, `Procedural`, `Episodic`, `Conversation`, `Project`, `Research`, `Skill`, `Preference`, `Workflow`, `Error`, `Recovery`, `Learning` memory types.

### 2. Memory Scorer (`MemoryScorer.js`)
- Calculates weighted composite scores based on importance, confidence, recency decay, and usage frequency.

### 3. Hybrid Retrieval Engine (`RetrievalEngine.js`)
- Searches and ranks memory objects across titles, summaries, tags, types, and importance thresholds.

### 4. Consolidation Engine (`ConsolidationEngine.js`)
- Synthesizes raw episodic/conversation entries into consolidated learnings while preserving provenance.

### 5. Reflection Engine (`ReflectionEngine.js`)
- Generates periodic reflection reports: Lessons Learned, Repeated Mistakes, Successful Patterns, Knowledge Gaps, Suggested Optimizations.

### 6. Forgetting Engine (`ForgettingEngine.js`)
- Manages memory lifecycle deletion, archiving, and privacy purges with mandatory audit logs.

### 7. Experience Store (`ExperienceStore.js`)
- Logs execution history, plan outcomes, simulation results, agent outcomes, and tool logs.

### 8. SQLite Storage (`MemoryStorage.js`)
- Persists memory objects and experience records in SQLite tables `memory_objects` and `experience_records`.
