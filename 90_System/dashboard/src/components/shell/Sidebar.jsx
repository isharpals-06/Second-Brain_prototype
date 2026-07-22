import React from 'react';
import { 
  Activity, 
  BookOpen, 
  Target, 
  Bot, 
  Brain, 
  Zap, 
  ShieldAlert, 
  GitBranch, 
  Wrench, 
  Settings, 
  Cpu,
  Layers,
  ChevronRight
} from 'lucide-react';

export const WORKSPACES = [
  { id: 'mission-control', label: 'Mission Control', icon: Activity, badge: 'v1.0.0', category: 'Core' },
  { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen, badge: 'Vault', category: 'Core' },
  { id: 'planner', label: 'Executive Planner', icon: Target, category: 'Subsystems' },
  { id: 'agents', label: 'Agent Runtime', icon: Bot, category: 'Subsystems' },
  { id: 'memory', label: 'Memory OS', icon: Brain, category: 'Subsystems' },
  { id: 'workflows', label: 'Workflows', icon: GitBranch, category: 'Subsystems' },
  { id: 'automation', label: 'Automation', icon: Zap, category: 'Subsystems' },
  { id: 'governance', label: 'Governance & Trust', icon: ShieldAlert, category: 'Subsystems' },
  { id: 'tools', label: 'Tool Runtime HAL', icon: Wrench, category: 'Subsystems' },
  { id: 'settings', label: 'System Settings', icon: Settings, category: 'System' }
];

export default function Sidebar({ activeWorkspace, onSelectWorkspace, systemHealth }) {
  return (
    <aside className="aegis-sidebar" style={{
      width: '240px',
      background: 'rgba(10, 14, 23, 0.98)',
      borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
      userSelect: 'none',
      flexShrink: 0
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '16px 16px 12px 16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '6px',
          background: 'linear-gradient(135deg, #38bdf8 0%, #a855f7 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '14px',
          boxShadow: '0 0 12px rgba(56, 189, 248, 0.3)'
        }}>
          A
        </div>
        <div>
          <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: '14px', letterSpacing: '0.04em' }}>AEGISOS</div>
          <div style={{ color: '#64748b', fontSize: '10px', fontFamily: 'monospace' }}>COCKPIT v1.0.0 (GA)</div>
        </div>
      </div>

      {/* Navigation List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
        {['Core', 'Subsystems', 'System'].map(category => {
          const items = WORKSPACES.filter(w => w.category === category);
          return (
            <div key={category} style={{ marginBottom: '16px' }}>
              <div style={{
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#475569',
                padding: '4px 8px 8px 8px'
              }}>
                {category}
              </div>
              {items.map(item => {
                const Icon = item.icon;
                const isActive = activeWorkspace === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectWorkspace(item.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: isActive ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                      color: isActive ? '#38bdf8' : '#94a3b8',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: isActive ? 600 : 400,
                      marginBottom: '2px',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                        e.currentTarget.style.color = '#e2e8f0';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#94a3b8';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Icon size={16} style={{ color: isActive ? '#38bdf8' : '#64748b' }} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span style={{
                        fontSize: '10px',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        background: isActive ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                        color: isActive ? '#38bdf8' : '#64748b',
                        fontFamily: 'monospace'
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Sidebar Footer — System Health Badge */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        background: 'rgba(15, 23, 42, 0.6)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Platform Services</span>
          <span style={{ fontSize: '11px', color: '#10b981', fontFamily: 'monospace' }}>15 / 15 Active</span>
        </div>
        <div style={{
          width: '100%',
          height: '4px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{ width: '100%', height: '100%', background: '#10b981' }} />
        </div>
      </div>
    </aside>
  );
}
