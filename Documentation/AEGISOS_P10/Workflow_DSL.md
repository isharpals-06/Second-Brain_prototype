# AEGISOS Declarative Workflow DSL Guide

All AEGISOS workflows are defined declaratively as JSON/JS schemas.

---

## Workflow Template Schema

```json
{
  "id": "wf_research_pipeline",
  "name": "Research Paper Pipeline",
  "description": "Searches vault notes, extracts concepts, and indexes PDF papers",
  "version": "1.0.0",
  "steps": [
    {
      "id": "s1",
      "title": "Search Vault Notes",
      "type": "tool",
      "toolId": "tool_vault_search",
      "inputs": { "query": "Operating Systems" }
    },
    {
      "id": "s2",
      "title": "Save Checkpoint",
      "type": "checkpoint"
    },
    {
      "id": "s3",
      "title": "Organize Notes via Librarian Agent",
      "type": "agent",
      "agentId": "agent_librarian"
    }
  ]
}
```

---

## Supported Step Types

- `agent`: Invokes an agent process hosted in Agent Runtime.
- `tool`: Executes a tool registered in Tool Runtime HAL.
- `approval`: Pauses workflow and requests approval gate from user/system.
- `checkpoint`: Saves execution snapshot for crash recovery.
