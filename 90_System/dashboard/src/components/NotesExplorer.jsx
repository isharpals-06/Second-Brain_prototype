import React, { useState, useEffect, useMemo } from 'react';
import { Search, Save, Edit2, Eye, FileText, ChevronRight, Folder, BookOpen, Clock, Cpu } from 'lucide-react';

export default function NotesExplorer({ initialSelectedFile, clearInitialSelected }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  
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
    <div style={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden' }}>
      
      {/* 1. Left Sidebar: Notes Directory List */}
      <div style={{
        width: '320px',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#0c0d12'
      }}>
        {/* Search */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search concepts or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '10px 12px 10px 38px',
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
            />
          </div>
          
          {/* Subject Filter */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }} className="no-scrollbar">
            {subjects.map(sub => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  whiteSpace: 'nowrap',
                  backgroundColor: selectedSubject === sub ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.03)',
                  borderColor: selectedSubject === sub ? 'var(--accent-primary)' : 'var(--border-color)',
                  color: selectedSubject === sub ? '#fff' : 'var(--text-secondary)'
                }}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        {/* Notes/Folders List */}
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '0 8px 16px 8px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <span>Loading notes list...</span>
            </div>
          ) : searchQuery.trim() ? (
            /* Search results view */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', padding: '4px 8px', letterSpacing: '0.5px' }}>
                Search Results ({filteredNotes.length})
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
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: isSelected ? 'rgba(139, 92, 246, 0.12)' : 'transparent',
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
                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <p style={{
                        color: isSelected ? '#fff' : 'var(--text-primary)',
                        fontSize: '0.8rem',
                        fontWeight: isSelected ? 600 : 500,
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap'
                      }}>
                        {note.title}
                      </p>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        {note.subject}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Folder MOC index selector view */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', padding: '4px 8px', letterSpacing: '0.5px' }}>
                Subject MOC hubs
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
                      backgroundColor: isSelectedHub ? `${subjColor}15` : 'rgba(255, 255, 255, 0.01)',
                      border: isSelectedHub ? `1px solid ${subjColor}` : '1px solid var(--border-color)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      color: isSelectedHub ? '#fff' : 'var(--text-secondary)',
                      outline: 'none',
                      transition: 'all 0.2s',
                      textAlign: 'left'
                    }}
                    onMouseOver={(e) => {
                      if (!isSelectedHub) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                    }}
                    onMouseOut={(e) => {
                      if (!isSelectedHub) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.01)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flexGrow: 1 }}>
                      <Folder size={15} style={{ color: subjColor, flexShrink: 0 }} />
                      <span style={{
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        color: isSelectedHub ? '#fff' : '#e5e7eb',
                        flexGrow: 1
                      }}>
                        {getSubjectCleanName(subj)}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
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
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#07080b' }}>
        {activeNote ? (
          <>
            {/* Note Toolbar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 24px',
              borderBottom: '1px solid var(--border-color)',
              backgroundColor: '#0c0d12'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Folder size={14} style={{ color: activeSubjectColor }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: activeSubjectColor }}>
                    {activeNote.subject} NOTES
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>/</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                    {activeNote.filename}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', color: '#fff', fontWeight: 700 }}>
                  {activeNote.title}
                </h2>
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    color: '#fff',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {isEditing ? (
                    <>
                      <Eye size={14} />
                      <span>Preview Mode</span>
                    </>
                  ) : (
                    <>
                      <Edit2 size={14} />
                      <span>Edit Source</span>
                    </>
                  )}
                </button>
                {isEditing && (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                      background: 'var(--accent-primary)',
                      border: 'none',
                      color: '#fff',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      cursor: saving ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Save size={14} />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Note Content Area */}
            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '24px 32px' }}>
              {isEditing ? (
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '16px',
                    color: '#e5e7eb',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.9rem',
                    lineHeight: '1.5',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              ) : (
                <div 
                  className="markdown-body animate-fade-in"
                  style={{ maxWidth: '800px', margin: '0 auto' }}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(noteContent) }}
                />
              )}
            </div>
          </>
        ) : activeMocHub ? (
          /* MOC Subject Hub Page */
          <div style={{ padding: '32px', overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Hub Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  backgroundColor: getSubjectColor(activeMocHub) + '20',
                  color: getSubjectColor(activeMocHub)
                }}>
                  SUBJECT HUB
                </span>
                <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', color: '#fff', fontWeight: 700, marginTop: '8px' }}>
                  {getSubjectCleanName(activeMocHub)} Hub
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
                  {subjectNotes.length} concepts mapped | {subjectFlashcards.length} spaced recall cards available
                </p>
              </div>
            </div>

            {/* Hub Tab Bar */}
            <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <button
                onClick={() => setMocTab('concepts')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: mocTab === 'concepts' ? 'var(--accent-primary)' : 'transparent',
                  color: mocTab === 'concepts' ? '#fff' : 'var(--text-secondary)',
                  border: mocTab === 'concepts' ? 'none' : '1px solid var(--border-color)',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                📄 Concept Cards ({subjectNotes.length})
              </button>
              <button
                onClick={() => {
                  setMocTab('flashcards');
                  setCardIndex(0);
                  setIsFlipped(false);
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: mocTab === 'flashcards' ? 'var(--accent-success)' : 'transparent',
                  color: mocTab === 'flashcards' ? '#fff' : 'var(--text-secondary)',
                  border: mocTab === 'flashcards' ? 'none' : '1px solid var(--border-color)',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                ⚡ Review Spaced Cards ({subjectFlashcards.length})
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
                      backgroundColor: 'rgba(255,255,255,0.01)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '16px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '140px',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = getSubjectColor(activeMocHub);
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.01)';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
                        {note.title}
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.4' }}>
                        Mapped atomic concept. Open file to view full notes, mathematical equations, and active recall cards.
                      </p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '12px' }}>
                      <span>Size: {Math.round(note.size / 102.4) / 10} KB</span>
                      <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Spaced Cards study session */
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '20px 0' }}>
                {subjectFlashcards.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px', fontStyle: 'italic' }}>
                    No spaced repetition cards found for this subject MOC.
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
                        backgroundColor: isFlipped ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                        border: isFlipped ? '2px dashed var(--accent-success)' : '1px solid var(--border-color)',
                        borderRadius: '12px',
                        padding: '30px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        textAlign: 'center',
                        position: 'relative',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
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
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {isFlipped ? 'Answer View' : 'Question View'}
                      </span>
                      
                      <div style={{ fontSize: '1.15rem', color: '#fff', lineHeight: '1.6', fontWeight: 500, padding: '0 10px' }}>
                        {isFlipped ? subjectFlashcards[cardIndex]?.answer : subjectFlashcards[cardIndex]?.question}
                      </div>

                      <div style={{ fontSize: '0.75rem', color: isFlipped ? 'var(--accent-success)' : 'var(--text-muted)', position: 'absolute', bottom: '16px' }}>
                        {isFlipped ? '⚡ Click to flip back to question' : '❓ Click to flip and show answer'}
                      </div>
                    </div>

                    {/* Progress indicator */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Card {cardIndex + 1} of {subjectFlashcards.length}
                      </span>
                      <div style={{ width: '200px', height: '4px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${((cardIndex + 1) / subjectFlashcards.length) * 100}%`, height: '100%', backgroundColor: 'var(--accent-success)', transition: 'width 0.2s' }}></div>
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
                          backgroundColor: 'rgba(255,255,255,0.03)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: cardIndex === 0 ? 'var(--text-muted)' : '#fff',
                          cursor: cardIndex === 0 ? 'not-allowed' : 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          outline: 'none'
                        }}
                      >
                        Previous Card
                      </button>
                      <button
                        onClick={() => setIsFlipped(!isFlipped)}
                        style={{
                          padding: '8px 24px',
                          backgroundColor: 'var(--accent-success)',
                          border: 'none',
                          borderRadius: '6px',
                          color: '#fff',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          outline: 'none'
                        }}
                      >
                        Flip Card
                      </button>
                      <button
                        onClick={() => {
                          setCardIndex(prev => Math.min(subjectFlashcards.length - 1, prev + 1));
                          setIsFlipped(false);
                        }}
                        disabled={cardIndex === subjectFlashcards.length - 1}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: 'rgba(255,255,255,0.03)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: cardIndex === subjectFlashcards.length - 1 ? 'var(--text-muted)' : '#fff',
                          cursor: cardIndex === subjectFlashcards.length - 1 ? 'not-allowed' : 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          outline: 'none'
                        }}
                      >
                        Next Card
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
            color: 'var(--text-muted)',
            gap: '12px'
          }}>
            <FileText size={48} strokeWidth={1} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
              No Subject Selected
            </h3>
            <p style={{ fontSize: '0.85rem' }}>Select a subject MOC hub from the sidebar to start reviewing.</p>
          </div>
        )}
      </div>

    </div>
  );
}
