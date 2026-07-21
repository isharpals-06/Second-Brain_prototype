# AEGISOS v1.0.0 — General Availability (GA) Master Architecture Guide

## Overview

AEGISOS is a production-grade Autonomous AI Operating System built upon a 12-platform decoupled architecture.

---

## 12 Core Platforms

```
                               ┌────────────────────────────────┐
                               │   Governance & Trust Platform  │
                               │  (Central Policy Authority)    │
                               └───────────────┬────────────────┘
                                               │
┌──────────────────────────────────────────────┴──────────────────────────────────────────────┐
│                                  AEGISOS Platform Subsystems                                │
├──────────────────────┬──────────────────────┬──────────────────────┬────────────────────────┤
│    Sentinel Core     │  World Model Engine  │   Knowledge Graph    │   Executive Planner    │
│(Perception Observers)│(Deterministic State) │ (Canonical Entities) │ (Goal Formulation)     │
├──────────────────────┼──────────────────────┼──────────────────────┼────────────────────────┤
│  Simulation Engine   │    Agent Runtime     │   Tool Runtime HAL   │   Workflow Platform    │
│  (Virtual Sandbox)   │ (Hosted Agent Loop)  │ (Hardware Execution) │ (Step State Machine)   │
├──────────────────────┼──────────────────────┼──────────────────────┼────────────────────────┤
│      Memory OS       │ AEGIS Cockpit UI/API │ Automation Platform  │ Production Diagnostics │
│(Long-Term Experience)│ (Mission Control)    │ (Policy-Aware Loops) │ (System Telemetry)     │
└──────────────────────┴──────────────────────┴──────────────────────┴────────────────────────┘
```

---

## Subsystem Directory Structure

- `server/core/`: Kernel EventBus, ContextEngine, AgentManager, ServiceRegistry, SkillRegistry
- `server/sentinel/`: ObserverRegistry, ObserverManager, Observer base & 6 active observers
- `server/worldModel/`: SessionEngine, ProjectManager, WorkspaceManager, RelationshipEngine, Timeline, Snapshots
- `server/knowledge/`: EntityRegistry, RelationshipRegistry, VectorStore, EmbeddingService, GraphQueryEngine
- `server/planner/`: IntentEngine, GoalEngine, PriorityEngine, PlanningEngine, DecisionEngine
- `server/simulation/`: SimulationRuntime, ScenarioEngine, RiskAnalyzer, PlanScorer, Virtual Sandbox
- `server/agentRuntime/`: AgentBase, AgentRegistry (5 system agents), LifecycleManager, AgentScheduler
- `server/toolRuntime/`: ToolBase, Built-in HAL Tools, Permission/Resource Gateways, ExecutionEngine
- `server/workflow/`: StateMachine, StepExecutor, WorkflowRegistry, ApprovalManager, CheckpointManager
- `server/memory/`: Multi-Type Store, MemoryScorer, RetrievalEngine, ConsolidationEngine, ReflectionEngine
- `server/governance/`: PolicyEngine, TrustEngine, IdentityManager, SecretManager, AuditEngine, SecurityMonitor
- `server/automation/`: TriggerEngine, Scheduler, EventEngine, PolicyExecutor, RollbackManager
- `server/production/`: SystemDiagnostics, ProductionAPI
