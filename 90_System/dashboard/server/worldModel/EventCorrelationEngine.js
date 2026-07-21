import { serverEventBus } from '../core/eventBus.js';
import { timelineEngine } from './TimelineEngine.js';
import { sessionEngine } from './SessionEngine.js';
import { projectManager } from './ProjectManager.js';
import { workspaceManager } from './WorkspaceManager.js';
import { relationshipEngine } from './RelationshipEngine.js';
import { stateManager } from './StateManager.js';
import { SessionType, NodeType, RelationType } from './types.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('WorldModel:EventCorrelationEngine');

export class EventCorrelationEngine {
  constructor() {
    this.processedEventsCount = 0;
    this.correlatedEventsCount = 0;
    this.droppedEventsCount = 0;
    this.startTime = Date.now();
  }

  start() {
    log.info('Subscribing EventCorrelationEngine to EventBus perception stream...');

    // Subscribe to all Sentinel perception events
    serverEventBus.subscribe('sentinel:event', (event) => this.handleSentinelEvent(event));
    serverEventBus.subscribe('NOTE_CREATED', (payload) => this.handleNoteEvent('create', payload));
    serverEventBus.subscribe('FLASHCARD_REVIEWED', (payload) => this.handleFlashcardEvent(payload));
  }

  handleSentinelEvent(event) {
    this.processedEventsCount += 1;
    const { category, payload, observer } = event;

    if (!payload) {
      this.droppedEventsCount += 1;
      return;
    }

    this.correlatedEventsCount += 1;

    switch (category) {
      case 'filesystem':
      case 'vault': {
        const filePath = payload.filePath || '';
        const filename = payload.filename || payload.noteName || '';
        const eventType = payload.eventType || 'modified';

        // Add timeline entry
        timelineEngine.addEntry({
          title: `File ${eventType}: ${filename}`,
          description: filePath,
          category: 'vault',
          source: observer,
          metadata: payload
        });

        // Add graph node & relationship
        if (filePath) {
          const activeProj = projectManager.getActiveProject();
          relationshipEngine.addNode(filePath, filePath.endsWith('.pdf') ? NodeType.DOCUMENT : NodeType.NOTE, filename);
          if (activeProj) {
            relationshipEngine.addNode(activeProj.name, NodeType.PROJECT, activeProj.name);
            relationshipEngine.addEdge(activeProj.name, filePath, RelationType.CONTAINS);
          }

          // Infer Session Type
          let inferredSession = SessionType.WRITING;
          if (filePath.endsWith('.js') || filePath.endsWith('.py') || filePath.endsWith('.jsx')) {
            inferredSession = SessionType.CODING;
          } else if (filePath.endsWith('.pdf')) {
            inferredSession = SessionType.RESEARCH;
          } else if (filePath.includes('10_Subjects')) {
            inferredSession = SessionType.STUDY;
          }

          sessionEngine.recordActivity(inferredSession, filePath, activeProj ? activeProj.name : 'SecondBrain');
          projectManager.recordActivity(activeProj ? activeProj.name : 'SecondBrain', filePath);
        }
        break;
      }

      case 'git': {
        const branch = payload.currentBranch || payload.branch;
        const commitMsg = payload.commitMsg;
        const activeProj = projectManager.getActiveProject();

        if (branch) {
          projectManager.recordActivity(activeProj ? activeProj.name : 'SecondBrain', null, branch);
        }

        timelineEngine.addEntry({
          title: `Git ${payload.eventType}: ${branch || ''}`,
          description: commitMsg || '',
          category: 'git',
          source: observer,
          metadata: payload
        });

        sessionEngine.recordActivity(SessionType.CODING, null, activeProj ? activeProj.name : 'SecondBrain');
        break;
      }

      case 'clipboard': {
        stateManager.updateState({ clipboardSnippet: payload.snippet });
        timelineEngine.addEntry({
          title: `Clipboard Updated (${payload.charCount} chars)`,
          description: payload.snippet,
          category: 'clipboard',
          source: observer,
          metadata: payload
        });
        break;
      }

      case 'system': {
        if (payload.memory) {
          stateManager.updateState({ systemHealth: `${payload.memory.usagePercent}% RAM` });
        }
        break;
      }

      default:
        break;
    }

    // Sync World State snapshot
    stateManager.updateState({
      currentSession: sessionEngine.getCurrentSession().type,
      currentProject: projectManager.getActiveProject()?.name || 'SecondBrain',
      currentBranch: projectManager.getActiveProject()?.branch || 'main',
      recentEvents: timelineEngine.getTimeline({ limit: 10 })
    });
  }

  handleNoteEvent(type, payload) {
    this.processedEventsCount += 1;
    timelineEngine.addEntry({
      title: `Note ${type}: ${payload.note || ''}`,
      category: 'vault',
      source: 'app',
      metadata: payload
    });
  }

  handleFlashcardEvent(payload) {
    this.processedEventsCount += 1;
    sessionEngine.recordActivity(SessionType.STUDY);
    timelineEngine.addEntry({
      title: `Flashcard Reviewed (Rating: ${payload.quality})`,
      category: 'study',
      source: 'app',
      metadata: payload
    });
  }

  getMetrics() {
    return {
      processedEvents: this.processedEventsCount,
      correlatedEvents: this.correlatedEventsCount,
      droppedEvents: this.droppedEventsCount,
      graphNodes: relationshipEngine.getMetrics().nodeCount,
      graphEdges: relationshipEngine.getMetrics().edgeCount,
      uptimeSeconds: Math.round((Date.now() - this.startTime) / 1000)
    };
  }
}

export const eventCorrelationEngine = new EventCorrelationEngine();
