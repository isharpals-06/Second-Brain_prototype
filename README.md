# 🧠 Neural Brain

A local-first, AI-augmented academic second brain dashboard that integrates Obsidian Markdown vaults, local LLMs (Ollama), and spaced repetition flashcards.

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![Ollama Support](https://img.shields.io/badge/Ollama-Local%20AI-orange)

---

## 🚀 Overview

Neural Brain solves the problem of scattered academic study notes, fragmented revision schedules, and high-latency cloud LLM usage. By uniting your files and local AI, it offers:

*   **🗂️ Map of Content (MOC) Registry**: A dashboard deck compiling indexes of key directories.
*   **📂 Full-Pane Subject Hubs**: Dedicated pages for OS, DSA, DBMS, and ML with alphanumeric sorting of notes.
*   **⚡ Interactive Spaced Repetition**: A study deck for cards containing double colons (`::`) or question marks (`??`), flip-to-reveal answers, and progress slides.
*   **📝 Quick Capture (Karpathy Buffer)**: A temporary textarea to dump thoughts and refine them via AI.
*   **✅ Obsidian Tasks Sync**: A checklist panel linked directly to `00_Inbox/Tasks.md`.

---

## 📺 Demo Interface

```text
+-----------------------------------------------------------------------------------+
|  NEURAL BRAIN | UNIVERSITY OS v2.0                                                |
+----------------------+------------------------------------------------------------+
|  [LayoutDashboard]   |   Welcome back to your Second Brain                        |
|  Dashboard           |   634 atomic concepts mapped in local directories          |
|                      +---------------------------------+--------------------------+
|  [FileText]          | 🗂️ Maps of Content (MOCs)       | 📝 Quick Capture Buffer  |
|  Notes Vault         | - OS MOC    - DSA MOC           | [ Write notes quickly..] |
|                      | - DBMS MOC  - Courses MOC       | [Refine via AI] [Save]   |
|  [MessageSquare]     +---------------------------------+--------------------------+
|  AI Chat Console     | Recently Visited Notes          | ✅ Quick Task Board      |
|                      | - Deadlock Basics.md            | [ ] Review [[OS MOC]]    |
|  [Cpu]               | - Array.md                      | [x] Memorize ANOVA table |
|  AI Coprocessor      +---------------------------------+--------------------------+
|                      | ⚡ Spaced Cards Study Session                                |
|  [Layers]            | Q: What is a deadlock?                                     |
|  Flashcards          | [Flip Card] --> A: Resource wait block.                    |
+----------------------+------------------------------------------------------------+
```

---

## 🛠️ Installation

### 1. Local Setup
Ensure you have Node.js (v18+) installed. Clone the repository and install the dependencies:

```bash
# Clone the repository
git clone https://github.com/isharpals-06/Second-Brain_prototype.git
cd Second-Brain_prototype/90_System/dashboard

# Install package dependencies
npm install
```

### 2. Configure Environment Templates
Copy the template environmental variables in both the root folder and dashboard subfolder:

```bash
# In the repository root
copy .env.example .env

# In 90_System/dashboard/
copy .env.example .env
```

### 3. Start Local AI Engine (Ollama)
Download and install [Ollama](https://ollama.com/). Pull the models you wish to use:

```bash
# Pull lightweight models
ollama pull mistral
ollama pull llama3:8b
```

---

## 🚀 Usage

### Simple Local Launch
To boot Ollama and start the React frontend + Express API servers concurrently, run the batch script from the root directory:

```bash
# Start script
./start_second_brain.bat
```
*Your browser will automatically open to `http://localhost:5180`.*

### Manual Startup
If you are on Linux or macOS, run the following commands:
```bash
# Start Ollama engine
ollama serve &

# Start backend & frontend dev server
cd 90_System/dashboard
npm run dev
```

---

## 📂 Project Structure

```text
SecondBrain/
├── 00_Inbox/                # Active inputs, capture notes, and tasks
│   └── Tasks.md             # Synchronized task list
├── 10_Subjects/             # Refined subject vaults
│   ├── 00_MOCs/             # Centralized Maps of Content
│   └── [Subjects]/          # Subject concept directories (Git ignored)
├── 20_Sources/              # Raw data sources (Git ignored)
├── 90_System/               # Core configurations
│   └── dashboard/           # Frontend & Backend Code
│       ├── Dockerfile       # Dashboard container configs
│       ├── package.json     # Node script definitions
│       ├── server/          # Express API server
│       └── src/             # Vite React client
├── docker-compose.yml       # Dev container profile
├── requirements.txt         # Python dependency list
└── start_second_brain.bat   # Unified batch launcher (Windows)
```

---

## ⚙️ Configuration

### Environment Variables (`90_System/dashboard/.env`)

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Backend service port | `3010` |
| `OLLAMA_URL` | Local Ollama engine socket URL | `http://127.0.0.1:11434` |
| `GEMINI_API_KEY` | Optional cloud API key override for Coprocessor | `""` |
| `GOOGLE_API_KEY` | Optional Google API Key override | `""` |

---

## 💻 Tech Stack

*   **Frontend**: React (v19), Vite (v8), Lucide-React, Vanilla CSS variables.
*   **Backend**: Node.js, Express, Cors, Dotenv, FS (File System).
*   **Data Structure**: Markdown (GitHub Flavored).
*   **Local LLM Host**: Ollama Server.

---

## 🧪 Tests

To test the cache and flashcard parsing functions, run the test script included in the dashboard folder:

```bash
cd 90_System/dashboard
node server/test_flashcards.js
```
*This validates if markdown files are successfully parsed into flashcard structures without runtime execution errors.*

---

## 📈 Performance Metrics

*   **Note Scanning**: Scans and parses 1000+ markdown files under 50ms.
*   **Cache Execution**: Zero-dependency caching system prevents re-indexing unmodified files, maintaining instantaneous dashboard load times.
*   **LLM Latency**: Less than 100ms first-token latency on local models (`llama3:8b`) under active RAM compilation.

---

## 🗺️ Roadmap

*   **PDF Auto-Refiner**: Direct drag-and-drop lecture parsing in the browser.
*   **Audio Transcription**: offline Whisper transcription engine integration.
*   **Wiki-Link Visualizer**: Navigable local node mapping canvas.

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:
1.  Fork the Project.
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the Branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
