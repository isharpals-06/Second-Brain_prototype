# AEGISOS Workflow State Machine Specification

## Overview

The State Machine enforces valid, explicit lifecycle state transitions for workflow instances.

---

## State Diagram

```
[ PENDING ] ─────► [ READY ] ─────► [ RUNNING ] ─────► [ COMPLETED ]
     │                                  │
     │                                  ├─────► [ WAITING ] ──► [ APPROVED ] ──► [ RUNNING ]
     │                                  │            │
     │                                  │            └────────► [ REJECTED ] ──► [ FAILED ]
     │                                  │
     │                                  ├─────► [ PAUSED ] ───► [ RUNNING ]
     │                                  │
     │                                  ├─────► [ RETRYING ] ─► [ RUNNING ]
     │                                  │
     └──────────────────────────────────┴─────► [ CANCELLED / FAILED / TIMED_OUT ]
```

---

## States Summary

- `PENDING`: Created, awaiting scheduling.
- `READY`: Validated and queued for step execution.
- `RUNNING`: Executing step loop.
- `WAITING`: Paused on an approval gate.
- `APPROVED`: Gate approved, ready to resume.
- `REJECTED`: Gate rejected.
- `PAUSED`: Paused manually.
- `RETRYING`: Retrying step after transient error.
- `COMPLETED`: All steps executed successfully.
- `FAILED`: Execution terminated with error.
- `CANCELLED`: User/system aborted instance.
- `TIMED_OUT`: Instance exceeded execution timeout limit.
