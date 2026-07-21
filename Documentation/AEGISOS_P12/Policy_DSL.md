# AEGISOS Declarative Policy DSL Guide

All security and access control policies in AEGISOS are specified declaratively.

---

## Policy Object Schema

```json
{
  "id": "pol_file_write",
  "name": "Ask Approval on File Write",
  "action": "tool_file_write",
  "effect": "ask_user",
  "priority": 50,
  "scope": "workspace",
  "conditions": {
    "pathPattern": "C:\\Users\\ishar\\Projects\\*"
  }
}
```

---

## Supported Policy Effects

- `allow`: Grants execution access immediately.
- `deny`: Blocks execution and generates a security violation alert.
- `ask_user`: Pauses execution and enqueues an approval gate.
