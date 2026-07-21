import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Plus, 
  Trash2, 
  Save, 
  Cpu, 
  History, 
  BookOpen, 
  Archive, 
  CheckCircle, 
  FolderPlus,
  ArrowRight,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX
} from 'lucide-react';

export default function AIChatConsole({ onSelectNote }) {
  const [provider, setProvider] = useState('gemini');
  const [model, setModel] = useState('gemini-2.5-flash');
  const [apiKeyOverride, setApiKeyOverride] = useState('');
  
  // Conversations list & Active Chat
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  
  // Save modal/drawer state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [saveTopic, setSaveTopic] = useState('');
  const [isStaging, setIsStaging] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [savedFileLink, setSavedFileLink] = useState(null);

  const [isListening, setIsListening] = useState(false);
  const [speakOutput, setSpeakOutput] = useState(true);
  const [recognition, setRecognition] = useState(null);

  const messagesEndRef = useRef(null);

  // Fetch saved chat history files on mount
  const [ollamaModels, setOllamaModels] = useState([]);

  // Initialize Speech Recognition Core
  useEffect(() => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-US';
        
        rec.onstart = () => {
          setIsListening(true);
        };
        
        rec.onend = () => {
          setIsListening(false);
        };
        
        rec.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInputMessage(prev => prev ? prev + ' ' + transcript : transcript);
        };
        
        setRecognition(rec);
      }
    } catch (_) {}
  }, []);

  const toggleListening = () => {
    if (!recognition) {
      alert("Speech recognition is not supported in this browser environment.");
      return;
    }
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const speakAARCResponse = (text) => {
    try {
      window.speechSynthesis.cancel(); // Abort any ongoing syntheses
      
      // Clean markdown tags, LaTeX, and code snippets from oral readouts
      let cleanText = text
        .replace(/`{3}[\s\S]*?`{3}/g, '[code block]')
        .replace(/`[\s\S]*?`/g, '') 
        .replace(/\$\$[\s\S]*?\$\$/g, '[math equation]')
        .replace(/\$[\s\S]*?\$/g, '')
        .replace(/[#*_-]/g, '')
        .trim();

      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const voices = window.speechSynthesis.getVoices();
      
      // Search for British accent profile
      const britishVoice = voices.find(v => 
        v.lang.includes('en-GB') || 
        v.name.toLowerCase().includes('british') || 
        v.name.toLowerCase().includes('hazel') || 
        v.name.toLowerCase().includes('uk')
      );
      
      if (britishVoice) {
        utterance.voice = britishVoice;
      }
      utterance.pitch = 0.95;
      utterance.rate = 1.05;
      
      window.speechSynthesis.speak(utterance);
    } catch (_) {}
  };

  const fetchChatHistory = async () => {
    try {
      const res = await fetch('/api/chat/history');
      const data = await res.json();
      setChatHistory(data);
    } catch (e) {
      console.error('Error fetching chat history:', e);
    }
  };

  const fetchOllamaModels = async () => {
    try {
      const res = await fetch('/api/ollama/models');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setOllamaModels(data);
      } else {
        setOllamaModels([
          { id: 'mixtral:latest', name: 'mixtral:latest (Fallback)' },
          { id: 'qwen3.6:latest', name: 'qwen3.6:latest (Fallback)' }
        ]);
      }
    } catch (e) {
      console.error('Error fetching Ollama models:', e);
    }
  };

  useEffect(() => {
    fetchChatHistory();
    fetchOllamaModels();
  }, []);

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Model choices based on provider
  const getModelsForProvider = (prov) => {
    switch (prov) {
      case 'gemini':
        return [
          { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Fast)' },
          { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Deep reasoning)' }
        ];
      case 'openai':
        return [
          { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
          { id: 'gpt-4o', name: 'GPT-4o (Standard)' },
          { id: 'o1-mini', name: 'o1 Mini (Reasoning)' }
        ];
      case 'ollama':
        return ollamaModels;
      case 'anthropic':
        return [
          { id: 'claude-3-5-sonnet-latest', name: 'Claude 3.5 Sonnet' },
          { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku (Fast)' }
        ];
      default:
        return [];
    }
  };

  // Switch models list when provider changes
  useEffect(() => {
    const list = getModelsForProvider(provider);
    if (list.length > 0) {
      // Avoid resetting model selection to first element if it's already set
      const modelExists = list.some(m => m.id === model);
      if (!modelExists) {
        setModel(list[0].id);
      }
    }
  }, [provider, ollamaModels]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || sending) return;

    const userMsg = { role: 'user', content: inputMessage.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputMessage('');
    setSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          model,
          messages: updatedMessages,
          apiKeyOverride: apiKeyOverride || undefined
        })
      });
      const data = await res.json();
      if (data.error) {
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error}` }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.result || '',
          routedModel: data.routedModel,
          category: data.category
        }]);
        if (speakOutput && data.result) {
          speakAARCResponse(data.result);
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error sending request: ${error.message}` }]);
    } finally {
      setSending(false);
    }
  };

  const startNewChat = () => {
    if (messages.length > 0 && window.confirm('Clear active chat session?')) {
      setMessages([]);
    } else if (messages.length === 0) {
      setMessages([]);
    }
    setSaveTitle('');
    setSaveTopic('');
    setSavedFileLink(null);
  };

  const triggerSaveChat = () => {
    if (messages.length === 0) return;
    
    // Guess a default title based on first user message
    const firstUserMsg = messages.find(m => m.role === 'user')?.content || 'Session';
    const cleanTitle = firstUserMsg.slice(0, 30).trim() + (firstUserMsg.length > 30 ? '...' : '');
    setSaveTitle(cleanTitle);
    setShowSaveModal(true);
    setSaveStatus('');
    setSavedFileLink(null);
  };

  const handleSaveChat = async () => {
    if (!saveTitle.trim()) {
      setSaveStatus('Please provide a note title.');
      return;
    }
    
    setSaveStatus('Generating textbook synthesis...');
    try {
      const res = await fetch('/api/chat/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          model,
          messages,
          title: saveTitle.trim(),
          topic: isStaging ? (saveTopic.trim() || 'Staged') : undefined,
          apiKeyOverride: apiKeyOverride || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatus('Saved successfully in Obsidian!');
        setSavedFileLink(data.filePath);
        fetchChatHistory(); // refresh history panel
        setTimeout(() => {
          setShowSaveModal(false);
        }, 3000);
      } else {
        setSaveStatus(`Failed to save: ${data.error}`);
      }
    } catch (e) {
      setSaveStatus(`Error saving: ${e.message}`);
    }
  };

  // Load a chat from history logs
  const loadArchivedChat = async (chatFile) => {
    try {
      const res = await fetch(`/api/notes/content?filePath=${encodeURIComponent(chatFile.absolutePath)}`);
      const data = await res.json();
      
      // Parse out the collapsed full conversation history JSON or text block
      const content = data.content || '';
      const detailsMatch = content.match(/<details>[\s\S]*?<summary>[\s\S]*?<\/summary>([\s\S]*?)<\/details>/);
      
      if (detailsMatch) {
        // Parse raw turns
        const rawHistoryBlock = detailsMatch[1].trim();
        const turnRegex = /\*\*(USER|ASSISTANT)\*\*:\s*([\s\S]*?)(?=(?:\*\*(?:USER|ASSISTANT)\*\*:\s*)|$)/g;
        
        let match;
        const parsedMessages = [];
        while ((match = turnRegex.exec(rawHistoryBlock)) !== null) {
          parsedMessages.push({
            role: match[1].toLowerCase(),
            content: match[2].trim()
          });
        }
        
        if (parsedMessages.length > 0) {
          setMessages(parsedMessages);
          setSaveTitle(chatFile.title);
          if (chatFile.topic !== 'GENERAL') {
            setIsStaging(true);
            setSaveTopic(chatFile.topic);
          } else {
            setIsStaging(false);
            setSaveTopic('');
          }
          return;
        }
      }
      
      // Fallback: load whole document as a single system notification if parsing fails
      setMessages([
        { role: 'assistant', content: `### Loaded Synthesis Note:\n\n${content}` }
      ]);
    } catch (e) {
      alert(`Error loading archived chat: ${e.message}`);
    }
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#020306' }}>
      
      {/* 1. Left Sidebar: Chat History Archive */}
      <div className="glass-panel" style={{
        width: '280px',
        borderRight: '1px solid rgba(0, 246, 255, 0.15)',
        borderTop: 'none',
        borderBottom: 'none',
        borderLeft: 'none',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'rgba(6,12,22,0.65)',
        flexShrink: 0,
        borderRadius: 0
      }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(0, 246, 255, 0.15)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={15} style={{ color: '#ff6a00' }} />
            <h3 style={{ fontSize: '0.75rem', fontFamily: 'var(--font-hud)', fontWeight: 800, color: '#fff', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Archive Indexes
            </h3>
          </div>
          
          <button 
            onClick={startNewChat}
            style={{
              width: '100%',
              backgroundColor: 'rgba(0, 246, 255, 0.05)',
              color: '#00f6ff',
              border: '1.2px solid #00f6ff',
              borderRadius: '4px',
              padding: '10px',
              fontSize: '0.7rem',
              fontWeight: 'bold',
              fontFamily: 'var(--font-hud)',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 0 10px rgba(0,246,255,0.1)',
              transition: 'all 0.25s'
            }}
            onMouseOver={e => {
              e.currentTarget.style.backgroundColor = '#00f6ff';
              e.currentTarget.style.color = '#020306';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(0,246,255,0.35)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 246, 255, 0.05)';
              e.currentTarget.style.color = '#00f6ff';
              e.currentTarget.style.boxShadow = '0 0 10px rgba(0,246,255,0.1)';
            }}
          >
            <Plus size={12} />
            <span>New Chat Array</span>
          </button>
        </div>

        {/* Saved List */}
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '12px' }} className="custom-scrollbar">
          {chatHistory.length === 0 ? (
            <div style={{ padding: '24px 10px', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '0.68rem', fontFamily: 'var(--font-tech)' }}>
              NO DATA INGESTED IN ARCHIVES
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {chatHistory.map((chat) => (
                <button
                  key={chat.absolutePath}
                  onClick={() => loadArchivedChat(chat)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '6px',
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '4px',
                    border: '1px solid rgba(0, 246, 255, 0.15)',
                    backgroundColor: 'rgba(6, 12, 22, 0.45)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#ff6a00';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 106, 0, 0.04)';
                    e.currentTarget.style.boxShadow = '0 0 10px rgba(255, 106, 0, 0.1)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0, 246, 255, 0.15)';
                    e.currentTarget.style.backgroundColor = 'rgba(6, 12, 22, 0.45)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Neon Left Indicator */}
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '2px',
                    backgroundColor: chat.topic === 'GENERAL' ? '#00f6ff' : '#ff6a00'
                  }} />

                  <span style={{ 
                    fontSize: '0.78rem', 
                    color: '#fff', 
                    fontWeight: 600,
                    fontFamily: 'var(--font-tech)',
                    display: '-webkit-box', 
                    WebkitLineClamp: 2, 
                    WebkitBoxOrient: 'vertical', 
                    overflow: 'hidden',
                    lineHeight: '1.3'
                  }}>
                    {chat.title}
                  </span>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.62rem', color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-tech)' }}>
                    <span style={{ 
                      color: chat.topic === 'GENERAL' ? '#00f6ff' : '#ff6a00', 
                      fontWeight: 700 
                    }}>
                      [{chat.topic}]
                    </span>
                    <span>
                      {new Date(chat.updatedAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Main Chat Panel */}
      <div style={{ flexGrow: 1, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        
        {/* Chat Panel Header (Config) */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid rgba(0, 246, 255, 0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(6,12,22,0.85)',
          zIndex: 10
        }}>
          <div>
            <h2 style={{ fontSize: '0.9rem', fontFamily: 'var(--font-hud)', fontWeight: 900, color: '#fff', letterSpacing: '1px', textTransform: 'uppercase', margin: 0 }}>
              Cognitive Core Chat Console
            </h2>
            <span style={{ fontSize: '0.62rem', color: '#ff6a00', fontFamily: 'var(--font-tech)', letterSpacing: '0.8px' }}>
              AUTOSAVING ACTIVE TO Obsidian note VAULT
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Provider Selector */}
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              style={{
                backgroundColor: 'rgba(2, 3, 6, 0.8)',
                border: '1.2px solid rgba(0, 246, 255, 0.25)',
                color: '#00f6ff',
                borderRadius: '4px',
                padding: '6px 12px',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-tech)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="gemini">Gemini API</option>
              <option value="openai">OpenAI API</option>
              <option value="anthropic">Anthropic Claude</option>
              <option value="ollama">Ollama (Local LLM)</option>
            </select>

            {/* Model Selector */}
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              style={{
                backgroundColor: 'rgba(2, 3, 6, 0.8)',
                border: '1.2px solid rgba(0, 246, 255, 0.25)',
                color: '#00f6ff',
                borderRadius: '4px',
                padding: '6px 12px',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-tech)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {getModelsForProvider(provider).map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>

            {/* API Key Override (if not configured in backend .env) */}
            {provider !== 'ollama' && (
              <input
                type="password"
                placeholder="CUSTOM KEY OVERRIDE"
                value={apiKeyOverride}
                onChange={(e) => setApiKeyOverride(e.target.value)}
                style={{
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  border: '1.2px solid rgba(0, 246, 255, 0.25)',
                  color: '#fff',
                  borderRadius: '4px',
                  padding: '6px 10px',
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-tech)',
                  width: '130px',
                  outline: 'none'
                }}
              />
            )}

            {/* Actions */}
            {messages.length > 0 && (
              <>
                <button
                  onClick={triggerSaveChat}
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.05)',
                    color: '#10b981',
                    border: '1.2px solid #10b981',
                    borderRadius: '4px',
                    padding: '6px 12px',
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-hud)',
                    fontWeight: 'bold',
                    letterSpacing: '1px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 0 10px rgba(16,185,129,0.15)',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.backgroundColor = '#10b981';
                    e.currentTarget.style.color = '#020306';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.05)';
                    e.currentTarget.style.color = '#10b981';
                  }}
                >
                  <Save size={12} />
                  <span>SAVE TRANSCRIPT</span>
                </button>

                <button
                  onClick={startNewChat}
                  style={{
                    backgroundColor: 'transparent',
                    color: 'rgba(255,255,255,0.4)',
                    border: '1.2px solid rgba(255,255,255,0.2)',
                    borderRadius: '4px',
                    padding: '6px 10px',
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-hud)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={e => e.currentTarget.style.borderColor = '#ff5500'}
                  onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
                >
                  CLEAR
                </button>
              </>
            )}
          </div>
        </div>

        {/* Messages Stream */}
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }} className="custom-scrollbar">
          {messages.length === 0 ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              flexGrow: 1, 
              color: 'rgba(255, 255, 255, 0.3)',
              textAlign: 'center',
              gap: '16px',
              maxWidth: '480px',
              margin: '0 auto'
            }}>
              <MessageSquare size={36} style={{ color: '#00f6ff', opacity: 0.6 }} />
              <div>
                <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 800, fontFamily: 'var(--font-hud)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                  A.R.C. COPROCESSOR INTERACTIVE ARRAY
                </h4>
                <p style={{ fontSize: '0.75rem', lineHeight: '1.5', fontFamily: 'var(--font-tech)', color: 'rgba(255,255,255,0.5)' }}>
                  Submit thoughts, debug concepts, or plan architectures. Synthesizing saves active sessions as concept nodes directly into subjects with automated cards.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div 
                key={i} 
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  width: '100%',
                  animation: 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                }}
              >
                <div 
                  className="glass-panel"
                  style={{
                    maxWidth: '85%',
                    padding: '16px 20px',
                    borderRadius: '4px',
                    border: msg.role === 'user' ? '1px solid rgba(0, 246, 255, 0.3)' : '1px solid rgba(255, 106, 0, 0.25)',
                    backgroundColor: msg.role === 'user' ? 'rgba(0, 246, 255, 0.02)' : 'rgba(6, 12, 22, 0.85)',
                    color: '#fff',
                    boxShadow: msg.role === 'user' ? '0 0 15px rgba(0, 246, 255, 0.03)' : '0 0 20px rgba(255, 106, 0, 0.05)',
                    lineHeight: '1.6',
                    fontSize: '0.88rem',
                    position: 'relative'
                  }}
                >
                  {/* Glowing left accent border for AEGISOS */}
                  {msg.role !== 'user' && (
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '3px',
                      backgroundColor: '#ff6a00'
                    }} />
                  )}

                  {/* Role Header */}
                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px',
                    gap: '24px',
                    borderBottom: '1px dashed rgba(255,255,255,0.08)',
                    paddingBottom: '6px'
                  }}>
                    <span style={{ 
                      fontSize: '0.62rem', 
                      fontWeight: 800, 
                      fontFamily: 'var(--font-hud)',
                      textTransform: 'uppercase', 
                      letterSpacing: '1px', 
                      color: msg.role === 'user' ? '#00f6ff' : '#ff6a00'
                    }}>
                      {msg.role === 'user' ? '[USER INGEST_FEED]' : '[J.A.R.V.I.S. RESPONSE]'}
                    </span>
                    {msg.routedModel && (
                      <span style={{
                        fontSize: '0.55rem',
                        fontWeight: 'bold',
                        backgroundColor: 'rgba(255,106,0,0.1)',
                        color: '#ff6a00',
                        border: '1px solid rgba(255,106,0,0.2)',
                        padding: '2px 6px',
                        borderRadius: '2px',
                        fontFamily: 'var(--font-tech)',
                        letterSpacing: '0.5px'
                      }}>
                        ROUTED: {msg.routedModel} | {msg.category}
                      </span>
                    )}
                  </div>
                  
                  {/* Content block */}
                  <div style={{ color: '#e5e7eb', whiteSpace: 'pre-wrap' }}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))
          )}
          {sending && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
              <div className="glass-panel" style={{
                padding: '14px 20px',
                borderRadius: '4px',
                color: '#ff6a00',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-tech)',
                border: '1px dashed rgba(255, 106, 0, 0.3)',
                backgroundColor: 'rgba(255, 106, 0, 0.02)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#ff6a00',
                  animation: 'pulse-glow 1.2s infinite alternate'
                }} />
                <span>COPROCESSOR FORMULATING KNOWLEDGE GRAPH RESPONSE...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input form */}
        <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(0, 246, 255, 0.15)', backgroundColor: 'rgba(6,12,22,0.85)' }}>
          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Mic input trigger */}
            <button
              type="button"
              onClick={toggleListening}
              style={{
                backgroundColor: isListening ? 'rgba(255, 85, 0, 0.1)' : 'rgba(0, 246, 255, 0.02)',
                color: isListening ? '#ff5500' : '#00f6ff',
                border: isListening ? '1.5px solid #ff5500' : '1.2px solid rgba(0, 246, 255, 0.25)',
                borderRadius: '4px',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: isListening ? '0 0 15px rgba(255, 85, 0, 0.3)' : 'none',
                outline: 'none'
              }}
              title={isListening ? "Listening verbally... Click to pause" : "Activate Verbal Input"}
            >
              {isListening ? <Mic size={16} /> : <Mic size={16} />}
            </button>

            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Query ${model} (Enter to send, Shift+Enter for new line)...`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              style={{
                flexGrow: 1,
                backgroundColor: 'rgba(2, 3, 6, 0.65)',
                border: '1.2px solid rgba(0, 246, 255, 0.25)',
                borderRadius: '4px',
                padding: '12px 14px',
                color: '#fff',
                fontSize: '0.82rem',
                fontFamily: 'var(--font-tech)',
                outline: 'none',
                resize: 'none',
                height: '44px',
                lineHeight: '1.4',
                transition: 'border-color 0.2s, box-shadow 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#00f6ff';
                e.target.style.boxShadow = '0 0 12px rgba(0, 246, 255, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(0, 246, 255, 0.25)';
                e.target.style.boxShadow = 'none';
              }}
            />

            {/* TTS Mute/Speak switch */}
            <button
              type="button"
              onClick={() => setSpeakOutput(!speakOutput)}
              style={{
                backgroundColor: speakOutput ? 'rgba(0, 246, 255, 0.02)' : 'transparent',
                color: speakOutput ? '#00f6ff' : 'rgba(255,255,255,0.25)',
                border: speakOutput ? '1.2px solid rgba(0, 246, 255, 0.25)' : '1.2px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                outline: 'none'
              }}
              title={speakOutput ? "A.R.C. Speaks Out Loud (Mute Verbal Mode)" : "A.R.C. Muted (Enable Voice Output)"}
            >
              {speakOutput ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            <button
              type="submit"
              disabled={!inputMessage.trim() || sending}
              style={{
                backgroundColor: inputMessage.trim() ? '#ff6a00' : 'transparent',
                color: inputMessage.trim() ? '#020306' : 'rgba(255,255,255,0.25)',
                border: inputMessage.trim() ? 'none' : '1.2px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: inputMessage.trim() ? 'pointer' : 'not-allowed',
                boxShadow: inputMessage.trim() ? '0 0 10px rgba(255, 106, 0, 0.3)' : 'none',
                transition: 'all 0.2s',
                outline: 'none'
              }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>

        {/* 3. Modal Layer: Save Chat and Synthesize */}
        {showSaveModal && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(2, 3, 6, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            backdropFilter: 'blur(6px)'
          }}>
            <div className="glass-panel animate-fade-in" style={{
              width: '90%',
              maxWidth: '460px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              border: '1.2px solid rgba(255, 106, 0, 0.35)',
              backgroundColor: 'rgba(6, 12, 22, 0.95)',
              boxShadow: '0 0 30px rgba(255, 106, 0, 0.15)',
              borderRadius: '4px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
                <Sparkles size={16} style={{ color: '#ff6a00' }} />
                <h3 style={{ fontSize: '0.85rem', fontFamily: 'var(--font-hud)', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Synthesize Vault Note
                </h3>
              </div>

              <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-tech)', lineHeight: '1.5', margin: 0 }}>
                This routine summarizes the key concepts from this thread, generates standard LaTeX code for formulas, and writes active recall card indices to your Obsidian vault.
              </p>

              {/* Title input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.62rem', fontWeight: 800, color: '#00f6ff', fontFamily: 'var(--font-hud)', letterSpacing: '0.8px' }}>TARGET FILE TITLE</label>
                <input
                  type="text"
                  placeholder="e.g. Semaphores synchronization"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  style={{
                    backgroundColor: 'rgba(2, 3, 6, 0.65)',
                    border: '1.2px solid rgba(0, 246, 255, 0.25)',
                    color: '#fff',
                    borderRadius: '4px',
                    padding: '10px 12px',
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-tech)',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Staging Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
                <input
                  type="checkbox"
                  id="staging-check"
                  checked={isStaging}
                  onChange={(e) => setIsStaging(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="staging-check" style={{ fontSize: '0.72rem', color: '#fff', cursor: 'pointer', fontWeight: 700, fontFamily: 'var(--font-hud)', letterSpacing: '0.5px' }}>
                  STORE IN ACADEMIC INCUBATOR INBOX
                </label>
              </div>

              {/* Staging topic details */}
              {isStaging && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.62rem', fontWeight: 800, color: '#ff6a00', fontFamily: 'var(--font-hud)', letterSpacing: '0.8px' }}>INBOX SEGMENT NAME</label>
                  <input
                    type="text"
                    placeholder="e.g. Operating_Systems"
                    value={saveTopic}
                    onChange={(e) => setSaveTopic(e.target.value)}
                    style={{
                      backgroundColor: 'rgba(2, 3, 6, 0.65)',
                      border: '1.2px solid rgba(255, 106, 0, 0.25)',
                      color: '#fff',
                      borderRadius: '4px',
                      padding: '10px 12px',
                      fontSize: '0.8rem',
                      fontFamily: 'var(--font-tech)',
                      outline: 'none'
                    }}
                  />
                  <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-tech)' }}>
                    Filing inbox items will stay unreviewed until processed by the Librarian.
                  </span>
                </div>
              )}

              {/* Status messages */}
              {saveStatus && (
                <div style={{ 
                  fontSize: '0.72rem', 
                  color: saveStatus.includes('success') ? '#10b981' : '#ff6a00',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  padding: '10px 12px',
                  borderRadius: '2px',
                  fontFamily: 'var(--font-tech)'
                }}>
                  {saveStatus.includes('success') && <CheckCircle size={12} style={{ color: '#10b981' }} />}
                  <span>{saveStatus.toUpperCase()}</span>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  onClick={handleSaveChat}
                  disabled={saveStatus.includes('synthesis')}
                  style={{
                    flexGrow: 2,
                    backgroundColor: '#ff6a00',
                    color: '#020306',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '10px',
                    fontWeight: 'bold',
                    fontFamily: 'var(--font-hud)',
                    fontSize: '0.75rem',
                    letterSpacing: '1px',
                    cursor: saveStatus.includes('synthesis') ? 'not-allowed' : 'pointer',
                    boxShadow: '0 0 10px rgba(255,106,0,0.25)'
                  }}
                >
                  EXECUTE SYNTHESIS
                </button>
                <button
                  onClick={() => setShowSaveModal(false)}
                  disabled={saveStatus.includes('synthesis')}
                  style={{
                    flexGrow: 1,
                    backgroundColor: 'transparent',
                    color: 'rgba(255,255,255,0.5)',
                    border: '1.2px solid rgba(255,255,255,0.2)',
                    borderRadius: '4px',
                    padding: '10px',
                    fontFamily: 'var(--font-hud)',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  ABORT
                </button>
              </div>

              {/* View link if saved */}
              {savedFileLink && (
                <button
                  onClick={() => {
                    onSelectNote(savedFileLink);
                    setShowSaveModal(false);
                  }}
                  style={{
                    backgroundColor: 'rgba(0, 246, 255, 0.05)',
                    color: '#00f6ff',
                    border: '1px solid #00f6ff',
                    borderRadius: '4px',
                    padding: '10px',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-hud)',
                    fontWeight: 'bold',
                    letterSpacing: '1px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 0 10px rgba(0,246,255,0.2)',
                    marginTop: '4px'
                  }}
                >
                  <span>DE-SHROUD ATOM NOTE</span>
                  <ArrowRight size={12} />
                </button>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
