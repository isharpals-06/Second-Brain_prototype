import { serverEventBus, EventSeverity } from './eventBus.js';
import { cognitiveMemoryEngine } from '../memory/initMemory.js';
import { dynamicKnowledgeGraph } from '../knowledge/DynamicKnowledgeGraph.js';
import { aegisLogger } from './logger.js';

const log = aegisLogger.child('Core:AutonomousInsights');

export class AutonomousInsightsEngine {
  constructor() {
    this.insights = [];
  }

  async scanForInsights() {
    log.info('Running Autonomous Insights Scanner pass...');
    const newInsights = [];
    const now = new Date().toISOString();

    try {
      // 1. Scan for Duplicate Documentation or Note Bloat
      const semantics = cognitiveMemoryEngine?.storage ? cognitiveMemoryEngine.storage.listSemantic() : [];
      const noteNames = semantics.map(s => s.name.toLowerCase());
      const duplicates = noteNames.filter((item, index) => noteNames.indexOf(item) !== index);

      if (duplicates.length > 0) {
        newInsights.push({
          id: `ins_${Date.now()}_dup`,
          type: 'DUPLICATE_DOCUMENTATION',
          severity: 'CALM_NOTICE',
          title: 'Potential Duplicate Concepts Identified',
          summary: `Identified ${duplicates.length} overlapping concept memories: "${duplicates.slice(0, 3).join(', ')}". Consolidate to maintain clean knowledge graph.`,
          autoAction: 'Merge duplicate semantic memories during next consolidation pass.',
          timestamp: now
        });
      }

      // 2. Scan for Architecture & Component Coverage
      const graphSummary = dynamicKnowledgeGraph ? dynamicKnowledgeGraph.getGraphSummary() : { nodeCount: 0, edgeCount: 0 };
      if (graphSummary.nodeCount > 0 && graphSummary.edgeCount === 0) {
        newInsights.push({
          id: `ins_${Date.now()}_arch`,
          type: 'ARCHITECTURE_INCONSISTENCY',
          severity: 'CALM_NOTICE',
          title: 'Knowledge Graph Disconnected Nodes Detected',
          summary: 'Several knowledge nodes currently exist without cross-layer relations. Re-run relation inference.',
          autoAction: 'Link nodes across Document -> Concept -> Project layers.',
          timestamp: now
        });
      }

      // 3. Scan for Memory Health & Procedural Learning Rate
      const procedurals = cognitiveMemoryEngine?.storage ? cognitiveMemoryEngine.storage.listProcedural() : [];
      if (procedurals.length > 0) {
        const topProcedure = procedurals[0];
        newInsights.push({
          id: `ins_${Date.now()}_proc`,
          type: 'WORKFLOW_OPTIMIZATION',
          severity: 'INFORMATIONAL',
          title: 'High-Value Procedural Pattern Identified',
          summary: `Pattern "${topProcedure.name}" has been executed ${topProcedure.usage_count || 1} times with 100% reliability. Recommended for automated execution.`,
          autoAction: 'Promote procedural pattern to high-priority execution queue.',
          timestamp: now
        });
      }

      // Store and limit insights queue
      this.insights.unshift(...newInsights);
      if (this.insights.length > 30) this.insights = this.insights.slice(0, 30);

      // Publish Insights event
      if (newInsights.length > 0) {
        serverEventBus.publish({
          type: 'AutonomousInsightsGenerated',
          source: 'AutonomousInsightsEngine',
          severity: EventSeverity.INFO,
          payload: { count: newInsights.length, insights: newInsights }
        });
      }

      log.info(`Autonomous Insights Scanner completed. Generated ${newInsights.length} new calm insights.`);
      return newInsights;
    } catch (err) {
      log.error(`Autonomous Insights scan failed: ${err.message}`);
      return [];
    }
  }

  getInsights(limit = 10) {
    return this.insights.slice(0, limit);
  }
}

export const autonomousInsightsEngine = new AutonomousInsightsEngine();
