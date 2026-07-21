import { stateManager } from './StateManager.js';
import { sessionEngine } from './SessionEngine.js';
import { projectManager } from './ProjectManager.js';
import { workspaceManager } from './WorkspaceManager.js';
import { timelineEngine } from './TimelineEngine.js';
import { relationshipEngine } from './RelationshipEngine.js';
import { eventCorrelationEngine } from './EventCorrelationEngine.js';

class ContextAPI {
  getState() {
    return stateManager.getState();
  }

  getSession() {
    return {
      currentSession: sessionEngine.getCurrentSession(),
      sessionHistory: sessionEngine.getHistory()
    };
  }

  getProjects() {
    return {
      activeProject: projectManager.getActiveProject(),
      allProjects: projectManager.listProjects()
    };
  }

  getWorkspace() {
    return workspaceManager.getCurrentWorkspace();
  }

  getTimeline(filter = {}) {
    return timelineEngine.getTimeline(filter);
  }

  getGraph() {
    return relationshipEngine.exportGraph();
  }

  getSnapshots() {
    return stateManager.getSnapshots();
  }

  getMetrics() {
    return {
      correlation: eventCorrelationEngine.getMetrics(),
      graph: relationshipEngine.getMetrics(),
      session: {
        active: sessionEngine.getCurrentSession().type,
        completedSessions: sessionEngine.getHistory().length
      }
    };
  }
}

export const contextAPI = new ContextAPI();
export { ContextAPI };
