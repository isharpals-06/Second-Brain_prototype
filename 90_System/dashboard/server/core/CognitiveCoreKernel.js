import { aegisLogger } from './logger.js';
import { serverEventBus } from './eventBus.js';
import { contextAssemblyPipeline } from '../knowledge/ContextAssemblyPipeline.js';
import { cognitiveMemoryEngine } from '../memory/CognitiveMemoryEngine.js';
import { reasoningEngine } from './ReasoningEngine.js';
import { entityExtractionEngine } from '../knowledge/EntityExtractionEngine.js';
import { reflectionEngine } from '../memory/ReflectionEngine.js';
import { providerManager } from '../ai/providerManager.js';

const log = aegisLogger.child('Core:CognitiveKernel');

export class CognitiveCoreKernel {
  constructor() {
    this.activePipelines = new Map();
  }

  async processIntent(rawInput, options = {}) {
    const pipelineId = `pipe_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    log.info(`[CognitiveKernel] Starting execution pipeline "${pipelineId}" for intent: "${rawInput}"`);

    try {
      // 1. Perception Layer: Convert raw input into structured observation
      const observation = {
        id: `obs_${Date.now()}`,
        rawInput,
        source: options.source || 'ccl_command_palette',
        timestamp: new Date().toISOString(),
      };

      // 2. Context Engine & Working Memory Assembly
      const context = await contextAssemblyPipeline.assembleContext(rawInput, options);
      await cognitiveMemoryEngine.remember('working', {
        key: pipelineId,
        state: { goal: rawInput, stage: 'PERCEIVED' },
      });

      // 3. Reasoning Engine Session
      const reasoningSession = await reasoningEngine.startReasoningSession(rawInput, context.structured);

      // 4. Entity Extraction & Knowledge Graph Update
      const extractedEntities = entityExtractionEngine.extractAndIndex(rawInput, observation.source);

      // 5. Model Provider Dispatch
      const prompt = `${context.promptFormatted}\nUser Goal: ${rawInput}\nReasoning Direction: ${reasoningSession.summary || 'Analyze and plan optimal resolution.'}`;
      const aiResponse = await providerManager.generate({ prompt });

      // 6. Reflection & Memory Update
      const reflection = await reflectionEngine.reflectOnExecution({
        id: pipelineId,
        goal: rawInput,
        output: aiResponse.text || aiResponse,
        status: 'completed',
      });

      // 7. Store in Episodic Memory
      await cognitiveMemoryEngine.remember('episodic', {
        title: `Executed Intent: ${rawInput.substring(0, 40)}`,
        summary: aiResponse.text ? aiResponse.text.substring(0, 100) : 'Completed successfully',
        outcome: 'success',
      });

      // Publish PipelineCompleted Event
      serverEventBus.publish({
        type: 'CognitivePipelineCompleted',
        source: 'CognitiveCoreKernel',
        payload: { pipelineId, rawInput, provider: aiResponse.provider, model: aiResponse.model },
      });

      return {
        pipelineId,
        input: rawInput,
        reasoning: reasoningSession,
        extractedEntities,
        response: aiResponse.text || aiResponse,
        reflection,
        status: 'completed',
      };
    } catch (err) {
      log.error(`[CognitiveKernel] Pipeline "${pipelineId}" failed: ${err.message}`);
      serverEventBus.publish({
        type: 'CognitivePipelineFailed',
        source: 'CognitiveCoreKernel',
        payload: { pipelineId, error: err.message },
      });
      throw err;
    }
  }

  getSystemHealth() {
    return {
      status: 'healthy',
      subsystems: {
        perception: 'active',
        contextEngine: 'active',
        workingMemory: 'active',
        reasoningEngine: 'active',
        planner: 'active',
        agentRuntime: 'active',
        toolRuntime: 'active',
        knowledgeLayer: 'active',
        reflectionEngine: 'active',
        providerLayer: 'active',
      },
    };
  }
}

export const cognitiveCoreKernel = new CognitiveCoreKernel();
