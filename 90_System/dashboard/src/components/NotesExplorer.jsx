import React, { useState, useEffect, useMemo } from 'react';
import { Search, Save, Edit2, Eye, FileText, ChevronRight, Folder, BookOpen, Clock, Cpu } from 'lucide-react';

export default function NotesExplorer({ 
  initialSelectedFile, 
  clearInitialSelected,
  globalSearchFilter,
  clearGlobalSearchFilter
}) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');

  // Trigger search filter when injected from Global Command Bar
  useEffect(() => {
    if (globalSearchFilter) {
      setSearchQuery(globalSearchFilter);
      setActiveMocHub(null); // Close active MOC hub to reveal search matches
      if (clearGlobalSearchFilter) clearGlobalSearchFilter();
    }
  }, [globalSearchFilter]);
  
  // Active note state
  const [activeNote, setActiveNote] = useState(null);
  const [noteContent, setNoteContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // MOC Hub state variables
  const [activeMocHub, setActiveMocHub] = useState('OS');
  const [flashcards, setFlashcards] = useState([]);
  const [mocTab, setMocTab] = useState('concepts');
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // PDF Slide Ingestion HUD states
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadSubject, setUploadSubject] = useState('OS');

  // Drag and drop event handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type !== 'application/pdf') {
        setUploadStatus('error');
        setUploadMessage('Format must be PDF.');
        setTimeout(() => setUploadStatus('idle'), 4000);
        return;
      }
      await uploadFile(file);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file) => {
    setUploadStatus('uploading');
    setUploadMessage('Parsing slides...');
    
    const targetSub = selectedSubject !== 'ALL' ? selectedSubject : uploadSubject;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subject', targetSub);

    try {
      const res = await fetch('/api/notes/upload-slides', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setUploadStatus('success');
        setUploadMessage(`Generated ${data.notes.length} concept notes!`);
        fetchNotesList(); // Reload note list to show new files
        setTimeout(() => setUploadStatus('idle'), 5000);
      } else {
        setUploadStatus('error');
        setUploadMessage(data.error || 'Ingestion failed.');
        setTimeout(() => setUploadStatus('idle'), 5000);
      }
    } catch (err) {
      setUploadStatus('error');
      setUploadMessage(err.message || 'Network error.');
      setTimeout(() => setUploadStatus('idle'), 5000);
    }
  };

  // Fetch all notes list
  const fetchNotesList = async () => {
    try {
      const res = await fetch('/api/notes');
      const data = await res.json();
      setNotes(data);
      
      const cardsRes = await fetch('/api/flashcards');
      const cardsData = await cardsRes.json();
      setFlashcards(cardsData);

      // If we had a file to open initially
      if (initialSelectedFile) {
        const found = data.find(n => n.absolutePath === initialSelectedFile || n.relativePath === initialSelectedFile);
        if (found) {
          loadNoteContent(found);
          setActiveMocHub(null);
        }
      } else {
        // Find default starting subject MOC
        const hasOS = data.some(n => n.subject === 'OS');
        if (hasOS) setActiveMocHub('OS');
        else if (data.length > 0) setActiveMocHub(data[0].subject);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotesList();
  }, []);

  // Listen to initial selected file changes from parent
  useEffect(() => {
    if (initialSelectedFile && notes.length > 0) {
      const found = notes.find(n => n.absolutePath === initialSelectedFile || n.relativePath === initialSelectedFile);
      if (found) {
        loadNoteContent(found);
        setActiveMocHub(null);
        if (clearInitialSelected) clearInitialSelected();
      }
    }
  }, [initialSelectedFile, notes]);

  const loadNoteContent = async (note) => {
    setActiveNote(note);
    setActiveMocHub(null); // Clear MOC hub to display note editor
    setIsEditing(false);

    // Save to recently visited in localStorage
    try {
      let visited = JSON.parse(localStorage.getItem('recentlyVisited') || '[]');
      visited = visited.filter(path => path !== note.absolutePath);
      visited.unshift(note.absolutePath);
      visited = visited.slice(0, 5);
      localStorage.setItem('recentlyVisited', JSON.stringify(visited));
    } catch(e) {}

    try {
      const res = await fetch(`/api/notes/content?filePath=${encodeURIComponent(note.absolutePath)}`);
      const data = await res.json();
      setNoteContent(data.content || '');
    } catch (e) {
      console.error(e);
      setNoteContent('Failed to load note content.');
    }
  };

  const handleSave = async () => {
    if (!activeNote) return;
    setSaving(true);
    try {
      const res = await fetch('/api/notes/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filePath: activeNote.absolutePath,
          content: noteContent
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsEditing(false);
        fetchNotesList();
      }
    } catch (e) {
      console.error(e);
      alert('Error saving note.');
    } finally {
      setSaving(false);
    }
  };

  // Click on a wiki link [[Note Name]] in the renderer
  const handleWikiLinkClick = (noteName) => {
    const cleanName = noteName.replace(/\[\[|\]\]/g, '').trim().toLowerCase();
    
    // Find note by title or filename
    const found = notes.find(n => {
      const titleLower = n.title.toLowerCase();
      const fileLower = n.filename.toLowerCase().replace('.md', '');
      return titleLower === cleanName || fileLower === cleanName;
    });

    if (found) {
      loadNoteContent(found);
      setActiveMocHub(null);
    } else {
      alert(`Note "${noteName}" not found in vault.`);
    }
  };

  // Get subjects present in vault
  const subjects = useMemo(() => {
    const subs = new Set(notes.map(n => n.subject));
    return ['ALL', ...Array.from(subs).sort()];
  }, [notes]);

  // Filter notes based on sidebar inputs
  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      const matchesSubject = selectedSubject === 'ALL' || n.subject === selectedSubject;
      const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            n.filename.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSubject && matchesSearch;
    });
  }, [notes, searchQuery, selectedSubject]);

  // Group notes by subject folder and sort them serially
  const notesBySubject = useMemo(() => {
    const groups = {};
    filteredNotes.forEach(note => {
      const sub = note.subject || 'GENERAL';
      if (!groups[sub]) groups[sub] = [];
      groups[sub].push(note);
    });

    // Natural sort notes inside each group (serially)
    Object.keys(groups).forEach(sub => {
      groups[sub].sort((a, b) => {
        return a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' });
      });
    });

    return groups;
  }, [filteredNotes]);

  const activeSubjects = useMemo(() => {
    return Object.keys(notesBySubject).sort();
  }, [notesBySubject]);

  const getSubjectCleanName = (subj) => {
    switch (subj) {
      case 'OS': return 'Operating Systems';
      case 'DSA': return 'Data Structures';
      case 'DBMS': return 'Database Systems';
      case 'DISCRETE_MATHEMATICS': return 'Discrete Mathematics';
      case 'COMPUTER_SYSTEM_ARCHITECTURE': return 'Computer Architecture';
      case 'CYBER_CN': return 'Cyber & CN';
      case 'ML': return 'Machine Learning';
      case 'OPPS': return 'OOPs (C++)';
      case 'STATISTICS': return 'Statistics';
      case 'MOC': return 'Maps of Content Index';
      case 'GENERAL': return 'General & Inbox';
      default: return subj;
    }
  };

  // Obsidian wiki-link parser + HTML Renderer
  const renderMarkdown = (text) => {
    if (!text) return '';
    
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Headers
      .replace(/^#\s+(.+)$/gm, '<h1 id="$1">$1</h1>')
      .replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
      .replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
      // Code blocks (multiline)
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // LaTeX block math
      .replace(/\$\$([\s\S]*?)\$\$/g, '<div style="background: rgba(139, 92, 246, 0.05); padding: 12px; border-radius: 8px; border-left: 2px solid var(--accent-primary); font-family: var(--font-mono); margin: 12px 0; overflow-x: auto; color: #a78bfa;">$$$1$$</div>')
      // LaTeX inline math
      .replace(/\$([^\$]+)\$/g, '<span style="color: #a78bfa; font-family: var(--font-mono); font-size: 0.9em;">$$1$</span>')
      // Bold
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // Blockquotes
      .replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>')
      // Flashcards highlighting
      .replace(/([^\n]+::[^\n]+)/g, '<span style="background: rgba(16, 185, 129, 0.1); border-left: 3px solid var(--accent-success); padding: 2px 8px; display: block; margin: 4px 0; font-size: 0.9em;">⚡ $1</span>')
      .replace(/([^\n]+\?\?)/g, '<span style="background: rgba(6, 182, 212, 0.1); border-left: 3px solid var(--accent-info); padding: 2px 8px; display: block; margin: 4px 0; font-size: 0.9em;">❓ $1</span>')
      // Lists
      .replace(/^\s*-\s+(.+)$/gm, '<li>$1</li>')
      .replace(/^\s*\d+\.\s+(.+)$/gm, '<li>$1</li>');

    // Parse Wiki Links: [[Link Name]]
    const wikiLinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
    html = html.replace(wikiLinkRegex, (match, target, alias) => {
      const displayName = alias || target;
      return `<a href="#" class="wiki-link" data-target="${target}">${displayName}</a>`;
    });

    return html;
  };

  // Add click handlers for wiki links in the rendered content
  useEffect(() => {
    const handleLinkClick = (e) => {
      const target = e.target;
      if (target && target.classList.contains('wiki-link')) {
        e.preventDefault();
        const noteName = target.getAttribute('data-target');
        handleWikiLinkClick(noteName);
      }
    };

    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, [notes]);

  const activeSubjectColor = activeNote ? getSubjectColor(activeNote.subject) : 'var(--accent-primary)';

  function getSubjectColor(subj) {
    if (!subj) return '#a78bfa';
    const cleanId = subj.toUpperCase();
    if (cleanId.includes('OS') || cleanId.includes('OPERATING')) return '#3b82f6';
    if (cleanId.includes('DSA') || cleanId.includes('DATA_STRUCTURES')) return '#10b981';
    if (cleanId.includes('DBMS') || cleanId.includes('DATABASE')) return '#f59e0b';
    if (cleanId.includes('DISCRETE')) return '#ec4899';
    if (cleanId.includes('COMPUTER') || cleanId.includes('SYSTEM_ARCHITECTURE') || cleanId.includes('ARCHITECTURE')) return '#8b5cf6';
    if (cleanId.includes('CYBER') || cleanId.includes('NETWORKS') || cleanId.includes('CYBER_CN')) return '#06b6d4';
    if (cleanId.includes('ML') || cleanId.includes('MACHINE')) return '#f43f5e';
    if (cleanId.includes('OPPS') || cleanId.includes('OOP')) return '#14b8a6';
    if (cleanId.includes('STATISTICS')) return '#84cc16';
    if (cleanId.includes('MOC')) return '#a78bfa';
    return '#6b7280';
  }

  // Filter notes/cards inside MOC Hub
  const subjectNotes = useMemo(() => {
    if (!activeMocHub) return [];
    return notes.filter(n => n.subject === activeMocHub).sort((a, b) => {
      return a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [notes, activeMocHub]);

  const subjectFlashcards = useMemo(() => {
    if (!activeMocHub) return [];
    return flashcards.filter(c => c.subject === activeMocHub);
  }, [flashcards, activeMocHub]);

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden', backgroundColor: '#020306' }}>
      
      {/* 1. Left Sidebar: Notes Directory List */}
      <div style={{
        width: '320px',
        borderRight: '1px solid rgba(0, 246, 255, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'rgba(6, 12, 22, 0.85)'
      }}>
        {/* Search */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '12px', color: 'rgba(0, 246, 255, 0.5)' }} />
            <input
              type="text"
              placeholder="QUERY CORE DATA SECTOR..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: 'rgba(2, 3, 6, 0.75)',
                border: '1.2px solid rgba(0, 246, 255, 0.25)',
                borderRadius: '4px',
                padding: '10px 12px 10px 38px',
                color: '#fff',
                fontSize: '0.78rem',
                fontFamily: 'var(--font-tech)',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#00f6ff'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(0, 246, 255, 0.25)'}
            />
          </div>
          
          {/* Subject Filter */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }} className="custom-scrollbar">
            {subjects.map(sub => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '0.68rem',
                  fontFamily: 'var(--font-hud)',
                  fontWeight: 'bold',
                  letterSpacing: '0.5px',
                  cursor: 'pointer',
                  border: '1.2px solid',
                  whiteSpace: 'nowrap',
                  backgroundColor: selectedSubject === sub ? 'rgba(0, 246, 255, 0.08)' : 'rgba(2, 3, 6, 0.35)',
                  borderColor: selectedSubject === sub ? '#00f6ff' : 'rgba(0, 246, 255, 0.15)',
                  color: selectedSubject === sub ? '#00f6ff' : 'rgba(255, 255, 255, 0.5)',
                  boxShadow: selectedSubject === sub ? '0 0 8px rgba(0, 246, 255, 0.15)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* PDF Slide Ingestion HUD */}
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            style={{
              padding: '12px',
              border: dragActive ? '1.5px solid #ff6a00' : '1.2px dashed rgba(255, 106, 0, 0.25)',
              backgroundColor: dragActive ? 'rgba(255, 106, 0, 0.08)' : 'rgba(2, 3, 6, 0.35)',
              borderRadius: '4px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              boxShadow: dragActive ? '0 0 12px rgba(255, 106, 0, 0.15)' : 'none',
              transition: 'all 0.2s ease',
              marginTop: '4px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.62rem', color: '#ff6a00', fontWeight: 800, letterSpacing: '0.8px', fontFamily: 'var(--font-hud)' }}>
                A.R.C. INGESTION HUB
              </span>
              <span style={{ fontSize: '0.52rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-tech)' }}>
                [PDF FEED]
              </span>
            </div>

            {uploadStatus === 'idle' && (
              <>
                <label style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: '4px', 
                  cursor: 'pointer',
                  padding: '8px 0'
                }}>
                  <BookOpen size={14} style={{ color: '#ff6a00', opacity: 0.8 }} />
                  <span style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.65)', textAlign: 'center', fontFamily: 'var(--font-tech)' }}>
                    DRAG & DROP note PDF
                  </span>
                  <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-tech)' }}>
                    or click to browse
                  </span>
                  <input 
                    type="file" 
                    accept=".pdf" 
                    onChange={handleFileChange} 
                    style={{ display: 'none' }} 
                  />
                </label>

                {selectedSubject === 'ALL' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '6px', fontFamily: 'var(--font-tech)' }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>Target:</span>
                    <select
                      value={uploadSubject}
                      onChange={(e) => setUploadSubject(e.target.value)}
                      style={{
                        backgroundColor: 'rgba(2, 3, 6, 0.8)',
                        border: '1px solid rgba(255, 106, 0, 0.25)',
                        borderRadius: '2px',
                        color: '#ff6a00',
                        padding: '2px 4px',
                        fontSize: '0.65rem',
                        outline: 'none',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-tech)'
                      }}
                    >
                      {subjects.filter(s => s !== 'ALL').map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.6rem', color: '#10b981', borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '6px', textAlign: 'center', fontFamily: 'var(--font-tech)' }}>
                    TARGET SUBJECT: <strong style={{ color: '#fff' }}>{selectedSubject}</strong>
                  </div>
                )}
              </>
            )}

            {uploadStatus === 'uploading' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '10px 0', fontFamily: 'var(--font-tech)' }}>
                <RefreshCw size={12} className="spin-anim" style={{ color: '#ff6a00' }} />
                <span style={{ fontSize: '0.68rem', color: '#ff6a00', fontWeight: 800 }}>{uploadMessage.toUpperCase()}</span>
                <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.4)' }}>PARSING SLIDE DECK IN SECONDS...</span>
              </div>
            )}

            {uploadStatus === 'success' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '10px 0', textAlign: 'center', fontFamily: 'var(--font-tech)' }}>
                <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 800 }}>✓ INGESTION COMPLETE</span>
                <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.8)' }}>{uploadMessage}</span>
              </div>
            )}

            {uploadStatus === 'error' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '10px 0', textAlign: 'center', fontFamily: 'var(--font-tech)' }}>
                <span style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 800 }}>⚠ CORE EXCEPTION</span>
                <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.8)' }}>{uploadMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Notes/Folders List */}
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '0 8px 16px 8px' }} className="custom-scrollbar">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-tech)' }}>
              <span>LOADING VAULT STRUCTURE...</span>
            </div>
          ) : searchQuery.trim() ? (
            /* Search results view */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-hud)', textTransform: 'uppercase', padding: '4px 8px', letterSpacing: '0.5px' }}>
                SEARCH COMPILATIONS ({filteredNotes.length})
              </div>
              {filteredNotes.map(note => {
                const isSelected = activeNote && activeNote.absolutePath === note.absolutePath;
                return (
                  <button
                    key={note.absolutePath}
                    onClick={() => loadNoteContent(note)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      textAlign: 'left',
                      padding: '10px 12px',
                      borderRadius: '4px',
                      border: 'none',
                      backgroundColor: isSelected ? 'rgba(0, 246, 255, 0.1)' : 'transparent',
                      cursor: 'pointer',
                      width: '100%',
                      gap: '8px',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                    }}
                    onMouseOut={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ flexGrow: 1, minWidth: 0, fontFamily: 'var(--font-tech)' }}>
                      <p style={{
                        color: isSelected ? '#00f6ff' : '#e5e7eb',
                        fontSize: '0.78rem',
                        fontWeight: isSelected ? 'bold' : 500,
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        margin: 0
                      }}>
                        [{note.subject}] {note.title}
                      </p>
                      <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)' }}>
                        SECTOR INDEX PATH
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Folder MOC index selector view */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-hud)', textTransform: 'uppercase', padding: '4px 8px', letterSpacing: '0.8px' }}>
                SUBJECT SECTORS
              </div>
              {activeSubjects.map((subj) => {
                const isSelectedHub = activeMocHub === subj;
                const subjNotes = notesBySubject[subj] || [];
                const subjColor = getSubjectColor(subj);
                return (
                  <button
                    key={subj}
                    onClick={() => {
                      setActiveMocHub(subj);
                      setActiveNote(null);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '12px 14px',
                      backgroundColor: isSelectedHub ? 'rgba(2, 3, 6, 0.85)' : 'rgba(2, 3, 6, 0.4)',
                      border: '1.2px solid',
                      borderColor: isSelectedHub ? '#00f6ff' : 'rgba(0, 246, 255, 0.12)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      color: isSelectedHub ? '#00f6ff' : 'rgba(255, 255, 255, 0.7)',
                      outline: 'none',
                      transition: 'all 0.2s',
                      textAlign: 'left'
                    }}
                    onMouseOver={(e) => {
                      if (!isSelectedHub) {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                        e.currentTarget.style.borderColor = 'rgba(0, 246, 255, 0.25)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isSelectedHub) {
                        e.currentTarget.style.backgroundColor = 'rgba(2, 3, 6, 0.4)';
                        e.currentTarget.style.borderColor = 'rgba(0, 246, 255, 0.12)';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flexGrow: 1 }}>
                      <Folder size={14} style={{ color: isSelectedHub ? '#00f6ff' : subjColor, flexShrink: 0 }} />
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        fontFamily: 'var(--font-hud)',
                        letterSpacing: '0.5px',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        color: isSelectedHub ? '#00f6ff' : '#e5e7eb',
                        flexGrow: 1
                      }}>
                        [{subj.toUpperCase()}]
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-tech)', color: isSelectedHub ? '#00f6ff' : 'rgba(255,255,255,0.45)', fontWeight: 'bold' }}>
                      {subjNotes.length}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 2. Right Pane: Note Viewer, Editor, or MOC Hub Page */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#020306' }}>
        {activeNote ? (
          <>
            {/* Note Toolbar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 24px',
              borderBottom: '1px solid rgba(0, 246, 255, 0.15)',
              backgroundColor: 'rgba(6,12,22,0.85)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Folder size={12} style={{ color: '#ff6a00' }} />
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#ff6a00', fontFamily: 'var(--font-hud)', letterSpacing: '0.8px' }}>
                    SECTOR: {activeNote.subject.toUpperCase()}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.85rem' }}>/</span>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.68rem', fontFamily: 'var(--font-tech)' }}>
                    {activeNote.filename}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-hud)', color: '#fff', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>
                  {activeNote.title}
                </h2>
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1.2px solid rgba(255,255,255,0.15)',
                    color: 'rgba(255,255,255,0.7)',
                    borderRadius: '4px',
                    padding: '8px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-hud)',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {isEditing ? (
                    <>
                      <Eye size={12} />
                      <span>PREVIEW MODE</span>
                    </>
                  ) : (
                    <>
                      <Edit2 size={12} />
                      <span>EDIT SOURCE</span>
                    </>
                  )}
                </button>
                {isEditing && (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                      backgroundColor: '#10b981',
                      border: 'none',
                      color: '#020306',
                      borderRadius: '4px',
                      padding: '8px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-hud)',
                      fontWeight: 'bold',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      boxShadow: '0 0 10px rgba(16, 185, 129, 0.25)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Save size={12} />
                    <span>{saving ? 'COMMITTING...' : 'COMMIT SAVES'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Note Content Area */}
            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '24px 32px', backgroundColor: 'rgba(2,3,6,0.2)' }} className="custom-scrollbar">
              {isEditing ? (
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(2, 3, 6, 0.65)',
                    border: '1.2px solid rgba(0, 246, 255, 0.25)',
                    borderRadius: '4px',
                    padding: '16px',
                    color: '#e5e7eb',
                    fontFamily: 'var(--font-tech)',
                    fontSize: '0.85rem',
                    lineHeight: '1.5',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              ) : (
                <div 
                  className="markdown-body animate-fade-in"
                  style={{ maxWidth: '800px', margin: '0 auto', color: 'rgba(255,255,255,0.9)' }}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(noteContent) }}
                />
              )}
            </div>
          </>
        ) : activeMocHub ? (
          /* MOC Subject Hub Page */
          <div style={{ padding: '32px', overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }} className="custom-scrollbar">
            
            {/* Hub Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '2px',
                  fontFamily: 'var(--font-hud)',
                  border: `1px solid ${getSubjectColor(activeMocHub)}`,
                  backgroundColor: getSubjectColor(activeMocHub) + '15',
                  color: getSubjectColor(activeMocHub),
                  letterSpacing: '0.5px'
                }}>
                  SECTOR CENTRAL STATION
                </span>
                <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-hud)', color: '#fff', fontWeight: 900, marginTop: '12px', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  {getSubjectCleanName(activeMocHub)} Core MOC
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-tech)', fontSize: '0.78rem', marginTop: '6px' }}>
                  {subjectNotes.length} COMPILATION FIELDS MAPPED | {subjectFlashcards.length} SM-2 RECALL INDEX CHUNKS ACTIVE
                </p>
              </div>
            </div>

            {/* Hub Tab Bar */}
            <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(0,246,255,0.15)', paddingBottom: '12px' }}>
              <button
                onClick={() => setMocTab('concepts')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: mocTab === 'concepts' ? 'rgba(0, 246, 255, 0.08)' : 'transparent',
                  color: mocTab === 'concepts' ? '#00f6ff' : 'rgba(255, 255, 255, 0.5)',
                  border: mocTab === 'concepts' ? '1px solid #00f6ff' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-hud)',
                  fontWeight: 'bold',
                  letterSpacing: '0.5px',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                📄 MAPPED ATOMICS ({subjectNotes.length})
              </button>
              <button
                onClick={() => {
                  setMocTab('flashcards');
                  setCardIndex(0);
                  setIsFlipped(false);
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: mocTab === 'flashcards' ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                  color: mocTab === 'flashcards' ? '#10b981' : 'rgba(255, 255, 255, 0.5)',
                  border: mocTab === 'flashcards' ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-hud)',
                  fontWeight: 'bold',
                  letterSpacing: '0.5px',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                ⚡ SPACED MEMORY CARD ARRAY ({subjectFlashcards.length})
              </button>
            </div>

            {/* Hub Content */}
            {mocTab === 'concepts' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                {subjectNotes.map(note => (
                  <div
                    key={note.absolutePath}
                    onClick={() => loadNoteContent(note)}
                    style={{
                      backgroundColor: 'rgba(2, 3, 6, 0.45)',
                      border: '1.2px solid rgba(0, 246, 255, 0.15)',
                      borderRadius: '4px',
                      padding: '16px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '140px',
                      transition: 'all 0.25s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = '#00f6ff';
                      e.currentTarget.style.backgroundColor = 'rgba(0, 246, 255, 0.03)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(0, 246, 255, 0.15)';
                      e.currentTarget.style.backgroundColor = 'rgba(2, 3, 6, 0.45)';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff', margin: '0 0 8px 0', fontFamily: 'var(--font-hud)', letterSpacing: '0.5px' }}>
                        {note.title.toUpperCase()}
                      </h4>
                      <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-tech)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.45', margin: 0 }}>
                        Mapped atomic concept. Open file to view full notes, mathematical equations, and active recall cards.
                      </p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.62rem', fontFamily: 'var(--font-tech)', color: 'rgba(255,255,255,0.35)', marginTop: '12px', borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '8px' }}>
                      <span>SIZE: {Math.round(note.size / 102.4) / 10} KB</span>
                      <span>{new Date(note.updatedAt).toLocaleDateString().toUpperCase()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Spaced Cards study session */
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '20px 0' }}>
                {subjectFlashcards.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-tech)', padding: '40px', fontStyle: 'italic' }}>
                    NO RECALL CARD REGISTRY CREATED FOR THIS SECTOR.
                  </div>
                ) : (
                  <>
                    {/* Interactive Flashcard box */}
                    <div
                      onClick={() => setIsFlipped(!isFlipped)}
                      style={{
                        width: '100%',
                        maxWidth: '500px',
                        minHeight: '280px',
                        backgroundColor: isFlipped ? 'rgba(16, 185, 129, 0.04)' : 'rgba(2, 3, 6, 0.65)',
                        border: isFlipped ? '1.5px dashed #10b981' : '1.2px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '4px',
                        padding: '30px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        textAlign: 'center',
                        position: 'relative',
                        boxShadow: '0 4px 25px rgba(0,0,0,0.35)'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'scale(1.01)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      <span style={{
                        position: 'absolute',
                        top: '12px',
                        right: '16px',
                        fontSize: '0.62rem',
                        color: 'rgba(255,255,255,0.3)',
                        fontFamily: 'var(--font-hud)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px'
                      }}>
                        {isFlipped ? '[ANSWER VIEW]' : '[QUESTION VIEW]'}
                      </span>
                      
                      <div style={{ fontSize: '1rem', fontFamily: 'var(--font-tech)', color: '#fff', lineHeight: '1.6', fontWeight: 500, padding: '0 10px' }}>
                        {isFlipped ? subjectFlashcards[cardIndex]?.answer : subjectFlashcards[cardIndex]?.question}
                      </div>

                      <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-hud)', color: isFlipped ? '#10b981' : 'rgba(255,255,255,0.35)', position: 'absolute', bottom: '16px', letterSpacing: '0.5px' }}>
                        {isFlipped ? '⚡ CLICK TO FLIP BACK TO QUESTION' : '❓ CLICK TO FLIP AND SHOW ANSWER'}
                      </div>
                    </div>

                    {/* Progress indicator */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-tech)', color: 'rgba(255,255,255,0.5)' }}>
                        CARD {cardIndex + 1} OF {subjectFlashcards.length}
                      </span>
                      <div style={{ width: '200px', height: '4px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${((cardIndex + 1) / subjectFlashcards.length) * 100}%`, height: '100%', backgroundColor: '#10b981', transition: 'width 0.2s' }}></div>
                      </div>
                    </div>

                    {/* Controls */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                      <button
                        onClick={() => {
                          setCardIndex(prev => Math.max(0, prev - 1));
                          setIsFlipped(false);
                        }}
                        disabled={cardIndex === 0}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: 'rgba(255,255,255,0.02)',
                          border: '1.2px solid rgba(255,255,255,0.1)',
                          borderRadius: '4px',
                          color: cardIndex === 0 ? 'rgba(255,255,255,0.2)' : '#fff',
                          cursor: cardIndex === 0 ? 'not-allowed' : 'pointer',
                          fontSize: '0.72rem',
                          fontFamily: 'var(--font-hud)',
                          fontWeight: 'bold',
                          outline: 'none'
                        }}
                      >
                        PREVIOUS CARD
                      </button>
                      <button
                        onClick={() => setIsFlipped(!isFlipped)}
                        style={{
                          padding: '8px 24px',
                          backgroundColor: '#10b981',
                          border: 'none',
                          borderRadius: '4px',
                          color: '#020306',
                          cursor: 'pointer',
                          fontSize: '0.72rem',
                          fontFamily: 'var(--font-hud)',
                          fontWeight: 'bold',
                          letterSpacing: '0.5px',
                          outline: 'none'
                        }}
                      >
                        FLIP CARD
                      </button>
                      <button
                        onClick={() => {
                          setCardIndex(prev => Math.min(subjectFlashcards.length - 1, prev + 1));
                          setIsFlipped(false);
                        }}
                        disabled={cardIndex === subjectFlashcards.length - 1}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: 'rgba(255,255,255,0.02)',
                          border: '1.2px solid rgba(255,255,255,0.1)',
                          borderRadius: '4px',
                          color: cardIndex === subjectFlashcards.length - 1 ? 'rgba(255,255,255,0.2)' : '#fff',
                          cursor: cardIndex === subjectFlashcards.length - 1 ? 'not-allowed' : 'pointer',
                          fontSize: '0.72rem',
                          fontFamily: 'var(--font-hud)',
                          fontWeight: 'bold',
                          outline: 'none'
                        }}
                      >
                        NEXT CARD
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          <div style={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'rgba(255,255,255,0.3)',
            gap: '16px'
          }}>
            <FileText size={48} strokeWidth={1} style={{ color: 'rgba(0, 246, 255, 0.25)', filter: 'drop-shadow(0 0 10px rgba(0, 246, 255, 0.1))' }} />
            <h3 style={{ fontFamily: 'var(--font-hud)', fontSize: '0.95rem', color: '#fff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>
              NO SECTOR SELECTED
            </h3>
            <p style={{ fontSize: '0.75rem', fontFamily: 'var(--font-tech)', margin: 0 }}>Select a subject MOC hub from the sidebar to start reviewing.</p>
          </div>
        )}
      </div>
    </div>
  );
}
