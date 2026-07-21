import { systemDiagnostics } from './SystemDiagnostics.js';

class ProductionAPI {
  getHealth() {
    return systemDiagnostics.getHealthReport();
  }

  getVersion() {
    return {
      version: 'v1.0.0',
      codename: 'AEGISOS',
      releaseType: 'General Availability (GA)',
      architectureVersion: 'ADR-014',
      releaseDate: new Date().toISOString()
    };
  }
}

export const productionAPI = new ProductionAPI();
export { ProductionAPI };
