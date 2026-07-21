# AEGISOS v0.8.0 — ADR-011: Governance & Trust Platform Architecture

## Overview

The Governance & Trust Platform (GTP) is the security backbone and central policy authority of AEGISOS, managing permissions, trust scores, identities, approval gates, secret metadata, audit logs, and compliance.

**STRICT PRINCIPLE**: Every execution request must pass through GTP before reaching Tool Runtime HAL. Nothing executes without policy.

---

## Subsystem Architecture

```
                               ┌────────────────────────────────┐
                               │       Decision Simulation      │
                               │        (Validated Plan)        │
                               └───────────────┬────────────────┘
                                               │
                               ┌───────────────▼────────────────┐
                               │  Governance & Trust Platform   │
                               └───────────────┬────────────────┘
                                               │
┌──────────────────────────────────────────────┴──────────────────────────────────────────────┐
│                                  Governance Platform Modules                                │
├─────────────────────┬─────────────────────┬─────────────────────┬───────────────────────────┤
│    Policy Engine    │    Trust Engine     │  Identity Manager   │       Audit Engine        │
│(Declarative Rules)  │(Score Evaluation)   │ (Auth & Session Tokens(Immutable Event Log)     │
├─────────────────────┼─────────────────────┼─────────────────────┼───────────────────────────┤
│   Secret Manager    │  Security Monitor   │  Compliance Engine  │    Governance Storage     │
│(Masked Credentials) │(Threat & Abuse Alert(Workspace Rules)     │ (SQLite Log & Policy DB)  │
└─────────────────────┴─────────────────────┴─────────────────────┴───────────────────────────┘
                                               │
                               ┌───────────────▼────────────────┐
                               │     Tool Runtime HAL Layer     │
                               │        (Execution Gate)        │
                               └────────────────────────────────┘
```

---

## Core Modules

### 1. Declarative Policy Engine (`PolicyEngine.js`)
- Evaluates execution requests against priority-ranked policies (`ALLOW`, `DENY`, `ASK_USER`).

### 2. Entity Trust Engine (`TrustEngine.js`)
- Maintains trust scores $[0.0 - 1.0]$ for agents, tools, plugins, models, and workflows.

### 3. Identity Manager (`IdentityManager.js`)
- Manages authenticated identities across `USER`, `AGENT`, `SERVICE`, and `SYSTEM`.

### 4. Secret Manager (`SecretManager.js`)
- Handles encrypted secret metadata without exposing raw credentials directly to agent prompts.

### 5. Immutable Audit Engine (`AuditEngine.js`)
- Records tamper-resistant audit entries for every plan, simulation, tool invocation, permission request, denial, and approval.

### 6. Security Threat Monitor (`SecurityMonitor.js`)
- Detects permission abuse, repeated failures, policy violations, and unauthorized execution attempts.

### 7. Compliance Engine (`ComplianceEngine.js`)
- Enforces workspace isolation rules, data retention policies, and privacy consent tracking.

### 8. SQLite Storage (`GovernanceStorage.js`)
- Persists policies, audit records, and security alerts in SQLite tables `governance_policies` and `governance_audit_logs`.
