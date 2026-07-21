/**
 * AEGISOS Standardized Logging System
 */

export const LogLevels = Object.freeze({
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
});

class Logger {
  constructor(moduleName = 'AEGISOS') {
    this.moduleName = moduleName;
    this.level = LogLevels.INFO;
  }

  setLevel(level) {
    if (LogLevels[level] !== undefined) {
      this.level = LogLevels[level];
    }
  }

  formatMessage(levelStr, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${levelStr}] [${this.moduleName}] ${message}${metaStr}`;
  }

  debug(message, meta) {
    if (this.level <= LogLevels.DEBUG) {
      console.debug(this.formatMessage('DEBUG', message, meta));
    }
  }

  info(message, meta) {
    if (this.level <= LogLevels.INFO) {
      console.log(this.formatMessage('INFO', message, meta));
    }
  }

  warn(message, meta) {
    if (this.level <= LogLevels.WARN) {
      console.warn(this.formatMessage('WARN', message, meta));
    }
  }

  error(message, meta) {
    if (this.level <= LogLevels.ERROR) {
      console.error(this.formatMessage('ERROR', message, meta));
    }
  }

  child(subModule) {
    return new Logger(`${this.moduleName}:${subModule}`);
  }
}

export const aegisLogger = new Logger('AEGISOS');
export { Logger };
