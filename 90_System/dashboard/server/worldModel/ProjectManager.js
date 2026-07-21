import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('WorldModel:ProjectManager');

export class ProjectManager {
  constructor() {
    this.activeProjectName = 'SecondBrain';
    this.projects = new Map([
      ['SecondBrain', {
        name: 'SecondBrain',
        workspace: 'C:\\Users\\ishar\\Projects\\SecondBrain',
        repository: 'Second-Brain_prototype',
        branch: 'main',
        status: 'active',
        recentFiles: [],
        relatedNotes: [],
        relatedPdfs: [],
        lastActivity: new Date().toISOString()
      }]
    ]);
  }

  getActiveProject() {
    return this.projects.get(this.activeProjectName) || null;
  }

  setActiveProject(name) {
    if (!this.projects.has(name)) {
      this.registerProject({ name });
    }
    this.activeProjectName = name;
    log.info(`Active project switched to "${name}".`);
  }

  registerProject({ name, workspace = '', repository = '', branch = 'main' }) {
    if (!name) return;
    const record = {
      name,
      workspace,
      repository,
      branch,
      status: 'active',
      recentFiles: [],
      relatedNotes: [],
      relatedPdfs: [],
      lastActivity: new Date().toISOString()
    };
    this.projects.set(name, record);
    return record;
  }

  recordActivity(projectName, filePath = null, branch = null) {
    const project = this.projects.get(projectName) || this.registerProject({ name: projectName });
    project.lastActivity = new Date().toISOString();

    if (branch) project.branch = branch;
    if (filePath) {
      if (!project.recentFiles.includes(filePath)) {
        project.recentFiles.unshift(filePath);
        if (project.recentFiles.length > 20) project.recentFiles.pop();
      }
      if (filePath.endsWith('.md') && !project.relatedNotes.includes(filePath)) {
        project.relatedNotes.push(filePath);
      } else if (filePath.endsWith('.pdf') && !project.relatedPdfs.includes(filePath)) {
        project.relatedPdfs.push(filePath);
      }
    }
  }

  listProjects() {
    return Array.from(this.projects.values());
  }
}

export const projectManager = new ProjectManager();
