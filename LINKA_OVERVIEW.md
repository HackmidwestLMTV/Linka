# Linka — Logistics-Aware FinOps Bridge

> **When a physical shipment gets stuck, stop paying for the digital cloud servers that are waiting on it.**

Linka is an agentic FinOps bridge that harmonizes **Flex business banking and supply chain logistics** with **cloud compute infrastructure (Akamai Connected Cloud & AWS)**. 

When international freight shipments encounter customs tariff holds, port congestion, or supply chain bottlenecks, Linka intercepts the disruption in real time, correlates the physical shipment with its tagged cloud workloads, calculates the working capital at risk, and allows businesses to hibernate idle cloud compute with a single click.

---

## 1. Executive Summary & Vision

### The Silent Capital Leak
Modern global enterprises operate with two mission-critical backbones that remain completely blind to each other:

| Operational Dimension | Flex (Business Banking & Supply Chain) | Cloud Infrastructure (Akamai / AWS) |
|---|---|---|
| **Core Visibility** | Purchase Orders, bill of lading, customs clearance, ETA revisions, working capital | CPU metrics, memory utilization, cluster nodes, per-second billing |
| **System Blindspot** | Zero insight into what servers or staging pipelines are active | Zero insight into whether physical inventory has actually arrived |
| **Organizational Owner** | VP of Supply Chain / Head of Logistics | Cloud Architect / DevOps Engineering Lead |

When an international ocean container faces an unexpected **14-day Section 301 customs tariff compliance review**:
1. The **Logistics Manager** knows the cargo cannot enter the domestic distribution network for two weeks, but has no access or mandate to manage cloud servers.
2. The **Cloud Engineer** sees provisioned microservices and database clusters running at low utilization, but assumes downstream batch jobs or automated syncs are pending.
3. **The Result:** Cloud clusters run at 0% effective throughput while draining **$180/day ($2,520 over 14 days)** of irreplaceable working capital.

Traditional FinOps tools (AWS Cost Explorer, Datadog, CloudHealth) only diagnose idle waste **retroactively** after days or weeks of accumulated bills. **Linka operates proactively at the moment of supply chain disruption**, converting logistics lead-time changes into immediate cloud capital defense.

---

## 2. How Linka Works (The 4-Stage Operational Loop)

Linka operates as an autonomous event-driven bridge across four distinct stages:

```
┌─────────────────────────────────┐
│  STAGE 1: Baseline Operational  │  ► Flex Banking tracks Freight Batch #104
│           Synchronization       │  ► Akamai Cloud cluster runs normal sync pipeline ($180/day)
└────────────────┬────────────────┘
                 │
                 ▼ (Disruption Occurs: Customs Tariff Hold)
┌─────────────────────────────────┐
│  STAGE 2: Telemetry & Event     │  ► Linka Webhook intercepts lead-time extension (+14 days)
│           Interception          │  ► Identifies zero-throughput condition across freight pipeline
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│  STAGE 3: Agentic Policy &      │  ► Correlates PO #104 metadata with Cloud Tag: "Batch-104"
│           FinOps Correlation    │  ► Quantifies capital exposure: $180/day × 14 days = $2,520
│                                 │  ► Passes automated safety checks (CPU < 10%, Reserve Active)
└────────────────┬────────────────┘
                 │
                 ▼ (One-Click User Approval)
┌─────────────────────────────────┐
│  STAGE 4: Capital Shield &      │  ► Issues Linode REST shutdown to pause idle compute nodes
│           Live Cloud Hibernation│  ► Working capital preserved in Flex account ($2,520 saved)
│                                 │  ► Dynamic forecast locks in cash preservation curve
└─────────────────────────────────┘
```

### Detailed Breakdown of the Steps:

#### Step 1: Baseline Sync
* **Flex Perspective:** Displays operating working capital ($248,500), 30-day projected burn ($14,200), and purchase order details (`PO #104`, Shenzhen ➔ Los Angeles, $82,400 ocean freight batch).
* **Cloud Perspective:** Monitors provisioned Akamai Linode instances tagged `Batch-104` (`Freight-Sync-Worker` @ $45/day and `Staging-DB-Cluster` @ $135/day), totaling $180/day in compute spend.

#### Step 2: Disruption Detection
* An external customs or carrier alert is ingested:
  ```json
  {
    "event": "LOGISTICS_LEAD_TIME_EXTENSION",
    "batchId": "Batch-104",
    "reason": "Section 301 Tariff Compliance Review",
    "delayDays": 14,
    "provider": "Akamai Connected Cloud",
    "taggedLinodes": ["linode-9842104", "linode-9842105"],
    "projectedWaste": 2520.00
  }
  ```
* Linka instantly calculates that the compute cluster will operate at **0% effective utilization** for 14 days, exposing **$2,520 in idle burn**.

#### Step 3: Agentic Policy Verification
Before making any recommendation, the Linka agent runs strict policy guardrails:
1. **Delay Threshold Policy:** Confirms that the logistics lead-time delay exceeds 3 days and CPU utilization remains under 10%.
2. **Capital Protection Policy:** Confirms that Flex banking reserves are active and that pausing staging workloads introduces zero production risk.
3. **Idempotency Guarantee:** Prepares automated restart hooks so instances seamlessly revive the moment customs status updates to "Cleared".

#### Step 4: One-Click Protection
* With a single click on the dashboard (or via automated policy rule), Linka dispatches an API command to pause or hibernate the targeted cloud workloads.
* Daily burn drops instantly from **$180/day to $0/day**.
* The interactive 30-day cash flow projection chart dynamically reflects the saved working capital, ensuring the business retains its capital runway within Flex.

---

## 3. Design Philosophy: Fluidity, Ease, and Cognitive Clarity

To appeal to non-technical financial executives, supply chain directors, and technical judges alike, Linka is built with an **Apple VisionOS spatial glassmorphism design system**.

### 🎨 Spatial Aesthetics & Visual Tokens
* **True Pitch-Black Foundation (`#000000`):** Creates extreme contrast, eliminates interface clutter, and maximizes battery efficiency on OLED displays.
* **Frosted Glass Panels (`backdrop-filter: blur(40px) saturate(190%)`):** Multi-layered glass cards with subtle 1px specular highlights (`rgba(255, 255, 255, 0.12)`) and inner ambient shadows.
* **Dual Ambient Aura:**
  - **Flex Green (`rgba(67, 126, 91, 0.18)`):** Grounded financial health and capital safety.
  - **Akamai Electric Blue (`rgba(0, 153, 255, 0.16)`):** Agile, high-performance cloud compute.
* **Apple Typography Stack:** Prioritizes native **SF Pro Display** with automatic optical fallback to **Inter**. Monospaced telemetry renders in **JetBrains Mono** with tabular numerals (`font-variant-numeric: tabular-nums`) so financial amounts and server IDs never shift or jitter during real-time updates.

### 🕹️ Cognitive Ergonomics & "Zero-Friction" Navigation
* **VisionOS Capsule Stepper:** A streamlined, pill-shaped step switcher (`1 Baseline` ➔ `2 Disruption` ➔ `3 Agent` ➔ `4 Protect`) allows viewers to grasp the narrative progression within 10 seconds.
* **Keyboard-First Pitching:** Presenters can step forward and backward through the entire presentation using the keyboard arrow keys (`←` and `→`), ensuring a smooth, seamless narrative delivery without awkward mouse hunting.
* **Dual-Channel Mobile Synchronization:**
  - The presenter opens the dashboard on their laptop or projector screen (`/`).
  - The presenter opens the remote controller on their smartphone (`/trigger.html`).
  - When the presenter taps **"Trigger Tariff Hold"** on their phone, the phone triggers haptic vibration feedback, dispatches dual WebSocket + HTTP REST payloads, and the laptop screen jumps to Step 2 live in front of the judges' eyes.

---

## 4. Technical Architecture & Implementation

```
 ┌────────────────────────────────────────────────────────────┐
 │                  Client Presentation Layer                 │
 │  - VisionOS Dashboard (HTML5, Vanilla CSS, Chart.js)       │
 │  - Mobile Remote Controller (/trigger.html) with Haptics   │
 └──────────────┬───────────────────────────────▲─────────────┘
                │ HTTP REST / WebSocket         │ Live State Broadcast
                ▼                               │ (Socket.IO)
 ┌──────────────────────────────────────────────┴─────────────┐
 │                    Linka Node.js Engine                    │
 │  - Express 4.18 REST Server & Static Asset Pipeline        │
 │  - Socket.IO Bi-Directional Event Broker                   │
 │  - Correlation Matrix (Batch-104 ➔ Linode Instance IDs)    │
 └──────────────┬─────────────────────────────────────────────┘
                │
                │ Akamai Linode REST API v4
                │ Authorization: Bearer <AKAMAI_API_TOKEN>
                ▼
 ┌────────────────────────────────────────────────────────────┐
 │           Akamai Connected Cloud (Linode Compute)          │
 │  - Freight-Sync-Worker (Linode 8GB, tag: Batch-104)        │
 │  - Staging-DB-Cluster  (Dedicated 16GB, tag: Batch-104)    │
 │  - Actions: POST /instances/{id}/shutdown                  │
 │             POST /instances/{id}/boot                      │
 └────────────────────────────────────────────────────────────┘
```

### Key Technical Characteristics:
1. **Lightweight & Dependency-Free Core:**
   - Powered by Node.js native `fetch` — no heavy SDK overhead.
   - Real-time event broadcasting using WebSocket protocol with automatic HTTP polling fallback.
2. **Akamai Linode API v4 Integration:**
   - Real-time instance discovery filtered by tags (`Batch-104`).
   - Clean shutdown endpoints (`POST https://api.linode.com/v4/linode/instances/{id}/shutdown`).
   - Automatic restart hooks on demo reset (`POST https://api.linode.com/v4/linode/instances/{id}/boot`).
3. **Resilient Failover (Demo Mode vs. Live Mode):**
   - In Live Mode (when `AKAMAI_API_TOKEN` is supplied), Linka executes real hardware state changes against the cloud provider.
   - In Demo Mode (default), Linka simulates hardware state changes locally with 100% deterministic fidelity, guaranteeing that network interruptions or API rate limits never compromise a live hackathon pitch.

---

## 5. Hack Midwest 2026 Pitch Strategy (3-Minute Live Demo)

Linka is engineered to strictly satisfy Hack Midwest rules (**Strictly Live Working Prototype MVP, Zero Slide Decks**):

| Time | Story Beat | Action on Screen |
|---|---|---|
| **0:00 - 0:40** | **The Disconnect** | Presenter shows **Step 1 (Baseline)**. Points out Flex Banking on the left ($248k capital) and Akamai Cloud on the right ($180/day). Highlights that neither system knows what the other is doing. |
| **0:40 - 1:20** | **The Disruption** | Presenter taps **"Trigger Tariff Hold"** on their mobile phone. Over live WebSockets, the laptop screen automatically transitions to **Step 2 (Disruption)**. Explains that a 14-day customs hold means $2,520 of pure idle burn. |
| **1:20 - 2:10** | **The Linka Agent** | Transitions to **Step 3 (Agent)**. Shows how Linka matched the PO `#104` to cloud tag `Batch-104`, evaluated safety guardrails (CPU < 10%), and prepared a safe action. |
| **2:10 - 2:45** | **The Protection** | Clicks **"Protect Capital"** on **Step 4 (Protect)**. Burn rate drops to $0/day. The Chart.js cash flow curve splits, locking in the $2,520 preserved in Flex. |
| **2:45 - 3:00** | **Summary & Vision** | Re-emphasizes: "Linka turns supply chain disruptions into immediate cloud cost defense." One-click reset resets the demo for judge Q&A. |

---

## 6. Project Directory & File Reference

- **[`server.js`](file:///Users/john.vianney.ssennono-1/Desktop/Linka/server.js):** Express backend, Socket.IO gateway, Akamai Linode REST API integration, and dual-channel REST endpoints (`/api/trigger`, `/api/reset`).
- **[`public/index.html`](file:///Users/john.vianney.ssennono-1/Desktop/Linka/public/index.html):** 4-step VisionOS presentation dashboard with responsive glassmorphism layout and live metric cards.
- **[`public/styles.css`](file:///Users/john.vianney.ssennono-1/Desktop/Linka/public/styles.css):** Spatial design tokens, frosted glass filters, typography styling, and ambient lighting gradients.
- **[`public/app.js`](file:///Users/john.vianney.ssennono-1/Desktop/Linka/public/app.js):** Client state machine, keyboard navigation (`←`/`→`), Chart.js 30-day forecast, and WebSocket listeners.
- **[`public/trigger.html`](file:///Users/john.vianney.ssennono-1/Desktop/Linka/public/trigger.html):** Mobile remote controller optimized for handheld demonstration with haptic vibration feedback.
- **[`DEPLOY.md`](file:///Users/john.vianney.ssennono-1/Desktop/Linka/DEPLOY.md):** Complete, step-by-step Akamai Cloud (Linode) deployment and hosting guide.
- **[`README.md`](file:///Users/john.vianney.ssennono-1/Desktop/Linka/README.md):** Concise, judge-friendly overview and quick-start instructions.
