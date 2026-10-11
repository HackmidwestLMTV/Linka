# Linka — Logistics-Aware FinOps Bridge

> **When physical shipments get stuck, stop paying for the digital cloud servers waiting on them.**

Linka connects supply chain disruptions tracked in **Flex** (business banking and logistics) directly to cloud compute infrastructure on **Akamai Connected Cloud (Linode)**. When a customs tariff hold delays an ocean freight shipment by two weeks, Linka instantly intercepts the logistics lead-time change, discovers the tagged Akamai Linodes processing that shipment, calculates the working capital at risk, and enables one-click or automated cloud hibernation.

Built for **Hack Midwest 2026** · **Akamai Cloud Challenge** · **Flex Challenge** · **Best AI & Agentic Workflow**.

---

## 🌐 Live Akamai Instance

* **Live Presentation Dashboard:** [http://172.237.128.254:3000](http://172.237.128.254:3000)
* **Live Mobile Remote Controller:** [http://172.237.128.254:3000/trigger.html](http://172.237.128.254:3000/trigger.html)
* **Hosted on:** Akamai Connected Cloud (Linode Dedicated Instance in Chicago, `us-ord`)

---

## The Problem: The Disconnected Enterprise

Modern global enterprises operate with two mission-critical backbones that remain completely blind to each other:

| Operational Dimension | Flex (Business Banking & Supply Chain) | Akamai Connected Cloud (Linode Infrastructure) |
|---|---|---|
| **Core Visibility** | Purchase Orders, bill of lading, customs holds, ETA revisions, working capital | CPU metrics, memory utilization, Linode instances, per-second billing |
| **System Blindspot** | Zero insight into what servers or staging pipelines are active | Zero insight into whether physical inventory has actually arrived |
| **Organizational Owner** | VP of Supply Chain / Logistics Manager | Cloud Architect / DevOps Lead |

When an international ocean container faces an unexpected **14-day Section 301 customs tariff compliance review**:
1. The **Logistics Manager** knows the cargo is stuck for two weeks, but has no mandate or tooling to modify cloud compute.
2. The **Cloud Engineer** sees compute instances running at low utilization, but assumes downstream batch syncs are pending.
3. **The Result:** Akamai Linode clusters run at 0% effective throughput while draining **$180/day ($2,520 over 14 days)** of irreplaceable working capital.

Traditional reactive billing tools only flag idle waste *weeks after* money has already been drained. **Linka acts proactively at the exact moment of supply chain disruption**, converting physical lead-time changes into immediate cloud capital defense.

---

## How It Works

```
 Flex Logistics Event            Linka FinOps Engine           Akamai Connected Cloud
 ────────────────────            ───────────────────           ──────────────────────
 Batch #104 Delayed        ──►   Discovers Linodes       ──►   Hibernates idle Linodes
 +14 days (Tariff hold)          tagged "Batch-104"            via Akamai Linode API v4
                                 $180/day × 14d = $2,520
```

1. **Detect:** Ingests supply chain events (e.g., *"Batch-104, tariff hold, +14 days"*).
2. **Correlate:** Discovers targeted Akamai Linodes tagged with that freight batch (`Batch-104`).
3. **Quantify:** Daily cost × delay duration = working capital at risk ($2,520).
4. **Shield:** One-click execution calls Akamai Linode API v4 to pause the idle compute workloads, preserving working capital in Flex.

---

## Core Capabilities & Features

### 1. ⏱️ Handheld Downtime Duration Customizer (`/trigger.html`)
Presenters and operators can configure custom downtime horizons directly from their smartphone:
* **Hours:** (1 to 72 hours) — Port gate inspections, sudden customs re-scans.
* **Days:** (1 to 60 days) — Section 301 tariff compliance reviews (+14 days).
* **Weeks:** (1 to 12 weeks) — Maritime shipping re-routings, canal congestion.
* **Months:** (1 to 6 months) — Seasonal trade embargoes, supply chain retooling.

### 2. 🏢 Customizable Business Expense Projections
Linka adapts to different business scales and operating structures:
* **Flex Private Banking & Logistics:** $170,400/yr operating burn ($14,200/mo baseline · $5,400/mo compute).
* **Mid-Market Global E-Commerce:** $540,000/yr operating burn ($45,000/mo baseline · $12,500/mo compute).
* **High-Speed Supply SaaS:** $1,440,000/yr operating burn ($120,000/mo baseline · $32,000/mo compute).
* **Custom Enterprise:** Direct numerical entry for any enterprise operating budget, dynamically updating monthly burn and compute expense ratios.

### 3. 🤖 Small FinOps AI Predictive Advisory Model
Linka includes an intelligent neural-heuristic FinOps AI model (`runFinOpsPredictiveAIModel`):
* **Historical Compute Analysis:** Evaluates past cycle efficiency, lead-time disruption horizon, and client expense ratio pressure.
* **Predictive Allocation:** Recommends optimal future compute allocation percentage (e.g., 66%–68% for elastic workloads) to avoid idle waste while guaranteeing SLA throughput.
* **One-Click Application:** Instantly synchronizes the advised compute percentage and budget with 95%+ confidence.

### 4. ⚡ High-Operation Mode for Unique Circumstances (>95% Saturation)
For enterprises facing unique, high-volume scenarios (holiday freight surges, flash clearance sales, or critical trade blockades), Linka supports sustained operation rates beyond 95% (up to 100%):
* **Presets:** `96% HA` (High Availability), `98% ⚡` (Peak Surge), `99.5%` (Mission-Critical Sovereign Flow).
* **Saturation Logic:** Prioritizes continuous 0-latency clearance over hibernation, shifting the capital shield toward failover and bandwidth burst reserves.

### 5. 🪟 Apple VisionOS Spatial Design System
* **Spatial Glassmorphism:** Frosted blur (`blur(40px) saturate(190%)`), `#000000` true pitch-black base, specular highlights.
* **Dual Ambient Aura:** Flex Green (`rgba(67, 126, 91, 0.18)`) meets Akamai Electric Blue (`rgba(0, 153, 255, 0.16)`).
* **Keyboard-First Pitching:** Step forward and backward seamlessly using `←` and `→` arrow keys.
* **Haptic Mobile Broadcast:** Triggering holds from `/trigger.html` vibrates the mobile device and broadcasts state changes to the dashboard in real time over dual-channel WebSockets + HTTP REST.

---

## Akamai Linode API Integration

Linka natively integrates with **Akamai Connected Cloud (Linode API v4)**:

```javascript
// Fetch Linode instances tagged with shipment ID
GET https://api.linode.com/v4/linode/instances
Authorization: Bearer <AKAMAI_API_TOKEN>

// Hibernate Linode compute instance during shipment hold
POST https://api.linode.com/v4/linode/instances/{instanceId}/shutdown

// Revive Linode compute instance when customs clears
POST https://api.linode.com/v4/linode/instances/{instanceId}/boot
```

* **Live Mode:** Dispatches real hardware state changes directly to Akamai Connected Cloud when an `AKAMAI_API_TOKEN` (or `LINODE_API_TOKEN`) is present.
* **Deterministic Simulation Mode:** Automatically falls back to deterministic simulation when running without credentials, ensuring a smooth presentation in any environment.

---

## 4-Step Presentation Flow

| Step | Screen Title | Key Operational Actions |
|---|---|---|
| **Step 1** | **Baseline Sync** | Flex working capital ($248,500) and Akamai compute ($180/day across 2 Linodes) operating normally. |
| **Step 2** | **Disruption Detected** | Section 301 tariff hold hits Batch #104. Computes $2,520 idle waste over 14 days and runs predictive FinOps AI model. |
| **Step 3** | **Agentic Decision** | Matches the `Batch-104` tag to `linode-9842104` and `linode-9842105`, verifying safety policies. |
| **Step 4** | **Capital Protected** | Pauses Akamai Linodes. Daily burn drops from $180/day to $0/day; 30-day cash flow curve locks in the preserved capital. |

---

## Quick Start (Local Development)

**Prerequisites:** [Node.js](https://nodejs.org) 18 or newer.

```bash
# 1. Clone the repository
git clone https://github.com/HackmidwestLMTV/Linka.git
cd Linka

# 2. Install dependencies
npm install

# 3. (Optional) Provide Akamai API Token
echo "AKAMAI_API_TOKEN=your_token_here" > .env

# 4. Start the Linka engine
npm start
```

* **Presentation Dashboard:** [http://localhost:3000](http://localhost:3000) (Local) · [http://172.237.128.254:3000](http://172.237.128.254:3000) (Live Akamai)
* **Mobile Controller:** [http://localhost:3000/trigger.html](http://localhost:3000/trigger.html) (Local) · [http://172.237.128.254:3000/trigger.html](http://172.237.128.254:3000/trigger.html) (Live Akamai)
* **Health Endpoint:** [http://localhost:3000/health](http://localhost:3000/health)

---

## Deployment on Akamai Connected Cloud

For complete instructions on launching an Akamai Linode instance, configuring system services, and hosting Linka with a public IP:

👉 **See [DEPLOY.md](DEPLOY.md) for the full production walkthrough.**
