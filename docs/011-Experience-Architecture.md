# AEGISOS EXPERIENCE ARCHITECTURE (v1.0)
## The Behavioral Blueprint of a Cognitive Operating System

**Version:** 1.0.0  
**Roles:** Chief Experience Officer, Principal UX Architect, HCI Researcher, AI Interaction Designer, Product Psychologist, Senior Systems Architect  
**Status:** Canonical & Unalterable

---

## PART 1 — EXPERIENCE PHILOSOPHY & EMOTIONAL PROGRESSION

AEGISOS is designed to build a deep, enduring cognitive partnership with the user. The emotional experience evolves systematically over time:

- **30 Seconds (Initial Impression):** Calmness & Clarity. The user feels zero visual clutter or cognitive overwhelm. The system communicates serenity, precision, and ambient readiness.
- **5 Minutes (First Interaction):** Effortless Control. As the user expresses intent, AEGISOS classifies the goal, loads context automatically, and displays progress transparently. The user feels understood and empowered.
- **1 Hour (Deep Work Session):** Flow & Momentum. Peripheral tools stay out of the way while subagents execute tasks in the background. The user enters a state of deep focus.
- **1 Month (Daily Collaboration):** Trust & Synergy. AEGISOS has ingested vault notes, procedural preferences, and working patterns. It anticipates context without being intrusive.
- **1 Year (Cognitive Symbiosis):** Ownership & Partnership. AEGISOS feels like an indispensable extension of the user's mind—a tireless digital butler and trusted mission commander.

---

## PART 2 — USER JOURNEY MAPS

### 2.1 First Launch Journey
1. **User Action:** Opens AEGISOS executable or web URL.
2. **AI Action:** Performs silent hardware & provider diagnostic check (`GEMINI`, `Ollama`). Renders clean 48px Header Telemetry Bar and central Mission Surface.
3. **Context & Animation:** Soft cyan border glow (`PERCEIVING`). Living Context Rail highlights default `OBSERVE` mode.
4. **Outcome:** User is greeted not with a generic prompt box, but an operational Mission Surface displaying system readiness.

### 2.2 Morning Startup & Context Restoration
1. **User Action:** Launches system at 09:00 AM.
2. **AI Action:** Loads Session Memory Layer (Layer 2). Summarizes overnight background indexing and active goals.
3. **Workspace Behavior:** Displays a calm **Morning Context Briefing** in the Living Context Rail.
4. **Memory Update:** Working memory loads active tasks from yesterday without losing conversation context.

### 2.3 Executing a Complex Mission (e.g., Code Refactoring)
1. **User Action:** Types or speaks: *"Refactor storage adapter to support SQLite vector extensions."*
2. **AI Action:** `IntentDetector` classifies input as `DELEGATE_AGENT`. Core Kernel initiates Layer 1-10 pipeline (`THINKING` ➔ `PLANNING`).
3. **Workspace Mutation:** Viewport transitions to **Mission Surface**. Subagent Matrix displays subagents (`Platform Architect`, `Vault Sentinel`) executing steps.
4. **Reflection & Completion:** Upon completion, system runs procedural reflection, updates Layer 5 Procedural Memory, and emits a calm emerald completion notification.

---

## PART 3 — AI PERSONALITY & VOICE GUIDELINES

- **Tone:** Professional, precise, calm, and objective. Speaks like a trusted executive chief of staff or mission flight controller.
- **Brevity:** High information density. Avoids fluff, sycophancy ("I'd be happy to help with that!"), or empty conversational filler.
- **Silence:** Silence is preferred over chatter. When executing background tasks, AEGISOS remains quiet until a status checkpoint or completion event occurs.
- **Humor & Emotion:** No artificial jokes, forced empathy, or conversational trickery. AEGISOS conveys respect through accuracy, speed, and reliability.
- **Technical Precision:** Uses exact terminology (e.g., *"Mounted SQLite WAL mode at 12ms"* rather than *"Saved your data!"*).

---

## PART 4 — AI INITIATIVE & AUTONOMY MATRIX

AEGISOS operates under strict initiative rules governing when it may act autonomously versus when it must seek user approval:

| Action Category | Autonomy Level | Initiative Rule |
|---|---|---|
| **Read Vault / Index Notes** | 🟢 Fully Autonomous | Background indexing and graph construction execute continuously without prompts. |
| **Recall Memory / Context** | 🟢 Fully Autonomous | Assembles relevant historical memories and context for active tasks automatically. |
| **Suggest Next Actions** | 🟡 Ambient Suggestion | Displays calm recommendations in the Living Context Rail without blocking the workspace. |
| **Execute Read-Only Tools** | 🟢 Fully Autonomous | Shell queries (`git status`, `ls`, file reads) run without confirmation. |
| **Execute Destructive Actions** | 🔴 Approval Checkpoint | File overwrites, git commits, code refactoring, or external API calls require approval. |
| **Interrupt Deep Focus** | ⛔ Strictly Forbidden | Interruptions occur ONLY for critical system failure or explicit security risk. |

---

## PART 5 — COGNITIVE OS STATES & BEHAVIORAL MATRIX

```
IDLE ➔ PERCEIVING ➔ THINKING ➔ PLANNING ➔ DELEGATING ➔ EXECUTING ➔ REFLECTING ➔ LEARNING
                                                                     ↓
                                                                RECOVERING (On Error)
```

1. **IDLE:** Ambient telemetry monitoring; low-power background pass every 5s.
2. **THINKING:** Multi-modal candidate route generation; purple border pulse (`#7C3AED`).
3. **PLANNING:** Dependency graph decomposition; cyan step illumination (`#06B6D4`).
4. **DELEGATING:** Subagent packet distribution; violet node split animation (`#8B5CF6`).
5. **EXECUTING:** Tool runtime invocation; amber scanline sweep (`#F59E0B`).
6. **REFLECTING:** Quality evaluation pass; emerald status check (`#10B981`).
7. **RECOVERING:** Provider failover retry; red alert indicator (`#EF4444`).

---

## PART 6 — MULTI-AGENT INTERACTION MODEL

- **Abstraction Layer:** Users never manage raw agent threads or subprocess handles. They interact with **Subagent Swarms** assigned to specific mission roles (`Platform Architect`, `Vault Sentinel`, `Code Auditor`).
- **Monitoring:** Subagents report progress into the **Subagent Matrix** inside the Mission Surface.
- **Interruption:** Users can pause, cancel, or modify subagent swarms instantly via the Command Palette (`Ctrl+K`) or single-click checkpoint triggers.

---

## PART 7 — ATTENTION MODEL & NOTIFICATION TIERS

1. **Tier 1 — Critical (Immediate Action):** Security breach, fatal provider failure, or unrecoverable error. Displayed as a modal overlay with audio chime.
2. **Tier 2 — Important (Checkpoint Required):** Subagent awaiting approval for file modifications. Displayed as a highlighted card in the Mission Surface.
3. **Tier 3 — Passive (Context Update):** Background graph indexing complete or new memory consolidated. Displayed as an ambient badge update in the Header Telemetry Bar.
4. **Tier 4 — Invisible (Silent Log):** Routine telemetry ticks and memory decay cycles. Written silently to audit logs.

---

## PART 8 — COLLABORATIVE CONVERSATION MODEL

- Conversation in AEGISOS is an **Operational Dialogue**, not a text box log.
- Every user statement is classified into an operational intent (`DELEGATE_AGENT`, `NAVIGATION`, `MEMORY_ACTION`, `SYSTEM_ACTION`, `UNIFIED_SEARCH`).
- Responses include executable previews, risk scores, and subagent assignment trees directly inline with text synthesis.

---

## PART 9 — WORKSPACE LIFECYCLE

```
Mission Inception ➔ Context Assembly ➔ Subagent Activation ➔ Dynamic Execution ➔ Reflection ➔ Memory Consolidation ➔ Archival
```
1. User expresses high-level intent.
2. Workspace mutates to **Mission Surface**.
3. `ContextAssemblyPipeline` fetches working, session, semantic, and graph context.
4. Subagents execute tasks with tool runtimes.
5. System evaluates output against reflection criteria.
6. Lessons are saved to Layer 5 Procedural Memory, and the mission is archived into Layer 3 Episodic Storage.

---

## PART 10 — TIME & TEMPORAL DESIGN

- **Morning (06:00 - 12:00):** Focus on overnight summary, active daily goals, and high-priority mission planning.
- **Afternoon (12:00 - 18:00):** Optimized for deep execution, coding sessions, research synthesis, and subagent orchestration.
- **Evening (18:00 - 00:00):** Focus on memory consolidation pass, reflection reviews, and daily progress archiving.
- **Session Restoration:** Returning after days or weeks triggers an automatic **Context Restoration Briefing** summarizing where the project was left.

---

## PART 11 — FAILURE & RECOVERY EXPERIENCE

- **Philosophy:** Never panic the user; errors are normal technical events handled gracefully.
- **Provider Outage:** If Gemini or Ollama fails, `AIRouter` automatically triggers failover to secondary providers and displays: `[Failover] Primary provider offline. Rerouted execution to secondary provider (Ollama Local) seamlessly.`
- **Tool Failure:** Displays raw error in the Context Inspector drawer while offering single-click retry or alternative tool execution paths.

---

## PART 12 — CONTINUOUS LEARNING EXPERIENCE

- **What is Remembered:** Intent patterns, tool preferences, project structures, code formatting rules, and historical decisions.
- **What is NEVER Remembered:** Raw passwords, unencrypted credentials, sensitive personal data, or transient junk logs.
- **Inspectability:** Users can review, export, import, or clear memories anytime via `/api/memory/stats` or the **Memory Surface**.

---

## PART 13 — MOBILE COMPANION ARCHITECTURE (`< 768px`)

Mobile devices do not shrink the desktop workstation. Mobile is the **AEGISOS Mobile Companion**:
- **Quick Intent Capture:** Single-tap voice input button and prompt line.
- **Approval Center:** Touch-optimized approval drawer for subagent write actions.
- **Mission Updates Feed:** Stream of active background tasks and subagent status cards.
- **Memory Note Capture:** Quick capture directly into the Obsidian vault inbox.

---

## PART 14 — FUTURE EXPERIENCE VISION

- **Voice-Native Interaction:** Bidirectional real-time audio streams with low-latency speech synthesis.
- **Spatial Computing & Smart Glasses:** Ambient heads-up telemetry rendering active subagents in physical space.
- **Multi-Device Continuity:** Seamless hands-free transfer from Desktop Workstation to Mobile Companion.

---

## PART 15 — 25 IMMUTABLE EXPERIENCE COMMANDMENTS

1. The AI shall never compete for the user's attention.
2. The AI shall never interrupt deep focus without a critical system failure.
3. The interface shall follow the active mission; the mission shall never follow the interface.
4. Navigation shall be invisible, driven by intent and context.
5. All buttons and containers shall enforce strict 0px sharp corner radii (`--radius-sharp: 0px`).
6. The AI shall never use sycophantic, artificial, or patronizing language.
7. Internal OS states (`THINKING`, `EXECUTING`, `REFLECTING`) shall always be visible through telemetry stream tokens.
8. The system shall operate exclusively in dark industrial visual space.
9. Destructive write operations shall always present an explicit checkpoint approval.
10. Read-only system queries shall execute with full autonomy.
11. The AI shall assemble multi-layer context before initiating task execution.
12. Errors shall be communicated calmly with immediate, automated recovery paths.
13. Subagent complexity shall be organized cleanly into role-based swarms.
14. The user shall be able to control all primary actions via keyboard shortcuts (`Ctrl+K`, `Ctrl+B`).
15. Memory inspection and forgetting shall remain transparent and auditable.
16. The desktop layout shall never shrink to accommodate mobile devices.
17. Mobile shall be designed independently as a dedicated AI Companion.
18. Notifications shall strictly follow the 4-tier attention hierarchy.
19. Silence is the default state when background subagents execute smoothly.
20. The system shall maintain 24/7 background awareness of vault and git changes.
21. Multi-modal provider selection shall be managed transparently by the capability router.
22. The AI shall record lessons learned into Layer 5 Procedural Memory after every mission.
23. Decorative, non-functional animations are strictly forbidden.
24. Information density shall favor technical clarity over empty whitespace.
25. AEGISOS shall remain forever open, provider-independent, and user-owned.
