import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Activity, Save, ArrowRight, BookOpen, Clock, Cpu } from 'lucide-react';

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

  // Maps of Content note selector
  const mocNotes = useMemo(() => {
    return notes.filter(n => 
      n.subject === 'MOC' || 
      n.filename.toLowerCase().includes('moc') || 
      n.title.toLowerCase().includes('moc')
    ).sort((a, b) => a.title.localeCompare(b.title));
  }, [notes]);

  const handleNoteClick = (note) => {
    // Re-order visited note queue
    try {
      let visited = JSON.parse(localStorage.getItem('recentlyVisited') || '[]');
      visited = visited.filter(path => path !== note.absolutePath);
      visited.unshift(note.absolutePath);
      visited = visited.slice(0, 5);
      localStorage.setItem('recentlyVisited', JSON.stringify(visited));
    } catch(e) {}
    onSelectNote(note.absolutePath);
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
        setScratchpad(''); // Clear scratchpad!
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

  const getSubjectColor = (subjectId) => {
    if (!subjectId) return '#a78bfa';
    const cleanId = subjectId.toUpperCase();
    if (cleanId.includes('OS') || cleanId.includes('OPERATING')) return '#3b82f6';
    if (cleanId.includes('DSA') || cleanId.includes('DATA_STRUCTURES')) return '#10b981';
    if (cleanId.includes('DBMS') || cleanId.includes('DATABASE')) return '#f59e0b';
    if (cleanId.includes('DISCRETE')) return '#ec4899';
    if (cleanId.includes('COMPUTER') || cleanId.includes('SYSTEM_ARCHITECTURE') || cleanId.includes('ARCHITECTURE')) return '#8b5cf6';
    if (cleanId.includes('CYBER') || cleanId.includes('NETWORKS') || cleanId.includes('CYBER_CN')) return '#06b6d4';
    if (cleanId.includes('ML') || cleanId.includes('MACHINE')) return '#f43f5e';
    if (cleanId.includes('OPPS') || cleanId.includes('OOP')) return '#14b8a6';
    if (cleanId.includes('STATISTICS')) return '#84cc16';
    return '#a78bfa';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexGrow: 1, justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)' }}>
        <span>Analyzing vault statistics...</span>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', height: '100%', overflowY: 'auto' }}>
      
      {/* Welcome Banner */}
      <div className="glass-panel" style={{
        padding: '24px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
        borderColor: 'rgba(139, 92, 246, 0.2)'
      }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', margin: '0 0 6px 0', textAlign: 'left', fontWeight: 700 }}>
            Welcome back to your Second Brain
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Your long-term academic memory contains **{notes.length} atomic concepts** connected in a semantic network.
          </p>
        </div>
      </div>

      {/* Grid: 3 Stats Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-primary)' }}>
            <FileText size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Concept Notes</h4>
            <p style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)' }}>{notes.length}</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Spaced Repetition</h4>
            <p style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)' }}>{flashcards.length} Cards</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-info)' }}>
            <Activity size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Graphify State</h4>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--accent-info)', marginTop: '4px' }}>Semantic Linked</p>
          </div>
        </div>

      </div>

      {/* Left and Right Split Panel */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        
        {/* Left Column: MOCs Registry & Recent Notes */}
        <div style={{ flex: '2 1 500px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Maps of Content (MOCs) Hub Registry */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-display)', fontWeight: 600, color: '#fff' }}>
                🗂️ Maps of Content (MOCs)
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                {mocNotes.length} Directories
              </span>
            </div>
            
            {mocNotes.length === 0 ? (
              <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                No Maps of Content found.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                {mocNotes.map(moc => {
                  const subjectId = moc.filename.replace(' MOC.md', '').replace('.md', '').toUpperCase();
                  return (
                    <button
                      key={moc.absolutePath}
                      onClick={() => onSelectNote(moc.absolutePath)}
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '12px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                        width: '100%',
                        outline: 'none'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = getSubjectColor(subjectId);
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-color)';
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                      }}
                    >
                      <div>
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: getSubjectColor(subjectId) + '20',
                          color: getSubjectColor(subjectId)
                        }}>
                          MOC INDEX
                        </span>
                        <h4 style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600, marginTop: '8px' }}>
                          {moc.title}
                        </h4>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <Clock size={12} />
                        <span>Updated {new Date(moc.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recently Visited Notes */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: '14px', color: '#fff' }}>
              Recently Visited Notes
            </h3>
            {visitedNotes.length === 0 ? (
              <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                No recent activity.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <Clock size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.85rem', color: '#fff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {n.title}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.7rem', color: getSubjectColor(n.subject), fontWeight: 600 }}>{n.subject}</span>
                      <ArrowRight size={12} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Quick Dump Scratchpad & Task Board */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Quick Capture Terminal */}
          <div className="glass-panel" style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            minHeight: '260px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} style={{ color: 'var(--accent-primary)' }} />
                <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-display)', fontWeight: 600, color: '#fff' }}>
                  Quick Capture Terminal
                </h3>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                (Karpathy Buffer)
              </span>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Dump rough notes, transcripts, or thoughts here. Based on Andrej Karpathy's raw buffer concept: write quickly, then format or clear.
            </p>

            <textarea
              value={scratchpad}
              onChange={(e) => setScratchpad(e.target.value)}
              placeholder="Dump quick thoughts or copy-paste lecture content..."
              style={{
                flexGrow: 1,
                width: '100%',
                backgroundColor: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '12px',
                color: '#e5e7eb',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                lineHeight: '1.4',
                outline: 'none',
                resize: 'none',
                minHeight: '120px'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {scratchStatus}
              </span>
              
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => {
                    // Navigate to coprocessor tab, pass scratchpad content, and clear local state
                    onNavigate('coprocessor', scratchpad);
                    setScratchpad('');
                  }}
                  disabled={!scratchpad.trim()}
                  style={{
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    color: 'var(--accent-primary)',
                    border: '1px solid var(--border-color-active)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: scratchpad.trim() ? 'pointer' : 'not-allowed',
                    opacity: scratchpad.trim() ? 1 : 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Cpu size={12} />
                  <span>Refine via AI</span>
                </button>
                
                <button
                  onClick={saveScratchpad}
                  disabled={scratchSaving || !scratchpad.trim()}
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 14px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: scratchpad.trim() ? 'pointer' : 'not-allowed',
                    opacity: scratchpad.trim() ? 1 : 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Save size={12} />
                  <span>Save Buffer</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Task Board */}
          <div className="glass-panel" style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            minHeight: '260px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Save size={18} style={{ color: 'var(--accent-success)' }} />
                <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-display)', fontWeight: 600, color: '#fff' }}>
                  Quick Task Board
                </h3>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-success)' }}>
                {tasks.filter(t => !t.completed).length} Active
              </span>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Tasks are saved in Obsidian (<code>00_Inbox/Tasks.md</code>) and automatically link inside your codebase / note graphify mapping.
            </p>

            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddTask();
                }}
                placeholder="Add task (e.g. 'Review [[OS MOC]]')..."
                style={{
                  flexGrow: 1,
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  color: '#e5e7eb',
                  fontSize: '0.8rem',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleAddTask}
                disabled={!newTaskText.trim()}
                style={{
                  backgroundColor: 'var(--accent-success)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: newTaskText.trim() ? 'pointer' : 'not-allowed',
                  opacity: newTaskText.trim() ? 1 : 0.6
                }}
              >
                Add
              </button>
            </div>

            <div style={{
              flexGrow: 1,
              overflowY: 'auto',
              maxHeight: '180px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }} className="no-scrollbar">
              {tasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                  No tasks set. Add one above!
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
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      opacity: task.completed ? 0.6 : 1
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleTask(task.text, !task.completed)}
                      style={{
                        cursor: 'pointer',
                        accentColor: 'var(--accent-success)'
                      }}
                    />
                    <span style={{
                      fontSize: '0.8rem',
                      color: task.completed ? 'var(--text-muted)' : '#e5e7eb',
                      textDecoration: task.completed ? 'line-through' : 'none',
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
          </div>

        </div>

      </div>

    </div>
  );
}
