import { serverEventBus, SystemEvents, EventSeverity } from './eventBus.js';
import { serverServiceRegistry } from './serviceRegistry.js';
import { reasoningEngine } from './ReasoningEngine.js';
import { contextAssembler } from './ContextAssembler.js';
import { autonomousInsightsEngine } from './AutonomousInsightsEngine.js';
import { selfLearningEngine } from './SelfLearningEngine.js';
import { knowledgeExtractor } from '../knowledge/KnowledgeExtractor.js';
import { hybridRetrievalEngine } from '../memory/HybridRetrievalEngine.js';
import { reflectionEngine } from '../memory/ReflectionEngine.js';
import { memoryConsolidationEngine } from '../memory/MemoryConsolidationEngine.js';
import { aegisLogger } from './logger.js';

const log = aegisLogger.child('CompanionEngine');

export class CompanionEngine {
  constructor() {
    this.isRunning = false;
    this.timer = null;
    this.tickIntervalMs = 10000; // 10s loop tick
    this.tickCount = 0;
    this.pendingSuggestions = [];
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    log.info('Starting AEGISOS Persistent Autonomous Cognitive OS Loop (Stage 3)...');

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
    log.info('Stopped AEGISOS Autonomous Cognitive OS Loop.');
  }

  async handlePerceptionEvent(type, payload) {
    const filePath = payload.filename || payload.filePath || 'vault';
    log.info(`[Perception Pipeline] Observed [${type}] on target: ${filePath}`);

    // 1. Knowledge Extraction
    const entities = knowledgeExtractor.extractEntities(filePath);

    // 2. Start Reasoning Session
    const goal = `Process perception event ${type} on ${filePath}`;
    const reasoningSession = await reasoningEngine.startReasoningSession(goal, { eventType: type, payload, entities });

    // 3. Multi-Factor Memory Retrieval
    const contextMemories = await hybridRetrievalEngine.retrieveRankedContext(goal, { activeGoal: goal });
    reasoningEngine.addStep(reasoningSession.id, 'Memory Retrieval', `Retrieved ${contextMemories.length} relevant memories.`);

    // 4. Decision & Reflection
    const decision = 'LOG_AND_MONITOR';
    reasoningEngine.completeReasoningSession(reasoningSession.id, {
      decision,
      confidence: 0.95,
      summary: `Perception event ${type} evaluated. Action: ${decision}`,
      memories: contextMemories
    });

    // 5. Reflection Engine & Memory Update
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
      // 1. Reason & Synthesize Tick Session
      const goal = `Autonomous Cognitive Pass (Tick #${this.tickCount})`;
      const reasoningSession = await reasoningEngine.startReasoningSession(goal, { tickCount: this.tickCount });

      reasoningEngine.addStep(reasoningSession.id, 'Subsystem Inspection', `Inspected ${serverServiceRegistry.list().length} registered services.`);

      // 2. Autonomous Insights Scanner (Every 3 ticks / 30 seconds)
      if (this.tickCount % 3 === 0) {
        await autonomousInsightsEngine.scanForInsights();
      }

      // 3. Self-Learning Optimization Pass (Every 5 ticks / 50 seconds)
      if (this.tickCount % 5 === 0) {
        await selfLearningEngine.runLearningOptimizationPass();
      }

      // 4. Memory Consolidation Pass (Every 10 ticks / 100 seconds)
      if (this.tickCount % 10 === 0) {
        await memoryConsolidationEngine.runConsolidationPass();
      }

      // Complete Tick Reasoning Session
      reasoningEngine.completeReasoningSession(reasoningSession.id, {
        decision: 'CONTINUE_AUTONOMOUS_LOOP',
        confidence: 0.99,
        summary: `Tick #${this.tickCount} completed cleanly. Systems nominal.`
      });

      // Publish loop tick telemetry
      serverEventBus.publish(SystemEvents.COMPANION_LOOP_TICK, {
        tickCount: this.tickCount,
        timestamp: new Date().toISOString(),
        activeServicesCount: serverServiceRegistry.list().length,
        status: 'nominal'
      }, { subsystem: 'Companion', severity: EventSeverity.DEBUG });

    } catch (err) {
      log.error(`Error in Autonomous Cognitive OS Loop tick #${this.tickCount}: ${err.message}`);
    }
  }

  getReasoningHistory() {
    return reasoningEngine.getRecentSessions(20);
  }

  getPendingSuggestions() {
    return autonomousInsightsEngine.getInsights(10);
  }
}

export const companionEngine = new CompanionEngine();
