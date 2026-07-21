# AEGISOS Audit Engine Specification

## Overview

The Audit Engine records tamper-resistant, immutable audit logs for all security-relevant decisions and execution events in AEGISOS.

---

## Audit Record Schema

```json
{
  "auditId": "aud_1784651389813_8o36",
  "category": "permission",
  "action": "tool_git_status",
  "requester": "sys_bootstrapper",
  "decision": "allow",
  "details": {
    "policyId": "pol_git_read",
    "reason": "Allow Git Status Query"
  },
  "timestamp": "2026-07-21T21:59:49.813Z"
}
```
