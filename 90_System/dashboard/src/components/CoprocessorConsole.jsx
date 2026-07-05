import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Save, FileText, Wand2, RefreshCw, CheckCircle, HelpCircle, UploadCloud, Send, MessageSquare } from 'lucide-react';

export default function CoprocessorConsole({ onSelectNote, preFillContent, clearPreFill }) {
  const [provider, setProvider] = useState('gemini');
  const [model, setModel] = useState('gemini-2.5-flash');

  useEffect(() => {
    if (preFillContent) {
      setRawContent(preFillContent);
      if (clearPreFill) clearPreFill();
    }
  }, [preFillContent]);
  const [apiKeyOverride, setApiKeyOverride] = useState('');
  
  const [notes, setNotes] = useState([]);
  const [selectedNotePath, setSelectedNotePath] = useState('');
  
  const [rawContent, setRawContent] = useState('');
  const [promptTemplate, setPromptTemplate] = useState('refine');
  const [customPrompt, setCustomPrompt] = useState('');
  
  const [aiOutput, setAiOutput] = useState('');
  const [refining, setRefining] = useState(false);
  
  // Save settings
  const [saveSubject, setSaveSubject] = useState('GENERAL');
  const [saveFilename, setSaveFilename] = useState('');
  const [saveStatus, setSaveStatus] = useState('');

  // Ollama integration
  const [ollamaModels, setOllamaModels] = useState([]);
  
  // Drag & drop / upload states
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [extractingText, setExtractingText] = useState(false);

  // Conversational instruction history states
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const fileInputRef = useRef(null);

  // Mapping from select option subject keys to restructured folder names
  const subjectFolderMap = {
    GENERAL: '00_Inbox/inbox_notes',
    OS: '10_Subjects/01_Operating_Systems',
    DSA: '10_Subjects/02_Data_Structures',
    DBMS: '10_Subjects/03_Database_Systems',
    DISCRETE_MATHEMATICS: '10_Subjects/04_Discrete_Mathematics',
    COMPUTER_SYSTEM_ARCHITECTURE: '10_Subjects/05_Computer_Architecture',
    CYBER_CN: '10_Subjects/06_Computer_Networks',
    ML: '10_Subjects/07_Machine_Learning',
    OPPS: '10_Subjects/08_OOPs',
    STATISTICS: '10_Subjects/09_Statistics',
  };

  const parseSubjectKey = (subjName) => {
    if (!subjName) return 'GENERAL';
    const clean = subjName.toUpperCase().replace(/\s+/g, '_');
    if (clean.includes('OPERATING_SYSTEMS') || clean.includes('OPERATING_SYSTEM')) return 'OS';
    if (clean.includes('DATA_STRUCTURES') || clean.includes('DSA')) return 'DSA';
    if (clean.includes('DATABASE_SYSTEMS') || clean.includes('DBMS')) return 'DBMS';
    if (clean.includes('DISCRETE')) return 'DISCRETE_MATHEMATICS';
    if (clean.includes('COMPUTER_ARCHITECTURE') || clean.includes('SYSTEM_ARCHITECTURE') || clean.includes('COMPUTER_SYSTEM_ARCHITECTURE')) return 'COMPUTER_SYSTEM_ARCHITECTURE';
    if (clean.includes('CYBER') || clean.includes('NETWORKS') || clean.includes('CYBER_CN')) return 'CYBER_CN';
    if (clean.includes('MACHINE_LEARNING') || clean.includes('ML')) return 'ML';
    if (clean.includes('OOPS') || clean.includes('OPPS') || clean.includes('OBJECT_ORIENTED')) return 'OPPS';
    if (clean.includes('STATISTICS')) return 'STATISTICS';
    return 'GENERAL';
  };

  // Load existing notes to let user choose
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetch('/api/notes');
        const data = await res.json();
        setNotes(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchNotes();
  }, []);

  // Fetch Ollama models
  useEffect(() => {
    const fetchOllamaModels = async () => {
      try {
        const res = await fetch('/api/ollama/models');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setOllamaModels(data);
          if (provider === 'ollama') {
            const hasMixtral = data.some(m => m.id.includes('mixtral'));
            const hasQwen = data.some(m => m.id.includes('qwen'));
            setModel(hasMixtral ? 'mixtral:latest' : (hasQwen ? 'qwen3.6:latest' : data[0].id));
          }
        }
      } catch (e) {
        console.error('Failed to load Ollama models:', e);
      }
    };
    fetchOllamaModels();
  }, [provider]);

  // Keep model name synced with default selections
  useEffect(() => {
    if (provider === 'gemini') setModel('gemini-2.5-flash');
    else if (provider === 'openai') setModel('gpt-4o');
    else if (provider === 'anthropic') setModel('claude-3-5-sonnet-latest');
    else if (provider === 'ollama') {
      if (ollamaModels.length > 0) {
        const hasMixtral = ollamaModels.some(m => m.id.includes('mixtral'));
        const hasQwen = ollamaModels.some(m => m.id.includes('qwen'));
        setModel(hasMixtral ? 'mixtral:latest' : (hasQwen ? 'qwen3.6:latest' : ollamaModels[0].id));
      } else {
        setModel('llama3');
      }
    }
  }, [provider]);

  const loadNoteToRefine = async (path) => {
    if (!path) return;
    try {
      const res = await fetch(`/api/notes/content?filePath=${encodeURIComponent(path)}`);
      const data = await res.json();
      setRawContent(data.content || '');
      
      const foundNote = notes.find(n => n.absolutePath === path);
      if (foundNote) {
        setSaveSubject(parseSubjectKey(foundNote.subject));
        setSaveFilename(foundNote.filename);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const templates = {
    refine: {
      name: 'Refine & Structurize Note',
      prompt: 'You are an expert university notes refiner. Take the provided text and organize it into a structured Obsidian concept note. Add YAML frontmatter with subject, topic, concept, type: concept, status: refined, tags: [university]. Break the content into logical sections with subheaders. Keep equations in LaTeX format ($ for inline, $$ for block). Do not add any conversational filler; output only the markdown note.'
    },
    flashcards: {
      name: 'Extract Active Recall Flashcards',
      prompt: 'Read the following concept notes and extract a set of active recall flashcards. Format them using Obsidian standard double colon (::) for inline cards (Question :: Answer) and double question mark (??) for multiline cards. Tag the sections with #flashcards. Provide a mix of definitional, conceptual, and mathematical cards based strictly on the text. Return only the markdown flashcards.'
    },
    summarize: {
      name: 'Simplify & Explain Concept',
      prompt: 'Explain the dense concept below in a simple, intuitive way for a student, while preserving technical accuracy. Use analogies, diagrams (in text or lists), and a clear step-by-step breakdown. Add a "Why it matters" section. Return only the markdown.'
    },
    split: {
      name: 'Split into Atomic Concepts',
      prompt: 'Review the text and split it into multiple, distinct, atomic concepts. For each concept, output the proposed filename using spaces, e.g. "=== NOTE: Virtual Memory.md ===" followed by the note content containing frontmatter and links, and close with "=== END ===". Link related notes to each other using Obsidian wiki links.'
    }
  };

  const handleRefining = async () => {
    setRefining(true);
    setAiOutput('');
    
    const activePrompt = customPrompt || templates[promptTemplate].prompt;
    
    // Add to instruction history
    const initialInstruction = customPrompt ? `Custom Instruction: ${customPrompt}` : templates[promptTemplate].name;
    setChatHistory([{ role: 'user', content: initialInstruction }]);

    try {
      const res = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          model,
          prompt: activePrompt,
          content: rawContent,
          apiKeyOverride: apiKeyOverride || undefined
        })
      });
      const data = await res.json();
      if (data.error) {
        setAiOutput(`Error from server: ${data.error}`);
        setChatHistory(prev => [...prev, { role: 'assistant', content: `Error: ${data.error}` }]);
      } else {
        setAiOutput(data.result || '');
        setChatHistory(prev => [...prev, { role: 'assistant', content: 'Initial refined note compiled successfully.' }]);
        
        // Auto-guess filename if not set
        if (!saveFilename) {
          const firstLine = (data.result || '').split('\n').find(l => l.startsWith('# '));
          if (firstLine) {
            setSaveFilename(firstLine.replace('# ', '').trim() + '.md');
          } else {
            setSaveFilename('New Refined Note.md');
          }
        }
      }
    } catch (e) {
      setAiOutput(`Failed to contact refinement server: ${e.message}`);
      setChatHistory(prev => [...prev, { role: 'assistant', content: `Error: ${e.message}` }]);
    } finally {
      setRefining(false);
    }
  };

  // Conversational Refinement Chat Instruction
  const handleChatInstruction = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || refining || !aiOutput) return;

    const instruction = chatInput.trim();
    setChatInput('');
    setRefining(true);

    setChatHistory(prev => [...prev, { role: 'user', content: instruction }]);

    const prompt = `You are a university study notes assistant. Take the current markdown content and edit it according to the following instruction: "${instruction}". Keep the output format in clean Obsidian markdown, preserving all YAML headers and flashcards where applicable. Do not include any conversational text or explanation; return ONLY the modified note.`;

    try {
      const res = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          model,
          prompt,
          content: aiOutput,
          apiKeyOverride: apiKeyOverride || undefined
        })
      });

      const data = await res.json();
      if (data.error) {
        setChatHistory(prev => [...prev, { role: 'assistant', content: `Modification failed: ${data.error}` }]);
      } else {
        setAiOutput(data.result || '');
        setChatHistory(prev => [...prev, { role: 'assistant', content: `Note updated: "${instruction}" applied.` }]);
      }
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }]);
    } finally {
      setRefining(false);
    }
  };

  // PDF Text Extraction using client-side pdf.js
  const handlePdfTextExtraction = async (file) => {
    setExtractingText(true);
    setUploadedFileName(file.name);
    
    // Auto fill save filename
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    setSaveFilename(baseName + '.md');
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Load PDFJS from CDN dynamically
      if (!window.pdfjsLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
        document.head.appendChild(script);
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }
      
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
      
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += `--- Page ${i} ---\n` + pageText + '\n\n';
      }
      
      setRawContent(fullText.trim());
    } catch (e) {
      console.error(e);
      alert(`Failed to extract text from PDF: ${e.message}`);
    } finally {
      setExtractingText(false);
    }
  };

  // File drop / upload handlers
  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      processUploadedFile(file);
    }
  };

  const processUploadedFile = (file) => {
    if (file.type === 'application/pdf') {
      handlePdfTextExtraction(file);
    } else if (file.type === 'text/plain' || file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setRawContent(e.target.result);
        setUploadedFileName(file.name);
        const baseName = file.name.replace(/\.[^/.]+$/, "");
        setSaveFilename(baseName + '.md');
      };
      reader.readAsText(file);
    } else {
      alert('Supported file types are PDF, TXT, and Markdown (.md).');
    }
  };

  const handleSaveToVault = async () => {
    if (!saveFilename) {
      setSaveStatus('Filename is required.');
      return;
    }

    const cleanFilename = saveFilename.endsWith('.md') ? saveFilename : `${saveFilename}.md`;
    const folderPath = subjectFolderMap[saveSubject] || '00_Inbox/inbox_notes';
    const filePath = `${folderPath}/${cleanFilename}`;

    setSaveStatus('Saving note...');

    try {
      // 1. Save File
      const res = await fetch('/api/notes/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filePath,
          content: aiOutput
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setSaveStatus('Note Saved! Triggering Graphify sync...');
        
        // 2. Rebuild Graphify
        const rebuildRes = await fetch('/api/graph/rebuild', { method: 'POST' });
        const rebuildData = await rebuildRes.json();
        
        if (rebuildData.success) {
          setSaveStatus('Success: Saved & Synced!');
        } else {
          setSaveStatus('Saved, but Graphify sync failed. Check server console.');
        }
        
        setTimeout(() => setSaveStatus(''), 4000);
      } else {
        setSaveStatus(`Failed to save: ${data.error}`);
      }
    } catch (e) {
      setSaveStatus(`Error: ${e.message}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', backgroundColor: '#020306' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        borderBottom: '1px solid rgba(0, 246, 255, 0.15)',
        backgroundColor: 'rgba(6,12,22,0.85)',
        zIndex: 10
      }}>
        <div>
          <h2 style={{ fontSize: '0.95rem', fontFamily: 'var(--font-hud)', fontWeight: 900, color: '#fff', letterSpacing: '1px', textTransform: 'uppercase', margin: 0 }}>
            Multi-AI Thought Coprocessor Core
          </h2>
          <p style={{ fontSize: '0.62rem', color: '#ff6a00', fontFamily: 'var(--font-tech)', letterSpacing: '0.8px', margin: '4px 0 0 0' }}>
            ACTIVE COGNITIVE ARCHITECTURE • SYNTHESIS MODULE
          </p>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div style={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
        
        {/* Left Side: Parameters and Input */}
        <div style={{
          width: '50%',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid rgba(0, 246, 255, 0.15)',
          height: '100%',
          backgroundColor: 'rgba(6, 12, 22, 0.55)',
          padding: '20px',
          overflowY: 'auto',
          gap: '20px'
        }} className="custom-scrollbar">
          
          {/* AI Settings Block */}
          <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1.2px solid rgba(0, 246, 255, 0.2)' }}>
            <h3 style={{ fontSize: '0.68rem', fontFamily: 'var(--font-hud)', color: '#00f6ff', fontWeight: 800, letterSpacing: '0.8px', borderBottom: '1px dashed rgba(0, 246, 255, 0.15)', paddingBottom: '8px', margin: 0 }}>
              [COPROCESSOR ARBITRATION]
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-hud)', marginBottom: '6px' }}>PROVIDER</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(2, 3, 6, 0.8)',
                    border: '1.2px solid rgba(0, 246, 255, 0.25)',
                    color: '#00f6ff',
                    borderRadius: '4px',
                    padding: '8px 10px',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-tech)',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="gemini">Gemini API</option>
                  <option value="ollama">Ollama (Local LLM)</option>
                  <option value="openai">OpenAI API</option>
                  <option value="anthropic">Anthropic API</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-hud)', marginBottom: '6px' }}>MODEL ARRAY</label>
                {provider === 'ollama' && ollamaModels.length > 0 ? (
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(2, 3, 6, 0.8)',
                      border: '1.2px solid rgba(0, 246, 255, 0.25)',
                      color: '#00f6ff',
                      borderRadius: '4px',
                      padding: '8px 10px',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-tech)',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {ollamaModels.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(2, 3, 6, 0.8)',
                      border: '1.2px solid rgba(0, 246, 255, 0.25)',
                      color: '#fff',
                      borderRadius: '4px',
                      padding: '8px 10px',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-tech)',
                      outline: 'none'
                    }}
                  />
                )}
              </div>
            </div>

            {provider !== 'ollama' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-hud)', marginBottom: '6px' }}>
                  CUSTOM ACCESS TOKENS (OVERRIDE)
                </label>
                <input
                  type="password"
                  placeholder="USE DEFAULTS..."
                  value={apiKeyOverride}
                  onChange={(e) => setApiKeyOverride(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(2, 3, 6, 0.8)',
                    border: '1.2px solid rgba(0, 246, 255, 0.25)',
                    color: '#fff',
                    borderRadius: '4px',
                    padding: '8px 10px',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-tech)',
                    outline: 'none'
                  }}
                />
              </div>
            )}
          </div>

          {/* File Ingestion */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.62rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-hud)', letterSpacing: '0.8px' }}>
              QUANTUM INGESTION ARRAY
            </label>
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: isDragging ? '1.2px solid #ff6a00' : '1.2px dashed rgba(255, 106, 0, 0.25)',
                borderRadius: '4px',
                padding: '20px 16px',
                textAlign: 'center',
                backgroundColor: isDragging ? 'rgba(255, 106, 0, 0.05)' : 'rgba(2, 3, 6, 0.35)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                boxShadow: isDragging ? '0 0 15px rgba(255, 106, 0, 0.15)' : 'none'
              }}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept=".pdf,.txt,.md"
                onChange={(e) => {
                  if (e.target.files?.length) {
                    processUploadedFile(e.target.files[0]);
                  }
                }}
              />
              <UploadCloud size={24} style={{ color: isDragging ? '#ff6a00' : 'rgba(255, 106, 0, 0.65)' }} />
              {extractingText ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RefreshCw size={12} className="spin-anim" style={{ color: '#ff6a00' }} />
                  <span style={{ fontSize: '0.72rem', color: '#ff6a00', fontFamily: 'var(--font-tech)' }}>EXTRACTING TEXT FIELDS FROM SLIDES...</span>
                </div>
              ) : uploadedFileName ? (
                <div style={{ fontFamily: 'var(--font-tech)' }}>
                  <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 800 }}>✓ SEEDED: </span>
                  <span style={{ fontSize: '0.72rem', color: '#fff' }}>{uploadedFileName}</span>
                </div>
              ) : (
                <div style={{ fontFamily: 'var(--font-tech)' }}>
                  <p style={{ fontSize: '0.75rem', color: '#fff', fontWeight: 600, margin: 0 }}>DRAG & DROP note MATERIALS</p>
                  <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', margin: '4px 0 0 0' }}>or browse (.pdf, .txt, .md)</p>
                </div>
              )}
            </div>
          </div>

          {/* Load existing note */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.62rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-hud)', letterSpacing: '0.8px' }}>
              PULL VAULT DOCUMENT SECTORS
            </label>
            <select
              value={selectedNotePath}
              onChange={(e) => {
                setSelectedNotePath(e.target.value);
                loadNoteToRefine(e.target.value);
              }}
              style={{
                width: '100%',
                backgroundColor: 'rgba(2, 3, 6, 0.8)',
                border: '1.2px solid rgba(0, 246, 255, 0.25)',
                color: '#00f6ff',
                borderRadius: '4px',
                padding: '10px',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-tech)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="" style={{ color: 'rgba(255,255,255,0.3)' }}>-- TARGET VAULT INDEX --</option>
              {notes.map(n => (
                <option key={n.absolutePath} value={n.absolutePath}>
                  [{n.subject}] {n.title}
                </option>
              ))}
            </select>
          </div>

          {/* Input text area */}
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '200px' }}>
            <label style={{ fontSize: '0.62rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-hud)', letterSpacing: '0.8px' }}>
              RAW SOURCE FIELD (TEXT / INGEST DATA)
            </label>
            <textarea
              placeholder="Paste raw lecture draft or notes here..."
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              style={{
                width: '100%',
                flexGrow: 1,
                backgroundColor: 'rgba(2, 3, 6, 0.65)',
                border: '1.2px solid rgba(0, 246, 255, 0.25)',
                color: '#fff',
                borderRadius: '4px',
                padding: '14px',
                fontFamily: 'var(--font-tech)',
                fontSize: '0.82rem',
                lineHeight: '1.4',
                outline: 'none',
                resize: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#00f6ff'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(0, 246, 255, 0.25)'}
            />
          </div>

          {/* Prompt Templates */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ fontSize: '0.62rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-hud)', letterSpacing: '0.8px' }}>
              DIRECTIVE REACTION SCHEMA
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {Object.keys(templates).map(key => (
                <button
                  key={key}
                  onClick={() => {
                    setPromptTemplate(key);
                    setCustomPrompt('');
                  }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '4px',
                    border: '1px solid',
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-hud)',
                    fontWeight: 'bold',
                    letterSpacing: '0.5px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    backgroundColor: promptTemplate === key && !customPrompt ? 'rgba(0, 246, 255, 0.05)' : 'rgba(255,255,255,0.01)',
                    borderColor: promptTemplate === key && !customPrompt ? '#00f6ff' : 'rgba(0,246,255,0.15)',
                    color: promptTemplate === key && !customPrompt ? '#00f6ff' : 'rgba(255,255,255,0.5)',
                    boxShadow: promptTemplate === key && !customPrompt ? '0 0 10px rgba(0,246,255,0.1)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  {templates[key].name.toUpperCase()}
                </button>
              ))}
            </div>

            <textarea
              placeholder="Or write custom instructions here (overrides templates)..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              style={{
                width: '100%',
                height: '60px',
                backgroundColor: 'rgba(2, 3, 6, 0.65)',
                border: '1.2px solid rgba(0, 246, 255, 0.25)',
                borderRadius: '4px',
                padding: '10px 12px',
                color: '#fff',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-tech)',
                outline: 'none',
                resize: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#00f6ff'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(0, 246, 255, 0.25)'}
            />

            <button
              onClick={handleRefining}
              disabled={refining || !rawContent}
              style={{
                background: refining || !rawContent ? 'transparent' : '#00f6ff',
                color: refining || !rawContent ? 'rgba(255,255,255,0.25)' : '#020306',
                border: refining || !rawContent ? '1.2px solid rgba(255,255,255,0.15)' : 'none',
                borderRadius: '4px',
                padding: '12px',
                fontWeight: 'bold',
                fontFamily: 'var(--font-hud)',
                fontSize: '0.78rem',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: refining || !rawContent ? 'not-allowed' : 'pointer',
                boxShadow: refining || !rawContent ? 'none' : '0 0 15px rgba(0,246,255,0.35)',
                transition: 'all 0.2s',
                outline: 'none'
              }}
            >
              {refining ? (
                <>
                  <RefreshCw className="spin-anim" size={14} />
                  <span>EXECUTING REFINEMENT WITH {provider.toUpperCase()}...</span>
                </>
              ) : (
                <>
                  <Wand2 size={14} />
                  <span>INITIALIZE REFINEMENT LAYER</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Output and Saving */}
        <div style={{
          width: '50%',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          backgroundColor: 'rgba(2,3,6,0.3)',
          padding: '20px',
          gap: '20px',
          overflowY: 'auto'
        }} className="custom-scrollbar">
          
          {/* Output text area */}
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '300px' }}>
            <label style={{ fontSize: '0.62rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-hud)', letterSpacing: '0.8px' }}>
              REFINED note OUTPUT LAYER (EDITABLE MARKDOWN)
            </label>
            <textarea
              placeholder="Refined note output will generate here..."
              value={aiOutput}
              onChange={(e) => setAiOutput(e.target.value)}
              style={{
                width: '100%',
                flexGrow: 1,
                backgroundColor: 'rgba(2, 3, 6, 0.65)',
                border: '1.2px solid rgba(255, 106, 0, 0.25)',
                color: '#e5e7eb',
                borderRadius: '4px',
                padding: '16px',
                fontFamily: 'var(--font-tech)',
                fontSize: '0.82rem',
                lineHeight: '1.45',
                outline: 'none',
                resize: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#ff6a00'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 106, 0, 0.25)'}
            />
          </div>

          {/* Conversational Refinement Chats */}
          {aiOutput && (
            <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1.2px solid rgba(255, 106, 0, 0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '6px' }}>
                <MessageSquare size={14} style={{ color: '#ff6a00' }} />
                <h3 style={{ fontSize: '0.68rem', fontFamily: 'var(--font-hud)', color: '#fff', fontWeight: 800, margin: 0, letterSpacing: '0.5px' }}>
                  REFACTOR DIALOG FIELD
                </h3>
              </div>
              
              {chatHistory.length > 0 && (
                <div style={{
                  maxHeight: '110px',
                  overflowY: 'auto',
                  backgroundColor: 'rgba(2,3,6,0.65)',
                  borderRadius: '2px',
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  fontSize: '0.78rem',
                  fontFamily: 'var(--font-tech)',
                  border: '1px solid rgba(255, 106, 0, 0.15)'
                }} className="custom-scrollbar">
                  {chatHistory.map((msg, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      gap: '8px',
                      color: msg.role === 'user' ? 'rgba(255,255,255,0.45)' : '#ff6a00'
                    }}>
                      <span style={{ fontWeight: 'bold', minWidth: '45px' }}>
                        {msg.role === 'user' ? '[USER]:' : '[AI]:'}
                      </span>
                      <span>{msg.content}</span>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleChatInstruction} style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Direct compiler instruction (e.g. 'translate to table')..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={refining}
                  style={{
                    flexGrow: 1,
                    backgroundColor: 'rgba(2,3,6,0.65)',
                    border: '1.2px solid rgba(255, 106, 0, 0.25)',
                    color: '#fff',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-tech)',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  disabled={refining || !chatInput.trim()}
                  style={{
                    backgroundColor: chatInput.trim() ? '#ff6a00' : 'transparent',
                    color: chatInput.trim() ? '#020306' : 'rgba(255,255,255,0.25)',
                    border: chatInput.trim() ? 'none' : '1.2px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px',
                    padding: '8px 14px',
                    cursor: refining || !chatInput.trim() ? 'not-allowed' : 'pointer',
                    boxShadow: chatInput.trim() ? '0 0 10px rgba(255, 106, 0, 0.3)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                >
                  {refining ? <RefreshCw className="spin-anim" size={12} /> : <Send size={12} />}
                </button>
              </form>
            </div>
          )}

          {/* Saving parameters */}
          {aiOutput && (
            <div className="glass-panel animate-fade-in" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1.2px solid rgba(16, 185, 129, 0.25)' }}>
              <h3 style={{ fontSize: '0.68rem', fontFamily: 'var(--font-hud)', color: '#10b981', fontWeight: 800, margin: 0, letterSpacing: '0.5px' }}>
                COMMIT KNOWLEDGE SECTOR
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-hud)', marginBottom: '4px' }}>SUBJECT SEGMENT</label>
                  <select
                    value={saveSubject}
                    onChange={(e) => setSaveSubject(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(2, 3, 6, 0.8)',
                      border: '1.2px solid rgba(16, 185, 129, 0.25)',
                      color: '#10b981',
                      borderRadius: '4px',
                      padding: '8px 10px',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-tech)',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="GENERAL">General</option>
                    <option value="OS">Operating Systems</option>
                    <option value="DSA">Data Structures</option>
                    <option value="DBMS">DBMS</option>
                    <option value="DISCRETE_MATHEMATICS">Discrete Math</option>
                    <option value="COMPUTER_SYSTEM_ARCHITECTURE">Computer Architecture</option>
                    <option value="CYBER_CN">Cyber Security & CN</option>
                    <option value="ML">Machine Learning</option>
                    <option value="OPPS">OOPs (C++)</option>
                    <option value="STATISTICS">Statistics</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-hud)', marginBottom: '4px' }}>IDENTIFIER FILENAME</label>
                  <input
                    type="text"
                    placeholder="e.g. Page Replacement.md"
                    value={saveFilename}
                    onChange={(e) => setSaveFilename(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(2, 3, 6, 0.8)',
                      border: '1.2px solid rgba(16, 185, 129, 0.25)',
                      color: '#fff',
                      borderRadius: '4px',
                      padding: '8px 10px',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-tech)',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '10px' }}>
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-tech)' }}>
                  {saveStatus.toUpperCase()}
                </span>
                
                <button
                  onClick={handleSaveToVault}
                  style={{
                    background: '#10b981',
                    color: '#020306',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '8px 16px',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-hud)',
                    fontWeight: 'bold',
                    letterSpacing: '1px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    boxShadow: '0 0 10px rgba(16, 185, 129, 0.3)',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                >
                  <Save size={12} />
                  <span>COMMIT TO VAULT</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
      
      <style>{`
        .spin-anim {
          animation: spin 1.5s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
