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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 24px',
        borderBottom: '1px solid var(--border-color)',
        zIndex: 10
      }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', fontWeight: 600 }}>Multi-AI Thought Coprocessor</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Refine notes, extract flashcards, and split lectures using Gemini, Ollama, or OpenAI
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
          borderRight: '1px solid var(--border-color)',
          height: '100%',
          backgroundColor: '#0c0d12',
          padding: '20px',
          overflowY: 'auto',
          gap: '16px'
        }}>
          {/* AI Settings Block */}
          <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '0.9rem', fontFamily: 'var(--font-display)', color: '#fff', fontWeight: 600 }}>1. Configure AI Provider</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Provider</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: '#fff',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                >
                  <option value="gemini" style={{ backgroundColor: '#12131a', color: '#f3f4f6' }}>Gemini API</option>
                  <option value="ollama" style={{ backgroundColor: '#12131a', color: '#f3f4f6' }}>Ollama (Local LLM)</option>
                  <option value="openai" style={{ backgroundColor: '#12131a', color: '#f3f4f6' }}>OpenAI API</option>
                  <option value="anthropic" style={{ backgroundColor: '#12131a', color: '#f3f4f6' }}>Anthropic API</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Model</label>
                {provider === 'ollama' && ollamaModels.length > 0 ? (
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      color: '#fff',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  >
                    {ollamaModels.map(m => (
                      <option key={m.id} value={m.id} style={{ backgroundColor: '#12131a', color: '#f3f4f6' }}>
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
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      color: '#fff',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                )}
              </div>
            </div>

            {provider !== 'ollama' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  API Key (leave blank to use server environment variables)
                </label>
                <input
                  type="password"
                  placeholder="Paste custom API key..."
                  value={apiKeyOverride}
                  onChange={(e) => setApiKeyOverride(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    color: '#fff',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
              </div>
            )}
          </div>

          {/* File Upload Zone */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Import Note Materials
            </label>
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: isDragging ? '2px dashed var(--accent-primary)' : '2px dashed var(--border-color)',
                borderRadius: '8px',
                padding: '18px 16px',
                textAlign: 'center',
                backgroundColor: isDragging ? 'rgba(139, 92, 246, 0.05)' : 'rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
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
              <UploadCloud size={28} style={{ color: isDragging ? 'var(--accent-primary)' : 'var(--text-secondary)' }} />
              {extractingText ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RefreshCw size={14} className="spin-anim" />
                  <span style={{ fontSize: '0.8rem', color: '#fff' }}>Extracting text from PDF...</span>
                </div>
              ) : uploadedFileName ? (
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-success)', fontWeight: 650 }}>✓ Loaded: </span>
                  <span style={{ fontSize: '0.8rem', color: '#fff' }}>{uploadedFileName}</span>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 500, margin: 0 }}>Drag & Drop Note PDFs / Text Files</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>or click to browse (.pdf, .txt, .md)</p>
                </div>
              )}
            </div>
          </div>

          {/* Load raw file */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Or Load Existing Note from Vault
            </label>
            <select
              value={selectedNotePath}
              onChange={(e) => {
                setSelectedNotePath(e.target.value);
                loadNoteToRefine(e.target.value);
              }}
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            >
              <option value="" style={{ backgroundColor: '#12131a', color: '#f3f4f6' }}>-- Choose a Note to Load Content --</option>
              {notes.map(n => (
                <option 
                  key={n.absolutePath} 
                  value={n.absolutePath}
                  style={{ backgroundColor: '#12131a', color: '#f3f4f6' }}
                >
                  [{n.subject}] {n.title}
                </option>
              ))}
            </select>
          </div>

          {/* Input text area */}
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '6px', minHeight: '200px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Raw Text Input (Lecture, rough notes, transcription, PDF copy)
            </label>
            <textarea
              placeholder="Paste raw lecture draft or notes here..."
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              style={{
                width: '100%',
                flexGrow: 1,
                backgroundColor: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                borderRadius: '8px',
                padding: '14px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                lineHeight: '1.4',
                outline: 'none',
                resize: 'none'
              }}
            />
          </div>

          {/* Prompt Templates */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Choose Prompt Template
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
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid',
                    fontSize: '0.8rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    backgroundColor: promptTemplate === key && !customPrompt ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.02)',
                    borderColor: promptTemplate === key && !customPrompt ? 'var(--accent-primary)' : 'var(--border-color)',
                    color: promptTemplate === key && !customPrompt ? '#fff' : 'var(--text-secondary)'
                  }}
                >
                  {templates[key].name}
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
                backgroundColor: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '8px 10px',
                color: '#fff',
                fontSize: '0.8rem',
                outline: 'none',
                resize: 'none'
              }}
            />

            <button
              onClick={handleRefining}
              disabled={refining || !rawContent}
              style={{
                background: 'var(--accent-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                fontWeight: 600,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: refining || !rawContent ? 'not-allowed' : 'pointer',
                opacity: refining || !rawContent ? 0.6 : 1,
                transition: 'opacity 0.2s'
              }}
            >
              {refining ? (
                <>
                  <RefreshCw className="spin-anim" size={16} />
                  <span>Refining with {provider.toUpperCase()}...</span>
                </>
              ) : (
                <>
                  <Wand2 size={16} />
                  <span>Run Thought Refinement</span>
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
          backgroundColor: '#07080b',
          padding: '20px',
          gap: '16px',
          overflowY: 'auto'
        }}>
          {/* Output text area */}
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '6px', minHeight: '300px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              AI Structured Output (Editable Markdown)
            </label>
            <textarea
              placeholder="Refined note output will generate here..."
              value={aiOutput}
              onChange={(e) => setAiOutput(e.target.value)}
              style={{
                width: '100%',
                flexGrow: 1,
                backgroundColor: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-color)',
                color: '#e5e7eb',
                borderRadius: '8px',
                padding: '16px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                lineHeight: '1.45',
                outline: 'none',
                resize: 'none'
              }}
            />
          </div>

          {/* Conversational Refinement Chats */}
          {aiOutput && (
            <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={16} style={{ color: 'var(--accent-primary)' }} />
                <h3 style={{ fontSize: '0.9rem', fontFamily: 'var(--font-display)', color: '#fff', fontWeight: 600, margin: 0 }}>
                  Conversational Refinement Loops
                </h3>
              </div>
              
              {chatHistory.length > 0 && (
                <div style={{
                  maxHeight: '110px',
                  overflowY: 'auto',
                  backgroundColor: 'rgba(0,0,0,0.15)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  fontSize: '0.8rem',
                  border: '1px solid var(--border-color)'
                }}>
                  {chatHistory.map((msg, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      gap: '6px',
                      color: msg.role === 'user' ? 'var(--text-secondary)' : '#fff'
                    }}>
                      <span style={{ fontWeight: 600, minWidth: '40px' }}>
                        {msg.role === 'user' ? 'User:' : 'AI:'}
                      </span>
                      <span>{msg.content}</span>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleChatInstruction} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Instruct AI to edit output (e.g. 'convert list to table', 'add summary')..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={refining}
                  style={{
                    flexGrow: 1,
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    color: '#fff',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  disabled={refining || !chatInput.trim()}
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    cursor: refining || !chatInput.trim() ? 'not-allowed' : 'pointer',
                    opacity: refining || !chatInput.trim() ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  {refining ? <RefreshCw className="spin-anim" size={14} /> : <Send size={14} />}
                </button>
              </form>
            </div>
          )}

          {/* Saving parameters */}
          {aiOutput && (
            <div className="glass-panel animate-fade-in" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '0.9rem', fontFamily: 'var(--font-display)', color: '#fff', fontWeight: 600 }}>Save Refined Note to Vault</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Subject Directory</label>
                  <select
                    value={saveSubject}
                    onChange={(e) => setSaveSubject(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      color: '#fff',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  >
                    <option value="GENERAL" style={{ backgroundColor: '#12131a', color: '#f3f4f6' }}>General</option>
                    <option value="OS" style={{ backgroundColor: '#12131a', color: '#f3f4f6' }}>Operating Systems</option>
                    <option value="DSA" style={{ backgroundColor: '#12131a', color: '#f3f4f6' }}>Data Structures</option>
                    <option value="DBMS" style={{ backgroundColor: '#12131a', color: '#f3f4f6' }}>DBMS</option>
                    <option value="DISCRETE_MATHEMATICS" style={{ backgroundColor: '#12131a', color: '#f3f4f6' }}>Discrete Math</option>
                    <option value="COMPUTER_SYSTEM_ARCHITECTURE" style={{ backgroundColor: '#12131a', color: '#f3f4f6' }}>Computer Architecture</option>
                    <option value="CYBER_CN" style={{ backgroundColor: '#12131a', color: '#f3f4f6' }}>Cyber Security & CN</option>
                    <option value="ML" style={{ backgroundColor: '#12131a', color: '#f3f4f6' }}>Machine Learning</option>
                    <option value="OPPS" style={{ backgroundColor: '#12131a', color: '#f3f4f6' }}>OOPs (C++)</option>
                    <option value="STATISTICS" style={{ backgroundColor: '#12131a', color: '#f3f4f6' }}>Statistics</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Filename</label>
                  <input
                    type="text"
                    placeholder="e.g. Page Replacement Algorithms.md"
                    value={saveFilename}
                    onChange={(e) => setSaveFilename(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      color: '#fff',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {saveStatus}
                </span>
                
                <button
                  onClick={handleSaveToVault}
                  style={{
                    background: 'var(--accent-success)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.opacity = 0.9}
                  onMouseOut={(e) => e.target.style.opacity = 1}
                >
                  <Save size={14} />
                  <span>Commit to Vault</span>
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
