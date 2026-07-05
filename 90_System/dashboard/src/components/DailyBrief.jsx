import React, { useState, useEffect } from 'react';
import { BookOpen, AlertCircle, RefreshCw, CheckCircle, HelpCircle } from 'lucide-react';

export default function DailyBrief() {
  const [briefData, setBriefData] = useState({ cards_due: [], unfiled_notes: [], unlinked_notes: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active Review State
  const [reviewMode, setReviewMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewingCards, setReviewingCards] = useState([]);

  // Fetch brief data
  const fetchDailyBrief = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/daily-brief');
      if (!res.ok) throw new Error('Failed to fetch daily brief.');
      const data = await res.json();
      setBriefData(data);
      setReviewingCards(data.cards_due || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyBrief();
  }, []);

  const playHapticSound = (type) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(750, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(550, ctx.currentTime);
        osc.frequency.setValueAtTime(700, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (_) {}
  };

  const handleStartReview = () => {
    playHapticSound('click');
    setReviewMode(true);
    setCurrentCardIndex(0);
    setShowAnswer(false);
  };

  const handleAnswerQuality = async (quality) => {
    playHapticSound('click');
    const card = reviewingCards[currentCardIndex];
    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_id: card.id, quality })
      });
      if (res.ok) {
        if (currentCardIndex + 1 < reviewingCards.length) {
          setCurrentCardIndex(prev => prev + 1);
          setShowAnswer(false);
        } else {
          // Finished review!
          playHapticSound('success');
          setReviewMode(false);
          fetchDailyBrief(); // Refresh numbers
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexGrow: 1, justifyContent: 'center', alignItems: 'center', color: '#00f6ff', height: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '2px solid rgba(0,246,255,0.2)',
            borderTopColor: '#00f6ff',
            animation: 'rotate-slow 1s linear infinite'
          }} />
          <span style={{ fontFamily: 'Share Tech Mono', fontSize: '0.8rem', letterSpacing: '2px' }}>A.R.C. GATHERING COGNITIVE INTEL...</span>
        </div>
      </div>
    );
  }

  if (reviewMode && reviewingCards.length > 0) {
    const currentCard = reviewingCards[currentCardIndex];
    return (
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', gap: '20px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed rgba(0,246,255,0.15)', paddingBottom: '12px' }}>
          <h2 style={{ fontFamily: 'var(--font-hud)', color: '#00f6ff', fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Flashcard Session [{currentCardIndex + 1} / {reviewingCards.length}]
          </h2>
          <button
            onClick={() => { playHapticSound('click'); setReviewMode(false); }}
            style={{
              padding: '4px 10px',
              backgroundColor: 'rgba(255, 85, 0, 0.1)',
              border: '1px solid #ff5500',
              color: '#ff5500',
              fontSize: '0.65rem',
              fontFamily: 'Share Tech Mono',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            TERMINATE SESSION
          </button>
        </header>

        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          {/* Card Body */}
          <div className="glass-panel" style={{
            width: '550px',
            padding: '30px',
            minHeight: '260px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '1px solid rgba(0, 246, 255, 0.25)',
            backgroundColor: 'rgba(6, 12, 22, 0.85)',
            boxShadow: '0 0 20px rgba(0, 246, 255, 0.1)',
            position: 'relative'
          }}>
            <div style={{ position: 'absolute', top: '10px', right: '12px', fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'Share Tech Mono' }}>
              SOURCE: {currentCard.note_path.split('/').pop()}
            </div>
            
            <div style={{ margin: 'auto 0', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#ff6a00', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', fontFamily: 'Share Tech Mono' }}>
                Question
              </div>
              <p style={{ fontSize: '1.05rem', color: '#fff', margin: 0, lineHeight: '1.5' }}>
                {currentCard.question}
              </p>

              {showAnswer && (
                <div style={{ marginTop: '24px', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#10b981', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', fontFamily: 'Share Tech Mono' }}>
                    Suggested Answer
                  </div>
                  <p style={{ fontSize: '0.95rem', color: '#cbd5e1', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                    {currentCard.answer}
                  </p>
                </div>
              )}
            </div>

            {/* Actions panel */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
              {!showAnswer ? (
                <button
                  onClick={() => { playHapticSound('click'); setShowAnswer(true); }}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#00f6ff',
                    color: '#020306',
                    border: 'none',
                    fontFamily: 'Share Tech Mono',
                    fontWeight: 'bold',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    letterSpacing: '1.5px',
                    boxShadow: '0 0 10px rgba(0,246,255,0.35)',
                    outline: 'none'
                  }}
                >
                  DE-SHROUD ANSWER
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '100%' }}>
                  <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'Share Tech Mono', letterSpacing: '1px' }}>
                    RATE RECALL QUALITY (0 = MUDDY, 5 = CRITICAL CLARITY)
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[0, 1, 2, 3, 4, 5].map(q => (
                      <button
                        key={q}
                        onClick={() => handleAnswerQuality(q)}
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '4px',
                          border: `1.2px solid ${q >= 3 ? '#10b981' : '#ff5500'}`,
                          backgroundColor: 'transparent',
                          color: '#fff',
                          fontFamily: 'Share Tech Mono',
                          fontSize: '0.9rem',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          outline: 'none'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = q >= 3 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 85, 0, 0.15)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', gap: '24px', overflowY: 'auto' }} className="custom-scrollbar">
      {/* Viewport Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed rgba(0,246,255,0.15)', paddingBottom: '16px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-hud)', color: '#fff', fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px', margin: 0 }}>
            A.R.C. Daily Tactical Brief
          </h2>
          <span style={{ fontSize: '0.62rem', color: '#00f6ff', fontFamily: 'Share Tech Mono', letterSpacing: '1px' }}>
            STARK_OS DIAGNOSTICS & ACTIVE INSTRUCTIONS
          </span>
        </div>
        <button
          onClick={() => { playHapticSound('click'); fetchDailyBrief(); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            backgroundColor: 'rgba(0, 246, 255, 0.05)',
            border: '1px solid rgba(0, 246, 255, 0.25)',
            color: '#00f6ff',
            fontSize: '0.7rem',
            fontFamily: 'Share Tech Mono',
            cursor: 'pointer',
            transition: 'all 0.2s',
            outline: 'none'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 246, 255, 0.12)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 246, 255, 0.05)'}
        >
          <RefreshCw size={12} />
          <span>RE-POLL STATUS</span>
        </button>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', border: '1.2px solid #ef4444', backgroundColor: 'rgba(239, 68, 68, 0.08)', padding: '12px 16px', color: '#ef4444', fontSize: '0.75rem', fontFamily: 'Share Tech Mono' }}>
          <AlertCircle size={16} />
          <span>EXCEPTION DETECTED: {error}</span>
        </div>
      )}

      {/* Grid Briefing Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px' }}>
        
        {/* Cell 1: Flashcards due */}
        <section className="glass-panel" style={{
          gridColumn: 'span 4',
          padding: '20px',
          border: '1.2px solid rgba(16, 185, 129, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '200px',
          backgroundColor: 'rgba(2, 3, 6, 0.4)'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.62rem', color: '#10b981', fontWeight: 800, letterSpacing: '1px', fontFamily: 'Share Tech Mono' }}>
                SPACED REPETITION
              </span>
              <BookOpen size={16} style={{ color: '#10b981' }} />
            </div>
            <h3 style={{ fontSize: '1.65rem', color: '#fff', margin: '6px 0', fontFamily: 'Share Tech Mono', fontWeight: 800 }}>
              {briefData.cards_due.length}
            </h3>
            <p style={{ fontSize: '#cbd5e1', fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
              Practice cards due for active memory calibration. Rate your answers to schedule dynamic SM-2 feedback.
            </p>
          </div>
          
          <button
            disabled={briefData.cards_due.length === 0}
            onClick={handleStartReview}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: briefData.cards_due.length > 0 ? '#10b981' : 'transparent',
              color: briefData.cards_due.length > 0 ? '#020306' : 'rgba(255,255,255,0.15)',
              border: briefData.cards_due.length > 0 ? 'none' : '1px solid rgba(255,255,255,0.08)',
              fontFamily: 'Share Tech Mono',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: briefData.cards_due.length > 0 ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              outline: 'none',
              letterSpacing: '1px'
            }}
          >
            {briefData.cards_due.length > 0 ? '⚡ INITIALIZE RECALL DECK' : 'VAULT FULLY CALIBRATED'}
          </button>
        </section>

        {/* Cell 2: Inbox Log status */}
        <section className="glass-panel" style={{
          gridColumn: 'span 4',
          padding: '20px',
          border: '1.2px solid rgba(255, 106, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '200px',
          backgroundColor: 'rgba(2, 3, 6, 0.4)'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.62rem', color: '#ff6a00', fontWeight: 800, letterSpacing: '1px', fontFamily: 'Share Tech Mono' }}>
                CAPTURED INBOX FEED
              </span>
              <AlertCircle size={16} style={{ color: '#ff6a00' }} />
            </div>
            <h3 style={{ fontSize: '1.65rem', color: '#fff', margin: '6px 0', fontFamily: 'Share Tech Mono', fontWeight: 800 }}>
              {briefData.unfiled_notes.length}
            </h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
              Unfiled items waiting in the capture inbox folder. Drop items in `00_Inbox` or press `Ctrl + Alt + Space` to log drafts.
            </p>
          </div>

          <div style={{
            padding: '10px',
            border: '1px dashed rgba(255, 106, 0, 0.2)',
            color: '#ff6a00',
            fontFamily: 'Share Tech Mono',
            fontSize: '0.68rem',
            textAlign: 'center'
          }}>
            {briefData.unfiled_notes.length > 0 
              ? '⚠ COPROCESSOR FILING LOOP STALLED' 
              : '✓ INBOX CLEAR / FULLY PARSED'}
          </div>
        </section>

        {/* Cell 3: Unlinked Notes */}
        <section className="glass-panel" style={{
          gridColumn: 'span 4',
          padding: '20px',
          border: '1.2px solid rgba(139, 92, 246, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '200px',
          backgroundColor: 'rgba(2, 3, 6, 0.4)'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.62rem', color: '#a855f7', fontWeight: 800, letterSpacing: '1px', fontFamily: 'Share Tech Mono' }}>
                REFACTORING DIRECTIVE
              </span>
              <RefreshCw size={16} style={{ color: '#a855f7' }} />
            </div>
            <h3 style={{ fontSize: '1.65rem', color: '#fff', margin: '6px 0', fontFamily: 'Share Tech Mono', fontWeight: 800 }}>
              {briefData.unlinked_notes.length}
            </h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
              Orphaned notes outside the subject maps of content. Link them to cased MOC indices to anchor them in the network.
            </p>
          </div>

          <div style={{
            padding: '10px',
            border: '1px dashed rgba(168, 85, 247, 0.2)',
            color: '#a855f7',
            fontFamily: 'Share Tech Mono',
            fontSize: '0.68rem',
            textAlign: 'center'
          }}>
            {briefData.unlinked_notes.length > 0 
              ? '⚠ ISOLATED AST NODES FOUND' 
              : '✓ CORE NETWORK SECURELY LINKED'}
          </div>
        </section>

      </div>

      {/* Deep-dive details panel */}
      {(briefData.unfiled_notes.length > 0 || briefData.unlinked_notes.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '12px' }}>
          
          {/* Inbox details */}
          {briefData.unfiled_notes.length > 0 && (
            <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '0.65rem', color: '#ff6a00', fontWeight: 800, fontFamily: 'Share Tech Mono', letterSpacing: '1px' }}>
                UNFILED CAPTURES QUEUE
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', maxHeight: '180px' }} className="custom-scrollbar">
                {briefData.unfiled_notes.map(note => (
                  <div key={note.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.7rem' }}>
                    <span style={{ color: '#fff', fontFamily: 'Share Tech Mono' }}>{note.note_path.split('/').pop()}</span>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.6rem' }}>{new Date(note.detected_at).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unlinked details */}
          {briefData.unlinked_notes.length > 0 && (
            <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '0.65rem', color: '#a855f7', fontWeight: 800, fontFamily: 'Share Tech Mono', letterSpacing: '1px' }}>
                ORPHANED VAULT NODES
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', maxHeight: '180px' }} className="custom-scrollbar">
                {briefData.unlinked_notes.map((note, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.7rem' }}>
                    <span style={{ color: '#fff', fontFamily: 'Share Tech Mono' }}>{note.title}</span>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem' }}>{note.relativePath.split('/')[1]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
