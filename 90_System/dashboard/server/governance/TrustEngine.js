import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Governance:TrustEngine');

export class TrustEngine {
  constructor() {
    this.trustScores = new Map([
      ['agent_librarian', 0.95],
      ['agent_coprocessor', 0.9],
      ['agent_reviewer', 0.92],
      ['agent_research', 0.88],
      ['agent_monitoring', 0.98],
      ['tool_git_status', 0.99],
      ['tool_file_read', 0.95],
      ['tool_file_write', 0.85]
    ]);
  }

  getTrustScore(entityId) {
    return this.trustScores.get(entityId) || 0.8;
  }

  recordOutcome(entityId, success = true) {
    let current = this.getTrustScore(entityId);
    if (success) {
      current = Math.min(1.0, current + 0.01);
    } else {
      current = Math.max(0.1, current - 0.05);
    }
    this.trustScores.set(entityId, Math.round(current * 100) / 100);
    log.debug(`Updated trust score for entity "${entityId}": ${current.toFixed(2)}`);
  }

  listScores() {
    const list = [];
    for (const [id, score] of this.trustScores.entries()) {
      list.push({ entityId: id, trustScore: score });
    }
    return list;
  }
}

export const trustEngine = new TrustEngine();
