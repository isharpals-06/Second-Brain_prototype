import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Command, 
  Activity, 
  BookOpen, 
  Target, 
  Bot, 
  Brain, 
  Zap, 
  ShieldAlert, 
  Wrench, 
  Settings,
  ArrowRight,
  Sparkles,
  FileText
} from 'lucide-react';
import { WORKSPACES } from './Sidebar';

export default function CommandPalette({ isOpen, onClose, onSelectWorkspace, onExecuteAction }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onSelectWorkspace(null); // Signal open command palette
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onSelectWorkspace]);

  if (!isOpen) return null;

  const COMMAND_ACTIONS = [
    { id: 'act_backup', title: 'Trigger System Backup', category: 'Actions', icon: Sparkles, action: () => onExecuteAction('backup') },
    { id: 'act_notes', title: 'Open Neural Vault Notes', category: 'Actions', icon: FileText, action: () => onSelectWorkspace('knowledge') },
    { id: 'act_agents', title: 'Inspect Running Agents', category: 'Actions', icon: Bot, action: () => onSelectWorkspace('agents') },
    { id: 'act_planner', title: 'View Active Goals & Plans', category: 'Actions', icon: Target, action: () => onSelectWorkspace('planner') },
    { id: 'act_memory', title: 'Open Memory OS Reflection', category: 'Actions', icon: Brain, action: () => onSelectWorkspace('memory') }
  ];

  const filteredWorkspaces = WORKSPACES.filter(w => 
    w.label.toLowerCase().includes(query.toLowerCase()) || 
    w.id.toLowerCase().includes(query.toLowerCase())
  );

  const filteredActions = COMMAND_ACTIONS.filter(a =>
    a.title.toLowerCase().includes(query.toLowerCase())
  );

  const totalResults = filteredWorkspaces.length + filteredActions.length;

  const handleSelect = (item) => {
    if (item.action) {
      item.action();
    } else if (item.id) {
      onSelectWorkspace(item.id);
    }
    onClose();
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '640px',
          maxHeight: '480px',
          background: '#0f172a',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(56, 189, 248, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Search size={18} style={{ color: '#38bdf8' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f8fafc',
              fontSize: '15px'
            }}
          />
          <span style={{ fontSize: '11px', color: '#64748b', background: 'rgba(255, 255, 255, 0.06)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
            ESC to close
          </span>
        </div>

        {/* Results List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {/* Workspaces Section */}
          {filteredWorkspaces.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '8px' }}>
                Workspaces
              </div>
              {filteredWorkspaces.map((ws, idx) => {
                const Icon = ws.icon;
                return (
                  <div
                    key={ws.id}
                    onClick={() => handleSelect(ws)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      background: 'transparent',
                      color: '#cbd5e1',
                      transition: 'all 0.1s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(56, 189, 248, 0.12)';
                      e.currentTarget.style.color = '#38bdf8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#cbd5e1';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Icon size={16} />
                      <span style={{ fontSize: '14px', fontWeight: 500 }}>{ws.label}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>Switch Workspace</span>
                      <ArrowRight size={14} style={{ color: '#475569' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Actions Section */}
          {filteredActions.length > 0 && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '8px' }}>
                System Actions
              </div>
              {filteredActions.map((act) => {
                const Icon = act.icon;
                return (
                  <div
                    key={act.id}
                    onClick={() => handleSelect(act)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      background: 'transparent',
                      color: '#cbd5e1',
                      transition: 'all 0.1s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(168, 85, 247, 0.12)';
                      e.currentTarget.style.color = '#c084fc';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#cbd5e1';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Icon size={16} />
                      <span style={{ fontSize: '14px', fontWeight: 500 }}>{act.title}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>Execute</span>
                      <ArrowRight size={14} style={{ color: '#475569' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {totalResults === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
              No matching commands or workspaces found for "{query}"
            </div>
          )}
        </div>

        {/* Footer info */}
        <div style={{
          padding: '8px 16px',
          background: 'rgba(0, 0, 0, 0.4)',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: '#64748b',
          fontFamily: 'monospace'
        }}>
          <span>AEGISOS Spotlight Engine</span>
          <span>Navigation • Search • System Actions</span>
        </div>
      </div>
    </div>
  );
}
