# 🧠 Second Brain: AI-Coprocessor & Semantic Knowledge Vault

An advanced, developer-focused **Second Brain** platform that integrates local markdown vaults (**Obsidian**), automated semantic knowledge graphs (**Graphify**), local LLMs (**Ollama**), and a dashboard interface to track tasks, capture raw thoughts, and study with spaced repetition.

---

## 🚀 Key Features

*   **🗂️ Maps of Content (MOCs) Hub Registry**: Visual card decks showing indexes of key directories.
*   **📂 Full-Pane Subject MOC Hubs**: Interactive hub pages for Data Structures (DSA), Operating Systems (OS), DBMS, ML, and more, complete with natural serial sorting.
*   **⚡ Spaced Repetition Study Decks**: An interactive, flip-to-reveal study system filtered by subject.
*   **📝 Quick Capture Terminal (Karpathy Buffer)**: A rapid raw thought dump area, easily savable as markdown or refinable via AI.
*   **✅ Quick Task Board**: Obsidian-integrated task list (`Tasks.md`) that automatically feeds back into your semantic graph.
*   **🤖 Local AI Coprocessor dropdown**: Dynamic model selector parsing your local Ollama models (`llama3`, `mistral`, `deepseek`) with no port or setup hassle.

---

## 📂 Vault Directory Map

```text
SecondBrain/
├── 00_Inbox/                # Active inputs, capture notes, and quick tasks
│   └── Tasks.md             # Synchronized task board registry
├── 10_Subjects/             # Refined subject knowledge vaults
│   ├── 00_MOCs/             # Centralized Maps of Content (MOC indices)
│   ├── 01_Operating_Systems/
│   ├── 02_Data_Structures/
│   ├── 03_Database_Systems/
│   ├── ...                  # Other course notebooks (ML, Stats, OOPs)
├── 20_Sources/              # Raw data sources
│   ├── raw_lectures/        # Lecture files and slide drafts (Git ignored)
│   ├── Excalidraw/          # System design diagrams
│   └── transcripts/         # Video and audio lecture transcription logs
├── 90_System/               # Core configurations and Dashboard Suite
│   ├── dashboard/           # Express backend + React Vite frontend code
│   └── style_guide.md       # Vault aesthetic guidelines
├── .gitignore               # Excludes secrets, node modules, and raw PDFs
├── docker-compose.yml       # Dev container orchestration profile
├── requirements.txt         # Graphify python packages list
└── start_second_brain.bat   # Unified launcher shell script (Windows)
```

---

## 🤖 Local AI Model Setup (Ollama Setup Simplified)

The dashboard contains an **AI Coprocessor** that runs entirely locally using **Ollama**. Follow these quick steps to hook up your own offline models:

### 1. Download & Install Ollama
*   **Windows / macOS**: Download the installer from [ollama.com](https://ollama.com/) and run it.
*   **Linux**: Execute `curl -fsSL https://ollama.com/install.sh | sh` in your terminal.

### 2. Pull Your Preferred Models
Open your terminal and pull whichever models you want to use. They will automatically be detected by the dashboard dropdown:
```bash
# General purpose lightweight models
ollama pull mistral
ollama pull llama3:8b

# Developer / coding models
ollama pull qwen2.5-coder:7b
ollama pull deepseek-coder
```

### 3. Start the Ollama Engine
The launcher script `start_second_brain.bat` automatically looks for Ollama on port `11434` and starts it in the background if it isn't running. 
If running manually, ensure it runs using:
```bash
ollama serve
```

### 4. Switch Models Instantly
In the **AI Coprocessor Console** tab on the Dashboard, use the dropdown at the top to select from your downloaded models list. The dropdown will dynamically fetch available tags and display model sizes.

---

## 🛠️ Local Installation & Launch

### Prerequisites
*   Node.js (v18+)
*   Python (v3.10+)

### 1. Configure Environmental Variables
Copy the env templates and add your credentials (optional, for OpenAI / Graphify Cloud integrations):
```bash
# In the root folder
copy .env.example .env

# In the 90_System/dashboard folder
copy .env.example .env
```

### 2. Install Dependencies
Run installation in the dashboard folder:
```bash
cd 90_System/dashboard
npm install
```

### 3. Launch the App
Run the batch script from the root folder:
```bash
start_second_brain.bat
```
This boots Ollama, opens your default browser to `http://localhost:5180`, and starts both the React frontend and Express API backend concurrently.

---

## 🐳 Running with Docker (Containerization)

You can containerize the entire development dashboard suite with a single command. The configuration automatically forwards connection handles to your host machine's Ollama engine.

```bash
# Start the containers
docker-compose up --build
```
*   **Access the Frontend:** Open `http://localhost:5180`
*   **Access the Backend:** REST API is exposed at `http://localhost:3010`
*   **Dynamic Data Syncing:** The repository directories are volume-mounted into the containers. Any edits you make in Obsidian or on the dashboard will immediately sync between your host and the containers.

---

## 📈 Future Roadmap
*   **Graphify Semantic Query Engine**: Direct graph query execution panel integrated into the dashboard.
*   **PDF Auto-Refiner**: Drag-and-drop lecture PDFs directly into the Quick Capture terminal for automatic atomic note generation.
*   **Audio Lecture transcriber**: Local audio transcription integration utilizing whisper.cpp.
