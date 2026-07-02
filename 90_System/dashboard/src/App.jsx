import { useState } from 'react';
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

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedFile, setSelectedFile] = useState(null);

  const [coprocessorPreFill, setCoprocessorPreFill] = useState('');

  // Router to select note and jump to explorer tab
  const handleSelectNote = (filePath) => {
    setSelectedFile(filePath);
    setActiveTab('notes');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'notes', label: 'Notes Vault', icon: FileText },
    { id: 'chat', label: 'AI Chat Console', icon: MessageSquare },
    { id: 'coprocessor', label: 'AI Coprocessor', icon: Cpu },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
  ];

  const renderContent = () => {
    switch (activeTab) {
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
          />
        );
      case 'chat':
        return (
          <AIChatConsole onSelectNote={handleSelectNote} />
        );
      case 'coprocessor':
        return (
          <CoprocessorConsole 
            onSelectNote={handleSelectNote} 
            preFillContent={coprocessorPreFill}
            clearPreFill={() => setCoprocessorPreFill('')}
          />
        );
      case 'flashcards':
        return <FlashcardsView />;
      default:
        return (
          <DashboardOverview 
            onSelectNote={handleSelectNote} 
            onNavigate={(tab, content) => {
              if (content) setCoprocessorPreFill(content);
              setActiveTab(tab);
            }} 
          />
        );
    }
  };

  return (
    <div style={{
      display: 'flex',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-sans)'
    }}>
      {/* 1. Left Sidebar Navigation Panel */}
      <div className="glass-panel" style={{
        width: 'var(--sidebar-width)',
        height: '100%',
        borderRadius: 0,
        borderTop: 'none',
        borderBottom: 'none',
        borderLeft: 'none',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0c0d12',
        zIndex: 100
      }}>
        {/* App Title */}
        <div style={{
          padding: '24px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--accent-primary) 0%, #06b6d4 100%)',
            color: '#fff'
          }}>
            <Network size={20} />
          </div>
          <div>
            <h1 style={{
              fontSize: '1.15rem',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              color: '#fff',
              margin: 0,
              letterSpacing: '0.5px'
            }}>
              Neural Brain
            </h1>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px' }}>
              UNIVERSITY OS v2.0
            </span>
          </div>
        </div>

        {/* Menu Navigation */}
        <nav style={{
          flexGrow: 1,
          padding: '24px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id !== 'notes') setSelectedFile(null); // Clear selections
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: isActive ? 'var(--accent-primary)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onMouseOver={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                    e.currentTarget.style.color = '#fff';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <Sparkles size={12} style={{ color: 'var(--accent-warning)' }} />
            <span>AI Assist Active</span>
          </div>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Powered by Gemini & Ollama</span>
        </div>
      </div>

      {/* 2. Main Content Display Area */}
      <main style={{
        flexGrow: 1,
        height: '100%',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {renderContent()}
      </main>

    </div>
  );
}

export default App;
