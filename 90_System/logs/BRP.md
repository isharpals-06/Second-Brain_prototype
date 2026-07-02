# ⚠️ Breakpoints (BRP.md)

This document details the active technical bottlenecks, structural risks, and scalability issues within the current system, along with strategies to mitigate them.

---

## 🔍 1. Active Breakpoints (Right Now)

### 📌 A. Windows Directory Junction Portability
*   **The Issue**: The `dashboard/src` directory is created as a Windows Junction Point linking to `dashboard/server/src`. If this vault is moved to another drive, zipped, or synced via basic cloud backup (e.g. Google Drive/OneDrive/Git), the junction is either ignored, converted to a static empty folder, or broken. This causes Vite to crash on boot with: `Failed to load url /src/main.jsx`.
*   **Vulnerability**: Low-Medium (only triggers on vault relocation or system restarts that purge symlinks).
*   **Mitigation**: Run `cmd.exe /c "mklink /J src server\src"` inside the `dashboard/` directory to quickly recreate the mapping.

### 📌 B. Stale Node Subprocesses (`EADDRINUSE`)
*   **The Issue**: Windows does not guarantee that child processes are killed when a task runner or terminal is terminated. If Vite (5173) or Express (3001) is stopped abruptly, the ports remain bound by orphaned background `node.exe` processes. Launching the dev server again causes an immediate backend crash.
*   **Vulnerability**: High (frequently happens on IDE cancellations or shell restarts).
*   **Mitigation**: Run `Stop-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess -Force` in PowerShell to force-kill the stale process.

### 📌 C. Gemini Free-Tier Rate Limits (429 Errors)
*   **The Issue**: The Gemini free tier has a strict limit of 15 Requests Per Minute (RPM) and 1500 Requests Per Day. During batch note refinement (like running subagents on 20+ raw lectures), this rate limit is quickly hit, resulting in `HTTP 429 Too Many Requests` and causing the background processor to stall.
*   **Vulnerability**: High (during large import tasks).
*   **Mitigation**: The refinement subagents use a 15-second delay between requests and batch Graphify triggers at the end of a subject, rather than after every note.

### 📌 D. Graphify HTML Viz Rendering Limits
*   **The Issue**: The local knowledge base currently contains **7,855 nodes** and **12,368 edges**. This exceeds the default Graphify HTML visualization limit (5,000 nodes). Graphify watch skips building `graph.html`, outputting a terminal warning.
*   **Vulnerability**: Low (only affects the unused static HTML visualization, not the dashboard's Canvas force graph).
*   **Mitigation**: Override limits by setting `GRAPHIFY_VIZ_NODE_LIMIT=10000` in the environment variables, or rely purely on the dashboard's custom Canvas GraphView.

---

## 📈 2. Future Breakpoints (As the Vault Scales)

### 📌 A. Chat Log & Indexing Bloat
*   **The Issue**: If every chat session is saved, the number of files in `meta/agent_chats/` will scale from dozens to hundreds or thousands. This will:
    1.  Slow down the Express backend's file-scanning routines (`fs.readdir` and parsing YAML headers).
    2.  Pollute search indexes and autocomplete fields inside Obsidian.
*   **Mitigation**: Store older chat notes in a compressed archive or log db once file counts exceed 500, or use a paging database for the history panel.

### 📌 B. Local Ollama VRAM/RAM Bottlenecks
*   **The Issue**: Running large local models like `mixtral:latest` (26 GB) or `qwen3.6:latest` (23 GB) requires significant system resources (GPU VRAM / System RAM). If Ollama attempts to load these large models while gaming or compiling heavy code, it will run incredibly slow or cause system out-of-memory crashes.
*   **Mitigation**: Switch to lightweight models like `neural-chat:latest` (4.1 GB) or `lfm2.5-thinking:latest` (731 MB) for quick dashboard chat tasks.

### 📌 C. Flashcard Parser Performance
*   **The Issue**: The backend flashcard parser currently reads every markdown file in the vault and splits it by lines to match `::` and `??`. With 634 notes, this is fast (~100ms), but if the vault grows to 5,000+ notes, the real-time parsing on every page load will cause noticeable lag.
*   **Mitigation**: Implement a backend cache for flashcards (`flashcards.json`) that is only updated when a file modification time changes, rather than reading all files from scratch on every page load.
