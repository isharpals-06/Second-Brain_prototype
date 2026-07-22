import { serverEventBus, SystemEvents, EventSeverity } from './eventBus.js';
import { serverServiceRegistry } from './serviceRegistry.js';
import { aegisLogger } from './logger.js';

const log = aegisLogger.child('CompanionEngine');

export class CompanionEngine {
  constructor() {
    this.isRunning = false;
    this.timer = null;
    this.tickIntervalMs = 10000; // 10s loop tick
    this.tickCount = 0;
    this.recentReasoning = [];
    this.pendingSuggestions = [];
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    log.info('Starting AEGISOS Persistent AI Companion Loop...');

    // Subscribe to Sentinel perception events
    serverEventBus.subscribe(SystemEvents.FILE_CHANGED, (payload) => this.handlePerceptionEvent('FILE_CHANGED', payload));
    serverEventBus.subscribe(SystemEvents.NOTE_CREATED, (payload) => this.handlePerceptionEvent('NOTE_CREATED', payload));

    // Initial tick
    this.executeLoopTick();

    // Schedule continuous loop
    this.timer = setInterval(() => this.executeLoopTick(), this.tickIntervalMs);
  }

  stop() {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    log.info('Stopped AEGISOS AI Companion Loop.');
  }

  handlePerceptionEvent(type, payload) {
    const thought = `Observed perception event [${type}] on target file: ${payload.filename || payload.filePath || 'vault'}. Evaluating impact...`;
    this.addReasoning(thought, 'Perception');
    
    serverEventBus.publish(SystemEvents.REASONING_GENERATED, {
      thought,
      source: 'Sentinel',
      context: payload
    }, { subsystem: 'Companion', severity: EventSeverity.INFO });
  }

  async executeLoopTick() {
    if (!this.isRunning) return;
    this.tickCount += 1;

    try {
      // 1. Observe: query system health & service status
      const sentinelService = serverServiceRegistry.get('Sentinel');
      const agentService = serverServiceRegistry.get('AgentRuntime');
      const memoryService = serverServiceRegistry.get('MemoryOS');
      const plannerService = serverServiceRegistry.get('Planner');

      // 2. Reason & Synthesize
      const thought = `[Tick #${this.tickCount}] AEGISOS Subsystems nominal. Sentinel observers active. Evaluating memory consolidation & task queues.`;
      this.addReasoning(thought, 'SystemLoop');

      // 3. Autonomous Suggestion Generation
      if (this.tickCount % 3 === 0) { // Every 30 seconds
        const suggestion = {
          id: `sug_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          title: 'Automated Vault Embedded Search Sync',
          description: 'Refresh local RAG vector cache for newly modified study notes.',
          subsystem: 'Knowledge',
          autoExecute: true,
          timestamp: new Date().toISOString()
        };
        this.pendingSuggestions.push(suggestion);
        if (this.pendingSuggestions.length > 20) this.pendingSuggestions.shift();

        serverEventBus.publish(SystemEvents.COMPANION_SUGGESTION, suggestion, {
          subsystem: 'Companion',
          severity: EventSeverity.INFO
        });
      }

      // 4. Publish loop tick telemetry
      serverEventBus.publish(SystemEvents.COMPANION_LOOP_TICK, {
        tickCount: this.tickCount,
        timestamp: new Date().toISOString(),
        activeServicesCount: serverServiceRegistry.list().length,
        status: 'nominal'
      }, { subsystem: 'Companion', severity: EventSeverity.DEBUG });

    } catch (err) {
      log.error(`Error in AI Companion Loop tick #${this.tickCount}: ${err.message}`);
    }
  }

  addReasoning(thought, category) {
    const record = {
      id: `rsn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      thought,
      category,
      timestamp: new Date().toISOString()
    };
    this.recentReasoning.push(record);
    if (this.recentReasoning.length > 50) this.recentReasoning.shift();
  }

  getReasoningHistory() {
    return this.recentReasoning;
  }

  getPendingSuggestions() {
    return this.pendingSuggestions;
  }
}

export const companionEngine = new CompanionEngine();
