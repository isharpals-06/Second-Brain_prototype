import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import dotenv from 'dotenv';

// Configure dotenv
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The vault root is three levels up from 90_System/dashboard/server/
const VAULT_ROOT = path.resolve(__dirname, '../../../');
const REFINED_NOTES_DIR = path.join(VAULT_ROOT, '10_Subjects');
const GRAPH_FILE = path.join(VAULT_ROOT, '90_System', 'graphify-out', 'graph.json');

const app = express();
const PORT = process.env.PORT || 3010;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Helper to recursively get markdown files
async function getMarkdownFiles(dir) {
  let results = [];
  try {
    const list = await fs.readdir(dir, { withFileTypes: true });
    for (const file of list) {
      const resPath = path.resolve(dir, file.name);
      if (file.isDirectory()) {
        const nameLower = file.name.toLowerCase();
        if (
          nameLower === 'node_modules' ||
          nameLower === '.git' ||
          nameLower === '.obsidian' ||
          nameLower === 'dashboard' ||
          nameLower === 'graphify-out'
        ) {
          continue;
        }
        results = results.concat(await getMarkdownFiles(resPath));
      } else if (file.name.endsWith('.md')) {
        results.push(resPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  return results;
}

const CACHE_FILE = path.join(__dirname, 'metadata_cache.json');

// Helper to sync and flattened cached notes and flashcards
async function syncMetadataCache() {
  let cache = { lastScanTime: 0, notes: {}, flashcards: {} };
  
  try {
    const cacheData = await fs.readFile(CACHE_FILE, 'utf-8');
    cache = JSON.parse(cacheData);
    if (!cache.notes) cache.notes = {};
    if (!cache.flashcards) cache.flashcards = {};
  } catch (e) {
    cache = { lastScanTime: 0, notes: {}, flashcards: {} };
  }

  const refinedFiles = await getMarkdownFiles(REFINED_NOTES_DIR);
  let rawFiles = [];
  try {
    rawFiles = await getMarkdownFiles(path.join(VAULT_ROOT, '20_Sources'));
  } catch (_) {}
  const currentFiles = [...refinedFiles, ...rawFiles];
  
  const currentPathsSet = new Set(currentFiles);
  let cacheChanged = false;

  // 1. Evict deleted files from cache
  for (const cachedPath in cache.notes) {
    if (!currentPathsSet.has(cachedPath)) {
      delete cache.notes[cachedPath];
      delete cache.flashcards[cachedPath];
      cacheChanged = true;
    }
  }

  // 2. Incremental sync for new/modified files
  for (const filePath of currentFiles) {
    try {
      const stats = await fs.stat(filePath);
      const mtimeMs = stats.mtime.getTime();
      const size = stats.size;
      
      const cachedNote = cache.notes[filePath];
      if (!cachedNote || new Date(cachedNote.updatedAt).getTime() !== mtimeMs || cachedNote.size !== size) {
        const relativePath = path.relative(VAULT_ROOT, filePath).replace(/\\/g, '/');
        const filename = path.basename(filePath);
        const subject = getSubjectFromPath(filePath);
        const content = await fs.readFile(filePath, 'utf-8');
        
        let title = filename.replace('.md', '');
        const h1Match = content.match(/^#\s+(.+)$/m);
        if (h1Match) {
          title = h1Match[1].replace(/[\#\*]/g, '').trim();
          title = title.replace(/^[^\w\s\(\)\-\,\.\'\’\"]+\s*/, '');
        }

        cache.notes[filePath] = {
          title,
          filename,
          relativePath,
          absolutePath: filePath.replace(/\\/g, '/'),
          subject,
          size,
          updatedAt: stats.mtime
        };

        // Parse flashcards inside the updated file
        const fileFlashcards = [];
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          if (line.startsWith('::') && i > 0) {
            let questionIdx = i - 1;
            while (questionIdx >= 0 && lines[questionIdx].trim() === '') {
              questionIdx--;
            }
            if (questionIdx >= 0) {
              const question = lines[questionIdx].replace('#flashcards', '').trim();
              const answer = line.substring(2).trim();
              if (question && answer) {
                fileFlashcards.push({
                  id: `${filename}-${i}`,
                  type: 'inline-nextline',
                  question,
                  answer,
                  filename,
                  filePath: filePath.replace(/\\/g, '/'),
                  subject,
                });
              }
            }
          } else if (line.includes('::')) {
            const parts = line.split('::');
            const question = parts[0].replace('#flashcards', '').trim();
            const answer = parts[1].trim();
            if (question && answer) {
              fileFlashcards.push({
                id: `${filename}-${i}`,
                type: 'inline',
                question,
                answer,
                filename,
                filePath: filePath.replace(/\\/g, '/'),
                subject,
              });
            }
          } else if (line === '??' && i > 0 && i + 1 < lines.length) {
            let questionIdx = i - 1;
            while (questionIdx >= 0 && lines[questionIdx].trim() === '') {
              questionIdx--;
            }
            if (questionIdx >= 0) {
              const question = lines[questionIdx].replace('#flashcards', '').trim();
              const answerLines = [];
              let j = i + 1;
              while (j < lines.length) {
                const nextLine = lines[j].trim();
                if (
                  nextLine === '' ||
                  nextLine.includes('::') ||
                  nextLine.startsWith('::') ||
                  nextLine.endsWith('??') ||
                  nextLine === '??' ||
                  nextLine.startsWith('#') ||
                  nextLine.startsWith('---')
                ) {
                  break;
                }
                answerLines.push(lines[j]);
                j++;
              }
              const answer = answerLines.join('\n').trim();
              if (question && answer) {
                fileFlashcards.push({
                  id: `${filename}-${i}`,
                  type: 'multiline-nextline',
                  question,
                  answer,
                  filename,
                  filePath: filePath.replace(/\\/g, '/'),
                  subject,
                });
                i = j - 1;
              }
            }
          } else if (line.endsWith('??') && i + 1 < lines.length) {
            const question = line.slice(0, -2).replace('#flashcards', '').trim();
            const answerLines = [];
            let j = i + 1;
            while (j < lines.length) {
              const nextLine = lines[j].trim();
              if (
                nextLine === '' ||
                nextLine.includes('::') ||
                nextLine.startsWith('::') ||
                nextLine.endsWith('??') ||
                nextLine === '??' ||
                nextLine.startsWith('#') ||
                nextLine.startsWith('---')
              ) {
                break;
              }
              answerLines.push(lines[j]);
              j++;
            }
            const answer = answerLines.join('\n').trim();
            if (question && answer) {
              fileFlashcards.push({
                id: `${filename}-${i}`,
                type: 'multiline',
                question,
                answer,
                filename,
                filePath: filePath.replace(/\\/g, '/'),
                subject,
              });
              i = j - 1;
            }
          }
        }
        cache.flashcards[filePath] = fileFlashcards;
        cacheChanged = true;
      }
    } catch (e) {
      console.error(`Failed to sync file ${filePath}:`, e.message);
    }
  }

  if (cacheChanged) {
    cache.lastScanTime = Date.now();
    await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
    console.log('Metadata cache synced and written.');
  }

  const notesList = Object.values(cache.notes);
  const flashcardsList = Object.values(cache.flashcards).flat();
  return { notes: notesList, flashcards: flashcardsList };
}

// Helper to parse subject from path
function getSubjectFromPath(filePath) {
  const relative = path.relative(REFINED_NOTES_DIR, filePath);
  const parts = relative.split(path.sep);
  if (parts.length > 1) {
    const clean = parts[0].toUpperCase();
    if (clean.includes('00_MOCS') || clean.includes('MOC')) return 'MOC';
    if (clean.includes('OPERATING_SYSTEMS') || clean.includes('OS')) return 'OS';
    if (clean.includes('DATA_STRUCTURES') || clean.includes('DSA')) return 'DSA';
    if (clean.includes('DATABASE_SYSTEMS') || clean.includes('DBMS')) return 'DBMS';
    if (clean.includes('DISCRETE')) return 'DISCRETE_MATHEMATICS';
    if (clean.includes('COMPUTER_ARCHITECTURE') || clean.includes('SYSTEM_ARCHITECTURE') || clean.includes('COMPUTER_SYSTEM_ARCHITECTURE')) return 'COMPUTER_SYSTEM_ARCHITECTURE';
    if (clean.includes('CYBER') || clean.includes('NETWORKS') || clean.includes('CYBER_CN')) return 'CYBER_CN';
    if (clean.includes('MACHINE_LEARNING') || clean.includes('ML')) return 'ML';
    if (clean.includes('OOPS') || clean.includes('OPPS') || clean.includes('OBJECT_ORIENTED')) return 'OPPS';
    if (clean.includes('STATISTICS')) return 'STATISTICS';
  }
  const relativeRaw = path.relative(path.join(VAULT_ROOT, '20_Sources'), filePath);
  const partsRaw = relativeRaw.split(path.sep);
  if (partsRaw.length > 1) {
    const cleanRaw = partsRaw[0].toUpperCase();
    if (cleanRaw.includes('OPERATING_SYSTEMS') || cleanRaw.includes('OS')) return 'OS';
    if (cleanRaw.includes('DATA_STRUCTURES') || cleanRaw.includes('DSA')) return 'DSA';
    if (cleanRaw.includes('DATABASE_SYSTEMS') || cleanRaw.includes('DBMS')) return 'DBMS';
    if (cleanRaw.includes('DISCRETE')) return 'DISCRETE_MATHEMATICS';
    if (cleanRaw.includes('COMPUTER_ARCHITECTURE') || cleanRaw.includes('SYSTEM_ARCHITECTURE') || cleanRaw.includes('COMPUTER_SYSTEM_ARCHITECTURE')) return 'COMPUTER_SYSTEM_ARCHITECTURE';
    if (cleanRaw.includes('CYBER') || cleanRaw.includes('NETWORKS') || cleanRaw.includes('CYBER_CN')) return 'CYBER_CN';
    if (cleanRaw.includes('MACHINE_LEARNING') || cleanRaw.includes('ML')) return 'ML';
    if (cleanRaw.includes('OOPS') || cleanRaw.includes('OPPS') || cleanRaw.includes('OBJECT_ORIENTED')) return 'OPPS';
    if (cleanRaw.includes('STATISTICS')) return 'STATISTICS';
  }
  return 'GENERAL';
}

// Endpoints

// 1. Get vault configurations and API key presence
app.get('/api/config', (req, res) => {
  res.json({
    vaultRoot: VAULT_ROOT,
    geminiKeyConfigured: !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
    openaiKeyConfigured: !!process.env.OPENAI_API_KEY,
    anthropicKeyConfigured: !!process.env.ANTHROPIC_API_KEY,
  });
});

const TASKS_FILE_PATH = path.join(VAULT_ROOT, '00_Inbox', 'Tasks.md');

// Get all tasks
app.get('/api/tasks', (req, res) => {
  try {
    if (!fsSync.existsSync(TASKS_FILE_PATH)) {
      return res.json([]);
    }
    const content = fsSync.readFileSync(TASKS_FILE_PATH, 'utf8');
    const lines = content.split('\n');
    const tasks = [];
    let idCounter = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const activeMatch = line.match(/^\s*-\s*\[\s*\]\s*(.+)$/i);
      const completedMatch = line.match(/^\s*-\s*\[\s*x\s*\]\s*(.+)$/i);
      if (activeMatch) {
        tasks.push({ id: idCounter++, text: activeMatch[1].trim(), completed: false });
      } else if (completedMatch) {
        tasks.push({ id: idCounter++, text: completedMatch[1].trim(), completed: true });
      }
    }
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a task
app.post('/api/tasks/add', (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Task text is required' });
    }
    const newTaskLine = `- [ ] ${text}`;
    let content = '';
    if (fsSync.existsSync(TASKS_FILE_PATH)) {
      content = fsSync.readFileSync(TASKS_FILE_PATH, 'utf8');
    } else {
      content = `# 📋 University Tasks\n\n## 📥 Active Tasks\n`;
    }
    const lines = content.split('\n');
    const activeIndex = lines.findIndex(l => l.includes('## 📥 Active Tasks'));
    if (activeIndex !== -1) {
      lines.splice(activeIndex + 1, 0, newTaskLine);
    } else {
      lines.push(newTaskLine);
    }
    fsSync.writeFileSync(TASKS_FILE_PATH, lines.join('\n'), 'utf8');

    // Trigger background Graphify update
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
    const cmd = `cmd.exe /c "set GEMINI_API_KEY=${geminiKey}&& set GOOGLE_API_KEY=${geminiKey}&& graphify extract ${VAULT_ROOT} --model gemini-3.1-flash-lite && graphify cluster-only ${VAULT_ROOT} --model gemini-3.1-flash-lite"`;
    exec(cmd, (err) => {
      if (err) console.error('Background graphify error:', err);
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle a task
app.post('/api/tasks/toggle', (req, res) => {
  try {
    const { text, completed } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Task text is required' });
    }
    if (!fsSync.existsSync(TASKS_FILE_PATH)) {
      return res.status(404).json({ error: 'Tasks file not found' });
    }
    let content = fsSync.readFileSync(TASKS_FILE_PATH, 'utf8');
    const lines = content.split('\n');
    let found = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (completed) {
        if (line.trim().startsWith('- [ ]') && line.includes(text)) {
          lines[i] = line.replace('- [ ]', '- [x]');
          found = true;
          break;
        }
      } else {
        if (line.trim().startsWith('- [x]') && line.includes(text)) {
          lines[i] = line.replace('- [x]', '- [ ]');
          found = true;
          break;
        }
      }
    }
    if (found) {
      fsSync.writeFileSync(TASKS_FILE_PATH, lines.join('\n'), 'utf8');
      
      // Trigger background Graphify update
      const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
      const cmd = `cmd.exe /c "set GEMINI_API_KEY=${geminiKey}&& set GOOGLE_API_KEY=${geminiKey}&& graphify extract ${VAULT_ROOT} --model gemini-3.1-flash-lite && graphify cluster-only ${VAULT_ROOT} --model gemini-3.1-flash-lite"`;
      exec(cmd, (err) => {
        if (err) console.error('Background graphify error:', err);
      });

      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// 2. List all notes
app.get('/api/notes', async (req, res) => {
  try {
    const { notes } = await syncMetadataCache();
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Get note content
app.get('/api/notes/content', async (req, res) => {
  const { filePath } = req.query;
  if (!filePath) {
    return res.status(400).json({ error: 'filePath query param is required' });
  }
  try {
    const resolvedPath = path.resolve(filePath);
    // Security check: ensure the path is within the vault
    if (!resolvedPath.startsWith(VAULT_ROOT)) {
      return res.status(403).json({ error: 'Access denied: outside workspace' });
    }
    const content = await fs.readFile(resolvedPath, 'utf-8');
    res.json({ content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Save note content
app.post('/api/notes/save', async (req, res) => {
  const { filePath, content } = req.body;
  if (!filePath || content === undefined) {
    return res.status(400).json({ error: 'filePath and content are required' });
  }
  try {
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(VAULT_ROOT)) {
      return res.status(403).json({ error: 'Access denied: outside workspace' });
    }
    await fs.writeFile(resolvedPath, content, 'utf-8');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Get graph data from graphify-out
app.get('/api/graph', async (req, res) => {
  try {
    const data = await fs.readFile(GRAPH_FILE, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    // If graphify file doesn't exist, return empty or try to scan simple relations
    res.json({ nodes: [], links: [], message: 'Graph.json not found. Run Graphify to generate.' });
  }
});

// 6. Get all flashcards from notes
app.get('/api/flashcards', async (req, res) => {
  try {
    const { flashcards } = await syncMetadataCache();
    res.json(flashcards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Rebuild Graphify graph
app.post('/api/graph/rebuild', (req, res) => {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
  console.log('Rebuilding knowledge graph...');

  // Run graphify in powershell
  const cmd = `cmd.exe /c "set GEMINI_API_KEY=${geminiKey}&& set GOOGLE_API_KEY=${geminiKey}&& graphify extract ${VAULT_ROOT} --model gemini-3.1-flash-lite && graphify cluster-only ${VAULT_ROOT} --model gemini-3.1-flash-lite"`;
  
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error('Graphify error:', stderr);
      return res.status(500).json({ error: stderr || error.message });
    }
    console.log('Graphify output:', stdout);
    res.json({ success: true, output: stdout });
  });
});

// Clean up outer markdown code block fences if present in LLM response
function cleanMarkdownFences(text) {
  if (!text) return '';
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(markdown|md)?\s*\n/i, '');
  cleaned = cleaned.replace(/\n\s*```$/, '');
  return cleaned.trim();
}

// Reusable helper to generate AI Refinement / Synthesis
async function generateRefinementText({ provider, model, prompt, content, apiKeyOverride }) {
  let aiResponseText = '';

  if (provider === 'gemini') {
    const apiKey = apiKeyOverride || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
    const selectedModel = model || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${prompt}\n\n==================== CONTENT ====================\n${content}` }]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.statusText} (${errorText})`);
    }

    const json = await response.json();
    aiResponseText = json.candidates?.[0]?.content?.parts?.[0]?.text || '';

  } else if (provider === 'openai') {
    const apiKey = apiKeyOverride || process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OpenAI API key is missing. Set OPENAI_API_KEY env or provide override.');
    const selectedModel = model || 'gpt-4o';
    const url = 'https://api.openai.com/v1/chat/completions';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: content }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.statusText} (${errorText})`);
    }

    const json = await response.json();
    aiResponseText = json.choices?.[0]?.message?.content || '';

  } else if (provider === 'ollama') {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
    const selectedModel = model || 'llama3';
    const url = `${ollamaUrl}/api/generate`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: selectedModel,
        prompt: `${prompt}\n\nContent to refine:\n${content}`,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama local API error: ${response.statusText}`);
    }

    const json = await response.json();
    aiResponseText = json.response || '';

  } else if (provider === 'anthropic') {
    const apiKey = apiKeyOverride || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('Anthropic API key is missing. Set ANTHROPIC_API_KEY env or provide override.');
    const selectedModel = model || 'claude-3-5-sonnet-latest';
    const url = 'https://api.anthropic.com/v1/messages';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: selectedModel,
        max_tokens: 4000,
        messages: [
          { role: 'user', content: `${prompt}\n\nContent to refine:\n${content}` }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API error: ${response.statusText} (${errorText})`);
    }

    const json = await response.json();
    aiResponseText = json.content?.[0]?.text || '';
  } else {
    throw new Error(`Unknown AI provider: ${provider}`);
  }

  return cleanMarkdownFences(aiResponseText);
}

// 8. Multi-AI Coprocessor Refine Note
app.post('/api/refine', async (req, res) => {
  const { provider, model, prompt, content, apiKeyOverride } = req.body;

  if (!provider || !prompt || content === undefined) {
    return res.status(400).json({ error: 'provider, prompt, and content are required' });
  }

  try {
    const result = await generateRefinementText({ provider, model, prompt, content, apiKeyOverride });
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 9. Multi-LLM Chat Endpoint
app.post('/api/chat', async (req, res) => {
  const { provider, model, messages, apiKeyOverride } = req.body;

  if (!provider || !messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'provider and messages array are required' });
  }

  try {
    let aiResponseText = '';

    if (provider === 'gemini') {
      const apiKey = apiKeyOverride || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
      const selectedModel = model || 'gemini-2.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;

      // Map roles to Gemini requirements ('user' and 'model')
      const contents = messages.map(msg => {
        let role = msg.role === 'assistant' ? 'model' : 'user';
        if (msg.role === 'system') {
          // Gemini handles system instruction separately, but we can treat as user message or systemInstruction
          role = 'user'; 
        }
        return {
          role: role,
          parts: [{ text: msg.content }]
        };
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.statusText} (${errorText})`);
      }

      const json = await response.json();
      aiResponseText = json.candidates?.[0]?.content?.parts?.[0]?.text || '';

    } else if (provider === 'openai') {
      const apiKey = apiKeyOverride || process.env.OPENAI_API_KEY;
      if (!apiKey) throw new Error('OpenAI API key is missing.');
      const selectedModel = model || 'gpt-4o';
      const url = 'https://api.openai.com/v1/chat/completions';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: messages
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.statusText} (${errorText})`);
      }

      const json = await response.json();
      aiResponseText = json.choices?.[0]?.message?.content || '';

    } else if (provider === 'ollama') {
      const ollamaUrl = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
      const selectedModel = model || 'llama3';
      const url = `${ollamaUrl}/api/chat`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          messages: messages,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama local API error: ${response.statusText}`);
      }

      const json = await response.json();
      aiResponseText = json.message?.content || '';

    } else if (provider === 'anthropic') {
      const apiKey = apiKeyOverride || process.env.ANTHROPIC_API_KEY;
      if (!apiKey) throw new Error('Anthropic API key is missing.');
      const selectedModel = model || 'claude-3-5-sonnet-latest';
      const url = 'https://api.anthropic.com/v1/messages';

      // Separate system messages for Claude
      const systemMessage = messages.find(m => m.role === 'system')?.content || '';
      const chatMessages = messages.filter(m => m.role !== 'system').map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }));

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: selectedModel,
          max_tokens: 4000,
          system: systemMessage || undefined,
          messages: chatMessages
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Anthropic API error: ${response.statusText} (${errorText})`);
      }

      const json = await response.json();
      aiResponseText = json.content?.[0]?.text || '';
    } else {
      throw new Error(`Unknown AI provider: ${provider}`);
    }

    res.json({ result: aiResponseText });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper slugify function
function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// Automatically link saved chat in the central Master MOC index
async function linkChatInMasterMOC(filename, title, dateStr, isStaging, topic, finalPath) {
  const mocPath = path.join(VAULT_ROOT, 'University Notes.md');
  try {
    let content = await fs.readFile(mocPath, 'utf-8');
    const noteName = filename.replace('.md', '');
    
    const relativeWikiPath = path.relative(VAULT_ROOT, finalPath).replace(/\\/g, '/').replace('.md', '');
    const linkText = `*   [[${relativeWikiPath}|${title} (Chat Session)]] - *Saved on ${dateStr}*${topic ? ` (Inbox: ${topic})` : ''}`;
    
    if (isStaging) {
      if (!content.includes('## 📥 Academic Inbox & Staging')) {
        content = content.replace(
          '## ⚡ Quick Navigation & Tools',
          `## 📥 Academic Inbox & Staging\n\n${linkText}\n\n---\n\n## ⚡ Quick Navigation & Tools`
        );
      } else {
        content = content.replace(
          '## 📥 Academic Inbox & Staging',
          `## 📥 Academic Inbox & Staging\n\n${linkText}`
        );
      }
    } else {
      if (!content.includes('## 💬 General Chat Archive')) {
        content = content.replace(
          '## ⚡ Quick Navigation & Tools',
          `## 💬 General Chat Archive\n\n${linkText}\n\n---\n\n## ⚡ Quick Navigation & Tools`
        );
      } else {
        content = content.replace(
          '## 💬 General Chat Archive',
          `## 💬 General Chat Archive\n\n${linkText}`
        );
      }
    }
    await fs.writeFile(mocPath, content, 'utf-8');
    console.log('Successfully registered chat link in University Notes.md');
  } catch (error) {
    console.error('Failed to link chat in Master MOC:', error.message);
  }
}

// 10. Save Chat with Automatic Synthesis
app.post('/api/chat/save', async (req, res) => {
  const { provider, model, messages, topic, title, conversationId, apiKeyOverride } = req.body;

  if (!messages || !Array.isArray(messages) || !title) {
    return res.status(400).json({ error: 'messages array and title are required' });
  }

  try {
    // 1. Generate synthesized study note using the LLM
    const synthPrompt = `You are an expert university notes refiner. Analyze the provided chat history between a student and an AI assistant, and synthesize the technical concepts discussed into a structured, cohesive, high-quality Obsidian concept note.
Follow these guidelines:
1. Divide it into logical sections with descriptive subheaders (##, ###).
2. Format all mathematical equations in LaTeX ($ for inline, $$ for block).
3. Append a set of active recall flashcards under the "## 🧠 Spaced Repetition Flashcards #flashcards" header at the very bottom, using "::" for inline (Q :: A) and "??" for multiline cards.
4. Integrate double-bracket wikilinks [[Note Name]] for key concepts to connect it with the vault.
5. Return ONLY the markdown content. Do not write any conversational intro or outro.`;

    const chatLogString = messages.map(m => `[${m.role.toUpperCase()}]: ${m.content}`).join('\n\n');

    let synthesisText = '';
    try {
      synthesisText = await generateRefinementText({
        provider: provider || 'gemini',
        model: model,
        prompt: synthPrompt,
        content: chatLogString,
        apiKeyOverride: apiKeyOverride
      });
    } catch (err) {
      console.error('Synthesis generation failed:', err.message);
      // Fallback if refine fails: compile raw text
      synthesisText = `## Chat Session: ${title}\n\n*Unable to generate automatic textbook synthesis. Falling back to transcript.*`;
    }

    // 2. Create the hybrid note content
    const dateStr = new Date().toISOString().split('T')[0];
    const fileContent = `---
subject: ${topic ? topic.toUpperCase() : 'GENERAL'}
topic: ${title}
concept: Chat Session
type: agent-chat
status: archived
aliases: ["${title}", "Chat Session: ${title}"]
tags: [agent-session, university-os, chat-preservation]
created: ${dateStr}
---

# 💬 Chat Session: ${title}

${synthesisText}

---

## 📜 Full Conversation History
<details>
<summary>Click to expand raw transcript (${messages.length} turns)</summary>

${messages.map(m => `**${m.role.toUpperCase()}**: ${m.content}`).join('\n\n')}

</details>
`;

    // 3. Determine save path & filename
    let targetDir = '';
    let filename = '';
    let saveSubject = 'GENERAL';

    const isMoc = topic && (topic.toLowerCase().includes('moc') || title.toLowerCase().includes('moc'));

    if (isMoc) {
      targetDir = path.join(VAULT_ROOT, '10_Subjects', '00_MOCs');
      saveSubject = 'MOC';
      let cleanTitle = title;
      if (!cleanTitle.toUpperCase().endsWith('MOC')) {
        cleanTitle = `${cleanTitle} MOC`;
      }
      filename = `${cleanTitle}.md`;
    } else if (topic) {
      // Staging incubator folder inside 00_Inbox
      targetDir = path.join(VAULT_ROOT, '00_Inbox', 'inbox_notes', slugify(topic));
      saveSubject = 'INBOX';
      filename = `${dateStr}-${slugify(title)}.md`;
    } else {
      // General agent chats folder inside 00_Inbox
      targetDir = path.join(VAULT_ROOT, '00_Inbox', 'agent_chats');
      filename = `${dateStr}-${slugify(title)}.md`;
    }

    await fs.mkdir(targetDir, { recursive: true });
    
    const finalPath = path.join(targetDir, filename);
    await fs.writeFile(finalPath, fileContent, 'utf-8');

    // 4. Automatically link the saved note in the central index
    await linkChatInMasterMOC(filename, title, dateStr, !!topic, topic, finalPath);

    res.json({
      success: true,
      filePath: finalPath.replace(/\\/g, '/'),
      filename: filename,
      subject: saveSubject
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 11. Get Chat History Files
app.get('/api/chat/history', async (req, res) => {
  try {
    const chatDir = path.join(VAULT_ROOT, '00_Inbox', 'agent_chats');
    let generalChats = [];
    try {
      const files = await fs.readdir(chatDir);
      for (const file of files) {
        if (file.endsWith('.md')) {
          const filePath = path.join(chatDir, file);
          const stats = await fs.stat(filePath);
          const content = await fs.readFile(filePath, 'utf-8');
          
          let title = file.replace('.md', '');
          const h1Match = content.match(/^#\s+(.+)$/m);
          if (h1Match) title = h1Match[1].replace(/[\#\*]/g, '').trim();

          generalChats.push({
            filename: file,
            absolutePath: filePath.replace(/\\/g, '/'),
            title,
            topic: 'GENERAL',
            updatedAt: stats.mtime,
            size: stats.size
          });
        }
      }
    } catch (_) {}

    // Also scan inbox_notes for chats
    let inboxChats = [];
    try {
      const inboxRoot = path.join(VAULT_ROOT, '00_Inbox', 'inbox_notes');
      const subdirs = await fs.readdir(inboxRoot, { withFileTypes: true });
      for (const dir of subdirs) {
        if (dir.isDirectory()) {
          const topicDir = path.join(inboxRoot, dir.name);
          const files = await fs.readdir(topicDir);
          for (const file of files) {
            if (file.endsWith('.md')) {
              const filePath = path.join(topicDir, file);
              const stats = await fs.stat(filePath);
              const content = await fs.readFile(filePath, 'utf-8');
              
              if (content.includes('type: agent-chat')) {
                let title = file.replace('.md', '');
                const h1Match = content.match(/^#\s+(.+)$/m);
                if (h1Match) title = h1Match[1].replace(/[\#\*]/g, '').trim();

                inboxChats.push({
                  filename: file,
                  absolutePath: filePath.replace(/\\/g, '/'),
                  title,
                  topic: dir.name.toUpperCase(),
                  updatedAt: stats.mtime,
                  size: stats.size
                });
              }
            }
          }
        }
      }
    } catch (_) {}

    const allChats = [...generalChats, ...inboxChats].sort((a, b) => b.updatedAt - a.updatedAt);
    res.json(allChats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 12. List Ollama local models dynamically
app.get('/api/ollama/models', async (req, res) => {
  try {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
    const response = await fetch(`${ollamaUrl}/api/tags`);
    if (!response.ok) {
      throw new Error('Ollama not responding');
    }
    const data = await response.json();
    const models = (data.models || []).map(m => ({
      id: m.name,
      name: `${m.name} (${Math.round(m.size / (1024*1024*102.4)) / 10} GB)`
    }));
    res.json(models);
  } catch (error) {
    res.json([]);
  }
});

app.listen(PORT, () => {
  console.log(`Second Brain Backend running at http://localhost:${PORT}`);
});
