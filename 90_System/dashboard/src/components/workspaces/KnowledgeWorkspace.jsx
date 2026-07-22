import React, { useState } from 'react';
import { 
  Sparkles, 
  LayoutDashboard, 
  FileText, 
  MessageSquare, 
  Cpu, 
  Layers 
} from 'lucide-react';
import DashboardOverview from '../DashboardOverview';
import NotesExplorer from '../NotesExplorer';
import CoprocessorConsole from '../CoprocessorConsole';
import FlashcardsView from '../FlashcardsView';
import AIChatConsole from '../AIChatConsole';
import DailyBrief from '../DailyBrief';

export default function KnowledgeWorkspace({ onTriggerBackup }) {
  const [activeTab, setActiveTab] = useState('brief');
  const [selectedFile, setSelectedFile] = useState(null);
  const [coprocessorPreFill, setCoprocessorPreFill] = useState('');
  const [globalSpeakOutput, setGlobalSpeakOutput] = useState(true);
  const [globalSearchFilter, setGlobalSearchFilter] = useState('');

  const handleSelectNote = (filePath) => {
    setSelectedFile(filePath);
    setActiveTab('notes');
  };

  const tabs = [
    { id: 'brief', label: 'Daily Brief', icon: Sparkles },
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'notes', label: 'Neural Vault', icon: FileText },
    { id: 'chat', label: 'Cognitive Chat', icon: MessageSquare },
    { id: 'coprocessor', label: 'Coprocessor', icon: Cpu }
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden' }}>
      {/* Knowledge Workspace Sub-Header Navigation */}
      <div style={{
        height: '44px',
        background: 'rgba(15, 23, 42, 0.95)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: '8px',
        userSelect: 'none',
        flexShrink: 0
      }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginRight: '8px', letterSpacing: '0.05em' }}>
          Knowledge Suite:
        </div>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '6px',
                border: 'none',
                background: isActive ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                color: isActive ? '#38bdf8' : '#94a3b8',
                fontSize: '12px',
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Workspace View Container */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {renderContent()}
      </div>
    </div>
  );
}
