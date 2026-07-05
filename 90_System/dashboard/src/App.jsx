import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Cpu, 
  Layers, 
  Sparkles,
  Network,
  MessageSquare
} from 'lucide-react';
import DashboardOverview from './components/DashboardOverview';
import NotesExplorer from './components/NotesExplorer';
import CoprocessorConsole from './components/CoprocessorConsole';
import FlashcardsView from './components/FlashcardsView';
import AIChatConsole from './components/AIChatConsole';
import DailyBrief from './components/DailyBrief';

function App() {
  const [activeTab, setActiveTab] = useState('brief');
  const [selectedFile, setSelectedFile] = useState(null);
  const [coprocessorPreFill, setCoprocessorPreFill] = useState('');
  const [backupStatus, setBackupStatus] = useState('idle');

  // Command Spotlight & Voice Output States
  const [showCommandBar, setShowCommandBar] = useState(false);
  const [commandInput, setCommandInput] = useState('');
  const [globalSpeakOutput, setGlobalSpeakOutput] = useState(true);
  const [globalSearchFilter, setGlobalSearchFilter] = useState('');

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

  // Router to select note and jump to explorer tab
  const handleSelectNote = (filePath) => {
    setSelectedFile(filePath);
    setActiveTab('notes');
  };

  const menuItems = [
    { id: 'brief', label: 'Daily Brief', icon: Sparkles },
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'notes', label: 'Neural Vault', icon: FileText },
    { id: 'chat', label: 'Cognitive Chat', icon: MessageSquare },
    { id: 'coprocessor', label: 'Coprocessor', icon: Cpu },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'brief':
        return <DailyBrief />;
      case 'dashboard':
        return (
          <DashboardOverview 
            onSelectNote={handleSelectNote} 
            onNavigate={(tab, content) => {
              if (content) setCoprocessorPreFill(content);
              setActiveTab(tab);
            }} 
          />
        );
      case 'notes':
        return (
          <NotesExplorer 
            initialSelectedFile={selectedFile} 
            clearInitialSelected={() => setSelectedFile(null)} 
            globalSearchFilter={globalSearchFilter}
            clearGlobalSearchFilter={() => setGlobalSearchFilter('')}
          />
        );
      case 'chat':
        return (
          <AIChatConsole 
            onSelectNote={handleSelectNote} 
            speakOutput={globalSpeakOutput}
            setSpeakOutput={setGlobalSpeakOutput}
          />
        );
      case 'coprocessor':
        return (
          <CoprocessorConsole 
            onSelectNote={handleSelectNote} 
            preFillContent={coprocessorPreFill}
            clearPreFill={() => setCoprocessorPreFill('')}
          />
        );
      default:
        return <DailyBrief />;
    }
  };

  // Web Audio API sound generator for movie haptic responses
  const playHapticSound = (type) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'hover') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(500, ctx.currentTime);
        osc.frequency.setValueAtTime(800, ctx.currentTime + 0.03);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (_) {}
  };

  const handleTriggerBackupWithSound = async () => {
    playHapticSound('click');
    setBackupStatus('backing-up');
    try {
      const res = await fetch('/api/backup/trigger', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        playHapticSound('success');
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

  // Keyboard shortcut listener for Ctrl+K command modal
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        playHapticSound('click');
        setShowCommandBar(prev => !prev);
        setCommandInput('');
      }
      if (e.key === 'Escape') {
        setShowCommandBar(false);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleCommandSubmit = (cmd) => {
    playHapticSound('click');
    setShowCommandBar(false);
    
    const lower = cmd.toLowerCase().trim();
    if (lower === '/overview' || lower === '/dashboard') {
      setActiveTab('dashboard');
    } else if (lower === '/notes' || lower === '/vault') {
      setActiveTab('notes');
    } else if (lower === '/chat' || lower === '/cognitive') {
      setActiveTab('chat');
    } else if (lower === '/coprocessor') {
      setActiveTab('coprocessor');
    } else if (lower === '/flashcards') {
      setActiveTab('flashcards');
    } else if (lower === '/backup') {
      handleTriggerBackupWithSound();
    } else if (lower === '/voice' || lower === '/mute') {
      setGlobalSpeakOutput(prev => !prev);
      playHapticSound('success');
    } else if (cmd.trim()) {
      // Direct text search: pass to notes explorer, switch tab
      setGlobalSearchFilter(cmd.trim());
      setActiveTab('notes');
    }
    setCommandInput('');
  };

  return (
    <div style={{
      display: 'flex',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: '#020306',
      color: '#d1e2ec',
      fontFamily: 'var(--font-telemetry)',
      position: 'relative'
    }}>
      {/* 3D Holographic Overlays */}
      <div className="particles-overlay" />
      <div className="hud-scanline" />

      {/* 1. Left Control Cockpit (Reactor Navigation + System Controls) */}
      <div style={{
        width: '380px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        padding: '24px',
        borderRight: '1px solid rgba(0, 246, 255, 0.12)',
        backgroundColor: 'rgba(2, 3, 6, 0.85)',
        zIndex: 50,
        overflowY: 'auto'
      }} className="custom-scrollbar">
        
        {/* Header Branding */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderBottom: '1px dashed rgba(0, 246, 255, 0.15)',
          paddingBottom: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            border: '1px solid #00f6ff',
            backgroundColor: 'rgba(0, 246, 255, 0.08)',
            color: '#00f6ff',
            boxShadow: '0 0 10px rgba(0, 246, 255, 0.25)'
          }}>
            <Network size={18} />
          </div>
          <div>
            <h1 style={{
              fontSize: '1.25rem',
              fontFamily: 'var(--font-hud)',
              fontWeight: 900,
              color: '#fff',
              margin: 0,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              textShadow: '0 0 10px rgba(0, 246, 255, 0.35)'
            }}>
              A.R.C. COCKPIT
            </h1>
            <span style={{ fontSize: '0.6rem', color: '#00f6ff', fontWeight: 700, letterSpacing: '1.5px' }}>
              STARK_OS v2.0.4-BETA
            </span>
          </div>
        </div>

        {/* 3D Circular Arc Reactor Navigation Dial */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          margin: '12px 0'
        }}>
          <span style={{ fontSize: '0.65rem', color: 'rgba(0, 246, 255, 0.6)', letterSpacing: '1px', textTransform: 'uppercase' }}>
            - ORBITAL CORE SELECTOR -
          </span>
          <div style={{
            position: 'relative',
            width: '260px',
            height: '260px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px dashed rgba(0, 246, 255, 0.15)',
            borderRadius: '50%'
          }}>
            {/* Concentric Rotating Rings */}
            <svg style={{ position: 'absolute', width: '230px', height: '230px' }}>
              <circle cx="115" cy="115" r="105" stroke="#00f6ff" strokeWidth="1" fill="none" strokeDasharray="10, 20" className="orbit-rotate-cw" style={{ opacity: 0.3 }} />
              <circle cx="115" cy="115" r="85" stroke="#00f6ff" strokeWidth="1" fill="none" strokeDasharray="40, 15" className="orbit-rotate-ccw" style={{ opacity: 0.45 }} />
              <line x1="115" y1="0" x2="115" y2="230" stroke="rgba(0, 246, 255, 0.06)" strokeWidth="1" />
              <line x1="0" y1="115" x2="230" y2="115" stroke="rgba(0, 246, 255, 0.06)" strokeWidth="1" />
              <circle cx="115" cy="115" r="40" stroke="#00f6ff" strokeWidth="1.5" fill="rgba(0, 246, 255, 0.03)" style={{ filter: 'drop-shadow(0 0 8px rgba(0,246,255,0.3))' }} />
            </svg>

            {/* Central Dial Text */}
            <div style={{ position: 'absolute', textAlign: 'center', zIndex: 5 }}>
              <span style={{ fontSize: '0.7rem', color: '#00f6ff', fontWeight: 800, letterSpacing: '1.5px', display: 'block' }}>A.R.C.</span>
              <span style={{ fontSize: '0.5rem', color: '#fff', opacity: 0.5, letterSpacing: '1px' }}>
                {activeTab.toUpperCase()}
              </span>
            </div>

            {/* Dispersed Circular Menu Triggers */}
            {menuItems.map((item, idx) => {
              const angle = (idx * 360) / menuItems.length - 90;
              const radius = 95;
              const x = 115 + radius * Math.cos((angle * Math.PI) / 180) - 18;
              const y = 115 + radius * Math.sin((angle * Math.PI) / 180) - 18;
              const isActive = activeTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    playHapticSound('click');
                    setActiveTab(item.id);
                    if (item.id !== 'notes') setSelectedFile(null);
                  }}
                  onMouseEnter={() => playHapticSound('hover')}
                  style={{
                    position: 'absolute',
                    left: `${x}px`,
                    top: `${y}px`,
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: isActive ? 'rgba(0, 246, 255, 0.25)' : 'rgba(2, 3, 6, 0.95)',
                    border: isActive ? '1.5px solid #00f6ff' : '1px solid rgba(0, 246, 255, 0.3)',
                    color: isActive ? '#00f6ff' : '#9ca3af',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: isActive ? '0 0 12px rgba(0, 246, 255, 0.4)' : 'none',
                    outline: 'none',
                    zIndex: 10
                  }}
                  title={item.label}
                >
                  <Icon size={14} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Module Indicator */}
        <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.6rem', color: '#ff6a00', fontWeight: 700, letterSpacing: '1px' }}>SYS_SELECTED_MODULE</span>
          <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 800, fontFamily: 'var(--font-hud)', letterSpacing: '1.5px' }}>
            {menuItems.find(m => m.id === activeTab)?.label.toUpperCase()}
          </span>
          <div style={{ display: 'flex', gap: '8px', marginTop: '6px', fontSize: '0.65rem', color: 'rgba(255,255,255,0.45)' }}>
            <span>SEC_LOC: [78cb06:0acf]</span>
            <span>|</span>
            <span>MEM: READY</span>
          </div>
        </div>

        {/* Diagnostic Telemetry Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.7rem', color: 'rgba(0, 246, 255, 0.7)' }}>
          <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '1.5px' }}>TELEMETRY_LOGS</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0, 246, 255, 0.08)', paddingBottom: '4px' }}>
            <span>THREAD_INTENT:</span>
            <span style={{ color: '#fff' }}>ROUTED_ACTIVE</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0, 246, 255, 0.08)', paddingBottom: '4px' }}>
            <span>RAG_SYNTAX_CACHE:</span>
            <span style={{ color: '#fff' }}>768-D NOMADIC</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0, 246, 255, 0.08)', paddingBottom: '4px' }}>
            <span>HARDWARE_TEMP:</span>
            <span style={{ color: 'var(--color-green)' }}>38.4°C</span>
          </div>
        </div>

        {/* A.R.C. Core Diagnostics & Backup Control */}
        <div className="glass-panel" style={{
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginTop: 'auto'
        }}>
          {/* Pulsing Arc Reactor Core */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #00f6ff 20%, #ff6a00 70%, transparent 100%)',
              boxShadow: '0 0 8px #00f6ff, 0 0 16px rgba(0,246,255,0.4)',
              animation: 'pulse 1.5s infinite ease-in-out',
              flexShrink: 0
            }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#fff', letterSpacing: '1px' }}>
                A.R.C. REACTIVE CORE
              </span>
              <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)' }}>
                SYSTEM ONLINE & RAG STABLE
              </span>
            </div>
          </div>

          {/* Backup Action Gate */}
          <button
            onClick={handleTriggerBackupWithSound}
            disabled={backupStatus === 'backing-up'}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px dashed rgba(0, 246, 255, 0.3)',
              backgroundColor: backupStatus === 'backing-up' ? 'rgba(255,255,255,0.02)' : 'rgba(0, 246, 255, 0.05)',
              color: backupStatus === 'success' ? 'var(--color-green)' : '#00f6ff',
              fontFamily: 'var(--font-telemetry)',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              cursor: backupStatus === 'backing-up' ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              outline: 'none',
              boxShadow: backupStatus === 'backing-up' ? 'none' : '0 0 8px rgba(0, 246, 255, 0.1)'
            }}
            onMouseOver={(e) => {
              if (backupStatus === 'idle') {
                e.currentTarget.style.backgroundColor = 'rgba(0, 246, 255, 0.12)';
                e.currentTarget.style.borderColor = 'rgba(0, 246, 255, 0.6)';
              }
            }}
            onMouseOut={(e) => {
              if (backupStatus === 'idle') {
                e.currentTarget.style.backgroundColor = 'rgba(0, 246, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(0, 246, 255, 0.3)';
              }
            }}
          >
            {backupStatus === 'idle' && <span>⚡ INITIALIZE BACKUP</span>}
            {backupStatus === 'backing-up' && <span>⚙ RUNNING BACKUP...</span>}
            {backupStatus === 'success' && <span>✓ SYSTEM RE-ROUTED</span>}
            {backupStatus === 'error' && <span style={{ color: 'var(--color-orange)' }}>⚠ GATE FAULT</span>}
          </button>
        </div>
      </div>

      {/* 2. Right Workspace: Floating 3D Hologram Perspective Screen */}
      <div style={{
        flexGrow: 1,
        height: 'calc(100vh - 48px)',
        margin: '24px 24px 24px 0',
        padding: '2px',
        position: 'relative',
        zIndex: 40
      }}>
        <div className="hologram-viewport-screen" style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Corner HUD Brackets */}
          <div className="hud-corner-bracket bracket-tl" />
          <div className="hud-corner-bracket bracket-tr" />
          <div className="hud-corner-bracket bracket-bl" />
          <div className="hud-corner-bracket bracket-br" />

          {/* Viewport Header Telemetry Strip */}
          <div style={{
            height: '32px',
            borderBottom: '1px solid rgba(0, 246, 255, 0.15)',
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'between',
            fontSize: '0.65rem',
            color: 'rgba(0, 246, 255, 0.6)',
            letterSpacing: '1px',
            backgroundColor: 'rgba(2, 3, 6, 0.4)',
            userSelect: 'none'
          }}>
            <div style={{ flexGrow: 1 }}>
              DISPLAY_FEED_ID: <span style={{ color: '#fff' }}>[78cb06:0acf]</span> | SYSTEM_MODE: <span style={{ color: '#fff' }}>{activeTab.toUpperCase()}</span>
            </div>
            <div>
              SCANLINE_HERTZ: 120Hz | <span style={{ color: 'var(--color-green)' }}>[SECURE]</span>
            </div>
          </div>

          {/* Inner Content Component (Scrollable inside the HUD container) */}
          <div style={{
            flexGrow: 1,
            overflowY: 'auto',
            position: 'relative'
          }} className="custom-scrollbar">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* 3. Global Spotlight Command Bar Modal */}
      {showCommandBar && (
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(2, 3, 6, 0.82)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }} onClick={() => setShowCommandBar(false)}>
          <div className="glass-panel" style={{
            width: '500px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxShadow: '0 0 35px rgba(0, 246, 255, 0.3)',
            border: '1.5px solid #00f6ff',
            backgroundColor: 'rgba(6, 12, 22, 0.95)',
            transform: 'perspective(1000px) rotateX(2deg)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.65rem', color: '#ff6a00', letterSpacing: '1.5px', fontWeight: 800 }}>
                A.R.C. COGNITIVE INJECTOR [SHORTCUT: CTRL+K]
              </span>
              <span style={{ fontSize: '0.55rem', color: '#9ca3af', fontFamily: 'var(--font-code)' }}>
                [ESC to abort]
              </span>
            </div>
            <input
              autoFocus
              type="text"
              placeholder="Query notes, toggle parameters, or nav tabs..."
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCommandSubmit(commandInput);
                }
              }}
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: '1rem',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                border: '1px solid #00f6ff',
                color: '#fff',
                fontFamily: 'var(--font-telemetry)',
                outline: 'none',
                boxShadow: 'inset 0 0 10px rgba(0, 246, 255, 0.1)'
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.45)', borderTop: '1px dashed rgba(0, 246, 255, 0.15)', paddingTop: '10px' }}>
              <div style={{ color: '#00f6ff', fontWeight: 700, marginBottom: '2px' }}>ROUTING COMMANDS:</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                <span>/overview or /dashboard - Jump to Overview</span>
                <span>/notes or /vault - Jump to Notes Vault</span>
                <span>/chat or /cognitive - Jump to Chat Core</span>
                <span>/coprocessor - Jump to Coprocessor</span>
                <span>/flashcards - Jump to Flashcards</span>
                <span>/backup - Initialize system backup</span>
                <span>/voice or /mute - Toggle speech output</span>
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.3)', marginTop: '6px', fontSize: '0.6rem' }}>
                *Type any other text to search note titles globally in the vault explorer.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
