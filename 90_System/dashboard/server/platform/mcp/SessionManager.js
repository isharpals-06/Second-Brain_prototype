import { aegisLogger } from '../../core/logger.js';

const log = aegisLogger.child('MCP:SessionManager');

export class MCPSessionManager {
  constructor() {
    this.sessions = new Map();
  }

  createSession(serverId, sessionData = {}) {
    const sessionId = `mcp_sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const session = {
      sessionId,
      serverId,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      data: sessionData,
    };
    this.sessions.set(sessionId, session);
    log.info(`MCP Session "${sessionId}" created for server "${serverId}".`);
    return session;
  }

  getSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActive = new Date().toISOString();
    }
    return session || null;
  }

  closeSession(sessionId) {
    this.sessions.delete(sessionId);
    log.info(`MCP Session "${sessionId}" closed.`);
    return true;
  }

  listSessions() {
    return Array.from(this.sessions.values());
  }
}

export const mcpSessionManager = new MCPSessionManager();
