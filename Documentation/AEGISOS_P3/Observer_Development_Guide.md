# Sentinel Observer Development Guide

## Overview

This guide explains how to create a new custom Observer in Sentinel Core by extending `BaseObserver`.

---

## Step 1: Extend `BaseObserver`

Create a new file under `server/sentinel/observers/`:

```javascript
import { BaseObserver } from './BaseObserver.js';
import { EventCategory, EventPriority } from '../eventSchema.js';

export class CustomDockerObserver extends BaseObserver {
  constructor() {
    super({
      id: 'docker_observer',
      name: 'Docker Container Observer',
      category: 'containers',
      version: '1.0.0'
    });

    this.timer = null;
  }

  async initialize() {
    await super.initialize();
    this.log.info('Custom Docker observer initialized.');
  }

  async start() {
    await super.start();
    this.timer = setInterval(() => this.checkContainers(), 10000);
  }

  checkContainers() {
    if (this.state !== 'running') return;

    // Perform observation (no heavy blocking)
    const activeContainers = 3; 

    this.emitEvent('containers', EventPriority.LOW, {
      eventType: 'DOCKER_STATUS_CHECK',
      activeContainers
    });
  }

  async stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    await super.stop();
  }
}
```

---

## Step 2: Register in `ObserverRegistry`

Register your new observer inside `server/sentinel/initSentinel.js`:

```javascript
import { sentinelObserverRegistry } from './ObserverRegistry.js';
import { CustomDockerObserver } from './observers/CustomDockerObserver.js';

const dockerObs = new CustomDockerObserver();
sentinelObserverRegistry.register(dockerObs);
```

That's it! Sentinel Core automatically manages initialization, execution, health monitoring, auto-restart, and event routing for your observer.
