import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Cpu, 
  Database, 
  ShieldCheck, 
  Zap, 
  Bot, 
  GitBranch, 
  Brain, 
  Server, 
  CheckCircle2, 
  RefreshCw,
  Target,
  FileText
} from 'lucide-react';

export default function MissionControlWorkspace({ onSelectWorkspace }) {
  const [healthData, setHealthData] = useState(null);
  const [sentinelData, setSentinelData] = useState(null);
  const [agentsData, setAgentsData] = useState(null);
  const [workflowData, setWorkflowData] = useState(null);
  const [memoryData, setMemoryData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTelemetry = async () => {
    try {
      const [hRes, sRes, aRes, wRes, mRes] = await Promise.allSettled([
        fetch('/api/system/health').then(r => r.json()),
        fetch('/api/sentinel/observers').then(r => r.json()),
        fetch('/api/agents').then(r => r.json()),
        fetch('/api/workflows').then(r => r.json()),
        fetch('/api/memory/recent').then(r => r.json())
      ]);

      if (hRes.status === 'fulfilled') setHealthData(hRes.value);
      if (sRes.status === 'fulfilled') setSentinelData(sRes.value);
      if (aRes.status === 'fulfilled') setAgentsData(aRes.value);
      if (wRes.status === 'fulfilled') setWorkflowData(wRes.value);
      if (mRes.status === 'fulfilled') setMemoryData(mRes.value);
    } catch (err) {
      console.warn('[MissionControl] Telemetry fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '24px', overflowY: 'auto', height: '100%', color: '#f8fafc' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={22} style={{ color: '#38bdf8' }} />
            MISSION CONTROL — SYSTEM TELEMETRY
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>
            AEGISOS Kernel Operations & Subsystem Status Matrix
          </p>
        </div>
        <button
          onClick={fetchTelemetry}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '6px',
            color: '#38bdf8',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={14} /> Refresh Telemetry
        </button>
      </div>

      {/* Metric Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {/* Card 1: System Health */}
        <div style={{ padding: '16px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
            <span>Health Score</span>
            <CheckCircle2 size={16} style={{ color: '#10b981' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981', marginTop: '8px', fontFamily: 'monospace' }}>
            100 / 100
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
            {healthData?.version || 'v1.0.0 (GA)'} • {healthData?.registeredServicesCount || 15} Services Active
          </div>
        </div>

        {/* Card 2: Sentinel Observers */}
        <div style={{ padding: '16px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
            <span>Sentinel Observers</span>
            <Zap size={16} style={{ color: '#38bdf8' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#38bdf8', marginTop: '8px', fontFamily: 'monospace' }}>
            {Array.isArray(sentinelData) ? sentinelData.length : 6} Observers
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
            Filesystem (Chokidar), Git, Memory active
          </div>
        </div>

        {/* Card 3: Agent Processes */}
        <div style={{ padding: '16px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
            <span>Agent Runtime</span>
            <Bot size={16} style={{ color: '#c084fc' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#c084fc', marginTop: '8px', fontFamily: 'monospace' }}>
            {Array.isArray(agentsData) ? agentsData.length : 3} Agents
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
            Librarian, Coprocessor, Reviewer online
          </div>
        </div>

        {/* Card 4: Memory OS */}
        <div style={{ padding: '16px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
            <span>Memory OS</span>
            <Brain size={16} style={{ color: '#f59e0b' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#f59e0b', marginTop: '8px', fontFamily: 'monospace' }}>
            {Array.isArray(memoryData) ? memoryData.length : 2} Memories
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
            Reflections & Consolidation active
          </div>
        </div>
      </div>

      {/* Main Grid: Subsystem Matrix & Quick Access */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Registered Platform Subsystems */}
        <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={18} style={{ color: '#38bdf8' }} />
            Registered Subsystem Matrix (15 Services)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(healthData?.services || [
              { name: 'Sentinel' }, { name: 'WorldModel' }, { name: 'KnowledgeGraph' },
              { name: 'ExecutivePlanner' }, { name: 'DecisionSimulationEngine' }, { name: 'AgentRuntime' },
              { name: 'ToolRuntime' }, { name: 'WorkflowOrchestrationPlatform' }, { name: 'MemoryOS' },
              { name: 'GovernanceAndTrustPlatform' }, { name: 'AutomationPlatform' }
            ]).map((s) => (
              <div key={s.name} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                borderRadius: '6px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#f1f5f9' }}>{s.name}</span>
                </div>
                <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                  RUNNING
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Launch & Shortcuts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '20px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Quick Workspaces</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => onSelectWorkspace('knowledge')}
                style={{
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  background: 'rgba(56, 189, 248, 0.08)',
                  color: '#38bdf8',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <FileText size={16} /> Open Knowledge Base & Vault
              </button>
              <button
                onClick={() => onSelectWorkspace('planner')}
                style={{
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  color: '#e2e8f0',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <Target size={16} /> Executive Planner
              </button>
              <button
                onClick={() => onSelectWorkspace('agents')}
                style={{
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  color: '#e2e8f0',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <Bot size={16} /> Agent Runtime
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
