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
  Sparkles
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

  const messagesEndRef = useRef(null);

  // Fetch saved chat history files on mount
  const [ollamaModels, setOllamaModels] = useState([]);

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
        setMessages(prev => [...prev, { role: 'assistant', content: data.result || '' }]);
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
    <div style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden' }}>
      
      {/* 1. Left Sidebar: Chat History Archive */}
      <div className="glass-panel" style={{
        width: '260px',
        borderRight: '1px solid var(--border-color)',
        borderTop: 'none',
        borderBottom: 'none',
        borderLeft: 'none',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'rgba(10,11,16,0.5)',
        flexShrink: 0
      }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={16} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '0.9rem', fontFamily: 'var(--font-display)', fontWeight: 600 }}>Chat Session Archive</h3>
          </div>
          <button 
            onClick={startNewChat}
            style={{
              width: '100%',
              backgroundColor: 'var(--accent-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'opacity 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.opacity = 0.9}
            onMouseOut={e => e.currentTarget.style.opacity = 1}
          >
            <Plus size={14} />
            <span>New Chat Session</span>
          </button>
        </div>

        {/* Saved List */}
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '10px' }}>
          {chatHistory.length === 0 ? (
            <div style={{ padding: '20px 10px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              No archived chat notes found in vault yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {chatHistory.map((chat) => (
                <button
                  key={chat.absolutePath}
                  onClick={() => loadArchivedChat(chat)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '4px',
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'rgba(255,255,255,0.01)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color-active)';
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.01)';
                  }}
                >
                  <span style={{ 
                    fontSize: '0.8rem', 
                    color: '#fff', 
                    fontWeight: 500, 
                    display: '-webkit-box', 
                    WebkitLineClamp: 2, 
                    WebkitBoxOrient: 'vertical', 
                    overflow: 'hidden' 
                  }}>
                    {chat.title}
                  </span>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    <span style={{ 
                      color: chat.topic === 'GENERAL' ? 'var(--text-muted)' : 'var(--accent-warning)', 
                      fontWeight: chat.topic === 'GENERAL' ? 400 : 600 
                    }}>
                      {chat.topic}
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
          padding: '12px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(10,11,16,0.2)',
          zIndex: 10
        }}>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-display)', fontWeight: 600 }}>AI Chat Console</h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Chat session autosaves directly into your local vault</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Provider Selector */}
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '0.8rem',
                outline: 'none'
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
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '0.8rem',
                outline: 'none'
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
                placeholder="Custom API Key Override"
                value={apiKeyOverride}
                onChange={(e) => setApiKeyOverride(e.target.value)}
                style={{
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  fontSize: '0.8rem',
                  width: '120px',
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
                    backgroundColor: 'rgba(16,185,129,0.1)',
                    color: 'var(--accent-success)',
                    border: '1px solid rgba(16,185,129,0.3)',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Save size={12} />
                  <span>Save Session</span>
                </button>

                <button
                  onClick={startNewChat}
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '6px 8px',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        {/* Messages Stream */}
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.length === 0 ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              flexGrow: 1, 
              color: 'var(--text-muted)',
              textAlign: 'center',
              gap: '12px',
              maxWidth: '450px',
              margin: '0 auto'
            }}>
              <MessageSquare size={36} style={{ color: 'var(--accent-primary)', opacity: 0.5 }} />
              <div>
                <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>Start a Future-Proof Chat</h4>
                <p style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                  Ask questions, debug, or brainstorm. When finished, hit **Save Session** to generate an automatic textbook note with flashcards inside your Obsidian vault.
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
                  animation: 'fadeIn 0.2s ease-out'
                }}
              >
                <div 
                  className={msg.role === 'user' ? '' : 'glass-panel'}
                  style={{
                    maxWidth: '80%',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    border: msg.role === 'user' ? 'none' : '1px solid var(--border-color)',
                    backgroundColor: msg.role === 'user' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.02)',
                    color: '#fff',
                    boxShadow: 'var(--shadow)',
                    lineHeight: '1.5',
                    fontSize: '0.9rem',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {/* Role Header */}
                  <span style={{ 
                    display: 'block', 
                    fontSize: '0.7rem', 
                    fontWeight: 700, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.5px', 
                    color: msg.role === 'user' ? 'rgba(255,255,255,0.7)' : 'var(--accent-primary)',
                    marginBottom: '6px'
                  }}>
                    {msg.role === 'user' ? 'You' : 'Assistant'}
                  </span>
                  
                  {/* Content block */}
                  <div style={{ color: msg.role === 'user' ? '#fff' : '#e5e7eb' }}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))
          )}
          {sending && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
              <div className="glass-panel" style={{ padding: '14px 18px', borderRadius: '12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <span>AI is formulating response...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input form */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', backgroundColor: 'rgba(10,11,16,0.3)' }}>
          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Query ${model} (Press Enter to send, Shift+Enter for new line)...`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              style={{
                flexGrow: 1,
                backgroundColor: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '12px',
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none',
                resize: 'none',
                height: '42px',
                lineHeight: '1.4'
              }}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || sending}
              style={{
                backgroundColor: inputMessage.trim() ? 'var(--accent-primary)' : 'transparent',
                color: inputMessage.trim() ? '#fff' : 'var(--text-muted)',
                border: inputMessage.trim() ? 'none' : '1px solid var(--border-color)',
                borderRadius: '8px',
                width: '42px',
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: inputMessage.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s'
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>

        {/* 3. Modal Layer: Save Chat and Synthesize */}
        {showSaveModal && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(10, 11, 16, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            backdropFilter: 'blur(4px)'
          }}>
            <div className="glass-panel animate-fade-in" style={{
              width: '90%',
              maxWidth: '450px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} style={{ color: 'var(--accent-warning)' }} />
                <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-display)', fontWeight: 600 }}>Save Chat to Obsidian</h3>
              </div>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                This will automatically summarize key concepts, format equations in LaTeX, and append flashcards.
              </p>

              {/* Title input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Note File Title</label>
                <input
                  type="text"
                  placeholder="e.g. Virtual Memory paging"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: '#fff',
                    borderRadius: '6px',
                    padding: '10px',
                    fontSize: '0.85rem',
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
                <label htmlFor="staging-check" style={{ fontSize: '0.8rem', color: '#fff', cursor: 'pointer', fontWeight: 500 }}>
                  Store in Academic Inbox Incubator
                </label>
              </div>

              {/* Staging topic details */}
              {isStaging && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Inbox Topic Folder Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Cryptography"
                    value={saveTopic}
                    onChange={(e) => setSaveTopic(e.target.value)}
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      color: '#fff',
                      borderRadius: '6px',
                      padding: '10px',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    Flashcards in staging will remain disabled until this topic graduates.
                  </span>
                </div>
              )}

              {/* Status messages */}
              {saveStatus && (
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: saveStatus.includes('success') ? 'var(--accent-success)' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  padding: '10px',
                  borderRadius: '6px'
                }}>
                  {saveStatus.includes('success') && <CheckCircle size={14} style={{ color: 'var(--accent-success)' }} />}
                  <span>{saveStatus}</span>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  onClick={handleSaveChat}
                  disabled={saveStatus.includes('synthesis')}
                  style={{
                    flexGrow: 2,
                    backgroundColor: 'var(--accent-primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '10px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: saveStatus.includes('synthesis') ? 'not-allowed' : 'pointer'
                  }}
                >
                  Synthesize & Save
                </button>
                <button
                  onClick={() => setShowSaveModal(false)}
                  disabled={saveStatus.includes('synthesis')}
                  style={{
                    flexGrow: 1,
                    backgroundColor: 'transparent',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '10px',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
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
                    backgroundColor: 'rgba(6,182,212,0.1)',
                    color: 'var(--accent-info)',
                    border: '1px solid rgba(6,182,212,0.3)',
                    borderRadius: '6px',
                    padding: '10px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <span>Open Note in Vault</span>
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
