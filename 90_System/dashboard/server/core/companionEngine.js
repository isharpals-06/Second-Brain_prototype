import { serverEventBus, SystemEvents, EventSeverity } from './eventBus.js';
import { serverServiceRegistry } from './serviceRegistry.js';
import { reasoningEngine } from './ReasoningEngine.js';
import { contextAssembler } from './ContextAssembler.js';
import { knowledgeExtractor } from '../knowledge/KnowledgeExtractor.js';
import { hybridRetrievalEngine } from '../memory/HybridRetrievalEngine.js';
import { reflectionEngine } from '../memory/ReflectionEngine.js';
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
    log.info('Starting AEGISOS Persistent AI Companion Cognitive Loop (Stage 2)...');

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

  async handlePerceptionEvent(type, payload) {
    const filePath = payload.filename || payload.filePath || 'vault';
    log.info(`[Perception Pipeline] Observed [${type}] on target: ${filePath}`);

    // Step 1: Knowledge Extraction
    const entities = knowledgeExtractor.extractEntities(filePath);

    // Step 2: Start Reasoning Session
    const goal = `Process perception event ${type} on ${filePath}`;
    const reasoningSession = await reasoningEngine.startReasoningSession(goal, { eventType: type, payload, entities });

    // Step 3: Multi-Factor Memory Retrieval
    const contextMemories = await hybridRetrievalEngine.retrieveRankedContext(goal, { activeGoal: goal });
    reasoningEngine.addStep(reasoningSession.id, 'Memory Retrieval', `Retrieved ${contextMemories.length} relevant memories.`);

    // Step 4: Decision & Reflection
    const decision = 'LOG_AND_MONITOR';
    reasoningEngine.completeReasoningSession(reasoningSession.id, {
      decision,
      confidence: 0.95,
      summary: `Perception event ${type} evaluated. Action: ${decision}`,
      memories: contextMemories
    });

    // Step 5: Reflection Engine & Memory Update
    await reflectionEngine.reflectOnExecution({
      title: `Perception Processing: ${type}`,
      status: 'completed',
      type: 'perception_handler'
    });
  }

  async executeLoopTick() {
    if (!this.isRunning) return;
    this.tickCount += 1;

    try {
      // 1. Observe: Subsystem state check
      const sentinelService = serverServiceRegistry.get('Sentinel');
      const agentService = serverServiceRegistry.get('AgentRuntime');

      // 2. Reason & Synthesize
      const goal = `Routine Subsystem Health & Memory Reflection Pass (Tick #${this.tickCount})`;
      const reasoningSession = await reasoningEngine.startReasoningSession(goal, { tickCount: this.tickCount });

      reasoningEngine.addStep(reasoningSession.id, 'Subsystem Inspection', `Inspected ${serverServiceRegistry.list().length} registered services.`);

      const decision = 'CONTINUE_AUTONOMOUS_LOOP';
      reasoningEngine.completeReasoningSession(reasoningSession.id, {
        decision,
        confidence: 0.99,
        summary: `Tick #${this.tickCount} completed cleanly. Systems nominal.`
      });

      // 3. Autonomous Suggestion Generation
      if (this.tickCount % 3 === 0) {
        const suggestion = {
          id: `sug_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          title: 'Cognitive Memory Consolidation Pass',
          description: 'Synthesize procedural lessons from recent workflow execution history.',
          subsystem: 'MemoryOS',
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

  getReasoningHistory() {
    return reasoningEngine.getRecentSessions(20);
  }

  getPendingSuggestions() {
    return this.pendingSuggestions;
  }
}

export const companionEngine = new CompanionEngine();
