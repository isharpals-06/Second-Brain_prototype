import React from 'react';
import { 
  Search, 
  Activity, 
  Cpu, 
  Command,
  Database,
  Terminal
} from 'lucide-react';

export default function TopBar({ 
  activeWorkspace, 
  workspaceMeta, 
  systemStatus, 
  onOpenCommandPalette, 
  onToggleConsole, 
  onToggleInspector, 
  isConsoleOpen,
  isInspectorOpen,
  onTriggerBackup
}) {
  return (
    <header className="aegis-topbar" style={{
      height: '52px',
      background: 'rgba(10, 14, 23, 0.95)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      zIndex: 40,
      userSelect: 'none'
    }}>
      {/* Left section: Breadcrumb & Workspace Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 10px',
          background: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: '6px',
          color: '#38bdf8',
          fontSize: '12px',
          fontWeight: 600,
          letterSpacing: '0.05em'
        }}>
          <span>AEGISOS</span>
          <span style={{ opacity: 0.4 }}>/</span>
          <span style={{ color: '#f8fafc' }}>{workspaceMeta?.label || 'Mission Control'}</span>
        </div>

        {workspaceMeta?.badge && (
          <span style={{
            fontSize: '11px',
            padding: '2px 8px',
            background: 'rgba(148, 163, 184, 0.1)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '4px',
            color: '#94a3b8',
            fontFamily: 'monospace'
          }}>
            {workspaceMeta.badge}
          </span>
        )}
      </div>

      {/* Middle section: Global Command Search Trigger */}
      <button 
        onClick={onOpenCommandPalette}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '340px',
          padding: '6px 12px',
          background: 'rgba(18, 24, 38, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '6px',
          color: '#94a3b8',
          fontSize: '13px',
          cursor: 'pointer',
          transition: 'all 0.15s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search size={14} style={{ color: '#38bdf8' }} />
          <span>Search workspaces, tools, notes...</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '11px', background: 'rgba(255, 255, 255, 0.08)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
          <Command size={10} /> K
        </div>
      </button>

      {/* Right section: System Telemetry & Quick Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Connection Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8' }}>
          <div style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: systemStatus?.connected ? '#10b981' : '#f59e0b',
            boxShadow: systemStatus?.connected ? '0 0 8px #10b981' : 'none'
          }} />
          <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>{systemStatus?.connected ? 'SYSTEM ACTIVE' : 'RECONNECTING'}</span>
        </div>

        <div style={{ height: '16px', width: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />

        {/* LLM Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#cbd5e1' }}>
          <Cpu size={14} style={{ color: '#a855f7' }} />
          <span style={{ fontSize: '11px', fontFamily: 'monospace' }}>Ollama / Gemini</span>
        </div>

        <div style={{ height: '16px', width: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Backup Action */}
        <button 
          onClick={onTriggerBackup}
          title="Create Vault & System Backup"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#f8fafc'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
        >
          <Database size={15} />
        </button>

        {/* Toggle Bottom Console */}
        <button 
          onClick={onToggleConsole}
          title="Toggle Docked System Console"
          style={{
            background: isConsoleOpen ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            border: `1px solid ${isConsoleOpen ? 'rgba(56, 189, 248, 0.3)' : 'transparent'}`,
            color: isConsoleOpen ? '#38bdf8' : '#94a3b8',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Terminal size={15} />
        </button>

        {/* Toggle Inspector */}
        <button 
          onClick={onToggleInspector}
          title="Toggle Context Inspector"
          style={{
            background: isInspectorOpen ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
            border: `1px solid ${isInspectorOpen ? 'rgba(168, 85, 247, 0.3)' : 'transparent'}`,
            color: isInspectorOpen ? '#c084fc' : '#94a3b8',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Activity size={15} />
        </button>
      </div>
    </header>
  );
}
