import React, { useState, useEffect, useMemo } from 'react';
import { Layers, Check, X, RotateCcw, AlertCircle, Sparkles, HelpCircle } from 'lucide-react';

export default function FlashcardsView() {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  
  // Review session state
  const [sessionCards, setSessionCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0, easy: 0 });
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Fetch flashcards
  const fetchCards = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/flashcards');
      const data = await res.json();
      setFlashcards(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const subjects = useMemo(() => {
    const subs = new Set(flashcards.map(c => c.subject));
    return ['ALL', ...Array.from(subs).sort()];
  }, [flashcards]);

  const startSession = () => {
    const filtered = selectedSubject === 'ALL' 
      ? [...flashcards]
      : flashcards.filter(c => c.subject === selectedSubject);
    
    // Shuffle cards
    const shuffled = filtered.sort(() => Math.random() - 0.5);
    
    // Limit to 20 cards max per review session
    setSessionCards(shuffled.slice(0, 20));
    setCurrentIndex(0);
    setIsFlipped(false);
    setStats({ correct: 0, incorrect: 0, easy: 0 });
    setSessionActive(true);
    setSessionFinished(false);
    setShowConfetti(false);
  };

  const handleScore = (grade) => {
    if (grade === 'good') {
      setStats(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else if (grade === 'easy') {
      setStats(prev => ({ ...prev, easy: prev.easy + 1 }));
    } else {
      setStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }

    if (currentIndex + 1 < sessionCards.length) {
      setIsFlipped(false);
      // Wait for flip back animation before changing card content
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 200);
    } else {
      setSessionFinished(true);
      setShowConfetti(true);
    }
  };

  const getSubjectColor = (subject) => {
    switch (subject) {
      case 'OS': return '#3b82f6';
      case 'DSA': return '#10b981';
      case 'DBMS': return '#f59e0b';
      case 'DISCRETE_MATHEMATICS':
      case 'DISCRETE': return '#ec4899';
      case 'COMPUTER_SYSTEM_ARCHITECTURE':
      case 'CSA': return '#8b5cf6';
      case 'CYBER_CN': return '#06b6d4';
      case 'ML': return '#f43f5e';
      case 'OPPS': return '#14b8a6';
      case 'STATISTICS': return '#84cc16';
      default: return '#a78bfa';
    }
  };

  const activeCard = sessionCards[currentIndex];
  const progressPercent = sessionCards.length > 0 
    ? Math.round((currentIndex / sessionCards.length) * 100)
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', alignItems: 'center', overflowY: 'auto' }}>
      
      {/* Top Header */}
      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 24px',
        borderBottom: '1px solid var(--border-color)',
        zIndex: 10
      }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', fontWeight: 600 }}>Active Recall Flashcards</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Practice spaced repetition directly from your Markdown `#flashcards` tags
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexGrow: 1, justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>
          <span>Loading flashcards from vault...</span>
        </div>
      ) : !sessionActive ? (
        /* Configuration Screen */
        <div className="glass-panel animate-fade-in" style={{
          maxWidth: '500px',
          width: '90%',
          margin: '40px auto',
          padding: '30px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          boxShadow: 'var(--shadow)'
        }}>
          <Layers size={48} style={{ color: 'var(--accent-primary)', margin: '0 auto', opacity: 0.8 }} />
          <div>
            <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', color: '#fff', fontWeight: 600, marginBottom: '8px' }}>
              Start Study Session
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              We detected <strong style={{ color: '#fff' }}>{flashcards.length} flashcards</strong> inside your 634 refined concept notes.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Filter by Subject Deck
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            >
              <option value="ALL" style={{ backgroundColor: '#12131a', color: '#f3f4f6' }}>All Subjects ({flashcards.length} cards)</option>
              {subjects.filter(s => s !== 'ALL').map(sub => {
                const count = flashcards.filter(c => c.subject === sub).length;
                return (
                  <option 
                    key={sub} 
                    value={sub} 
                    style={{ backgroundColor: '#12131a', color: '#f3f4f6' }}
                  >
                    {sub} ({count} cards)
                  </option>
                );
              })}
            </select>
          </div>

          <button
            onClick={startSession}
            disabled={flashcards.length === 0}
            style={{
              background: 'var(--accent-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '14px',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: flashcards.length === 0 ? 'not-allowed' : 'pointer',
              opacity: flashcards.length === 0 ? 0.5 : 1,
              transition: 'opacity 0.2s',
              marginTop: '10px'
            }}
          >
            Launch Session (Max 20 Cards)
          </button>
        </div>
      ) : sessionFinished ? (
        /* Completion Screen */
        <div className="glass-panel animate-fade-in" style={{
          maxWidth: '500px',
          width: '90%',
          margin: '40px auto',
          padding: '30px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          boxShadow: 'var(--shadow)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {showConfetti && <div className="confetti-shower" />}
          
          <Sparkles size={48} style={{ color: 'var(--accent-warning)', margin: '0 auto' }} />
          <div>
            <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', color: '#fff', fontWeight: 600, marginBottom: '8px' }}>
              Review Session Complete!
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Excellent job. Active recall strengthens synaptic connections!
            </p>
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: '8px' }}>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-success)' }}>{stats.correct}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Good / Correct</p>
            </div>
            <div style={{ backgroundColor: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.2)', padding: '12px', borderRadius: '8px' }}>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-info)' }}>{stats.easy}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Easy / Instant</p>
            </div>
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '8px' }}>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-danger)' }}>{stats.incorrect}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Incorrect / Study</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              onClick={startSession}
              style={{
                flexGrow: 1,
                background: 'var(--accent-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <RotateCcw size={16} />
              <span>Review Again</span>
            </button>
            <button
              onClick={() => setSessionActive(false)}
              style={{
                flexGrow: 1,
                background: 'var(--bg-card)',
                color: '#fff',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '12px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Select Another Deck
            </button>
          </div>
        </div>
      ) : (
        /* Active Study Interface */
        <div style={{
          maxWidth: '650px',
          width: '95%',
          margin: '20px auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          alignItems: 'center'
        }}>
          {/* Progress header */}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Card {currentIndex + 1} of {sessionCards.length}
            </span>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: '12px',
              backgroundColor: getSubjectColor(activeCard.subject) + '20',
              color: getSubjectColor(activeCard.subject),
              border: `1px solid ${getSubjectColor(activeCard.subject)}30`
            }}>
              {activeCard.subject}
            </span>
          </div>

          {/* Progress Bar */}
          <div style={{
            width: '100%',
            height: '4px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              backgroundColor: 'var(--accent-primary)',
              transition: 'width 0.3s ease'
            }} />
          </div>

          {/* 3D Flipped Card Wrapper */}
          <div 
            onClick={() => !isFlipped && setIsFlipped(true)}
            style={{
              width: '100%',
              height: '320px',
              perspective: '1000px',
              cursor: isFlipped ? 'default' : 'pointer'
            }}
          >
            <div style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              textAlign: 'center',
              transition: 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}>
              
              {/* Card Front (Question) */}
              <div className="glass-panel" style={{
                position: 'absolute',
                inset: 0,
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '30px',
                boxShadow: 'var(--shadow)',
                border: '1px solid rgba(255,255,255,0.06)'
              }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                  Question (Click to reveal)
                </span>
                <p style={{
                  fontSize: '1.25rem',
                  fontFamily: 'var(--font-display)',
                  lineHeight: '1.5',
                  color: '#fff',
                  fontWeight: 500,
                  whiteSpace: 'pre-wrap'
                }}>
                  {activeCard.question}
                </p>
                <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Ref: <code>{activeCard.filename}</code>
                </div>
              </div>

              {/* Card Back (Answer) */}
              <div className="glass-panel" style={{
                position: 'absolute',
                inset: 0,
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '30px',
                boxShadow: 'var(--shadow)',
                border: '1px solid rgba(139, 92, 246, 0.2)'
              }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', fontWeight: 600 }}>
                  Answer
                </span>
                <p style={{
                  fontSize: '1.15rem',
                  lineHeight: '1.6',
                  color: '#e5e7eb',
                  overflowY: 'auto',
                  maxHeight: '200px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {activeCard.answer}
                </p>
              </div>

            </div>
          </div>

          {/* Action buttons */}
          <div style={{ width: '100%', minHeight: '60px', display: 'flex', justifyContent: 'center' }}>
            {!isFlipped ? (
              <button
                onClick={() => setIsFlipped(true)}
                style={{
                  background: 'var(--bg-card)',
                  color: '#fff',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '12px 30px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  boxShadow: 'var(--shadow)'
                }}
              >
                Reveal Answer
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px', width: '100%', animation: 'fadeIn 0.2s' }}>
                <button
                  onClick={() => handleScore('incorrect')}
                  style={{
                    flexGrow: 1,
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171',
                    borderRadius: '8px',
                    padding: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <X size={14} />
                  <span>Incorrect</span>
                </button>
                <button
                  onClick={() => handleScore('good')}
                  style={{
                    flexGrow: 1.5,
                    background: 'var(--accent-success)',
                    border: 'none',
                    color: '#fff',
                    borderRadius: '8px',
                    padding: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <Check size={14} />
                  <span>Good / Correct</span>
                </button>
                <button
                  onClick={() => handleScore('easy')}
                  style={{
                    flexGrow: 1,
                    background: 'rgba(6, 182, 212, 0.1)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    color: '#22d3ee',
                    borderRadius: '8px',
                    padding: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <Sparkles size={14} />
                  <span>Easy</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setSessionActive(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              cursor: 'pointer',
              textDecoration: 'underline',
              marginTop: '10px'
            }}
          >
            End Study Session
          </button>
        </div>
      )}

      <style>{`
        .confetti-shower {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image: radial-gradient(circle, #f59e0b 2px, transparent 0),
                            radial-gradient(circle, #8b5cf6 2px, transparent 0),
                            radial-gradient(circle, #10b981 2px, transparent 0),
                            radial-gradient(circle, #ec4899 2px, transparent 0);
          background-size: 15% 15%, 20% 20%, 18% 18%, 22% 22%;
          background-position: 10% 10%, 90% 90%, 30% 80%, 80% 20%;
          animation: confettiBlast 2s ease-out forwards;
        }
        @keyframes confettiBlast {
          0% { background-position: 50% 50%; opacity: 1; }
          100% { background-position: 0% 0%, 100% 100%, 20% 90%, 90% 10%; opacity: 0; }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
