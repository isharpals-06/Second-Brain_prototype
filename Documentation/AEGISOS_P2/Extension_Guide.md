# AEGISOS v0.1.5 — System Extension Guide

## Overview

This guide details how to extend AEGISOS with lazy-loaded services, versioned skills, permission checks, and agent health monitors.

---

## 1. Registering a Lazy Service with Dependencies

Use `registerLazy` to defer instantiation until the service is actually requested:

```javascript
import { serverServiceRegistry } from './core/serviceRegistry.js';

serverServiceRegistry.registerLazy(
  'Planner',
  (deps) => {
    const db = deps.Database;
    return {
      createPlan: (goal) => {
        console.log('Plan created using DB connection');
      }
    };
  },
  ['Database'] // Dependencies resolved automatically before factory runs
);

// Accessing service (triggers lazy factory resolution)
const planner = serverServiceRegistry.get('Planner');
```

---

## 2. Registering a Versioned Skill with Required Permissions

```javascript
import { serverSkillRegistry } from './core/skillRegistry.js';

serverSkillRegistry.registerSkill({
  id: 'vault_write',
  name: 'Atomic Note File Commit',
  version: '1.2.0',
  category: 'Storage',
  description: 'Writes markdown files to 10_Subjects/',
  requiredPermissions: ['vault:write', 'vault:index'],
  handler: async (params, context) => {
    return { success: true, file: params.filename };
  }
});

// Permission validation check
const hasPermission = serverSkillRegistry.validatePermissions('vault_write', ['vault:write', 'vault:index']);
```

---

## 3. Agent Health Tracking & Capabilities Discovery

```javascript
import { serverAgentManager } from './core/agentManager.js';

// Search agents by capability
const filingAgents = serverAgentManager.findByCapability('refactor_notes');

// Record heartbeat
serverAgentManager.heartbeat('agent_librarian');

// Record metrics
serverAgentManager.recordTaskExecution('agent_librarian', true, 450 /* ms */);

// Check stale agents (unresponsive > 60 seconds)
const staleList = serverAgentManager.checkHealth(60000);
```

---

## 4. Atomic Context Updates & Snapshots

```javascript
import { serverContextEngine } from './core/contextEngine.js';

// Atomic update of multiple keys
serverContextEngine.setMany({
  currentModel: 'mixtral',
  activeProvider: 'ollama',
  activeNote: 'Deadlocks.md'
});

// Take snapshot
const stateBackup = serverContextEngine.snapshot();

// Restore snapshot
serverContextEngine.restore(stateBackup);
```
