# AEGISOS Memory Object Schema Guide

All memories stored in Memory OS adhere to the standard Memory Object Schema.

---

## Memory Object DTO

```json
{
  "id": "mem_arch_aegisos",
  "type": "learning",
  "title": "AEGISOS Autonomous Subsystem Architecture",
  "summary": "AEGISOS core architecture follows strict layered decoupling across Sentinel, World Model, Knowledge Graph, Executive Planner, Simulation Engine, Agent Runtime, Tool Runtime HAL, Workflow Platform, and Memory OS.",
  "timestamp": "2026-07-21T21:55:00.000Z",
  "source": "System Architecture Specification",
  "confidence": 0.95,
  "importance": 0.9,
  "accessCount": 10,
  "score": 0.88,
  "tags": ["architecture", "aegisos", "kernel"],
  "lifecycleStatus": "active",
  "version": "1.0.0"
}
```

---

## Supported Memory Types

- `semantic`: Factual, conceptual knowledge.
- `procedural`: Operational procedures and rules.
- `episodic`: Event history and session episodes.
- `conversation`: Inter-agent and user dialogs.
- `project`: Project milestone memories.
- `research`: Research paper & document insights.
- `skill`: Agent capability memories.
- `preference`: System and user preferences.
- `workflow`: Workflow execution outcomes.
- `error`: Diagnostic error memories.
- `recovery`: Failure recovery records.
- `learning`: Synthesized lessons learned.
