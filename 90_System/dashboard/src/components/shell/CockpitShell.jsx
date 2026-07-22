import React, { useState, useEffect } from 'react';
import TopBar from './TopBar';
import Sidebar, { WORKSPACES } from './Sidebar';
import CommandPalette from './CommandPalette';
import RightInspector from './RightInspector';
import BottomConsole from './BottomConsole';

import MissionControlWorkspace from '../workspaces/MissionControlWorkspace';
import KnowledgeWorkspace from '../workspaces/KnowledgeWorkspace';
import PlannerWorkspace from '../workspaces/PlannerWorkspace';
import AgentsWorkspace from '../workspaces/AgentsWorkspace';
import MemoryWorkspace from '../workspaces/MemoryWorkspace';
import WorkflowsWorkspace from '../workspaces/WorkflowsWorkspace';
import AutomationWorkspace from '../workspaces/AutomationWorkspace';
import GovernanceWorkspace from '../workspaces/GovernanceWorkspace';
import ToolRuntimeWorkspace from '../workspaces/ToolRuntimeWorkspace';
import SettingsWorkspace from '../workspaces/SettingsWorkspace';

export default function CockpitShell() {
  const [activeWorkspace, setActiveWorkspace] = useState('mission-control');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [systemStatus, setSystemStatus] = useState({ connected: true });
  const [backupStatus, setBackupStatus] = useState('idle');

  // Trigger local project/vault backup in the backend
  const handleTriggerBackup = async () => {
    setBackupStatus('backing-up');
    try {
      const res = await fetch('/api/backup/trigger', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setBackupStatus('success');
        setTimeout(() => setBackupStatus('idle'), 3000);
      } else {
        setBackupStatus('error');
        setTimeout(() => setBackupStatus('idle'), 3000);
      }
    } catch (_) {
      setBackupStatus('error');
      setTimeout(() => setBackupStatus('idle'), 3000);
    }
  };

  const currentWorkspaceMeta = WORKSPACES.find(w => w.id === activeWorkspace) || WORKSPACES[0];

  const renderWorkspace = () => {
    switch (activeWorkspace) {
      case 'mission-control':
        return <MissionControlWorkspace onSelectWorkspace={setActiveWorkspace} />;
      case 'knowledge':
        return <KnowledgeWorkspace onTriggerBackup={handleTriggerBackup} />;
      case 'planner':
        return <PlannerWorkspace />;
      case 'agents':
        return <AgentsWorkspace />;
      case 'memory':
        return <MemoryWorkspace />;
      case 'workflows':
        return <WorkflowsWorkspace />;
      case 'automation':
        return <AutomationWorkspace />;
      case 'governance':
        return <GovernanceWorkspace />;
      case 'tools':
        return <ToolRuntimeWorkspace />;
      case 'settings':
        return <SettingsWorkspace onTriggerBackup={handleTriggerBackup} />;
      default:
        return <MissionControlWorkspace onSelectWorkspace={setActiveWorkspace} />;
    }
  };

  return (
    <div className="aegis-cockpit-shell" style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100vw',
      height: '100vh',
      background: '#090d16',
      color: '#f8fafc',
      overflow: 'hidden'
    }}>
      {/* Top Navigation Bar */}
      <TopBar 
        activeWorkspace={activeWorkspace}
        workspaceMeta={currentWorkspaceMeta}
        systemStatus={systemStatus}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onToggleConsole={() => setIsConsoleOpen(prev => !prev)}
        onToggleInspector={() => setIsInspectorOpen(prev => !prev)}
        isConsoleOpen={isConsoleOpen}
        isInspectorOpen={isInspectorOpen}
        onTriggerBackup={handleTriggerBackup}
      />

      {/* Central Operating Workspace */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Left Sidebar */}
        <Sidebar 
          activeWorkspace={activeWorkspace} 
          onSelectWorkspace={setActiveWorkspace} 
        />

        {/* Main Workspace Canvas */}
        <main style={{ flex: 1, height: '100%', overflow: 'hidden', position: 'relative', background: '#0b0f19' }}>
          {renderWorkspace()}
        </main>

        {/* Right Context Inspector */}
        <RightInspector 
          isOpen={isInspectorOpen} 
          onClose={() => setIsInspectorOpen(false)}
          activeWorkspace={activeWorkspace}
        />
      </div>

      {/* Docked Bottom Console */}
      <BottomConsole 
        isOpen={isConsoleOpen} 
        onClose={() => setIsConsoleOpen(false)} 
      />

      {/* Global Command Spotlight (Ctrl + K) */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectWorkspace={(id) => {
          if (id) setActiveWorkspace(id);
          else setIsCommandPaletteOpen(true);
        }}
        onExecuteAction={(act) => {
          if (act === 'backup') handleTriggerBackup();
        }}
      />
    </div>
  );
}
