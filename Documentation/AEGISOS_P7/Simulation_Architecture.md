# AEGISOS v0.4.5 — ADR-006: Decision Simulation Engine Architecture

## Overview

The Decision Simulation Engine (DSE) is the mental sandbox and virtual validation layer of AEGISOS. It receives structured plans from the Executive Planner and simulates their execution virtually before any action reaches an autonomous agent.

**STRICT PRINCIPLE**: Virtual simulation only. The DSE **NEVER PERFORMS REAL EXECUTION**. It does NOT execute shell commands, call MCP tools, mutate databases, or modify files. Everything remains virtual.

---

## Subsystem Architecture

```
                               ┌────────────────────────────────┐
                               │       Executive Planner        │
                               │      (Generated Plans)         │
                               └───────────────┬────────────────┘
                                               │
                               ┌───────────────▼────────────────┐
                               │   Simulation Runtime Sandbox   │
                               └───────────────┬────────────────┘
                                               │
┌──────────────────────────────────────────────┴──────────────────────────────────────────────┐
│                                     Simulation Modules                                      │
├─────────────────────┬─────────────────────┬─────────────────────┬───────────────────────────┤
│   Scenario Engine   │  Outcome Predictor  │Constraint Validator │     Conflict Detector     │
│(Branching Scenarios)│(Probability & Time) │(Resource & System)  │(Circular & Parallel Risk) │
├─────────────────────┼─────────────────────┼─────────────────────┼───────────────────────────┤
│ Resource Estimator  │    Risk Analyzer    │Permission Validator │        Plan Scorer        │
│(CPU/RAM/Disk/Cost)  │(Security/Data Loss) │ (Required Actions)  │ (Final Approval & Score)  │
└─────────────────────┴─────────────────────┴─────────────────────┴───────────────────────────┘
                                               │
                               ┌───────────────▼────────────────┐
                               │     Simulation API Facade      │
                               │      (/api/simulation/*)       │
                               └────────────────────────────────┘
```

---

## Core Modules

### 1. Simulation Runtime (`SimulationRuntime.js`)
- Isolated sandbox environment that executes plan simulations.
- Produces comprehensive virtual simulation reports with zero side effects.

### 2. Scenario Engine (`ScenarioEngine.js`)
- Generates hypothetical scenarios (`Nominal Execution`, `Task Timeout Failure`, `Resource Surge Edge Case`).

### 3. Outcome Predictor (`OutcomePredictor.js`)
- Predicts success probability (`0.0 - 1.0`), estimated completion time, likely blockers, and confidence scores.

### 4. Constraint Validator (`ConstraintValidator.js`)
- Checks system constraints (`offlineMode`, `memoryHigh`, `gpuBusy`, restricted actions).

### 5. Conflict Detector (`ConflictDetector.js`)
- Detects circular dependencies, duplicate task IDs, or resource contention across plan tasks.

### 6. Resource Estimator (`ResourceEstimator.js`)
- Estimates CPU usage (%), RAM (MB), Disk (MB), duration (s), and estimated API cost ($).

### 7. Risk Analyzer (`RiskAnalyzer.js`)
- Assigns risk levels (`Critical`, `High`, `Medium`, `Low`, `Negligible`) based on security and data loss risks.

### 8. Permission Validator (`PermissionValidator.js`)
- Validates required action permissions (`read_file`, `write_file`, `git_commit`, `terminal_exec`).

### 9. Plan Scorer (`PlanScorer.js`)
- Scores plans (0-100) and produces approval status: `Approved`, `Conditional Approval`, or `Rejected`.

### 10. Simulation Storage (`SimulationStorage.js`)
- Persists simulation reports to SQLite table `simulation_reports`.
