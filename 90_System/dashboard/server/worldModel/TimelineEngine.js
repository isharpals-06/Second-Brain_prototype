import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('WorldModel:TimelineEngine');

export class TimelineEngine {
  constructor(maxEntries = 1000) {
    this.timeline = [];
    this.maxEntries = maxEntries;
  }

  addEntry({ title, description = '', category = 'general', source = 'system', metadata = {} }) {
    const entry = {
      id: `time_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      title,
      description,
      category,
      source,
      metadata
    };

    this.timeline.push(entry);
    if (this.timeline.length > this.maxEntries) {
      this.timeline.shift();
    }
    log.debug(`Timeline entry: [${category}] ${title}`);
    return entry;
  }

  getTimeline(filter = {}) {
    let result = [...this.timeline];

    if (filter.category) {
      result = result.filter(e => e.category.toLowerCase() === filter.category.toLowerCase());
    }
    if (filter.source) {
      result = result.filter(e => e.source.toLowerCase() === filter.source.toLowerCase());
    }
    if (filter.limit) {
      result = result.slice(-parseInt(filter.limit, 10));
    }

    return result;
  }

  replay(fromTimestamp) {
    if (!fromTimestamp) return this.timeline;
    const fromTime = new Date(fromTimestamp).getTime();
    return this.timeline.filter(e => new Date(e.timestamp).getTime() >= fromTime);
  }

  export() {
    return {
      entriesCount: this.timeline.length,
      entries: this.timeline
    };
  }
}

export const timelineEngine = new TimelineEngine();
