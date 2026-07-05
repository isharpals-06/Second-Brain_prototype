import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FileText, Activity, Save, ArrowRight, BookOpen, Clock, Cpu, Shield, Mic, CheckSquare } from 'lucide-react';

function PhysicsNetworkGraph({ notes, onNodeClick }) {
  const canvasRef = useRef(null);
  const nodesRef = useRef([]);
  const linksRef = useRef([]);
  const dragNodeIndexRef = useRef(null);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState(null);

  const playHapticHover = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    } catch (_) {}
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        canvas.width = entry.contentRect.width || 400;
        canvas.height = entry.contentRect.height || 260;
      }
    });
    resizeObserver.observe(container);

    canvas.width = container.clientWidth || 400;
    canvas.height = container.clientHeight || 260;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const subjectsData = [
      { id: 'MOC', label: 'CORE VAULT', color: 'var(--color-cyan)', size: 11, charge: -120 },
      { id: 'OS', label: 'OS MOC', color: '#00f6ff', size: 7, charge: -60 },
      { id: 'DSA', label: 'DSA MOC', color: '#10b981', size: 7, charge: -60 },
      { id: 'DBMS', label: 'DBMS MOC', color: '#f59e0b', size: 7, charge: -60 },
      { id: 'DISCRETE', label: 'MATH MOC', color: '#ec4899', size: 7, charge: -60 },
      { id: 'CSA', label: 'CSA MOC', color: '#3b82f6', size: 7, charge: -60 },
      { id: 'CYBER_CN', label: 'CYBER MOC', color: '#ef4444', size: 7, charge: -60 },
      { id: 'ML', label: 'ML MOC', color: '#a855f7', size: 7, charge: -60 },
      { id: 'STATISTICS', label: 'STATS MOC', color: '#14b8a6', size: 7, charge: -60 }
    ];

    nodesRef.current = subjectsData.map((node, idx) => {
      if (node.id === 'MOC') {
        return { ...node, x: centerX, y: centerY, vx: 0, vy: 0, fx: centerX, fy: centerY };
      }
      const angle = (idx * 2 * Math.PI) / (subjectsData.length - 1);
      const r = 70 + Math.random() * 20;
      return {
        ...node,
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle),
        vx: 0,
        vy: 0
      };
    });

    linksRef.current = [
      { source: 'OS', target: 'MOC' },
      { source: 'DSA', target: 'MOC' },
      { source: 'DBMS', target: 'MOC' },
      { source: 'DISCRETE', target: 'MOC' },
      { source: 'CSA', target: 'MOC' },
      { source: 'CYBER_CN', target: 'MOC' },
      { source: 'ML', target: 'MOC' },
      { source: 'STATISTICS', target: 'MOC' }
    ];

    let animationFrameId;

    const step = () => {
      const nodes = nodesRef.current;
      const links = linksRef.current;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      // 1. Repulsion
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const distSqr = dx * dx + dy * dy + 0.1;
          const dist = Math.sqrt(distSqr);
          if (dist < 180) {
            const force = (n1.charge * n2.charge) / distSqr;
            const fx = (dx / dist) * force * 0.15;
            const fy = (dy / dist) * force * 0.15;
            
            if (n1.id !== 'MOC' && n1.fx === undefined) {
              n1.vx -= fx;
              n1.vy -= fy;
            }
            if (n2.id !== 'MOC' && n2.fx === undefined) {
              n2.vx += fx;
              n2.vy += fy;
            }
          }
        }
      }

      // 2. Attraction
      const springLength = 70;
      const k = 0.015;
      links.forEach(link => {
        const sourceNode = nodes.find(n => n.id === link.source);
        const targetNode = nodes.find(n => n.id === link.target);
        if (!sourceNode || !targetNode) return;

        const dx = targetNode.x - sourceNode.x;
        const dy = targetNode.y - sourceNode.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
        const delta = dist - springLength;
        const force = delta * k;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        if (sourceNode.id !== 'MOC' && sourceNode.fx === undefined) {
          sourceNode.vx += fx;
          sourceNode.vy += fy;
        }
        if (targetNode.id !== 'MOC' && targetNode.fx === undefined) {
          targetNode.vx -= fx;
          targetNode.vy -= fy;
        }
      });

      // 3. Gravity
      const gravity = 0.008;
      nodes.forEach(node => {
        if (node.id === 'MOC') return;
        const dx = cx - node.x;
        const dy = cy - node.y;
        node.vx += dx * gravity;
        node.vy += dy * gravity;
      });

      // 4. Update coordinates
      const damping = 0.82;
      nodes.forEach(node => {
        if (node.fx !== undefined) {
          node.x = node.fx;
          node.y = node.fy;
          node.vx = 0;
          node.vy = 0;
        } else {
          node.vx *= damping;
          node.vy *= damping;
          node.x += node.vx;
          node.y += node.vy;
        }

        const padding = 20;
        if (node.x < padding) { node.x = padding; node.vx = 0; }
        if (node.x > w - padding) { node.x = w - padding; node.vx = 0; }
        if (node.y < padding) { node.y = padding; node.vy = 0; }
        if (node.y > h - padding) { node.y = h - padding; node.vy = 0; }
      });

      // 5. Draw
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = 'rgba(0, 246, 255, 0.02)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 25) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw links
      ctx.strokeStyle = 'rgba(0, 246, 255, 0.15)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      links.forEach(link => {
        const sourceNode = nodes.find(n => n.id === link.source);
        const targetNode = nodes.find(n => n.id === link.target);
        if (!sourceNode || !targetNode) return;
        ctx.beginPath();
        ctx.moveTo(sourceNode.x, sourceNode.y);
        ctx.lineTo(targetNode.x, targetNode.y);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Draw nodes
      nodes.forEach(node => {
        const isHovered = hoveredNode && hoveredNode.id === node.id;
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size + (isHovered ? 3 : 0), 0, 2 * Math.PI);
        ctx.fillStyle = node.color;
        ctx.shadowBlur = isHovered ? 12 : 5;
        ctx.shadowColor = node.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size / 2.2, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fill();

        ctx.fillStyle = isHovered ? '#fff' : 'rgba(211, 226, 236, 0.7)';
        ctx.font = `${isHovered ? 'bold ' : ''}8px Share Tech Mono`;
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y - node.size - 6);
      });

      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [hoveredNode]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mousePosRef.current = { x, y };

    if (dragNodeIndexRef.current !== null) {
      const dragNode = nodesRef.current[dragNodeIndexRef.current];
      if (dragNode.id !== 'MOC') {
        dragNode.fx = x;
        dragNode.fy = y;
      }
      return;
    }

    let foundHover = null;
    for (let i = 0; i < nodesRef.current.length; i++) {
      const node = nodesRef.current[i];
      const dx = x - node.x;
      const dy = y - node.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < node.size + 8) {
        foundHover = node;
        break;
      }
    }

    if (foundHover && (!hoveredNode || hoveredNode.id !== foundHover.id)) {
      setHoveredNode(foundHover);
      playHapticHover();
    } else if (!foundHover && hoveredNode) {
      setHoveredNode(null);
    }
  };

  const handleMouseDown = (e) => {
    const { x, y } = mousePosRef.current;
    for (let i = 0; i < nodesRef.current.length; i++) {
      const node = nodesRef.current[i];
      const dx = x - node.x;
      const dy = y - node.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < node.size + 8) {
        dragNodeIndexRef.current = i;
        if (node.id !== 'MOC') {
          node.fx = x;
          node.fy = y;
        }
        break;
      }
    }
  };

  const handleMouseUp = () => {
    if (dragNodeIndexRef.current !== null) {
      const dragNode = nodesRef.current[dragNodeIndexRef.current];
      dragNode.fx = undefined;
      dragNode.fy = undefined;
      dragNodeIndexRef.current = null;
    }
  };

  const handleClick = () => {
    if (hoveredNode) {
      onNodeClick(hoveredNode.id);
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          cursor: hoveredNode ? 'pointer' : 'default'
        }}
      />
      {hoveredNode && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: 'rgba(2, 3, 6, 0.92)',
          border: `1px solid ${hoveredNode.color}`,
          padding: '6px 10px',
          fontFamily: 'var(--font-telemetry)',
          fontSize: '0.62rem',
          color: '#fff',
          boxShadow: `0 0 12px rgba(0, 246, 255, 0.18)`,
          pointerEvents: 'none',
          zIndex: 20
        }}>
          <div>NODE: {hoveredNode.label}</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.52rem', marginTop: '2px' }}>
            STATUS: ACTIVE SPRING
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardOverview({ onSelectNote, onNavigate }) {
  const [notes, setNotes] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [scratchpad, setScratchpad] = useState('');
  const [loading, setLoading] = useState(true);
  const [scratchSaving, setScratchSaving] = useState(false);
  const [scratchStatus, setScratchStatus] = useState('');
  
  // Task board states
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState('');

  // Recently visited notes state
  const [visitedNotes, setVisitedNotes] = useState([]);
  
  // Backup state
  const [backupStatus, setBackupStatus] = useState('idle');
  const [backupLog, setBackupLog] = useState('Idle. Awaiting trigger.');

  const fetchStats = async () => {
    try {
      // Fetch Notes
      const notesRes = await fetch('/api/notes');
      const notesData = await notesRes.json();
      setNotes(notesData);

      // Fetch Flashcards
      const cardsRes = await fetch('/api/flashcards');
      const cardsData = await cardsRes.json();
      setFlashcards(cardsData);

      // Fetch Tasks list
      const tasksRes = await fetch('/api/tasks');
      const tasksData = await tasksRes.json();
      setTasks(tasksData);
    } catch (e) {
      console.error('Error fetching dashboard stats:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Update visited notes list from localStorage
  useEffect(() => {
    if (notes.length > 0) {
      let paths = [];
      try {
        paths = JSON.parse(localStorage.getItem('recentlyVisited') || '[]');
      } catch (e) {}
      const mapped = paths.map(p => notes.find(n => n.absolutePath === p)).filter(Boolean);
      setVisitedNotes(mapped);
    }
  }, [notes]);

  const handleNoteClick = (note) => {
    try {
      let visited = JSON.parse(localStorage.getItem('recentlyVisited') || '[]');
      visited = visited.filter(path => path !== note.absolutePath);
      visited.unshift(note.absolutePath);
      visited = visited.slice(0, 5);
      localStorage.setItem('recentlyVisited', JSON.stringify(visited));
    } catch(e) {}
    onSelectNote(note.absolutePath);
  };

  // Subject node map click handler (navigates directly to the MOC file)
  const handleSubjectNodeClick = (subjectName) => {
    const mocFile = notes.find(n => 
      n.filename.toUpperCase().includes(subjectName.toUpperCase()) && 
      n.filename.toUpperCase().includes('MOC')
    );
    if (mocFile) {
      handleNoteClick(mocFile);
    } else {
      alert(`Subject MOC file for "${subjectName}" could not be found in notes vault.`);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskText.trim()) return;
    try {
      const res = await fetch('/api/tasks/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newTaskText })
      });
      const data = await res.json();
      if (data.success) {
        setNewTaskText('');
        // Reload tasks list
        const tasksRes = await fetch('/api/tasks');
        const tasksData = await tasksRes.json();
        setTasks(tasksData);
      }
    } catch (e) {
      console.error('Error adding task:', e);
    }
  };

  const handleToggleTask = async (taskText, isCompleted) => {
    try {
      const res = await fetch('/api/tasks/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: taskText, completed: isCompleted })
      });
      const data = await res.json();
      if (data.success) {
        // Reload tasks list
        const tasksRes = await fetch('/api/tasks');
        const tasksData = await tasksRes.json();
        setTasks(tasksData);
      }
    } catch (e) {
      console.error('Error toggling task:', e);
    }
  };

  const saveScratchpad = async () => {
    if (!scratchpad.trim()) return;
    setScratchSaving(true);
    setScratchStatus('Saving...');
    try {
      const res = await fetch('/api/notes/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filePath: 'scratchpad.md',
          content: scratchpad
        })
      });
      const data = await res.json();
      if (data.success) {
        setScratchStatus('Saved!');
        setScratchpad('');
        setTimeout(() => setScratchStatus(''), 2000);
      } else {
        setScratchStatus('Failed to save.');
      }
    } catch (e) {
      setScratchStatus('Error saving.');
    } finally {
      setScratchSaving(false);
    }
  };

  const handleTriggerBackup = async () => {
    setBackupStatus('backing-up');
    setBackupLog('Initiating zip thread... zipping vault & server folders...');
    try {
      const res = await fetch('/api/backup/trigger', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setBackupStatus('success');
        setBackupLog('Compressing coordinates... success!');
        setTimeout(() => {
          setBackupStatus('idle');
          setBackupLog('Idle. Awaiting trigger.');
        }, 4000);
      } else {
        setBackupStatus('error');
        setBackupLog('Backup thread interrupted: Check server logs.');
        setTimeout(() => {
          setBackupStatus('idle');
          setBackupLog('Idle. Awaiting trigger.');
        }, 4000);
      }
    } catch (_) {
      setBackupStatus('error');
      setBackupLog('Connection error: Backup failed.');
      setTimeout(() => {
        setBackupStatus('idle');
        setBackupLog('Idle. Awaiting trigger.');
      }, 4000);
    }
  };

  const getSubjectColor = (subjectId) => {
    if (!subjectId) return 'var(--color-violet)';
    const cleanId = subjectId.toUpperCase();
    if (cleanId.includes('OS') || cleanId.includes('OPERATING')) return 'var(--color-cyan)';
    if (cleanId.includes('DSA') || cleanId.includes('DATA_STRUCTURES')) return '#10b981';
    if (cleanId.includes('DBMS') || cleanId.includes('DATABASE')) return '#f59e0b';
    if (cleanId.includes('DISCRETE')) return '#ec4899';
    if (cleanId.includes('COMPUTER') || cleanId.includes('SYSTEM_ARCHITECTURE') || cleanId.includes('ARCHITECTURE')) return '#a78bfa';
    if (cleanId.includes('CYBER') || cleanId.includes('NETWORKS') || cleanId.includes('CYBER_CN')) return '#06b6d4';
    if (cleanId.includes('ML') || cleanId.includes('MACHINE')) return '#f43f5e';
    if (cleanId.includes('OPPS') || cleanId.includes('OOP')) return '#14b8a6';
    if (cleanId.includes('STATISTICS')) return '#84cc16';
    return 'var(--color-violet)';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexGrow: 1, justifyContent: 'center', alignItems: 'center', color: 'var(--color-cyan)', height: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '2px solid rgba(0,251,251,0.2)',
            borderTopColor: 'var(--color-cyan)',
            animation: 'rotate-slow 1s linear infinite'
          }} />
          <span style={{ fontFamily: 'var(--font-telemetry)', fontSize: '0.8rem', letterSpacing: '2px' }}>A.R.C. TELEMETRY COGNITION INITIALIZING...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      height: '100%',
      overflowY: 'auto',
      backgroundColor: '#0c0d12',
      backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
      backgroundSize: '40px 40px',
      position: 'relative'
    }} className="custom-scrollbar">
      
      {/* Decorative Viewport Brackets */}
      <div style={{ position: 'absolute', top: '10px', left: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(0,251,251,0.3)', borderLeft: '2px solid rgba(0,251,251,0.3)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '10px', right: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(0,251,251,0.3)', borderRight: '2px solid rgba(0,251,251,0.3)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(0,251,251,0.3)', borderLeft: '2px solid rgba(0,251,251,0.3)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(0,251,251,0.3)', borderRight: '2px solid rgba(0,251,251,0.3)', pointerEvents: 'none' }} />

      {/* 1. Cockpit Welcome Banner */}
      <div className="glass-panel" style={{
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
        border: '1px solid rgba(0, 251, 251, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* L-shaped corner brackets */}
        <div style={{ position: 'absolute', top: '-1px', left: '-1px', width: '8px', height: '8px', borderTop: '2px solid var(--color-cyan)', borderLeft: '2px solid var(--color-cyan)' }} />
        <div style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '8px', height: '8px', borderBottom: '2px solid var(--color-cyan)', borderRight: '2px solid var(--color-cyan)' }} />
        
        <div>
          <h1 style={{
            fontSize: '1.4rem',
            fontFamily: 'var(--font-hud)',
            fontWeight: 800,
            color: '#fff',
            margin: '0 0 4px 0',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            textShadow: '0 0 10px rgba(0,251,251,0.3)'
          }}>
            A.R.C. COGNITIVE HUD v2.0
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontFamily: 'var(--font-telemetry)', margin: 0 }}>
            LONG-TERM MEMORY CACHE ACTIVE // SYSTEM SECURITY LEVEL: STARK_SECURED // {notes.length} NODES LOGGED
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-telemetry)', fontSize: '0.7rem', color: 'var(--color-cyan)' }}>
          <span className="pulse-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-cyan)', boxShadow: '0 0 8px var(--color-cyan)' }} />
          <span>VAULT FEED STATUS: COMPILING</span>
        </div>
      </div>

      {/* 2. Main Bento Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px' }}>
        
        {/* Bento Cell 1: concentric Arc Reactor Diagnostic Core (Spans 7 columns) */}
        <section className="glass-panel" style={{
          gridColumn: 'span 7',
          padding: '20px',
          border: '1px solid rgba(0, 246, 255, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '360px',
          position: 'relative',
          backgroundColor: 'var(--hud-glass-surface)'
        }}>
          {/* Brackets */}
          <div style={{ position: 'absolute', top: '-1px', left: '-1px', width: '6px', height: '6px', borderTop: '2px solid var(--color-cyan)', borderLeft: '2px solid var(--color-cyan)' }} />
          <div style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '6px', height: '6px', borderBottom: '2px solid var(--color-cyan)', borderRight: '2px solid var(--color-cyan)' }} />

          <header style={{ display: 'flex', justifyContext: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.75rem', fontFamily: 'var(--font-telemetry)', color: 'var(--color-cyan)', fontWeight: 700, letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-cyan)', animation: 'pulse 1.5s infinite' }} />
              ARC CORE DIAGNOSTIC
            </h3>
            <span style={{ fontSize: '#6b7280', fontFamily: 'var(--font-telemetry)', fontSize: '0.65rem' }}>ID: COG-99.A</span>
          </header>

          <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {/* Spinning vector rings */}
            <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justify: 'center' }}>
              
              {/* Outer Dash Ring (rotating clockwise) */}
              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', animation: 'pulse 3s infinite ease-in-out' }} viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" stroke="var(--color-cyan)" strokeWidth="0.5" strokeDasharray="3 6" opacity="0.35" />
              </svg>
              
              {/* Mid Ring (rotating counter-clockwise) */}
              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'rotate(-45deg)' }} viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="none" stroke="var(--color-violet)" strokeWidth="1" strokeDasharray="8 20" opacity="0.6" />
              </svg>
              
              {/* Inner ring */}
              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="30" fill="none" stroke="var(--color-cyan)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.8" />
              </svg>

              {/* Core Text load */}
              <div style={{ zIndex: 10, textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-hud)', textShadow: '0 0 8px var(--color-cyan)' }}>42%</div>
                <div style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-telemetry)', letterSpacing: '1px', textTransform: 'uppercase' }}>RAM LOAD</div>
              </div>
            </div>

            {/* Left Telemetry Label */}
            <div style={{ position: 'absolute', left: '16px', top: '35%', fontFamily: 'var(--font-telemetry)', fontSize: '0.7rem', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span style={{ color: 'var(--color-cyan)', fontWeight: 700 }}>✓ RAG ENGINE</span>
              <span style={{ color: 'var(--text-muted)' }}>CACHE: SYNCD</span>
              <span style={{ color: 'var(--text-muted)' }}>FILES: {notes.length} NODES</span>
            </div>

            {/* Right Telemetry Label */}
            <div style={{ position: 'absolute', right: '16px', bottom: '35%', fontFamily: 'var(--font-telemetry)', fontSize: '0.7rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
              <span style={{ color: 'var(--color-violet)', fontWeight: 700 }}>✓ MODEL TIMEOUT</span>
              <span style={{ color: 'var(--text-muted)' }}>AUTO-UNLOAD: 5M</span>
              <span style={{ color: 'var(--text-muted)' }}>STATE: STABLE</span>
            </div>
          </div>
        </section>

        {/* Bento Cell 2: Subject Vault Network SVG Graph (Spans 5 columns) */}
        <section className="glass-panel" style={{
          gridColumn: 'span 5',
          padding: '20px',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          height: '360px',
          position: 'relative',
          backgroundColor: 'var(--hud-glass-surface)'
        }}>
          <div style={{ position: 'absolute', top: '-1px', left: '-1px', width: '6px', height: '6px', borderTop: '2px solid var(--color-violet)', borderLeft: '2px solid var(--color-violet)' }} />
          <div style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '6px', height: '6px', borderBottom: '2px solid var(--color-violet)', borderRight: '2px solid var(--color-violet)' }} />

          <header style={{ marginBottom: '12px' }}>
            <h3 style={{ fontSize: '0.75rem', fontFamily: 'var(--font-telemetry)', color: 'var(--color-violet)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
              NEURAL SUBJECT VAULT
            </h3>
          </header>

          <div style={{ flexGrow: 1, position: 'relative' }}>
            <PhysicsNetworkGraph notes={notes} onNodeClick={handleSubjectNodeClick} />
          </div>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'var(--font-telemetry)', textAlign: 'center' }}>
            CLICK NODES TO NAVIGATE SUBJECT MAP OF CONTENTS (MOC)
          </div>
        </section>
      </div>

      {/* Row 3: Diagnostics, Backups, and Voice HUD (Spans 12 columns) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px' }}>
        
        {/* Bento Cell 3: Index Status Info Block (Spans 3 columns) */}
        <section className="glass-panel" style={{
          gridColumn: 'span 3',
          padding: '16px',
          border: '1px dashed rgba(0, 246, 255, 0.2)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: 'var(--hud-glass-surface)'
        }}>
          <div style={{ position: 'absolute', top: '-1px', left: '-1px', width: '5px', height: '5px', borderTop: '2px solid rgba(255,255,255,0.3)', borderLeft: '2px solid rgba(255,255,255,0.3)' }} />
          <h4 style={{ fontSize: '0.7rem', fontFamily: 'var(--font-telemetry)', color: 'var(--text-secondary)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '14px' }}>
            INDEX STATUS
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontFamily: 'var(--font-telemetry)', fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContext: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
              <span style={{ color: 'var(--text-muted)' }}>EMBED CACHE</span>
              <span style={{ color: 'var(--color-cyan)' }}>768-D Nomadic</span>
            </div>
            <div style={{ display: 'flex', justifyContext: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
              <span style={{ color: 'var(--text-muted)' }}>INDEXED</span>
              <span style={{ color: '#fff' }}>{notes.length} Notes</span>
            </div>
            <div style={{ display: 'flex', justifyContext: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>RAG LINK</span>
              <span style={{ color: '#10b981' }}>CONNECTED</span>
            </div>
          </div>
        </section>

        {/* Bento Cell 4: Backup Controller Panel (Spans 5 columns) */}
        <section className="glass-panel" style={{
          gridColumn: 'span 5',
          padding: '16px',
          border: '1px solid rgba(0, 246, 255, 0.3)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--hud-glass-surface)'
        }}>
          <div style={{ position: 'absolute', top: '-1px', left: '-1px', width: '5px', height: '5px', borderTop: '2px solid var(--color-cyan)', borderLeft: '2px solid var(--color-cyan)' }} />
          
          <div style={{ fontFamily: 'var(--font-telemetry)', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '12px', textAlign: 'center', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            LOG: <span style={{ color: '#fff' }}>{backupLog}</span>
          </div>

          <button
            onClick={handleTriggerBackup}
            disabled={backupStatus === 'backing-up'}
            style={{
              padding: '10px 24px',
              backgroundColor: backupStatus === 'backing-up' ? 'rgba(255,255,255,0.05)' : 'rgba(139,92,246,0.1)',
              border: '1px solid var(--color-cyan)',
              color: backupStatus === 'success' ? '#10b981' : '#fff',
              fontFamily: 'var(--font-telemetry)',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '2px',
              cursor: backupStatus === 'backing-up' ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              outline: 'none',
              boxShadow: '0 0 10px rgba(0,251,251,0.1)'
            }}
            onMouseOver={(e) => {
              if (backupStatus === 'idle') {
                e.currentTarget.style.backgroundColor = 'rgba(0,251,251,0.15)';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(0,251,251,0.3)';
              }
            }}
            onMouseOut={(e) => {
              if (backupStatus === 'idle') {
                e.currentTarget.style.backgroundColor = 'rgba(139,92,246,0.1)';
                e.currentTarget.style.boxShadow = '0 0 10px rgba(0,251,251,0.1)';
              }
            }}
          >
            {backupStatus === 'idle' && <span>TRIGGER MANUAL BACKUP</span>}
            {backupStatus === 'backing-up' && <span>ZIPPING WORKSPACE...</span>}
            {backupStatus === 'success' && <span>✓ ARCHIVE SUCCESSFUL</span>}
            {backupStatus === 'error' && <span style={{ color: '#ef4444' }}>⚠ ARCHIVE ERROR</span>}
          </button>
        </section>

        {/* Bento Cell 5: Voice HUD (Spans 4 columns) */}
        <section className="glass-panel" style={{
          gridColumn: 'span 4',
          padding: '16px',
          border: '1px dashed rgba(0, 246, 255, 0.2)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: 'var(--hud-glass-surface)'
        }}>
          <div style={{ position: 'absolute', top: '-1px', left: '-1px', width: '5px', height: '5px', borderTop: '2px solid rgba(255,255,255,0.3)', borderLeft: '2px solid rgba(255,255,255,0.3)' }} />
          
          <header style={{ display: 'flex', justifyContext: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '0.7rem', fontFamily: 'var(--font-telemetry)', color: 'var(--text-secondary)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              VOICE HUD FEED
            </h4>
            <Mic size={14} style={{ color: 'var(--color-cyan)' }} />
          </header>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContext: 'space-between', gap: '3px', height: '36px', marginTop: '8px' }}>
            {/* Bouncing Simulated Audio Spectrum */}
            <div style={{ width: '100%', height: '30%', backgroundColor: 'rgba(0,251,251,0.7)', borderRadius: '2px 2px 0 0' }} />
            <div style={{ width: '100%', height: '65%', backgroundColor: 'rgba(0,251,251,0.5)', borderRadius: '2px 2px 0 0' }} />
            <div style={{ width: '100%', height: '90%', backgroundColor: 'rgba(0,251,251,0.85)', borderRadius: '2px 2px 0 0' }} />
            <div style={{ width: '100%', height: '40%', backgroundColor: 'rgba(0,251,251,0.6)', borderRadius: '2px 2px 0 0' }} />
            <div style={{ width: '100%', height: '70%', backgroundColor: 'rgba(0,251,251,0.95)', borderRadius: '2px 2px 0 0' }} />
            <div style={{ width: '100%', height: '20%', backgroundColor: 'rgba(0,251,251,0.4)', borderRadius: '2px 2px 0 0' }} />
            <div style={{ width: '100%', height: '55%', backgroundColor: 'rgba(0,251,251,0.75)', borderRadius: '2px 2px 0 0' }} />
          </div>
        </section>
      </div>

      {/* Row 4: Tasks, Scratchpad, and Visited History (Spans 12 columns) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px' }}>
        
        {/* Left Bento: Quick Capture Terminal (Spans 6 columns) */}
        <section className="glass-panel" style={{
          gridColumn: 'span 6',
          padding: '20px',
          border: '1px dashed rgba(0, 246, 255, 0.2)',
          backgroundColor: 'var(--hud-glass-surface)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          minHeight: '260px'
        }}>
          <div style={{ position: 'absolute', top: '-1px', left: '-1px', width: '5px', height: '5px', borderTop: '2px solid rgba(255,255,255,0.3)', borderLeft: '2px solid rgba(255,255,255,0.3)' }} />
          
          <header style={{ display: 'flex', justifyContext: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.8rem', fontFamily: 'var(--font-telemetry)', fontWeight: 700, color: '#fff', letterSpacing: '1px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={14} style={{ color: 'var(--color-cyan)' }} />
              RAW BUFFER TERMINAL
            </h3>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: 'var(--font-telemetry)' }}>[KARPATHY_BUFFER]</span>
          </header>

          <textarea
            value={scratchpad}
            onChange={(e) => setScratchpad(e.target.value)}
            placeholder="Dump thoughts, copy lecture transcripts, or notes..."
            style={{
              flexGrow: 1,
              width: '100%',
              backgroundColor: 'rgba(0,0,0,0.3)',
              border: '1px dashed rgba(0, 246, 255, 0.2)',
              borderRadius: '6px',
              padding: '12px',
              color: 'var(--color-cyan)',
              fontFamily: 'var(--font-telemetry)',
              fontSize: '0.8rem',
              lineHeight: '1.4',
              outline: 'none',
              resize: 'none',
              minHeight: '100px'
            }}
          />

          <div style={{ display: 'flex', justifyContext: 'space-between', alignItems: 'center', marginTop: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-telemetry)' }}>
              {scratchStatus}
            </span>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  onNavigate('coprocessor', scratchpad);
                  setScratchpad('');
                }}
                disabled={!scratchpad.trim()}
                style={{
                  backgroundColor: 'rgba(6, 182, 212, 0.1)',
                  color: 'var(--color-cyan)',
                  border: '1px solid rgba(0, 251, 251, 0.3)',
                  borderRadius: '4px',
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-telemetry)',
                  fontWeight: 600,
                  cursor: scratchpad.trim() ? 'pointer' : 'not-allowed',
                  opacity: scratchpad.trim() ? 1 : 0.5
                }}
              >
                Refine via AI
              </button>
              
              <button
                onClick={saveScratchpad}
                disabled={scratchSaving || !scratchpad.trim()}
                style={{
                  backgroundColor: 'var(--color-cyan)',
                  color: '#0c0d12',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '6px 14px',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-telemetry)',
                  fontWeight: 700,
                  cursor: scratchpad.trim() ? 'pointer' : 'not-allowed',
                  opacity: scratchpad.trim() ? 1 : 0.5
                }}
              >
                Save Buffer
              </button>
            </div>
          </div>
        </section>

        {/* Right Bento: Strategic Tasks Directive (Spans 6 columns) */}
        <section className="glass-panel" style={{
          gridColumn: 'span 6',
          padding: '20px',
          border: '1px dashed rgba(0, 246, 255, 0.2)',
          backgroundColor: 'var(--hud-glass-surface)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          minHeight: '260px'
        }}>
          <div style={{ position: 'absolute', top: '-1px', left: '-1px', width: '5px', height: '5px', borderTop: '2px solid rgba(255,255,255,0.3)', borderLeft: '2px solid rgba(255,255,255,0.3)' }} />
          
          <header style={{ display: 'flex', justifyContext: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.8rem', fontFamily: 'var(--font-telemetry)', fontWeight: 700, color: '#fff', letterSpacing: '1px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckSquare size={14} style={{ color: '#10b981' }} />
              TACTICAL DIRECTIVES
            </h3>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-telemetry)', fontWeight: 600, color: '#10b981' }}>
              {tasks.filter(t => !t.completed).length} ACTIVE
            </span>
          </header>

          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTask();
              }}
              placeholder="Inject tactical directive (e.g. 'Review [[OS MOC]]')..."
              style={{
                flexGrow: 1,
                backgroundColor: 'rgba(0,0,0,0.3)',
                border: '1px dashed rgba(0, 246, 255, 0.2)',
                borderRadius: '4px',
                padding: '8px 12px',
                color: '#fff',
                fontFamily: 'var(--font-telemetry)',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            />
            <button
              onClick={handleAddTask}
              disabled={!newTaskText.trim()}
              style={{
                backgroundColor: 'var(--color-green)',
                color: '#0c0d12',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 14px',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-telemetry)',
                fontWeight: 700,
                cursor: newTaskText.trim() ? 'pointer' : 'not-allowed',
                opacity: newTaskText.trim() ? 1 : 0.6
              }}
            >
              INJECT
            </button>
          </div>

          <div style={{
            flexGrow: 1,
            overflowY: 'auto',
            maxHeight: '140px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }} className="custom-scrollbar">
            {tasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic', fontFamily: 'var(--font-telemetry)' }}>
                NO DIRECTIVES ACTIVE.
              </div>
            ) : (
              tasks.map(task => (
                <div
                  key={task.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    backgroundColor: 'rgba(255,255,255,0.01)',
                    border: '1px dashed rgba(0, 246, 255, 0.2)',
                    borderRadius: '4px',
                    opacity: task.completed ? 0.6 : 1
                  }}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleTask(task.text, !task.completed)}
                    style={{
                      cursor: 'pointer',
                      accentColor: 'var(--color-green)'
                    }}
                  />
                  <span style={{
                    fontSize: '0.8rem',
                    color: task.completed ? 'var(--text-muted)' : '#e5e7eb',
                    textDecoration: task.completed ? 'line-through' : 'none',
                    fontFamily: 'var(--font-telemetry)',
                    wordBreak: 'break-all',
                    textAlign: 'left',
                    flexGrow: 1
                  }}>
                    {task.text}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Row 5: Recently Visited Notes (Spans 12 columns) */}
      <section className="glass-panel" style={{
        padding: '20px',
        border: '1px dashed rgba(0, 246, 255, 0.2)',
        backgroundColor: 'var(--hud-glass-surface)',
        position: 'relative'
      }}>
        <div style={{ position: 'absolute', top: '-1px', left: '-1px', width: '5px', height: '5px', borderTop: '2px solid rgba(255,255,255,0.3)', borderLeft: '2px solid rgba(255,255,255,0.3)' }} />
        
        <h3 style={{ fontSize: '0.8rem', fontFamily: 'var(--font-telemetry)', fontWeight: 700, color: '#fff', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '14px' }}>
          RECENTLY ACCESSED NEURAL LOGS
        </h3>
        
        {visitedNotes.length === 0 ? (
          <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic', fontFamily: 'var(--font-telemetry)' }}>
            NO DATA ACCESSED IN CURRENT RUN TIME.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
            {visitedNotes.map(n => (
              <button
                key={n.absolutePath}
                onClick={() => handleNoteClick(n)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: 'rgba(255,255,255,0.01)',
                  border: '1px dashed rgba(0, 246, 255, 0.2)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = getSubjectColor(n.subject);
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.01)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <Clock size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8rem', color: '#fff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', fontFamily: 'var(--font-telemetry)' }}>
                    {n.title}
                  </span>
                </div>
                <span style={{ fontSize: '0.65rem', color: getSubjectColor(n.subject), fontWeight: 700, fontFamily: 'var(--font-telemetry)', flexShrink: 0 }}>
                  {n.subject}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
