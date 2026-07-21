# AEGISOS Entity Trust Model Specification

## Overview

The Trust Engine assigns and dynamically updates trust scores $[0.0 - 1.0]$ for all system entities (agents, tools, plugins, models, workflows).

---

## Dynamic Score Adjustments

- **Successful Execution**: $+0.01$ boost (capped at $1.0$).
- **Failed Execution / Denial**: $-0.05$ penalty (floored at $0.1$).

---

## Initial Entity Trust Rankings

| Entity ID | Entity Category | Initial Trust Score |
| :--- | :--- | :--- |
| `agent_monitoring` | Agent Process | `0.98` |
| `tool_git_status` | HAL Tool | `0.99` |
| `agent_librarian` | Agent Process | `0.95` |
| `tool_file_read` | HAL Tool | `0.95` |
| `agent_reviewer` | Agent Process | `0.92` |
| `agent_coprocessor` | Agent Process | `0.90` |
| `agent_research` | Agent Process | `0.88` |
| `tool_file_write` | HAL Tool | `0.85` |
