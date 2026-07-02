---
subject: Operating Systems
topic: Course Overview
concept: OS Map of Content
type: MOC
status: reviewed
tags: [university, os, index]
created: 2026-06-19
---

# 🗺️ Operating Systems Map of Content (MOC)

Welcome to your Operating Systems & Computer System Engineering knowledge map. This index organizes all concepts, lectures, and active recall resources for the course.

---

## 🏛️ Unit 1: System Engineering Fundamentals

This section covers the core principles of building and structuring complex systems, mitigating complexity, and enforcing boundaries.

*   **Core Concepts**:
    *   [[System Complexity]] - Why systems are difficult to build and scale.
    *   [[Modularity and Abstraction]] - Standard design principles to manage complexity.
    *   [[Remote Procedure Calls]] (RPCs) - Enforcing modularity in distributed client/server environments.
    *   [[System Performance]] - Methodology for measuring, modeling, and improving performance.
    *   [[Policy vs Mechanism]] - Separating design goals from implementation details.
*   **System Boundaries**:
    *   [[Naming in Systems]] - How naming schemes allow modules to interact.
    *   [[Domain Name System]] - Case study of hierarchical naming in DNS.
    *   [[OS Boundaries]] - Enforcing boundaries between user programs and the kernel.

---

## 💻 Unit 2: OS Architecture & Kernel (TBD)
*   **Kernel Structures & Virtualization**:
    *   [[Kernel Architectures]] - Monolithic vs. Microkernel structures.
    *   [[Virtual Machines]] - Hardware virtualization and memory translation hierarchies.
*   *Process & Thread Management*
    *   [[Threads]] - The virtual processor abstraction and thread switching.
    *   [[Bounded Buffers]] - Queue-based inter-process communication.
    *   [[Locks]] - Enforcing mutual exclusion and atomicity.
    *   [[Deadlock]] - Resource allocation cycles and avoidance strategies (e.g., lock ordering).
    *   [[Condition Variables]] - Efficient synchronization without busy waiting.
    *   [[Preemption]] - Cooperative vs preemptive thread scheduling using timer interrupts.
*   *CPU Scheduling*

---

## 💾 Unit 3: Memory Management
*   [[Virtual Memory]] - Address isolation and translation using page tables.
*   *Page Replacement Algorithms*

---

## 🗄️ Unit 4: Storage & Filesystems (TBD)
*   *I/O Systems*
    *   [[RAID]] - Redundancy and fault tolerance for disk storage (RAID 1, 4, 5).
*   *File Systems*
    *   [[Transactions]] - Abstraction providing atomicity (via shadow copies/atomic rename) and isolation.
    *   [[Write-Ahead Logging]] - Performance-optimized atomicity using append-only logs and undo/redo recovery.
    *   [[Conflict Serializability]] - Graph-based verification of concurrent transaction isolation.
    *   [[Two-Phase Locking]] (2PL) - Concurrency control protocol enforcing serializable schedules.
    *   [[Two-Phase Commit]] (2PC) - Consensus protocol for multi-site atomicity in distributed transactions.
    *   [[Replicated State Machines]] - Primary-backup replication and consensus-driven single-copy consistency.

---

## 🌐 Unit 5: Computer Networks (TBD)
*   [[Network Fundamentals]] - Key principles of routing, transport, naming, and layering.
*   [[Routing Algorithms]] - Link-State vs. Distance-Vector routing.
*   [[Scalable Internet Routing]] - Path-vector routing, routing hierarchies, and CIDR.
*   [[Border Gateway Protocol]] (BGP) - Inter-domain policy routing and AS relationships.
*   [[TCP Congestion Control]] - Sliding window, AIMD, and TCP transmission phases.
*   [[Queue Management]] - Switch buffer policies including DropTail, RED, and ECN.
*   [[Traffic Scheduling]] - In-network prioritization and fair queueing (DRR).
*   [[Content Distribution]] - CDNs, P2P networks (BitTorrent, DHTs), and NAT traversal (relays).

---

## 🔒 Unit 6: Computer Security (TBD)
*   [[Computer Security]] - Threat models, the guard model, and common exploits (SQL injection, confused deputy).
*   [[Password Authentication]] - Secure storage (salting/hashing), session cookies, and challenge-response protocols.
*   [[Secure Channels]] - Confidentiality (encryption), integrity (MACs), Diffie-Hellman key exchange, and digital signatures.
*   [[Denial of Service and Intrusion Detection]] - DDoS (SYN flood, reflection), NIDS, and evasion tactics (TTL manipulation).
*   [[Bitcoin]] - Decentralized digital currency utilizing blockchain consensus and Proof of Work.
*   [[Tor]] - Onion routing network providing anonymity via layered encryption.
