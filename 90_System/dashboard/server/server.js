import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import multer from 'multer';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
import { DatabaseSync } from 'node:sqlite';
import chokidar from 'chokidar';

// AEGISOS Config & Core Architecture Imports
import { config } from './config/index.js';
import { aegisLogger } from './core/logger.js';
import { initializeAegisCore } from './core/initCore.js';
import { initializeSentinelCore } from './sentinel/initSentinel.js';
import { initializeWorldModelEngine } from './worldModel/initWorldModel.js';
import { contextAPI } from './worldModel/ContextAPI.js';
import { initializeKnowledgeSubsystem } from './knowledge/initKnowledge.js';
import { knowledgeAPI } from './knowledge/KnowledgeAPI.js';
import { initializeExecutivePlanner } from './planner/initPlanner.js';
import { plannerAPI } from './planner/PlannerAPI.js';
import { initializeSimulationEngine } from './simulation/initSimulation.js';
import { simulationAPI } from './simulation/SimulationAPI.js';
import { initializeAgentRuntime } from './agentRuntime/initAgentRuntime.js';
import { agentRuntimeAPI } from './agentRuntime/AgentRuntimeAPI.js';
import { initializeToolRuntime } from './toolRuntime/initToolRuntime.js';
import { toolRuntimeAPI } from './toolRuntime/ToolRuntimeAPI.js';
import { initializeWorkflowPlatform } from './workflow/initWorkflow.js';
import { workflowAPI } from './workflow/WorkflowAPI.js';
import { initializeMemoryPlatform } from './memory/initMemory.js';
import { memoryAPI } from './memory/MemoryAPI.js';
import { initializeGovernancePlatform } from './governance/initGovernance.js';
import { governanceAPI } from './governance/GovernanceAPI.js';
import { initializeAutomationPlatform } from './automation/initAutomation.js';
import { automationAPI } from './automation/AutomationAPI.js';
import { productionAPI } from './production/ProductionAPI.js';
import { companionEngine } from './core/companionEngine.js';
import { reasoningEngine } from './core/ReasoningEngine.js';
import { contextAssembler } from './core/ContextAssembler.js';
import { autonomousInsightsEngine } from './core/AutonomousInsightsEngine.js';
import { selfLearningEngine } from './core/SelfLearningEngine.js';
import { reflectionEngine } from './memory/ReflectionEngine.js';
import { hybridRetrievalEngine } from './memory/HybridRetrievalEngine.js';
import { memoryConsolidationEngine } from './memory/MemoryConsolidationEngine.js';
import { worldModelEngine } from './worldModel/WorldModelEngine.js';
import { dynamicKnowledgeGraph } from './knowledge/DynamicKnowledgeGraph.js';
import { projectUserIntelligence } from './knowledge/ProjectUserIntelligence.js';
import { entityExtractionEngine } from './knowledge/EntityExtractionEngine.js';
import { semanticIntelligenceEngine } from './knowledge/SemanticIntelligenceEngine.js';
import { contextAssemblyPipeline } from './knowledge/ContextAssemblyPipeline.js';
import { cognitiveCoreKernel } from './core/CognitiveCoreKernel.js';
import { initializeModelProviderLayer } from './ai/initAI.js';
import { providerRegistry } from './ai/providerRegistry.js';
import { providerManager } from './ai/providerManager.js';
import { modelManager } from './ai/modelManager.js';
import { aiRouter } from './ai/router.js';
import { sentinelObserverRegistry } from './sentinel/ObserverRegistry.js';
import { sentinelObserverManager } from './sentinel/ObserverManager.js';
import { serverEventBus } from './core/eventBus.js';
import { serverContextEngine } from './core/contextEngine.js';
import { serverServiceRegistry } from './core/serviceRegistry.js';
import { serverAgentManager } from './core/agentManager.js';
import { serverSkillRegistry } from './core/skillRegistry.js';
import { SystemEvents } from './core/types.js';

const log = aegisLogger.child('Server');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The vault root is three levels up from 90_System/dashboard/server/
const VAULT_ROOT = path.resolve(__dirname, '../../../');
const REFINED_NOTES_DIR = path.join(VAULT_ROOT, '10_Subjects');
const GRAPH_FILE = path.join(VAULT_ROOT, '90_System', 'graphify-out', 'graph.json');

// Multer configuration
const upload = multer({ storage: multer.memoryStorage() });

// Cased subject subfolder mapping
const SUBJECT_FOLDER_MAP = {
  'OS': '01_Operating_Systems',
  'DSA': '02_Data_Structures',
  'DBMS': '03_Database_Systems',
  'DISCRETE': '04_Discrete_Mathematics',
  'CSA': '05_Computer_Architecture',
  'CYBER_CN': '06_Computer_Networks',
  'ML': '07_Machine_Learning',
  'OPPS': '08_OOPs',
  'STATISTICS': '09_Statistics'
};

const app = express();
const PORT = process.env.PORT || 3010;

const DIST_DIR = path.join(__dirname, '../dist');

app.use(cors());
app.use(express.static(DIST_DIR));

// Initialize AEGISOS Core Architecture
const aegisCore = initializeAegisCore();

// Boot Model Provider Abstraction Layer (MPAL v1.2.0)
initializeModelProviderLayer().catch(err => console.error('[MPAL Boot] Failed:', err));

// Initialize SQLite database
const dbPath = path.join(__dirname, 'vault_assistant.db');
const db = new DatabaseSync(dbPath);
reasoningEngine.setDatabase(db);
dynamicKnowledgeGraph.setDatabase(db);

db.exec(`
  CREATE TABLE IF NOT EXISTS flashcards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    note_path TEXT,
    question TEXT,
    answer TEXT,
    easiness REAL DEFAULT 2.5,
    interval INTEGER DEFAULT 1,
    repetitions INTEGER DEFAULT 0,
    due_date TEXT,
    last_reviewed TEXT
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS inbox_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    note_path TEXT,
    detected_at TEXT,
    status TEXT  -- 'unfiled' | 'filed' | 'ignored'
  );
`);

db.exec(`
  CREATE UNIQUE INDEX IF NOT EXISTS idx_flashcards_path_q ON flashcards(note_path, question);
`);

db.exec(`
  CREATE UNIQUE INDEX IF NOT EXISTS idx_inbox_path ON inbox_log(note_path);
`);

const AEGISOS_SYSTEM_PROMPTS = {
  coding: `You are the AEGISOS Coprocessor specialized in software engineering and systems architecture.
Guidelines:
- Provide highly optimized, correct, and clean code.
- Explain design patterns, architectural choices, and complexity analysis (Time/Space) briefly.
- Structure explanations with clear directory maps or module dependencies when describing projects.
- Keep comments concise and focus on explaining the "why" rather than the obvious "what".`,

  math: `You are the AEGISOS Coprocessor specialized in mathematics, proofs, and statistical calculations.
Guidelines:
- Format all equations using standard LaTeX syntax block notation ($$ ... $$) for multiline math or inline notation ($ ... $) for inline variables.
- Break down multi-step mathematical derivations step-by-step with logical justifications for each transition.
- Focus on clarity and accuracy in proofs, explaining the assumptions, theorems used, and final conclusions.`,

  research: `You are the AEGISOS Coprocessor specialized in academic research, synthesis, and active recall.
Guidelines:
- Synthesize complex information into clear, nested markdown bullet points.
- Highlight key definitions, core concepts, and vocabulary terms in bold.
- Formulate 2-3 active recall questions and answers at the very bottom in the format: "Question :: Answer" (separated by double colons) tagged with #flashcards.
- Cross-reference related files or subtopics where possible.`,

  brainstorming: `You are the AEGISOS Coprocessor specialized in lateral thinking, ideation, and problem-solving.
Guidelines:
- Generate multiple alternative approaches, design options, or creative paths for the user's query.
- Use comparative tables (pros vs. cons, speed vs. cost) to compare different choices.
- Frame your suggestions in structured mind-maps or logical categories to spark inspiration.`
};

// Helper function to classify intent and auto-route prompts to the best local model
function classifyTaskAndModel(promptText, availableModels) {
  const result = {
    model: null,
    category: 'brainstorming'
  };

  if (!availableModels || availableModels.length === 0) {
    return result; 
  }

  const promptLower = promptText.toLowerCase();

  // 1. Check if the task is coding-related
  const codingKeywords = [
    'code', 'function', 'class', 'const', 'import', 'let', 'bug', 'compile', 'debug',
    'python', 'javascript', 'html', 'css', 'typescript', 'java', 'c++', 'react', 'express',
    'docker', 'database', 'sql', 'api', 'json', 'program', 'script', 'synthesize', 'project'
  ];
  const isCoding = codingKeywords.some(kw => promptLower.includes(kw));

  if (isCoding) {
    result.category = 'coding';
    const codeModel = availableModels.find(m => 
      m.name.toLowerCase().includes('coder') || 
      m.name.toLowerCase().includes('code')
    );
    if (codeModel) {
      result.model = codeModel.name;
      return result;
    }
  }

  // 2. Check if the task is math-related
  const mathKeywords = [
    'math', 'equation', 'formula', 'statistics', 'anova', 'probability', 'proof', 'theorem',
    'variance', 'mean', 'median', 'stddev', 'calculus', 'algebra', 'matrix', 'integral', 'fraction'
  ];
  const isMath = mathKeywords.some(kw => promptLower.includes(kw));

  if (isMath) {
    result.category = 'math';
    const mathModel = availableModels.find(m => 
      m.name.toLowerCase().includes('math')
    );
    if (mathModel) {
      result.model = mathModel.name;
      return result;
    }
  }

  // 3. Check if the task is research/summary-related
  const researchKeywords = [
    'research', 'summary', 'summarize', 'note', 'define', 'explain', 'concept', 'study',
    'flashcard', 'recall', 'read', 'paper', 'article', 'lecture', 'subject'
  ];
  const isResearch = researchKeywords.some(kw => promptLower.includes(kw));
  if (isResearch) {
    result.category = 'research';
  }

  // Fallback to general models
  const generalModel = availableModels.find(m => 
    m.name.toLowerCase().includes('llama') || 
    m.name.toLowerCase().includes('mistral') || 
    m.name.toLowerCase().includes('gemma') ||
    m.name.toLowerCase().includes('phi')
  );
  result.model = generalModel ? generalModel.name : availableModels[0].name;
  return result;
}
// Backup function: zips clean codebase and key notes folder, keeping only 5 recent backups
async function runBackup() {
  const backupDir = path.join(__dirname, '..', '..', 'backups');
  
  // Ensure backups directory exists
  try {
    await fs.mkdir(backupDir, { recursive: true });
  } catch (_) {}

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const destinationZip = path.join(backupDir, `second_brain_backup_${timestamp}.zip`);
  
  // Clean list of tracked project files and directories
  const pathsToBackup = [
    '10_Subjects/00_MOCs',
    '00_Inbox',
    '90_System/dashboard/server/server.js',
    'README.md',
    'Developer_handbook.md',
    'docker-compose.yml',
    'requirements.txt',
    'start_second_brain.bat'
  ];

  // Resolve path tokens into fully qualified Windows paths, filtering only existing paths
  const absolutePaths = pathsToBackup
    .map(p => path.resolve(__dirname, '..', '..', '..', p))
    .filter(p => fsSync.existsSync(p))
    .map(p => `'${p}'`)
    .join(', ');

  const command = `powershell -Command "Compress-Archive -Path ${absolutePaths} -DestinationPath '${destinationZip}' -Force"`;

  return new Promise((resolve, reject) => {
    exec(command, async (error, stdout, stderr) => {
      if (error) {
        console.error('[AEGISOS Backup] Failed to create backup:', stderr || error.message);
        return reject(error);
      }
      
      console.log(`[AEGISOS Backup] Backup successfully generated at: ${destinationZip}`);
      
      // Pruning logic: keep only the 5 most recent backups
      try {
        const files = await fs.readdir(backupDir);
        const backupFiles = files
          .filter(f => f.startsWith('second_brain_backup_') && f.endsWith('.zip'))
          .map(f => ({ name: f, path: path.join(backupDir, f) }));
        
        for (const file of backupFiles) {
          const stats = await fs.stat(file.path);
          file.mtime = stats.mtime.getTime();
        }
        
        backupFiles.sort((a, b) => b.mtime - a.mtime);
        
        if (backupFiles.length > 5) {
          const toDelete = backupFiles.slice(5);
          for (const file of toDelete) {
            await fs.unlink(file.path);
            console.log(`[AEGISOS Backup] Evicted old backup: ${file.name}`);
          }
        }
      } catch (cleanErr) {
        console.warn('[AEGISOS Backup] Pruning old backups failed:', cleanErr.message);
      }
      
      resolve(destinationZip);
    });
  });
}

app.use(express.json({ limit: '50mb' }));

// ----------------------------------------------------
// AEGISOS Core Architecture System API Endpoints
// ----------------------------------------------------

app.get('/api/aegis/status', (req, res) => {
  res.json({
    status: 'online',
    architecture: 'AEGISOS Phase 1',
    context: serverContextEngine.getAll(),
    services: serverServiceRegistry.list(),
    agents: serverAgentManager.list(),
    skills: serverSkillRegistry.listSkills()
  });
});

app.get('/api/aegis/events', (req, res) => {
  const limit = parseInt(req.query.limit || '50', 10);
  res.json({ events: serverEventBus.getHistory(limit) });
});

// Real-Time Server-Sent Events (SSE) Telemetry Stream
app.get(['/api/stream/events', '/api/aegis/stream'], (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Initial event history backfill
  const history = serverEventBus.getHistory(20);
  history.forEach(evt => {
    res.write(`data: ${JSON.stringify(evt)}\n\n`);
  });

  // Subscribe to all live system events via EventBus wildcard
  const unsubscribe = serverEventBus.subscribe('*', (eventRecord) => {
    res.write(`data: ${JSON.stringify(eventRecord)}\n\n`);
  });

  req.on('close', () => {
    unsubscribe();
    res.end();
  });
});

// AI Companion Loop Telemetry & Reasoning Endpoints
app.get('/api/companion/reasoning', (req, res) => {
  res.json({
    reasoningTrace: companionEngine.getReasoningHistory(),
    tickCount: companionEngine.tickCount,
    status: companionEngine.isRunning ? 'running' : 'stopped'
  });
});

app.get('/api/companion/suggestions', (req, res) => {
  res.json({
    suggestions: companionEngine.getPendingSuggestions()
  });
});

// ----------------------------------------------------
// Stage 2 — Cognitive Engine APIs (v1.4.0)
// ----------------------------------------------------

app.get('/api/cognitive/reasoning', (req, res) => {
  const limit = parseInt(req.query.limit || '10', 10);
  res.json({ sessions: reasoningEngine.getRecentSessions(limit) });
});

app.post('/api/cognitive/reason', async (req, res) => {
  try {
    const { goal, context } = req.body;
    const session = await reasoningEngine.startReasoningSession(goal, context || {});
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cognitive/assemble-context', async (req, res) => {
  try {
    const { prompt, options } = req.body;
    const context = await contextAssembler.assemblePromptContext(prompt || '', options || {});
    res.json(context);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cognitive/reflect', async (req, res) => {
  try {
    const lesson = await reflectionEngine.reflectOnExecution(req.body || {});
    res.json({ success: true, lesson });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Stage 3 — Autonomous Cognitive OS Dashboard APIs (v1.5.0)

app.get('/api/cognitive/dashboard', (req, res) => {
  res.json({
    architecture: 'AEGISOS Autonomous Cognitive OS (v1.5.0)',
    status: companionEngine.isRunning ? 'running' : 'stopped',
    tickCount: companionEngine.tickCount,
    recentReasoning: reasoningEngine.getRecentSessions(5),
    insights: autonomousInsightsEngine.getInsights(5),
    learning: selfLearningEngine.getLearningSummary(),
    graph: dynamicKnowledgeGraph.getGraphSummary()
  });
});

app.get('/api/cognitive/insights', (req, res) => {
  const limit = parseInt(req.query.limit || '10', 10);
  res.json({ insights: autonomousInsightsEngine.getInsights(limit) });
});

app.get('/api/cognitive/learning', (req, res) => {
  res.json({ learning: selfLearningEngine.getLearningSummary() });
});

app.post('/api/cognitive/consolidate', async (req, res) => {
  try {
    const summary = await memoryConsolidationEngine.runConsolidationPass();
    res.json({ success: true, summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// Model Provider Abstraction Layer (MPAL v1.2.0) APIs
// ----------------------------------------------------

app.get('/api/providers', (req, res) => {
  res.json({
    providers: providerRegistry.listProviders(),
    defaultProvider: providerRegistry.defaultProviderId
  });
});

app.get('/api/providers/status', (req, res) => {
  res.json(providerManager.getTelemetry());
});

app.get('/api/models', async (req, res) => {
  try {
    const category = req.query.category;
    const models = category 
      ? await modelManager.getModelsByCategory(category) 
      : await modelManager.listAllModels();
    res.json({ models });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/provider/select', (req, res) => {
  const { providerId, category, modelId } = req.body;
  if (providerId && !category) {
    const success = providerRegistry.setDefaultProvider(providerId);
    return res.json({ success, defaultProvider: providerRegistry.defaultProviderId });
  }
  if (category && providerId && modelId) {
    modelManager.setCategoryPreference(category, providerId, modelId);
    return res.json({ success: true, categoryDefaults: modelManager.userPreferences.categoryDefaults });
  }
  res.status(400).json({ error: 'Provide providerId or (category, providerId, modelId)' });
});

app.get('/api/provider/current', (req, res) => {
  const defaultProv = providerRegistry.getDefaultProvider();
  res.json({
    defaultProvider: defaultProv ? defaultProv.health() : null,
    userPreferences: modelManager.userPreferences
  });
});

app.get('/api/provider/health', async (req, res) => {
  const healthResults = await providerRegistry.checkAllHealth();
  res.json({ health: healthResults });
});

app.post('/api/ai/generate', async (req, res) => {
  try {
    const result = await providerManager.generate(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ai/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    await providerManager.stream({
      ...req.body,
      onChunk: (chunk) => {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }
    });
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

app.get('/api/aegis/agents', (req, res) => {
  res.json({ agents: serverAgentManager.list() });
});

app.get('/api/aegis/skills', (req, res) => {
  res.json({ skills: serverSkillRegistry.listSkills() });
});

app.post('/api/aegis/skills/execute', async (req, res) => {
  try {
    const { skillId, params } = req.body;
    const result = await serverSkillRegistry.executeSkill(skillId, params, serverContextEngine.getAll());
    res.json({ success: true, result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/aegis/context', (req, res) => {
  const { key, value } = req.body;
  if (key) {
    serverContextEngine.set(key, value);
    return res.json({ success: true, context: serverContextEngine.getAll() });
  }
  res.status(400).json({ error: 'Key is required' });
});

// Boot Sentinel Core Perception Engine
initializeSentinelCore().catch(err => console.error('[Sentinel Core] Boot failed:', err));

// ----------------------------------------------------
// AEGISOS Sentinel Core Perception REST APIs
// ----------------------------------------------------

app.get('/api/sentinel/status', (req, res) => {
  res.json({
    status: 'active',
    version: 'v0.2.0-Sentinel',
    metrics: sentinelObserverManager.getMetrics(),
    observers: sentinelObserverRegistry.list()
  });
});

app.get('/api/sentinel/observers', (req, res) => {
  res.json({ observers: sentinelObserverRegistry.list() });
});

app.get('/api/sentinel/metrics', (req, res) => {
  res.json({ metrics: sentinelObserverManager.getMetrics() });
});

app.get('/api/sentinel/events', (req, res) => {
  const limit = parseInt(req.query.limit || '20', 10);
  const events = serverEventBus.getHistory(100).filter(e => e.event && typeof e.event === 'string' && e.event.startsWith('sentinel:'));
  res.json({ events: events.slice(-limit) });
});

app.post('/api/sentinel/observers/:id/toggle', async (req, res) => {
  const { id } = req.params;
  const observer = sentinelObserverRegistry.get(id);
  if (!observer) return res.status(404).json({ error: 'Observer not found' });

  if (observer.state === 'running') {
    await sentinelObserverManager.pauseObserver(id);
  } else {
    await sentinelObserverManager.resumeObserver(id);
  }
  res.json({ success: true, observer: observer.status() });
});

app.post('/api/sentinel/observers/:id/restart', async (req, res) => {
  const { id } = req.params;
  const success = await sentinelObserverManager.restartObserver(id);
  if (success) {
    res.json({ success: true, message: `Restarted observer ${id}` });
  } else {
    res.status(500).json({ error: `Failed to restart observer ${id}` });
  }
});

// Boot World Model Engine
initializeWorldModelEngine(db);

// ----------------------------------------------------
// AEGISOS World Model Engine REST APIs
// ----------------------------------------------------

app.get('/api/world/state', (req, res) => {
  res.json({ state: contextAPI.getState() });
});

app.get('/api/world/session', (req, res) => {
  res.json(contextAPI.getSession());
});

app.get('/api/world/projects', (req, res) => {
  res.json(contextAPI.getProjects());
});

app.get('/api/world/workspace', (req, res) => {
  res.json(contextAPI.getWorkspace());
});

app.get('/api/world/timeline', (req, res) => {
  res.json({ timeline: contextAPI.getTimeline(req.query) });
});

app.get('/api/world/graph', (req, res) => {
  res.json(contextAPI.getGraph());
});

app.get('/api/world/snapshots', (req, res) => {
  res.json({ snapshots: contextAPI.getSnapshots() });
});

app.get('/api/world/metrics', (req, res) => {
  res.json({ metrics: contextAPI.getMetrics() });
});

// Boot Knowledge Graph Subsystem
initializeKnowledgeSubsystem(db);

// ----------------------------------------------------
// AEGISOS Knowledge Graph & Semantic Index REST APIs
// ----------------------------------------------------

app.get('/api/knowledge/entities', (req, res) => {
  res.json({ entities: knowledgeAPI.getEntities(req.query.type) });
});

app.get('/api/knowledge/relationships', (req, res) => {
  res.json({ relationships: knowledgeAPI.getRelationships() });
});

app.get('/api/knowledge/entity/:id', (req, res) => {
  const entity = knowledgeAPI.getEntity(req.params.id);
  if (!entity) return res.status(404).json({ error: 'Entity not found' });
  res.json({ entity });
});

app.post('/api/knowledge/query', async (req, res) => {
  try {
    const results = await knowledgeAPI.query(req.body);
    res.json({ results });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/knowledge/search', async (req, res) => {
  try {
    const queryText = req.query.q || '';
    const limit = parseInt(req.query.limit || '5', 10);
    const results = await knowledgeAPI.search(queryText, limit);
    res.json({ query: queryText, results });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/knowledge/metrics', (req, res) => {
  res.json({ metrics: knowledgeAPI.getMetrics() });
});

// Boot Executive Planner Subsystem
initializeExecutivePlanner(db);

// ----------------------------------------------------
// AEGISOS Executive Planner REST APIs
// ----------------------------------------------------

app.get('/api/planner/intent', (req, res) => {
  res.json({ intent: plannerAPI.getIntent() });
});

app.get('/api/planner/goals', (req, res) => {
  res.json({ goals: plannerAPI.getGoals(req.query.status) });
});

app.post('/api/planner/goals', (req, res) => {
  try {
    const goal = plannerAPI.createGoal(req.body);
    res.json({ goal });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/planner/priorities', (req, res) => {
  res.json({ priorities: plannerAPI.getPriorities() });
});

app.get('/api/planner/plans', (req, res) => {
  res.json({ plans: plannerAPI.getPlans() });
});

app.post('/api/planner/plan/generate', (req, res) => {
  try {
    const plan = plannerAPI.generatePlan(req.body.goalId);
    if (!plan) return res.status(404).json({ error: 'Goal not found' });
    res.json({ plan });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/planner/recommendations', (req, res) => {
  res.json({ recommendations: plannerAPI.getRecommendations() });
});

app.get('/api/planner/decisions', (req, res) => {
  res.json({ decisions: plannerAPI.getDecisions() });
});

app.get('/api/planner/constraints', (req, res) => {
  res.json({ constraints: plannerAPI.getConstraints() });
});

app.get('/api/planner/metrics', (req, res) => {
  res.json({ metrics: plannerAPI.getMetrics() });
});

// Boot Decision Simulation Engine
initializeSimulationEngine(db);

// ----------------------------------------------------
// AEGISOS Decision Simulation Engine REST APIs
// ----------------------------------------------------

app.post('/api/simulation/run', (req, res) => {
  try {
    const report = simulationAPI.simulatePlan(req.body.plan);
    if (!report) return res.status(400).json({ error: 'Invalid plan provided' });
    res.json({ report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/simulation/reports', (req, res) => {
  res.json({ reports: simulationAPI.listReports() });
});

app.get('/api/simulation/report/:id', (req, res) => {
  const report = simulationAPI.getReport(req.params.id);
  if (!report) return res.status(404).json({ error: 'Simulation report not found' });
  res.json({ report });
});

app.get('/api/simulation/metrics', (req, res) => {
  res.json({ metrics: simulationAPI.getMetrics() });
});

// Boot Agent Runtime Subsystem
initializeAgentRuntime(db);

// ----------------------------------------------------
// AEGISOS Agent Runtime REST APIs
// ----------------------------------------------------

app.get('/api/agents', (req, res) => {
  res.json({ agents: agentRuntimeAPI.listAgents() });
});

app.get('/api/agents/queue', (req, res) => {
  res.json({ queue: agentRuntimeAPI.getQueueStatus() });
});

app.get('/api/agents/capabilities', (req, res) => {
  res.json({ capabilities: agentRuntimeAPI.getCapabilities() });
});

app.get('/api/agents/messages', (req, res) => {
  res.json({ messages: agentRuntimeAPI.getMessages(req.query.receiverId) });
});

app.get('/api/agents/metrics', (req, res) => {
  res.json({ metrics: agentRuntimeAPI.getMetrics() });
});

app.get('/api/agents/:id', (req, res) => {
  const agent = agentRuntimeAPI.getAgent(req.params.id);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  res.json({ agent });
});

app.post('/api/agents/:id/start', (req, res) => {
  const success = agentRuntimeAPI.startAgent(req.params.id);
  res.json({ success, id: req.params.id });
});

app.post('/api/agents/:id/pause', (req, res) => {
  const success = agentRuntimeAPI.pauseAgent(req.params.id);
  res.json({ success, id: req.params.id });
});

app.post('/api/agents/:id/resume', (req, res) => {
  const success = agentRuntimeAPI.resumeAgent(req.params.id);
  res.json({ success, id: req.params.id });
});

app.post('/api/agents/:id/stop', (req, res) => {
  const success = agentRuntimeAPI.stopAgent(req.params.id);
  res.json({ success, id: req.params.id });
});

app.post('/api/agents/:id/restart', (req, res) => {
  const success = agentRuntimeAPI.restartAgent(req.params.id);
  res.json({ success, id: req.params.id });
});

// Boot Tool Runtime Subsystem
initializeToolRuntime(db);

// ----------------------------------------------------
// AEGISOS Tool Runtime REST APIs
// ----------------------------------------------------

app.get('/api/tools', (req, res) => {
  res.json({ tools: toolRuntimeAPI.listTools() });
});

app.get('/api/tools/history', (req, res) => {
  res.json({ history: toolRuntimeAPI.getHistory() });
});

app.get('/api/tools/metrics', (req, res) => {
  res.json({ metrics: toolRuntimeAPI.getMetrics() });
});

app.get('/api/tools/:id', (req, res) => {
  const tool = toolRuntimeAPI.getTool(req.params.id);
  if (!tool) return res.status(404).json({ error: 'Tool not found' });
  res.json({ tool });
});

app.post('/api/tools/execute', async (req, res) => {
  try {
    const result = await toolRuntimeAPI.executeTool(req.body.id, req.body.input || {});
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Boot Workflow Orchestration Platform
initializeWorkflowPlatform(db);

// ----------------------------------------------------
// AEGISOS Workflow Orchestration Platform REST APIs
// ----------------------------------------------------

app.get('/api/workflows', (req, res) => {
  res.json({ workflows: workflowAPI.listWorkflows() });
});

app.get('/api/workflows/instances', (req, res) => {
  res.json({ instances: workflowAPI.listInstances() });
});

app.get('/api/workflows/approvals', (req, res) => {
  res.json({ approvals: workflowAPI.listApprovals() });
});

app.get('/api/workflows/metrics', (req, res) => {
  res.json({ metrics: workflowAPI.getMetrics() });
});

app.get('/api/workflows/instance/:id', (req, res) => {
  const instance = workflowAPI.getInstance(req.params.id);
  if (!instance) return res.status(404).json({ error: 'Workflow instance not found' });
  res.json({ instance });
});

app.post('/api/workflows/run', (req, res) => {
  try {
    const instance = workflowAPI.runWorkflow(req.body.id, req.body.inputs || {});
    if (!instance) return res.status(404).json({ error: 'Workflow template not found' });
    res.json({ instance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/workflows/approve', (req, res) => {
  const success = workflowAPI.approve(req.body.approvalId);
  res.json({ success, approvalId: req.body.approvalId });
});

app.post('/api/workflows/reject', (req, res) => {
  const success = workflowAPI.reject(req.body.approvalId, req.body.reason || '');
  res.json({ success, approvalId: req.body.approvalId });
});

// Boot Memory OS Subsystem
initializeMemoryPlatform(db);

// ----------------------------------------------------
// AEGISOS Memory OS REST APIs
// ----------------------------------------------------

app.get('/api/memory/search', (req, res) => {
  const results = memoryAPI.search({
    query: req.query.q || '',
    type: req.query.type || null,
    limit: parseInt(req.query.limit || '10', 10)
  });
  res.json({ results });
});

app.get('/api/memory/recent', (req, res) => {
  res.json({ memories: memoryAPI.listRecent(parseInt(req.query.limit || '10', 10)) });
});

app.get('/api/memory/important', (req, res) => {
  res.json({ memories: memoryAPI.listImportant(parseInt(req.query.limit || '10', 10)) });
});

app.get('/api/memory/reflection', (req, res) => {
  res.json({ reflection: memoryAPI.reflect() });
});

app.get('/api/memory/experience', (req, res) => {
  res.json({ experiences: memoryAPI.listExperiences() });
});

app.get('/api/memory/metrics', (req, res) => {
  res.json({ metrics: memoryAPI.getMetrics() });
});

app.post('/api/memory/store', async (req, res) => {
  try {
    const memory = await memoryAPI.storeMemory(req.body);
    res.json({ memory });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cognitive Memory Unified API Endpoints (v1.3.0)

app.post('/api/memory/remember', async (req, res) => {
  try {
    const { layer = 'semantic', ...data } = req.body;
    const memory = await memoryAPI.remember(layer, data);
    res.json({ success: true, memory });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/memory/recall', async (req, res) => {
  try {
    const { query, ...options } = req.body;
    const results = await memoryAPI.recall(query, options);
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/memory/update', async (req, res) => {
  try {
    const { id, updates, layer = 'semantic' } = req.body;
    const memory = await memoryAPI.update(id, updates, layer);
    res.json({ success: true, memory });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/memory/forget', async (req, res) => {
  try {
    const { id, layer = 'semantic', reason = 'user_request' } = req.body;
    const success = await memoryAPI.forget(id, reason, layer);
    res.json({ success, id, layer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/memory/link', (req, res) => {
  try {
    const { sourceId, targetId, relationType, sourceLayer, targetLayer } = req.body;
    const link = memoryAPI.link(sourceId, targetId, relationType, sourceLayer, targetLayer);
    res.json({ success: true, link });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/memory/unlink', (req, res) => {
  try {
    const { sourceId, targetId, relationType } = req.body;
    const success = memoryAPI.unlink(sourceId, targetId, relationType);
    res.json({ success, sourceId, targetId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/memory/summarize', async (req, res) => {
  try {
    const { layer = 'episodic', filter } = req.body;
    const summary = await memoryAPI.summarize(layer, filter);
    res.json({ summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/memory/ingest', async (req, res) => {
  try {
    const { filePath, options } = req.body;
    const result = await memoryAPI.ingestDocument(filePath, options || {});
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/memory/consolidate', (req, res) => {
  const result = memoryAPI.consolidate();
  res.json({ result });
});

app.delete('/api/memory/:id', (req, res) => {
  const success = memoryAPI.forget(req.params.id, req.body?.reason);
  res.json({ success, id: req.params.id });
});

// Boot Governance & Trust Platform
initializeGovernancePlatform(db);

// ----------------------------------------------------
// AEGISOS Governance & Trust Platform REST APIs
// ----------------------------------------------------

app.get('/api/governance/policies', (req, res) => {
  res.json({ policies: governanceAPI.listPolicies() });
});

app.get('/api/governance/trust', (req, res) => {
  res.json({ trustScores: governanceAPI.listTrustScores() });
});

app.get('/api/governance/audit', (req, res) => {
  res.json({ auditLogs: governanceAPI.listAuditLogs() });
});

app.get('/api/governance/alerts', (req, res) => {
  res.json({ alerts: governanceAPI.listAlerts() });
});

app.get('/api/governance/identities', (req, res) => {
  res.json({ identities: governanceAPI.listIdentities() });
});

app.get('/api/governance/secrets', (req, res) => {
  res.json({ secrets: governanceAPI.listSecrets() });
});

app.get('/api/governance/compliance', (req, res) => {
  res.json({ compliance: governanceAPI.getCompliance() });
});

app.get('/api/governance/metrics', (req, res) => {
  res.json({ metrics: governanceAPI.getMetrics() });
});

app.post('/api/governance/evaluate', (req, res) => {
  try {
    const evaluation = governanceAPI.evaluate(req.body);
    res.json({ evaluation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Boot Automation Platform
initializeAutomationPlatform(db);

// ----------------------------------------------------
// AEGISOS Automation Platform REST APIs
// ----------------------------------------------------

app.get('/api/automation/list', (req, res) => {
  res.json({ automations: automationAPI.listAutomations() });
});

app.get('/api/automation/analytics', (req, res) => {
  res.json({ analytics: automationAPI.getAnalytics() });
});

app.get('/api/automation/level', (req, res) => {
  res.json({ autonomyLevel: automationAPI.getAutonomyLevel() });
});

app.post('/api/automation/level', (req, res) => {
  const level = automationAPI.setAutonomyLevel(req.body.level);
  res.json({ autonomyLevel: level });
});

app.post('/api/automation/trigger/:id', async (req, res) => {
  try {
    const result = await automationAPI.triggerAutomation(req.params.id);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/automation/approvals', (req, res) => {
  res.json({ approvals: automationAPI.listApprovals() });
});

app.get('/api/automation/rollbacks', (req, res) => {
  res.json({ rollbacks: automationAPI.listRollbacks() });
});

app.post('/api/automation/rollback/:id', (req, res) => {
  const result = automationAPI.triggerRollback(req.params.id);
  res.json({ result });
});

// ----------------------------------------------------
// AEGISOS v1.0.0 Production System Health & Diagnostics
// ----------------------------------------------------

app.get('/api/system/health', (req, res) => {
  res.json(productionAPI.getHealth());
});

app.get('/api/system/diagnostics', (req, res) => {
  res.json(productionAPI.getHealth());
});

app.get('/api/system/version', (req, res) => {
  res.json(productionAPI.getVersion());
});

// Helper to recursively get markdown files
async function getMarkdownFiles(dir) {
  let results = [];
  try {
    const list = await fs.readdir(dir, { withFileTypes: true });
    for (const file of list) {
      const resPath = path.resolve(dir, file.name);
      if (file.isDirectory()) {
        const nameLower = file.name.toLowerCase();
        if (
          nameLower === 'node_modules' ||
          nameLower === '.git' ||
          nameLower === '.obsidian' ||
          nameLower === 'dashboard' ||
          nameLower === 'graphify-out'
        ) {
          continue;
        }
        results = results.concat(await getMarkdownFiles(resPath));
      } else if (file.name.endsWith('.md')) {
        results.push(resPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  return results;
}

const CACHE_FILE = path.join(__dirname, 'metadata_cache.json');
const EMBEDDINGS_CACHE_FILE = path.join(__dirname, 'embeddings_cache.json');

// Vector math helper: Cosine Similarity
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Fetch single embedding using local Ollama model (nomic-embed-text)
async function getEmbedding(text) {
  const ollamaUrl = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
  try {
    const response = await fetch(`${ollamaUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'nomic-embed-text',
        prompt: text
      })
    });
    if (!response.ok) {
      throw new Error(`Embedding generation failed: ${response.statusText}`);
    }
    const data = await response.json();
    return data.embedding; 
  } catch (e) {
    console.error('[AEGISOS Semantic Index] Error fetching embedding:', e.message);
    return null;
  }
}

// Background builder: scans subjects notes and updates vector index
async function buildEmbeddingsCache() {
  console.log('[AEGISOS Semantic Index] Starting background vault embeddings indexer...');
  let cache = {};
  
  try {
    const cacheData = await fs.readFile(EMBEDDINGS_CACHE_FILE, 'utf-8');
    cache = JSON.parse(cacheData);
  } catch (_) {
    cache = {};
  }

  // Get current notes list
  const refinedFiles = await getMarkdownFiles(REFINED_NOTES_DIR);
  
  // Evict deleted files from embeddings cache
  const currentPathsSet = new Set(refinedFiles);
  let cacheChanged = false;
  for (const cachedPath in cache) {
    if (!currentPathsSet.has(cachedPath)) {
      delete cache[cachedPath];
      cacheChanged = true;
    }
  }

  // Check if Ollama has nomic-embed-text model
  const ollamaUrl = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
  let hasEmbedModel = false;
  try {
    const tagsRes = await fetch(`${ollamaUrl}/api/tags`);
    if (tagsRes.ok) {
      const tagsData = await tagsRes.json();
      hasEmbedModel = (tagsData.models || []).some(m => m.name.includes('nomic-embed-text'));
    }
  } catch (_) {}

  if (!hasEmbedModel) {
    console.warn('[AEGISOS Semantic Index] Model "nomic-embed-text" not found in local Ollama tags. RAG indexing skipped.');
    console.warn('[AEGISOS Semantic Index] Run "ollama pull nomic-embed-text" to enable local contextual search.');
    return;
  }

  // Sync vectors incrementally
  for (const filePath of refinedFiles) {
    try {
      const stats = await fs.stat(filePath);
      const mtimeMs = stats.mtime.getTime();
      const size = stats.size;
      
      const cached = cache[filePath];
      if (!cached || cached.updatedAt !== mtimeMs || cached.size !== size) {
        const content = await fs.readFile(filePath, 'utf-8');
        const cleanedText = content.replace(/[\#\*\`\[\]]/g, ' ').slice(0, 3000); 
        const vector = await getEmbedding(cleanedText);
        
        if (vector) {
          cache[filePath] = {
            vector,
            updatedAt: mtimeMs,
            size,
            title: path.basename(filePath, '.md'),
            relativePath: path.relative(VAULT_ROOT, filePath).replace(/\\/g, '/')
          };
          cacheChanged = true;
          await new Promise(resolve => setTimeout(resolve, 20));
        }
      }
    } catch (err) {
      console.error(`[AEGISOS Semantic Index] Failed to index ${filePath}:`, err.message);
    }
  }

  if (cacheChanged) {
    await fs.writeFile(EMBEDDINGS_CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
    console.log('[AEGISOS Semantic Index] Vault embeddings cache synced and saved.');
  } else {
    console.log('[AEGISOS Semantic Index] Vault embeddings index is already up to date.');
  }
}

// Helper to sync and flattened cached notes and flashcards
async function syncMetadataCache() {
  let cache = { lastScanTime: 0, notes: {}, flashcards: {} };
  
  try {
    const cacheData = await fs.readFile(CACHE_FILE, 'utf-8');
    cache = JSON.parse(cacheData);
    if (!cache.notes) cache.notes = {};
    if (!cache.flashcards) cache.flashcards = {};
  } catch (e) {
    cache = { lastScanTime: 0, notes: {}, flashcards: {} };
  }

  const refinedFiles = await getMarkdownFiles(REFINED_NOTES_DIR);
  let rawFiles = [];
  try {
    rawFiles = await getMarkdownFiles(path.join(VAULT_ROOT, '20_Sources'));
  } catch (_) {}
  const currentFiles = [...refinedFiles, ...rawFiles];
  
  const currentPathsSet = new Set(currentFiles);
  let cacheChanged = false;

  // 1. Evict deleted files from cache
  for (const cachedPath in cache.notes) {
    if (!currentPathsSet.has(cachedPath)) {
      delete cache.notes[cachedPath];
      delete cache.flashcards[cachedPath];
      cacheChanged = true;
    }
  }

  // 2. Incremental sync for new/modified files
  for (const filePath of currentFiles) {
    try {
      const stats = await fs.stat(filePath);
      const mtimeMs = stats.mtime.getTime();
      const size = stats.size;
      
      const cachedNote = cache.notes[filePath];
      if (!cachedNote || new Date(cachedNote.updatedAt).getTime() !== mtimeMs || cachedNote.size !== size) {
        const relativePath = path.relative(VAULT_ROOT, filePath).replace(/\\/g, '/');
        const filename = path.basename(filePath);
        const subject = getSubjectFromPath(filePath);
        const content = await fs.readFile(filePath, 'utf-8');
        
        let title = filename.replace('.md', '');
        const h1Match = content.match(/^#\s+(.+)$/m);
        if (h1Match) {
          title = h1Match[1].replace(/[\#\*]/g, '').trim();
          title = title.replace(/^[^\w\s\(\)\-\,\.\'\’\"]+\s*/, '');
        }

        cache.notes[filePath] = {
          title,
          filename,
          relativePath,
          absolutePath: filePath.replace(/\\/g, '/'),
          subject,
          size,
          updatedAt: stats.mtime
        };

        // Parse flashcards inside the updated file
        const fileFlashcards = [];
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          if (line.startsWith('::') && i > 0) {
            let questionIdx = i - 1;
            while (questionIdx >= 0 && lines[questionIdx].trim() === '') {
              questionIdx--;
            }
            if (questionIdx >= 0) {
              const question = lines[questionIdx].replace('#flashcards', '').trim();
              const answer = line.substring(2).trim();
              if (question && answer) {
                fileFlashcards.push({
                  id: `${filename}-${i}`,
                  type: 'inline-nextline',
                  question,
                  answer,
                  filename,
                  filePath: filePath.replace(/\\/g, '/'),
                  subject,
                });
              }
            }
          } else if (line.includes('::')) {
            const parts = line.split('::');
            const question = parts[0].replace('#flashcards', '').trim();
            const answer = parts[1].trim();
            if (question && answer) {
              fileFlashcards.push({
                id: `${filename}-${i}`,
                type: 'inline',
                question,
                answer,
                filename,
                filePath: filePath.replace(/\\/g, '/'),
                subject,
              });
            }
          } else if (line === '??' && i > 0 && i + 1 < lines.length) {
            let questionIdx = i - 1;
            while (questionIdx >= 0 && lines[questionIdx].trim() === '') {
              questionIdx--;
            }
            if (questionIdx >= 0) {
              const question = lines[questionIdx].replace('#flashcards', '').trim();
              const answerLines = [];
              let j = i + 1;
              while (j < lines.length) {
                const nextLine = lines[j].trim();
                if (
                  nextLine === '' ||
                  nextLine.includes('::') ||
                  nextLine.startsWith('::') ||
                  nextLine.endsWith('??') ||
                  nextLine === '??' ||
                  nextLine.startsWith('#') ||
                  nextLine.startsWith('---')
                ) {
                  break;
                }
                answerLines.push(lines[j]);
                j++;
              }
              const answer = answerLines.join('\n').trim();
              if (question && answer) {
                fileFlashcards.push({
                  id: `${filename}-${i}`,
                  type: 'multiline-nextline',
                  question,
                  answer,
                  filename,
                  filePath: filePath.replace(/\\/g, '/'),
                  subject,
                });
                i = j - 1;
              }
            }
          } else if (line.endsWith('??') && i + 1 < lines.length) {
            const question = line.slice(0, -2).replace('#flashcards', '').trim();
            const answerLines = [];
            let j = i + 1;
            while (j < lines.length) {
              const nextLine = lines[j].trim();
              if (
                nextLine === '' ||
                nextLine.includes('::') ||
                nextLine.startsWith('::') ||
                nextLine.endsWith('??') ||
                nextLine === '??' ||
                nextLine.startsWith('#') ||
                nextLine.startsWith('---')
              ) {
                break;
              }
              answerLines.push(lines[j]);
              j++;
            }
            const answer = answerLines.join('\n').trim();
            if (question && answer) {
              fileFlashcards.push({
                id: `${filename}-${i}`,
                type: 'multiline',
                question,
                answer,
                filename,
                filePath: filePath.replace(/\\/g, '/'),
                subject,
              });
              i = j - 1;
            }
          }
        }
        cache.flashcards[filePath] = fileFlashcards;
        cacheChanged = true;
      }
    } catch (e) {
      console.error(`Failed to sync file ${filePath}:`, e.message);
    }
  }

  if (cacheChanged) {
    cache.lastScanTime = Date.now();
    await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
    console.log('Metadata cache synced and written.');
  }

  const notesList = Object.values(cache.notes);
  const flashcardsList = Object.values(cache.flashcards).flat();
  return { notes: notesList, flashcards: flashcardsList };
}

// Helper to parse subject from path
function getSubjectFromPath(filePath) {
  const relative = path.relative(REFINED_NOTES_DIR, filePath);
  const parts = relative.split(path.sep);
  if (parts.length > 1) {
    const clean = parts[0].toUpperCase();
    if (clean.includes('00_MOCS') || clean.includes('MOC')) return 'MOC';
    if (clean.includes('OPERATING_SYSTEMS') || clean.includes('OS')) return 'OS';
    if (clean.includes('DATA_STRUCTURES') || clean.includes('DSA')) return 'DSA';
    if (clean.includes('DATABASE_SYSTEMS') || clean.includes('DBMS')) return 'DBMS';
    if (clean.includes('DISCRETE')) return 'DISCRETE_MATHEMATICS';
    if (clean.includes('COMPUTER_ARCHITECTURE') || clean.includes('SYSTEM_ARCHITECTURE') || clean.includes('COMPUTER_SYSTEM_ARCHITECTURE')) return 'COMPUTER_SYSTEM_ARCHITECTURE';
    if (clean.includes('CYBER') || clean.includes('NETWORKS') || clean.includes('CYBER_CN')) return 'CYBER_CN';
    if (clean.includes('MACHINE_LEARNING') || clean.includes('ML')) return 'ML';
    if (clean.includes('OOPS') || clean.includes('OPPS') || clean.includes('OBJECT_ORIENTED')) return 'OPPS';
    if (clean.includes('STATISTICS')) return 'STATISTICS';
  }
  const relativeRaw = path.relative(path.join(VAULT_ROOT, '20_Sources'), filePath);
  const partsRaw = relativeRaw.split(path.sep);
  if (partsRaw.length > 1) {
    const cleanRaw = partsRaw[0].toUpperCase();
    if (cleanRaw.includes('OPERATING_SYSTEMS') || cleanRaw.includes('OS')) return 'OS';
    if (cleanRaw.includes('DATA_STRUCTURES') || cleanRaw.includes('DSA')) return 'DSA';
    if (cleanRaw.includes('DATABASE_SYSTEMS') || cleanRaw.includes('DBMS')) return 'DBMS';
    if (cleanRaw.includes('DISCRETE')) return 'DISCRETE_MATHEMATICS';
    if (cleanRaw.includes('COMPUTER_ARCHITECTURE') || cleanRaw.includes('SYSTEM_ARCHITECTURE') || cleanRaw.includes('COMPUTER_SYSTEM_ARCHITECTURE')) return 'COMPUTER_SYSTEM_ARCHITECTURE';
    if (cleanRaw.includes('CYBER') || cleanRaw.includes('NETWORKS') || cleanRaw.includes('CYBER_CN')) return 'CYBER_CN';
    if (cleanRaw.includes('MACHINE_LEARNING') || cleanRaw.includes('ML')) return 'ML';
    if (cleanRaw.includes('OOPS') || cleanRaw.includes('OPPS') || cleanRaw.includes('OBJECT_ORIENTED')) return 'OPPS';
    if (cleanRaw.includes('STATISTICS')) return 'STATISTICS';
  }
  return 'GENERAL';
}

// Endpoints

// 1. Get vault configurations and API key presence
app.get('/api/config', (req, res) => {
  res.json({
    vaultRoot: VAULT_ROOT,
    geminiKeyConfigured: !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
    openaiKeyConfigured: !!process.env.OPENAI_API_KEY,
    anthropicKeyConfigured: !!process.env.ANTHROPIC_API_KEY,
  });
});

const TASKS_FILE_PATH = path.join(VAULT_ROOT, '00_Inbox', 'Tasks.md');

// Get all tasks
app.get('/api/tasks', (req, res) => {
  try {
    if (!fsSync.existsSync(TASKS_FILE_PATH)) {
      return res.json([]);
    }
    const content = fsSync.readFileSync(TASKS_FILE_PATH, 'utf8');
    const lines = content.split('\n');
    const tasks = [];
    let idCounter = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const activeMatch = line.match(/^\s*-\s*\[\s*\]\s*(.+)$/i);
      const completedMatch = line.match(/^\s*-\s*\[\s*x\s*\]\s*(.+)$/i);
      if (activeMatch) {
        tasks.push({ id: idCounter++, text: activeMatch[1].trim(), completed: false });
      } else if (completedMatch) {
        tasks.push({ id: idCounter++, text: completedMatch[1].trim(), completed: true });
      }
    }
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a task
app.post('/api/tasks/add', (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Task text is required' });
    }
    const newTaskLine = `- [ ] ${text}`;
    let content = '';
    if (fsSync.existsSync(TASKS_FILE_PATH)) {
      content = fsSync.readFileSync(TASKS_FILE_PATH, 'utf8');
    } else {
      content = `# 📋 University Tasks\n\n## 📥 Active Tasks\n`;
    }
    const lines = content.split('\n');
    const activeIndex = lines.findIndex(l => l.includes('## 📥 Active Tasks'));
    if (activeIndex !== -1) {
      lines.splice(activeIndex + 1, 0, newTaskLine);
    } else {
      lines.push(newTaskLine);
    }
    fsSync.writeFileSync(TASKS_FILE_PATH, lines.join('\n'), 'utf8');

    // Trigger background Graphify update
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
    const cmd = `cmd.exe /c "set GEMINI_API_KEY=${geminiKey}&& set GOOGLE_API_KEY=${geminiKey}&& graphify extract ${VAULT_ROOT} --model gemini-3.1-flash-lite && graphify cluster-only ${VAULT_ROOT} --model gemini-3.1-flash-lite"`;
    exec(cmd, (err) => {
      if (err) console.error('Background graphify error:', err);
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle a task
app.post('/api/tasks/toggle', (req, res) => {
  try {
    const { text, completed } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Task text is required' });
    }
    if (!fsSync.existsSync(TASKS_FILE_PATH)) {
      return res.status(404).json({ error: 'Tasks file not found' });
    }
    let content = fsSync.readFileSync(TASKS_FILE_PATH, 'utf8');
    const lines = content.split('\n');
    let found = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (completed) {
        if (line.trim().startsWith('- [ ]') && line.includes(text)) {
          lines[i] = line.replace('- [ ]', '- [x]');
          found = true;
          break;
        }
      } else {
        if (line.trim().startsWith('- [x]') && line.includes(text)) {
          lines[i] = line.replace('- [x]', '- [ ]');
          found = true;
          break;
        }
      }
    }
    if (found) {
      fsSync.writeFileSync(TASKS_FILE_PATH, lines.join('\n'), 'utf8');
      
      // Trigger background Graphify update
      const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
      const cmd = `cmd.exe /c "set GEMINI_API_KEY=${geminiKey}&& set GOOGLE_API_KEY=${geminiKey}&& graphify extract ${VAULT_ROOT} --model gemini-3.1-flash-lite && graphify cluster-only ${VAULT_ROOT} --model gemini-3.1-flash-lite"`;
      exec(cmd, (err) => {
        if (err) console.error('Background graphify error:', err);
      });

      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/notes/upload-slides', upload.single('file'), async (req, res) => {
  try {
    const subject = req.body.subject;
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded.' });
    }
    if (!subject || !SUBJECT_FOLDER_MAP[subject]) {
      return res.status(400).json({ success: false, error: `Invalid subject: ${subject}` });
    }

    // Parse PDF text
    const pdfBuffer = req.file.buffer;
    const parsedPdf = await pdf(pdfBuffer);
    const textContent = parsedPdf.text;

    if (!textContent || !textContent.trim()) {
      return res.status(400).json({ success: false, error: 'PDF file is empty or could not be parsed.' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
    if (!apiKey) {
      return res.status(500).json({ success: false, error: 'Gemini API key is not configured.' });
    }

    const prompt = `You are the AEGISOS Coprocessor.
Your task is to parse the raw text extracted from a university lecture slides PDF and slice/refine it into atomic concept notes.
Each concept note must be returned as a separate block with a special delimiter: "=== NOTE_START ===" and "=== NOTE_END ===".

For each concept note:
1. Generate a descriptive title (used as the filename, e.g. "Virtual Memory Pages").
2. Format the body of the note using beautiful, structured markdown.
3. Every note must follow these formatting constraints:
   - YAML metadata block at the top:
     ---
     title: "Note Title"
     subject: "${subject}"
     type: concept
     ---
   - Link at the top back to the subject's MOC file: "Up: [[${subject} MOC]]"
   - Include clear definitions, lists, and LaTeX equations if relevant. Use $$ ... $$ for blocks and $ ... $ for inline math.
   - At the bottom, include 2-3 Active Recall Flashcards formatted with double colons: "Question :: Answer" or double question marks: "Question ?? Answer" and tagged with #flashcards.
   - Keep code blocks clean.
4. Output format:
=== NOTE_START ===
FILENAME: Note Title
---
yaml...
---
Up: [[${subject} MOC]]
# Note Title
...body...
#flashcards
Question :: Answer
=== NOTE_END ===

Do not output any introductory or concluding text. Return only the note blocks.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${prompt}\n\n==================== RAW SLIDES TEXT ====================\n${textContent}` }]
        }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini API error: ${err}`);
    }

    const json = await response.json();
    const responseText = json.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Process the response and save files
    const noteBlocks = responseText.split('=== NOTE_START ===');
    const savedNotes = [];

    for (let block of noteBlocks) {
      if (!block.trim()) continue;
      const endIdx = block.indexOf('=== NOTE_END ===');
      let cleanBlock = block;
      if (endIdx !== -1) {
        cleanBlock = block.substring(0, endIdx);
      }

      const lines = cleanBlock.trim().split('\n');
      let filenameLine = lines.find(l => l.trim().startsWith('FILENAME:'));
      if (!filenameLine) continue;

      const filename = filenameLine.replace('FILENAME:', '').trim();
      const cleanFilename = filename.replace(/[\\/:*?"<>|]/g, '_') + '.md';
      const contentLines = lines.filter(l => !l.trim().startsWith('FILENAME:'));
      const content = contentLines.join('\n').trim();

      const subjectFolder = SUBJECT_FOLDER_MAP[subject];
      const targetDir = path.join(REFINED_NOTES_DIR, subjectFolder);
      
      // Ensure target directory exists
      await fs.mkdir(targetDir, { recursive: true });
      const targetFilePath = path.join(targetDir, cleanFilename);

      await fs.writeFile(targetFilePath, content, 'utf8');
      savedNotes.push(cleanFilename);
    }

    // Automatically update the subject MOC to index the new files!
    const mocFilename = `${subject} MOC.md`;
    const mocDir = path.join(REFINED_NOTES_DIR, '00_MOCs');
    const mocPath = path.join(mocDir, mocFilename);
    
    let mocContent = '';
    try {
      mocContent = await fs.readFile(mocPath, 'utf8');
    } catch (_) {
      mocContent = `---\ntitle: "${subject} MOC"\ntype: moc\n---\n\n# ${subject} Map of Content\n\n## Core Concepts\n`;
    }

    let updatedMocContent = mocContent;
    for (const cleanName of savedNotes) {
      const baseName = cleanName.replace('.md', '');
      const linkStr = `- [[${baseName}]]`;
      if (!mocContent.includes(`[[${baseName}]]`)) {
        updatedMocContent += `\n${linkStr}`;
      }
    }

    await fs.mkdir(mocDir, { recursive: true });
    await fs.writeFile(mocPath, updatedMocContent, 'utf8');

    res.json({
      success: true,
      message: `Successfully processed ${savedNotes.length} concept notes.`,
      notes: savedNotes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

async function getUnlinkedNotes() {
  const mocsDir = path.join(REFINED_NOTES_DIR, '00_MOCs');
  const mocLinks = new Set();
  try {
    const mocFiles = await fs.readdir(mocsDir);
    for (const file of mocFiles) {
      if (file.endsWith('.md')) {
        const content = await fs.readFile(path.join(mocsDir, file), 'utf8');
        const matches = content.match(/\[\[(.*?)\]\]/g) || [];
        for (const match of matches) {
          const cleanLink = match.slice(2, -2).trim();
          mocLinks.add(cleanLink.toLowerCase());
        }
      }
    }
  } catch (_) {}

  const allNotes = [];
  async function scan(dir) {
    const list = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of list) {
      const resPath = path.resolve(dir, entry.name);
      if (entry.isDirectory()) {
        const nameLower = entry.name.toLowerCase();
        if (nameLower === '00_mocs' || nameLower === 'node_modules' || nameLower === '.git' || nameLower === 'dashboard' || nameLower === 'graphify-out') continue;
        await scan(resPath);
      } else if (entry.name.endsWith('.md')) {
        allNotes.push(resPath);
      }
    }
  }
  
  try {
    await scan(REFINED_NOTES_DIR);
  } catch (_) {}

  const unlinked = [];
  for (const file of allNotes) {
    const baseName = path.basename(file, '.md');
    if (baseName.toLowerCase().endsWith(' moc')) continue;
    if (!mocLinks.has(baseName.toLowerCase())) {
      unlinked.push({
        title: baseName,
        absolutePath: file,
        relativePath: path.relative(VAULT_ROOT, file).replace(/\\/g, '/')
      });
    }
  }
  return unlinked;
}

app.post('/api/review', express.json(), async (req, res) => {
  const { card_id, quality } = req.body;
  if (card_id === undefined || quality === undefined) {
    return res.status(400).json({ error: 'card_id and quality are required' });
  }

  const q = parseInt(quality, 10);
  if (isNaN(q) || q < 0 || q > 5) {
    return res.status(400).json({ error: 'Quality must be between 0 and 5' });
  }

  try {
    const selectQuery = db.prepare(`SELECT * FROM flashcards WHERE id = ?`);
    const card = selectQuery.get(card_id);
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    let easiness = card.easiness;
    let interval = card.interval;
    let repetitions = card.repetitions;

    // SM-2 calculation
    easiness = easiness + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (easiness < 1.3) easiness = 1.3;

    if (q < 3) {
      repetitions = 0;
      interval = 1;
    } else {
      repetitions += 1;
      if (repetitions === 1) {
        interval = 1;
      } else if (repetitions === 2) {
        interval = 6;
      } else {
        interval = Math.round(interval * easiness);
      }
    }

    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + interval);
    const dueStr = nextDueDate.toISOString().split('T')[0];
    const lastReviewedStr = new Date().toISOString().split('T')[0];

    const updateStmt = db.prepare(`
      UPDATE flashcards 
      SET easiness = ?, interval = ?, repetitions = ?, due_date = ?, last_reviewed = ?
      WHERE id = ?
    `);
    updateStmt.run(easiness, interval, repetitions, dueStr, lastReviewedStr, card_id);

    res.json({
      success: true,
      card: {
        id: card_id,
        easiness,
        interval,
        repetitions,
        due_date: dueStr
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/daily-brief', async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // 1. Cards due
    const cardsQuery = db.prepare(`SELECT * FROM flashcards WHERE due_date <= ?`);
    const cardsDue = cardsQuery.all(todayStr);

    // 2. Unfiled notes
    const unfiledQuery = db.prepare(`SELECT * FROM inbox_log WHERE status = 'unfiled'`);
    const unfiledNotes = unfiledQuery.all();

    // 3. Unlinked notes
    const unlinkedNotes = await getUnlinkedNotes();

    res.json({
      cards_due: cardsDue,
      unfiled_notes: unfiledNotes,
      unlinked_notes: unlinkedNotes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// 2. List all notes
app.get('/api/notes', async (req, res) => {
  try {
    const { notes } = await syncMetadataCache();
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Get note content
app.get('/api/notes/content', async (req, res) => {
  const { filePath } = req.query;
  if (!filePath) {
    return res.status(400).json({ error: 'filePath query param is required' });
  }
  try {
    const resolvedPath = path.resolve(filePath);
    // Security check: ensure the path is within the vault
    if (!resolvedPath.startsWith(VAULT_ROOT)) {
      return res.status(403).json({ error: 'Access denied: outside workspace' });
    }
    const content = await fs.readFile(resolvedPath, 'utf-8');
    res.json({ content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Save note content
app.post('/api/notes/save', async (req, res) => {
  const { filePath, content } = req.body;
  if (!filePath || content === undefined) {
    return res.status(400).json({ error: 'filePath and content are required' });
  }
  try {
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(VAULT_ROOT)) {
      return res.status(403).json({ error: 'Access denied: outside workspace' });
    }
    await fs.writeFile(resolvedPath, content, 'utf-8');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Get graph data from graphify-out
app.get('/api/graph', async (req, res) => {
  try {
    const data = await fs.readFile(GRAPH_FILE, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    // If graphify file doesn't exist, return empty or try to scan simple relations
    res.json({ nodes: [], links: [], message: 'Graph.json not found. Run Graphify to generate.' });
  }
});

// 6. Get all flashcards from notes
app.get('/api/flashcards', async (req, res) => {
  try {
    const { flashcards } = await syncMetadataCache();
    res.json(flashcards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Rebuild Graphify graph
app.post('/api/graph/rebuild', (req, res) => {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
  console.log('Rebuilding knowledge graph...');

  // Run graphify in powershell
  const cmd = `cmd.exe /c "set GEMINI_API_KEY=${geminiKey}&& set GOOGLE_API_KEY=${geminiKey}&& graphify extract ${VAULT_ROOT} --model gemini-3.1-flash-lite && graphify cluster-only ${VAULT_ROOT} --model gemini-3.1-flash-lite"`;
  
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error('Graphify error:', stderr);
      return res.status(500).json({ error: stderr || error.message });
    }
    console.log('Graphify output:', stdout);
    res.json({ success: true, output: stdout });
  });
});

// Clean up outer markdown code block fences if present in LLM response
function cleanMarkdownFences(text) {
  if (!text) return '';
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(markdown|md)?\s*\n/i, '');
  cleaned = cleaned.replace(/\n\s*```$/, '');
  return cleaned.trim();
}

// Reusable helper to generate AI Refinement / Synthesis
async function generateRefinementText({ provider, model, prompt, content, apiKeyOverride }) {
  let aiResponseText = '';

  if (provider === 'gemini') {
    const apiKey = apiKeyOverride || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
    const selectedModel = model || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${prompt}\n\n==================== CONTENT ====================\n${content}` }]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.statusText} (${errorText})`);
    }

    const json = await response.json();
    aiResponseText = json.candidates?.[0]?.content?.parts?.[0]?.text || '';

  } else if (provider === 'openai') {
    const apiKey = apiKeyOverride || process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OpenAI API key is missing. Set OPENAI_API_KEY env or provide override.');
    const selectedModel = model || 'gpt-4o';
    const url = 'https://api.openai.com/v1/chat/completions';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: content }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.statusText} (${errorText})`);
    }

    const json = await response.json();
    aiResponseText = json.choices?.[0]?.message?.content || '';

  } else if (provider === 'ollama') {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
    let selectedModel = model || 'auto';
    let detectedCategory = 'research'; // Default to research formatting for note refinements

    if (selectedModel === 'auto') {
      try {
        const tagsResponse = await fetch(`${ollamaUrl}/api/tags`);
        if (tagsResponse.ok) {
          const tagsData = await tagsResponse.json();
          const sampleText = `${prompt} ${content}`;
          const classification = classifyTaskAndModel(sampleText, tagsData.models || []);
          if (classification.model) {
            selectedModel = classification.model;
            detectedCategory = classification.category;
            console.log(`[AEGISOS Router] Auto-routed refinement to model: ${selectedModel} | Category: ${detectedCategory}`);
          }
        }
      } catch (e) {
        console.warn('[AEGISOS Router] Failed to fetch tags for auto-routing, using default.', e.message);
      }
    }

    // Default fallback if auto failed to find a model
    if (selectedModel === 'auto') selectedModel = 'llama3';

    const baseSystemPrompt = AEGISOS_SYSTEM_PROMPTS[detectedCategory] || AEGISOS_SYSTEM_PROMPTS.research;

    const url = `${ollamaUrl}/api/generate`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: selectedModel,
        system: baseSystemPrompt,
        prompt: `${prompt}\n\nContent to refine:\n${content}`,
        keep_alive: "5m", // Automatically unload model from memory after 5 minutes of idle time
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama local API error: ${response.statusText}`);
    }

    const json = await response.json();
    aiResponseText = json.response || '';

  } else if (provider === 'anthropic') {
    const apiKey = apiKeyOverride || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('Anthropic API key is missing. Set ANTHROPIC_API_KEY env or provide override.');
    const selectedModel = model || 'claude-3-5-sonnet-latest';
    const url = 'https://api.anthropic.com/v1/messages';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: selectedModel,
        max_tokens: 4000,
        messages: [
          { role: 'user', content: `${prompt}\n\nContent to refine:\n${content}` }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API error: ${response.statusText} (${errorText})`);
    }

    const json = await response.json();
    aiResponseText = json.content?.[0]?.text || '';
  } else {
    throw new Error(`Unknown AI provider: ${provider}`);
  }

  return cleanMarkdownFences(aiResponseText);
}

// 8. Multi-AI Coprocessor Refine Note
app.post('/api/refine', async (req, res) => {
  const { provider, model, prompt, content, apiKeyOverride } = req.body;

  if (!provider || !prompt || content === undefined) {
    return res.status(400).json({ error: 'provider, prompt, and content are required' });
  }

  try {
    const result = await generateRefinementText({ provider, model, prompt, content, apiKeyOverride });
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 9. Multi-LLM Chat Endpoint
app.post('/api/chat', async (req, res) => {
  const { provider, model, messages, apiKeyOverride } = req.body;

  if (!provider || !messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'provider and messages array are required' });
  }

  try {
    let aiResponseText = '';

    if (provider === 'gemini') {
      const apiKey = apiKeyOverride || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
      const selectedModel = model || 'gemini-2.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;

      // Map roles to Gemini requirements ('user' and 'model')
      const contents = messages.map(msg => {
        let role = msg.role === 'assistant' ? 'model' : 'user';
        if (msg.role === 'system') {
          // Gemini handles system instruction separately, but we can treat as user message or systemInstruction
          role = 'user'; 
        }
        return {
          role: role,
          parts: [{ text: msg.content }]
        };
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.statusText} (${errorText})`);
      }

      const json = await response.json();
      aiResponseText = json.candidates?.[0]?.content?.parts?.[0]?.text || '';

    } else if (provider === 'openai') {
      const apiKey = apiKeyOverride || process.env.OPENAI_API_KEY;
      if (!apiKey) throw new Error('OpenAI API key is missing.');
      const selectedModel = model || 'gpt-4o';
      const url = 'https://api.openai.com/v1/chat/completions';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: messages
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.statusText} (${errorText})`);
      }

      const json = await response.json();
      aiResponseText = json.choices?.[0]?.message?.content || '';

    } else if (provider === 'ollama') {
      const ollamaUrl = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
      let selectedModel = model || 'auto';
      let detectedCategory = 'brainstorming';

      if (selectedModel === 'auto') {
        try {
          const tagsResponse = await fetch(`${ollamaUrl}/api/tags`);
          if (tagsResponse.ok) {
            const tagsData = await tagsResponse.json();
            const lastUserMessage = messages[messages.length - 1]?.content || '';
            const classification = classifyTaskAndModel(lastUserMessage, tagsData.models || []);
            if (classification.model) {
              selectedModel = classification.model;
              detectedCategory = classification.category;
              console.log(`[AEGISOS Router] Auto-routed chat query to model: ${selectedModel} | Category: ${detectedCategory}`);
            }
          }
        } catch (e) {
          console.warn('[AEGISOS Router] Failed to fetch tags for auto-routing, using default.', e.message);
        }
      }

      // Default fallback if auto failed to find a model
      if (selectedModel === 'auto') selectedModel = 'llama3';

      // Retrieve contextual notes using local RAG (Cosine Similarity search)
      let contextString = '';
      try {
        const queryText = messages[messages.length - 1]?.content || '';
        const queryVector = await getEmbedding(queryText);
        
        if (queryVector) {
          let embedCache = {};
          try {
            const cacheData = await fs.readFile(EMBEDDINGS_CACHE_FILE, 'utf-8');
            embedCache = JSON.parse(cacheData);
          } catch (_) {}

          const ranked = [];
          for (const filePath in embedCache) {
            const similarity = cosineSimilarity(queryVector, embedCache[filePath].vector);
            ranked.push({
              filePath,
              similarity,
              title: embedCache[filePath].title
            });
          }

          ranked.sort((a, b) => b.similarity - a.similarity);
          
          // Get top 3 notes with similarity score above 0.45
          const topNotes = ranked.filter(n => n.similarity > 0.45).slice(0, 3);
          
          if (topNotes.length > 0) {
            const chunks = [];
            for (const note of topNotes) {
              const content = await fs.readFile(note.filePath, 'utf-8');
              chunks.push(`--- Note: ${note.title} (Relevance: ${Math.round(note.similarity * 100)}%) ---\n${content.slice(0, 2000)}`);
            }
            contextString = chunks.join('\n\n');
            console.log(`[AEGISOS Semantic Index] Retrieved ${topNotes.length} context notes for query: "${queryText.slice(0, 30)}..."`);
          }
        }
      } catch (ragErr) {
        console.warn('[AEGISOS Semantic Index] Context retrieval error:', ragErr.message);
      }

      let modifiedMessages = [...messages];
      const baseSystemPrompt = AEGISOS_SYSTEM_PROMPTS[detectedCategory] || AEGISOS_SYSTEM_PROMPTS.brainstorming;
      
      let systemPrompt = `${baseSystemPrompt}`;
      
      if (contextString) {
        systemPrompt += `\n\nYou have access to the user's local notes vault. Use the following context from their notes to answer their question accurately. If the context doesn't contain the answer, use your general knowledge, but reference the notes where applicable.

================ CONTEXT FROM USER NOTES ================
${contextString}
=========================================================`;
      }

      const existingSystemIdx = modifiedMessages.findIndex(m => m.role === 'system');
      if (existingSystemIdx !== -1) {
        modifiedMessages[existingSystemIdx] = {
          role: 'system',
          content: `${systemPrompt}\n\nOriginal System Instructions:\n${modifiedMessages[existingSystemIdx].content}`
        };
      } else {
        modifiedMessages.unshift({
          role: 'system',
          content: systemPrompt
        });
      }

      const url = `${ollamaUrl}/api/chat`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          messages: modifiedMessages,
          keep_alive: "5m", // Automatically unload model from memory after 5 minutes of idle time
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama local API error: ${response.statusText}`);
      }

      const json = await response.json();
      aiResponseText = json.message?.content || '';

    } else if (provider === 'anthropic') {
      const apiKey = apiKeyOverride || process.env.ANTHROPIC_API_KEY;
      if (!apiKey) throw new Error('Anthropic API key is missing.');
      const selectedModel = model || 'claude-3-5-sonnet-latest';
      const url = 'https://api.anthropic.com/v1/messages';

      // Separate system messages for Claude
      const systemMessage = messages.find(m => m.role === 'system')?.content || '';
      const chatMessages = messages.filter(m => m.role !== 'system').map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }));

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: selectedModel,
          max_tokens: 4000,
          system: systemMessage || undefined,
          messages: chatMessages
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Anthropic API error: ${response.statusText} (${errorText})`);
      }

      const json = await response.json();
      aiResponseText = json.content?.[0]?.text || '';
    } else {
      throw new Error(`Unknown AI provider: ${provider}`);
    }

    res.json({ result: aiResponseText });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper slugify function
function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// Automatically link saved chat in the central Master MOC index
async function linkChatInMasterMOC(filename, title, dateStr, isStaging, topic, finalPath) {
  const mocPath = path.join(VAULT_ROOT, 'University Notes.md');
  try {
    let content = await fs.readFile(mocPath, 'utf-8');
    const noteName = filename.replace('.md', '');
    
    const relativeWikiPath = path.relative(VAULT_ROOT, finalPath).replace(/\\/g, '/').replace('.md', '');
    const linkText = `*   [[${relativeWikiPath}|${title} (Chat Session)]] - *Saved on ${dateStr}*${topic ? ` (Inbox: ${topic})` : ''}`;
    
    if (isStaging) {
      if (!content.includes('## 📥 Academic Inbox & Staging')) {
        content = content.replace(
          '## ⚡ Quick Navigation & Tools',
          `## 📥 Academic Inbox & Staging\n\n${linkText}\n\n---\n\n## ⚡ Quick Navigation & Tools`
        );
      } else {
        content = content.replace(
          '## 📥 Academic Inbox & Staging',
          `## 📥 Academic Inbox & Staging\n\n${linkText}`
        );
      }
    } else {
      if (!content.includes('## 💬 General Chat Archive')) {
        content = content.replace(
          '## ⚡ Quick Navigation & Tools',
          `## 💬 General Chat Archive\n\n${linkText}\n\n---\n\n## ⚡ Quick Navigation & Tools`
        );
      } else {
        content = content.replace(
          '## 💬 General Chat Archive',
          `## 💬 General Chat Archive\n\n${linkText}`
        );
      }
    }
    await fs.writeFile(mocPath, content, 'utf-8');
    console.log('Successfully registered chat link in University Notes.md');
  } catch (error) {
    console.error('Failed to link chat in Master MOC:', error.message);
  }
}

// 10. Save Chat with Automatic Synthesis
app.post('/api/chat/save', async (req, res) => {
  const { provider, model, messages, topic, title, conversationId, apiKeyOverride } = req.body;

  if (!messages || !Array.isArray(messages) || !title) {
    return res.status(400).json({ error: 'messages array and title are required' });
  }

  try {
    // 1. Generate synthesized study note using the LLM
    const synthPrompt = `You are an expert university notes refiner. Analyze the provided chat history between a student and an AI assistant, and synthesize the technical concepts discussed into a structured, cohesive, high-quality Obsidian concept note.
Follow these guidelines:
1. Divide it into logical sections with descriptive subheaders (##, ###).
2. Format all mathematical equations in LaTeX ($ for inline, $$ for block).
3. Append a set of active recall flashcards under the "## 🧠 Spaced Repetition Flashcards #flashcards" header at the very bottom, using "::" for inline (Q :: A) and "??" for multiline cards.
4. Integrate double-bracket wikilinks [[Note Name]] for key concepts to connect it with the vault.
5. Return ONLY the markdown content. Do not write any conversational intro or outro.`;

    const chatLogString = messages.map(m => `[${m.role.toUpperCase()}]: ${m.content}`).join('\n\n');

    let synthesisText = '';
    try {
      synthesisText = await generateRefinementText({
        provider: provider || 'gemini',
        model: model,
        prompt: synthPrompt,
        content: chatLogString,
        apiKeyOverride: apiKeyOverride
      });
    } catch (err) {
      console.error('Synthesis generation failed:', err.message);
      // Fallback if refine fails: compile raw text
      synthesisText = `## Chat Session: ${title}\n\n*Unable to generate automatic textbook synthesis. Falling back to transcript.*`;
    }

    // 2. Create the hybrid note content
    const dateStr = new Date().toISOString().split('T')[0];
    const fileContent = `---
subject: ${topic ? topic.toUpperCase() : 'GENERAL'}
topic: ${title}
concept: Chat Session
type: agent-chat
status: archived
aliases: ["${title}", "Chat Session: ${title}"]
tags: [agent-session, university-os, chat-preservation]
created: ${dateStr}
---

# 💬 Chat Session: ${title}

${synthesisText}

---

## 📜 Full Conversation History
<details>
<summary>Click to expand raw transcript (${messages.length} turns)</summary>

${messages.map(m => `**${m.role.toUpperCase()}**: ${m.content}`).join('\n\n')}

</details>
`;

    // 3. Determine save path & filename
    let targetDir = '';
    let filename = '';
    let saveSubject = 'GENERAL';

    const isMoc = topic && (topic.toLowerCase().includes('moc') || title.toLowerCase().includes('moc'));

    if (isMoc) {
      targetDir = path.join(VAULT_ROOT, '10_Subjects', '00_MOCs');
      saveSubject = 'MOC';
      let cleanTitle = title;
      if (!cleanTitle.toUpperCase().endsWith('MOC')) {
        cleanTitle = `${cleanTitle} MOC`;
      }
      filename = `${cleanTitle}.md`;
    } else if (topic) {
      // Staging incubator folder inside 00_Inbox
      targetDir = path.join(VAULT_ROOT, '00_Inbox', 'inbox_notes', slugify(topic));
      saveSubject = 'INBOX';
      filename = `${dateStr}-${slugify(title)}.md`;
    } else {
      // General agent chats folder inside 00_Inbox
      targetDir = path.join(VAULT_ROOT, '00_Inbox', 'agent_chats');
      filename = `${dateStr}-${slugify(title)}.md`;
    }

    await fs.mkdir(targetDir, { recursive: true });
    
    const finalPath = path.join(targetDir, filename);
    await fs.writeFile(finalPath, fileContent, 'utf-8');

    // 4. Automatically link the saved note in the central index
    await linkChatInMasterMOC(filename, title, dateStr, !!topic, topic, finalPath);

    res.json({
      success: true,
      filePath: finalPath.replace(/\\/g, '/'),
      filename: filename,
      subject: saveSubject
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 11. Get Chat History Files
app.get('/api/chat/history', async (req, res) => {
  try {
    const chatDir = path.join(VAULT_ROOT, '00_Inbox', 'agent_chats');
    let generalChats = [];
    try {
      const files = await fs.readdir(chatDir);
      for (const file of files) {
        if (file.endsWith('.md')) {
          const filePath = path.join(chatDir, file);
          const stats = await fs.stat(filePath);
          const content = await fs.readFile(filePath, 'utf-8');
          
          let title = file.replace('.md', '');
          const h1Match = content.match(/^#\s+(.+)$/m);
          if (h1Match) title = h1Match[1].replace(/[\#\*]/g, '').trim();

          generalChats.push({
            filename: file,
            absolutePath: filePath.replace(/\\/g, '/'),
            title,
            topic: 'GENERAL',
            updatedAt: stats.mtime,
            size: stats.size
          });
        }
      }
    } catch (_) {}

    // Also scan inbox_notes for chats
    let inboxChats = [];
    try {
      const inboxRoot = path.join(VAULT_ROOT, '00_Inbox', 'inbox_notes');
      const subdirs = await fs.readdir(inboxRoot, { withFileTypes: true });
      for (const dir of subdirs) {
        if (dir.isDirectory()) {
          const topicDir = path.join(inboxRoot, dir.name);
          const files = await fs.readdir(topicDir);
          for (const file of files) {
            if (file.endsWith('.md')) {
              const filePath = path.join(topicDir, file);
              const stats = await fs.stat(filePath);
              const content = await fs.readFile(filePath, 'utf-8');
              
              if (content.includes('type: agent-chat')) {
                let title = file.replace('.md', '');
                const h1Match = content.match(/^#\s+(.+)$/m);
                if (h1Match) title = h1Match[1].replace(/[\#\*]/g, '').trim();

                inboxChats.push({
                  filename: file,
                  absolutePath: filePath.replace(/\\/g, '/'),
                  title,
                  topic: dir.name.toUpperCase(),
                  updatedAt: stats.mtime,
                  size: stats.size
                });
              }
            }
          }
        }
      }
    } catch (_) {}

    const allChats = [...generalChats, ...inboxChats].sort((a, b) => b.updatedAt - a.updatedAt);
    res.json(allChats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 12. Manual Backup Trigger Route
app.post('/api/backup/trigger', async (req, res) => {
  try {
    const zipPath = await runBackup();
    res.json({ success: true, file: path.basename(zipPath) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 13. List Ollama local models dynamically
app.get('/api/ollama/models', async (req, res) => {
  try {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
    const response = await fetch(`${ollamaUrl}/api/tags`);
    if (!response.ok) {
      throw new Error('Ollama not responding');
    }
    const data = await response.json();
    const models = (data.models || []).map(m => ({
      id: m.name,
      name: `${m.name} (${Math.round(m.size / (1024*1024*102.4)) / 10} GB)`
    }));
    models.unshift({ id: 'auto', name: '🤖 Auto-Route (AEGISOS)' });
    res.json(models);
  } catch (error) {
    res.json([]);
  }
});

function startLibrarianWatcher() {
  const inboxPath = path.join(VAULT_ROOT, '00_Inbox');
  console.log('[Librarian] Initializing file watcher on:', inboxPath);

  const watcher = chokidar.watch(inboxPath, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    ignoreInitial: true
  });

  watcher.on('add', async (filePath) => {
    if (!filePath.endsWith('.md')) return;
    
    const relativePath = path.relative(VAULT_ROOT, filePath).replace(/\\/g, '/');
    console.log(`[Librarian] Detected new capture note: ${relativePath}`);

    try {
      const todayStr = new Date().toISOString();
      const insertInbox = db.prepare(`
        INSERT OR IGNORE INTO inbox_log (note_path, detected_at, status)
        VALUES (?, ?, 'unfiled')
      `);
      insertInbox.run(relativePath, todayStr);
    } catch (err) {
      console.error('[Librarian] DB insert failed:', err.message);
    }

    try {
      const fileContent = await fs.readFile(filePath, 'utf8');
      if (!fileContent.trim()) {
        console.log(`[Librarian] Note is empty, skipping auto-filing for now.`);
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
      if (!apiKey) {
        throw new Error('Gemini API key is not configured.');
      }

      const systemPrompt = `You are the AEGISOS Coprocessor.
Your task is to classify this quick capture note and recommend filing details.
Examine the content and choose the best matching university subject.

Available subjects MUST be one of:
- OS (Operating Systems)
- DSA (Data Structures)
- DBMS (Database Systems)
- DISCRETE (Discrete Mathematics)
- CSA (Computer System Architecture)
- CYBER_CN (Computer Networks / Cyber Security)
- ML (Machine Learning)
- OPPS (Object Oriented Programming)
- STATISTICS (Probability and Statistics)

You must return a raw JSON object ONLY, containing:
{
  "subject": "OS" | "DSA" | "DBMS" | "DISCRETE" | "CSA" | "CYBER_CN" | "ML" | "OPPS" | "STATISTICS",
  "filename": "A clean, concise 2-4 word filename describing the concept",
  "tags": ["an", "array", "of", "lowercase", "keywords"]
}

Do not include markdown fences, preambles, or explanations. Return the raw JSON block directly.`;

      const responseText = await generateRefinementText({
        provider: 'gemini',
        model: 'gemini-2.5-flash',
        prompt: systemPrompt,
        content: fileContent,
        apiKeyOverride: apiKey
      });

      let cleanedJsonStr = responseText.trim();
      cleanedJsonStr = cleanedJsonStr.replace(/^```json\s*/i, '');
      cleanedJsonStr = cleanedJsonStr.replace(/^```\s*/i, '');
      cleanedJsonStr = cleanedJsonStr.replace(/```$/, '');
      cleanedJsonStr = cleanedJsonStr.trim();

      const metadata = JSON.parse(cleanedJsonStr);
      const { subject, filename, tags } = metadata;

      if (!subject || !SUBJECT_FOLDER_MAP[subject]) {
        throw new Error(`Invalid subject returned by model: ${subject}`);
      }

      const subjectFolder = SUBJECT_FOLDER_MAP[subject];
      const targetDir = path.join(REFINED_NOTES_DIR, subjectFolder);
      const cleanFilename = (filename || 'quick_note').replace(/[\\/:*?"<>|]/g, '_') + '.md';
      const targetFilePath = path.join(targetDir, cleanFilename);

      const frontmatter = `---
title: "${filename}"
subject: "${subject}"
type: concept
tags: [${(tags || []).map(t => `"${t}"`).join(', ')}]
---

Up: [[${subject} MOC]]

`;
      
      const refinedContent = frontmatter + fileContent;
      await fs.mkdir(targetDir, { recursive: true });
      await fs.writeFile(targetFilePath, refinedContent, 'utf8');

      await fs.unlink(filePath);
      console.log(`[Librarian] Successfully filed ${relativePath} -> ${path.relative(VAULT_ROOT, targetFilePath)}`);

      const mocFilename = `${subject} MOC.md`;
      const mocDir = path.join(REFINED_NOTES_DIR, '00_MOCs');
      const mocPath = path.join(mocDir, mocFilename);
      
      let mocContent = '';
      try {
        mocContent = await fs.readFile(mocPath, 'utf8');
      } catch (_) {
        mocContent = `---\ntitle: "${subject} MOC"\ntype: moc\n---\n\n# ${subject} Map of Content\n\n## Core Concepts\n`;
      }

      const noteBaseName = cleanFilename.replace('.md', '');
      const linkStr = `- [[${noteBaseName}]]`;
      if (!mocContent.includes(`[[${noteBaseName}]]`)) {
        const updatedMocContent = mocContent.trim() + `\n${linkStr}\n`;
        await fs.mkdir(mocDir, { recursive: true });
        await fs.writeFile(mocPath, updatedMocContent, 'utf8');
        console.log(`[Librarian] Appended link [[${noteBaseName}]] to MOC: ${mocFilename}`);
      }

      const updateInbox = db.prepare(`
        UPDATE inbox_log SET status = 'filed' WHERE note_path = ?
      `);
      updateInbox.run(relativePath);

      // Trigger automatic rebuild of the search index
      syncMetadataCache().catch(console.error);

    } catch (err) {
      console.error(`[Librarian] Failed to auto-file ${relativePath}:`, err.message);
    }
  });
}

// --- Track B Phase B3: World Model & Knowledge Graph Endpoints ---
app.get('/api/worldmodel/state', (req, res) => {
  res.json({
    status: 'healthy',
    entities: worldModelEngine.getState(),
  });
});

app.post('/api/worldmodel/snapshot', (req, res) => {
  const result = worldModelEngine.snapshot();
  res.json({ success: true, snapshot: result });
});

app.get('/api/worldmodel/diff', (req, res) => {
  const result = worldModelEngine.diff();
  res.json({ success: true, diff: result });
});

app.get('/api/knowledge/nodes', (req, res) => {
  const limit = parseInt(req.query.limit || '100', 10);
  const nodes = dynamicKnowledgeGraph.getNodes(limit);
  res.json({ nodes });
});

app.get('/api/knowledge/edges', (req, res) => {
  const limit = parseInt(req.query.limit || '200', 10);
  const edges = dynamicKnowledgeGraph.getEdges(limit);
  res.json({ edges });
});

app.post('/api/knowledge/query', (req, res) => {
  const { query, typeFilter } = req.body || {};
  const results = dynamicKnowledgeGraph.search(query || '', typeFilter);
  res.json({ success: true, query, count: results.length, results });
});

app.post('/api/knowledge/node', (req, res) => {
  const { id, label, type, properties } = req.body || {};
  if (!id || !label || !type) {
    return res.status(400).json({ error: 'Missing required parameters: id, label, type' });
  }
  const node = dynamicKnowledgeGraph.createNode(id, label, type, properties || {});
  entityExtractionEngine.extractAndIndex(`${label} ${JSON.stringify(properties || {})}`, 'user_api');
  res.json({ success: true, node });
});

app.post('/api/knowledge/edge', (req, res) => {
  const { sourceId, targetId, relation, weight } = req.body || {};
  if (!sourceId || !targetId) {
    return res.status(400).json({ error: 'Missing required parameters: sourceId, targetId' });
  }
  const edge = dynamicKnowledgeGraph.createEdge(sourceId, targetId, relation || 'RELATING_TO', weight || 1.0);
  res.json({ success: true, edge });
});

app.get('/api/knowledge/user-model', (req, res) => {
  res.json({ userModel: projectUserIntelligence.getUserModel() });
});

app.put('/api/knowledge/user-model', (req, res) => {
  const { key, value } = req.body || {};
  if (!key || value === undefined) {
    return res.status(400).json({ error: 'Missing required parameters: key, value' });
  }
  const updated = projectUserIntelligence.updateUserModel(key, value);
  res.json({ success: true, userModel: updated });
});

// --- Track B Phase B1: Cognitive Core Kernel Endpoints ---
app.post('/api/cognitive/kernel/intent', async (req, res) => {
  const { intent, options } = req.body || {};
  if (!intent) {
    return res.status(400).json({ error: 'Missing required parameter: intent' });
  }
  try {
    const result = await cognitiveCoreKernel.processIntent(intent, options || {});
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/cognitive/kernel/health', (req, res) => {
  res.json(cognitiveCoreKernel.getSystemHealth());
});

// SPA Fallback Handler: Serve dist/index.html for non-API GET requests
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(DIST_DIR, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      log.error(`Failed to serve index.html: ${err.message}`);
      res.status(404).send('AEGISOS Frontend build not found. Please run "npm run build".');
    }
  });
});

const serverInstance = app.listen(PORT, () => {
  console.log('----------------------------------------------------');
  console.log(`🚀 AEGISOS v1.0.0 Server active at http://localhost:${PORT}`);
  console.log(`📂 Static Frontend directory: ${DIST_DIR}`);
  console.log(`⚙️ Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log('----------------------------------------------------');
  buildEmbeddingsCache().catch(err => console.error('[AEGISOS Semantic Index] Background indexer failed:', err));
  runBackup().catch(err => console.error('[AEGISOS Backup] Startup backup failed:', err));
  startLibrarianWatcher();
});

// Graceful Shutdown & Error Handlers
function gracefulShutdown(signal) {
  console.log(`\n[AEGISOS Kernel] Received signal ${signal}. Shutting down gracefully...`);
  companionEngine.stop();
  sentinelObserverManager.stopAll().catch(() => {});
  
  serverEventBus.publish(SystemEvents.APPLICATION_SHUTDOWN, {
    signal,
    timestamp: new Date().toISOString()
  }, { subsystem: 'Kernel', severity: 'WARN' });

  serverInstance.close(() => {
    console.log('[AEGISOS Kernel] Server closed. Database connections released.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('[AEGISOS Kernel] Forcefully shutting down after 5s timeout.');
    process.exit(1);
  }, 5000);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('uncaughtException', (err) => {
  console.error('[AEGISOS Kernel] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[AEGISOS Kernel] Unhandled Promise Rejection:', reason);
});
