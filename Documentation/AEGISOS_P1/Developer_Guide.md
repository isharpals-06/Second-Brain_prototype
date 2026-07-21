# AEGISOS Developer & Extension Guide

## Overview

This guide explains how to extend AEGISOS by registering new Services, Agents, Skills, and Events cleanly using the Phase 1 core architecture.

---

## 1. How to Register a New Service

Register new internal services with the `ServiceRegistry`:

```javascript
import { serverServiceRegistry } from './core/serviceRegistry.js';

class VoiceAssistantService {
  constructor() {
    this.status = 'idle';
  }
  start() {
    this.status = 'listening';
  }
  stop() {
    this.status = 'stopped';
  }
}

// Register service
serverServiceRegistry.register('Voice', new VoiceAssistantService());
```

---

## 2. How to Register a New AI Agent

Agent definitions plug into the `AgentManager`:

```javascript
import { serverAgentManager } from './core/agentManager.js';

serverAgentManager.register({
  id: 'agent_planner',
  name: 'Planner Agent',
  role: 'Task Decomposition & Scheduling',
  capabilities: ['summarize', 'search_notes'],
  enabled: true
});
```

---

## 3. How to Register & Execute a Skill

Register reusable capabilities in the `SkillRegistry`:

```javascript
import { serverSkillRegistry } from './core/skillRegistry.js';

serverSkillRegistry.registerSkill({
  id: 'format_latex',
  name: 'Format LaTeX Equations',
  category: 'Math',
  description: 'Converts raw text formulas to $$...$$ block notation',
  handler: async (params, context) => {
    const { formula } = params;
    return `$$ ${formula} $$`;
  }
});

// Execute skill
const formatted = await serverSkillRegistry.executeSkill('format_latex', { formula: 'E = mc^2' });
```

---

## 4. How to Publish & Subscribe to Events

Use the `EventBus` to emit and capture decoupled system events:

```javascript
import { serverEventBus, SystemEvents } from './core/eventBus.js';

// Subscribe
const unsubscribe = serverEventBus.subscribe(SystemEvents.NOTE_CREATED, (payload) => {
  console.log('New note created:', payload.note);
});

// Publish
serverEventBus.publish(SystemEvents.NOTE_CREATED, { note: '10_Subjects/01_OS/Deadlocks.md' });

// Cleanup
unsubscribe();
```

---

## 5. React Integration (`useAegis()`)

In any React component under `<AegisProvider>`:

```jsx
import React from 'react';
import { useAegis } from '../core/context/AegisContext.jsx';

export function AgentStatusBadge() {
  const { agents, contextState, updateContext } = useAegis();

  return (
    <div>
      <h3>Current Model: {contextState.currentModel}</h3>
      <p>Active Agents: {agents.length}</p>
      <button onClick={() => updateContext('currentModel', 'qwen3.6')}>Switch Model</button>
    </div>
  );
}
```
