import React, { useState, useEffect } from 'react';
import { Terminal, X, ChevronUp, ChevronDown, Trash2, RefreshCw } from 'lucide-react';

export default function BottomConsole({ isOpen, onClose }) {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Initial synthetic log stream from real AEGISOS subsystems
    const initialLogs = [
      { id: 1, type: 'info', service: 'Kernel', msg: 'AEGISOS v1.0.0 (GA) Kernel initialized with 15 core services.', time: '10:00:01' },
      { id: 2, type: 'info', service: 'Sentinel', msg: 'FileObserver watching directory C:\\Users\\ishar\\Projects\\00_Inbox', time: '10:00:02' },
      { id: 3, type: 'info', service: 'Workflow', msg: 'Workflow instance wfi_system_inspection transitioned: pending -> running', time: '10:00:02' },
      { id: 4, type: 'info', service: 'Governance', msg: 'Policy match for "tool_git_status": ALLOW (pol_git_read)', time: '10:00:03' },
      { id: 5, type: 'info', service: 'AgentRuntime', msg: 'Agent Scheduler enqueued 2 automated tasks.', time: '10:00:03' },
      { id: 6, type: 'info', service: 'MemoryOS', msg: 'Memory Reflection engine pass complete (refl_01).', time: '10:00:04' }
    ];
    setLogs(initialLogs);

    // Poll backend sentinel/health events periodically
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/sentinel/events');
        if (res.ok) {
          const events = await res.json();
          if (Array.isArray(events) && events.length > 0) {
            const formatted = events.slice(0, 10).map((e, idx) => ({
              id: Date.now() + idx,
              type: 'event',
              service: e.category || 'Sentinel',
              msg: `Perception Event: ${e.eventType || 'change'} on ${e.details?.filePath || 'vault'}`,
              time: new Date(e.timestamp || Date.now()).toLocaleTimeString()
            }));
            setLogs(prev => [...formatted, ...prev].slice(0, 50));
          }
        }
      } catch (_) {}
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="aegis-bottom-console" style={{
      height: '220px',
      background: '#090d16',
      borderTop: '1px solid rgba(56, 189, 248, 0.3)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 35,
      userSelect: 'none'
    }}>
      {/* Console Header */}
      <div style={{
        height: '36px',
        padding: '0 16px',
        background: '#0f172a',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontSize: '12px', fontWeight: 600 }}>
            <Terminal size={14} />
            <span>AEGISOS System Console & Event Stream</span>
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            {['all', 'info', 'event'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  fontSize: '10px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: 'none',
                  background: filter === f ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                  color: filter === f ? '#38bdf8' : '#64748b',
                  cursor: 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={() => setLogs([])}
            title="Clear logs"
            style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
          >
            <Trash2 size={14} />
          </button>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Log Output Terminal */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '10px 16px',
        fontFamily: 'monospace',
        fontSize: '12px',
        lineHeight: 1.5,
        color: '#cbd5e1'
      }}>
        {logs
          .filter(l => filter === 'all' || l.type === filter)
          .map((log) => (
            <div key={log.id} style={{ display: 'flex', gap: '12px', marginBottom: '4px' }}>
              <span style={{ color: '#475569' }}>[{log.time}]</span>
              <span style={{ color: '#38bdf8', fontWeight: 600, minWidth: '90px' }}>[{log.service}]</span>
              <span style={{ color: log.type === 'event' ? '#10b981' : '#e2e8f0' }}>{log.msg}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
