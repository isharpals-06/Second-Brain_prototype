import React, { useState, useEffect } from 'react';
import { Bot, Play, Pause, Square, RefreshCw, Cpu, Activity } from 'lucide-react';

export default function AgentsWorkspace() {
  const [agents, setAgents] = useState([]);
  const [queue, setQueue] = useState(null);

  const loadAgentsData = async () => {
    try {
      const [aRes, qRes] = await Promise.all([
        fetch('/api/agents').then(r => r.json()),
        fetch('/api/agents/queue').then(r => r.json())
      ]);
      setAgents(aRes);
      setQueue(qRes);
    } catch (_) {}
  };

  useEffect(() => {
    loadAgentsData();
  }, []);

  return (
    <div style={{ padding: '24px', overflowY: 'auto', height: '100%', color: '#f8fafc' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bot size={22} style={{ color: '#c084fc' }} />
            AGENT PROCESS RUNTIME
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>
            Process Lifecycle Manager, Subagent Scheduler & Capability Matrix
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Active System Agents Table */}
        <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Registered Agents</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(agents.length > 0 ? agents : [
              { id: 'agent_librarian', name: 'Librarian Agent', role: 'Filing & Ingestion', status: 'active' },
              { id: 'agent_coprocessor', name: 'Coprocessor Agent', role: 'Multi-AI Synthesis', status: 'active' },
              { id: 'agent_reviewer', name: 'Reviewer Agent', role: 'Spaced Repetition', status: 'active' }
            ]).map(a => (
              <div key={a.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '8px'
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#f1f5f9' }}>{a.name}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Role: {a.role}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '11px', fontFamily: 'monospace', padding: '2px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                    ONLINE
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scheduler Queue Summary */}
        <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Scheduler Queue</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
              <span style={{ color: '#94a3b8', fontSize: '12px' }}>Pending Tasks</span>
              <span style={{ color: '#38bdf8', fontFamily: 'monospace', fontWeight: 600 }}>{queue?.pending || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
              <span style={{ color: '#94a3b8', fontSize: '12px' }}>Running Tasks</span>
              <span style={{ color: '#10b981', fontFamily: 'monospace', fontWeight: 600 }}>{queue?.running || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
              <span style={{ color: '#94a3b8', fontSize: '12px' }}>Completed Tasks</span>
              <span style={{ color: '#c084fc', fontFamily: 'monospace', fontWeight: 600 }}>{queue?.completed || 2}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
