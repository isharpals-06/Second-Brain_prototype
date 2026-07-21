/**
 * AEGISOS Client Logging Utility
 */

export const LogLevels = Object.freeze({
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
});

class ClientLogger {
  constructor(moduleName = 'AEGISOS-Client') {
    this.moduleName = moduleName;
    this.level = LogLevels.INFO;
  }

  setLevel(level) {
    if (LogLevels[level] !== undefined) {
      this.level = LogLevels[level];
    }
  }

  format(levelStr, msg) {
    return `[${new Date().toLocaleTimeString()}] [${levelStr}] [${this.moduleName}] ${msg}`;
  }

  debug(msg, meta) {
    if (this.level <= LogLevels.DEBUG) console.debug(this.format('DEBUG', msg), meta || '');
  }

  info(msg, meta) {
    if (this.level <= LogLevels.INFO) console.log(this.format('INFO', msg), meta || '');
  }

  warn(msg, meta) {
    if (this.level <= LogLevels.WARN) console.warn(this.format('WARN', msg), meta || '');
  }

  error(msg, meta) {
    if (this.level <= LogLevels.ERROR) console.error(this.format('ERROR', msg), meta || '');
  }
}

export const aegisClientLogger = new ClientLogger('AEGISOS');
export { ClientLogger };
