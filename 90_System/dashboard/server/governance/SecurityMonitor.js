import { AlertSeverity } from './types.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Governance:SecurityMonitor');

export class SecurityMonitor {
  constructor() {
    this.alerts = [];
  }

  recordAlert({ title, severity = AlertSeverity.LOW, source, description }) {
    const alertId = `alt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const alert = {
      alertId,
      title,
      severity,
      source,
      description,
      timestamp: new Date().toISOString()
    };

    this.alerts.push(alert);
    log.warn(`SECURITY ALERT [${severity.toUpperCase()}] "${title}" from ${source}`);
    return alert;
  }

  listAlerts() {
    return this.alerts;
  }
}

export const securityMonitor = new SecurityMonitor();
