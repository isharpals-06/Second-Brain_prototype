# AEGISOS — Cognitive Memory Architecture (docs/007-Memory-System.md)
**Document Version:** 1.0  
**Status:** CONSTITUTIONAL MANDATE  

---

## 1. Six-Layer Cognitive Memory Hierarchy

Memory in AEGISOS is not documents or markdown files. Memory is **structured cognitive state** divided into 6 distinct functional layers:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                        6-LAYER MEMORY HIERARCHY                         │
├─────────────┬─────────────────────────────────────────────┬─────────────┤
│ Layer       │ Primary Contents & Scope                    │ Expiration  │
├─────────────┼─────────────────────────────────────────────┼─────────────┤
│ 1. SESSION   │ Current interaction, active reasoning context│ Auto-purged │
│ 2. WORKING   │ Running agents, planner state, goals queue  │ Application │
│ 3. EPISODIC  │ Execution logs, user actions, system events │ Persistent  │
│ 4. SEMANTIC  │ Knowledge concepts, entity relationships    │ Persistent  │
│ 5. PROCEDURAL│ Execution recipes, tool reliability patterns│ Consolidated│
│ 6. IDENTITY  │ Core preferences, design philosophy, vision │ Permanent   │
└─────────────┴─────────────────────────────────────────────┴─────────────┘
```

---

## 2. Memory Subsystems & Engines

- **`CognitiveMemoryEngine.js`:** Unified API for reading and writing across all 6 layers backed by SQLite database tables.
- **`MemoryConsolidationEngine.js`:** Runs periodic pruning passes, merges duplicate semantic memories, and reinforces procedural confidence scores.
- **`HybridRetrievalEngine.js`:** Multi-factor memory retrieval combining BM25 keyword matching, vector embedding distances, and recency/importance weighting.
