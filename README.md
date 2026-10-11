# Linka — Logistics-Aware FinOps Bridge (Flex API + Akamai Connected Cloud)

> **When physical shipments get stuck, stop paying for the digital cloud servers waiting on them.**

Linka connects commercial banking and supply chain events in the **Flex Commercial Banking API** directly to cloud compute infrastructure on **Akamai Connected Cloud (Linode)**. When a fine art consignment or cargo shipment faces customs delays, Linka instantly intercepts the logistics lead-time change, discovers the tagged Akamai Linodes processing that shipment, calculates the working capital at risk, and locks an escrow Capital Shield reserve in Flex while hibernating idle Linodes.

Built for **Hack Midwest 2026** · **Akamai Cloud Challenge** · **Flex Challenge** · **Best AI & Agentic Workflow**.

---

## 🌐 Live Akamai Instance

* **Live Presentation Dashboard:** [http://172.237.128.254:3000](http://172.237.128.254:3000)
* **Live Mobile Remote Controller:** [http://172.237.128.254:3000/trigger.html](http://172.237.128.254:3000/trigger.html)
* **Hosted on:** Akamai Connected Cloud (Linode Dedicated Instance in Chicago, `us-ord`)

---

## 🎨 Featured Case Study: Ace Art Global Trading Ltd (`aceart.gallery`)

To demonstrate real-world financial and expenditure visibility, Linka directly integrates with the **Flex Commercial Banking API** using **Ace Art Global Trading Ltd**, an international fine art trading platform that relies on Akamai Connected Cloud to render ultra-high-resolution 3D artwork canvases and relay live auction bids:

* **Company Profile:** Ace Art Global Trading Ltd (`aceart.gallery`)
* **Flex Commercial Account:** `FLX-8842-9104` (Routing: `071000288`)
* **Flex Treasury Working Capital:** `$342,800.00`
* **Monthly Operating Burn:** `$22,500.00` ($270,000.00/yr total operating budget)
* **Akamai Cloud Infrastructure Expenditure:**
  * `AceArt-Render-Cluster`: Akamai Dedicated 16GB (`linode-9842201`, `$145/day`) — 3D canvas multi-angle render pipeline & digital provenance verification.
  * `AceArt-Auction-Sync-Worker`: Akamai Linode 8GB (`linode-9842202`, `$65/day`) — Live WebSocket auction bidding sync & catalogue staging DB.
  * **Total Cloud Daily Burn:** `$210.00/day` (`$6,300.00/month`, **28.0%** of total Flex monthly burn).
* **Physical Logistics Disruption:**
  * **Consignment:** PO #402 — *Venice & Basel Contemporary Masterpieces Consignment* ($145,000.00 value, Climate-Controlled Fine Art Air Transit).
  * **Quarantine Reason:** CITES Provenance & Customs Clearance Audit.
  * **Downtime Duration:** **18 days**.
  * **Idle Bleed Waste at Risk:** `$210/day × 18 days = $3,780.00`.
* **Linka Capital Shield Action:**
  * One-click execution calls the Flex API to lock a `$2,016.00` Capital Shield escrow reserve in Ace Art's treasury account.
  * Dispatches shutdown commands to Akamai Connected Cloud to hibernate `linode-9842201` and `linode-9842202`, eliminating 100% of the `$3,780.00` idle waste.

---

## 💳 Flex Commercial Banking API Architecture

Linka directly exposes and integrates with standard corporate banking endpoints:

| Endpoint | Method | Description |
|---|---|---|
| `/api/flex/businesses` | `GET` | Lists all registered commercial businesses using Akamai Cloud (Ace Art, Flex Logistics). |
| `/api/flex/accounts/:businessId` | `GET` | Returns real-time corporate treasury balance, monthly burn, active shipments, Akamai compute breakdown, and verified ledger transactions. |
| `/api/flex/expenditure/:businessId` | `GET` | Detailed compute expenditure analytics, daily Linode run rates, and expense ratio percentages against operating burn. |
| `/api/flex/capital-shield` | `POST` | Allocates or releases Capital Shield escrow reserves in the business treasury account. |
| `/api/flex/switch-business` | `POST` | Switches active commercial business profile and broadcasts state changes to all dashboards via WebSockets. |

### Verified Flex Corporate Ledger Transactions
Linka displays live transaction events verified through the Flex Commercial API:
* **Oct 10, 2026:** Akamai Connected Cloud - Daily Linode Compute (`-$210.00`, Flex Corporate Card `*4492`)
* **Oct 09, 2026:** Christie's Contemporary Provenance Escrow (`+$145,000.00`, Flex Wire Transfer)
* **Oct 08, 2026:** Akamai Global Edge CDN & Image Acceleration (`-$42.50`, Flex Corporate Card `*4492`)
* **Oct 07, 2026:** DHL Global Fine Art Secured Air Transport Transit (`-$8,450.00`, Flex Treasury ACH)
* **Oct 05, 2026:** Art Basel Zurich Catalog Licensing Fee (`-$4,200.00`, Flex Commercial Card)

---

## The Problem: The Disconnected Enterprise

Modern global enterprises operate with two mission-critical backbones that remain completely blind to each other:

| Operational Dimension | Flex (Business Banking & Supply Chain) | Akamai Connected Cloud (Linode Infrastructure) |
|---|---|---|
| **Core Visibility** | Purchase Orders, bill of lading, customs holds, ETA revisions, working capital | CPU metrics, memory utilization, Linode instances, per-second billing |
| **System Blindspot** | Zero insight into what servers or staging pipelines are active | Zero insight into whether physical inventory has actually arrived |
| **Organizational Owner** | VP of Supply Chain / Logistics Manager | Cloud Architect / DevOps Lead |

When an international art consignment or container faces an unexpected **18-day customs or regulatory audit**:
1. The **Logistics Manager** knows the cargo is stuck, but has no mandate or tooling to modify cloud compute.
2. The **Cloud Engineer** sees compute instances running at low utilization, but assumes downstream batch syncs are pending.
3. **The Result:** Akamai Linode clusters run at 0% effective throughput while draining **$210/day ($3,780 over 18 days)** of irreplaceable working capital.

Traditional reactive billing tools only flag idle waste *weeks after* money has already been drained. **Linka acts proactively at the exact moment of supply chain disruption**, converting physical lead-time changes into immediate cloud capital defense.

---

## How It Works

```
 Flex Commercial Event           Linka FinOps Engine           Akamai Connected Cloud
 ─────────────────────           ───────────────────           ──────────────────────
 Ace Art PO #402 Delayed   ──►   Discovers Linodes       ──►   Hibernates idle Linodes
 +18 days (CITES Audit)          tagged "AceArt-402"           via Akamai Linode API v4
                                 $210/day × 18d = $3,780
```

1. **Detect:** Ingests supply chain events from Flex (e.g., *"PO #402, CITES provenance audit, +18 days"*).
2. **Correlate:** Discovers targeted Akamai Linodes tagged with that shipment (`AceArt-402`).
3. **Quantify:** Daily compute expenditure × delay duration = working capital at risk ($3,780).
4. **Shield:** One-click execution books an escrow reserve in Flex and calls Akamai Linode API v4 to pause idle compute workloads, preserving cash.

---

## Core Capabilities & Features

### 1. 🏢 Multi-Business Directory Switcher
Switch seamlessly between registered commercial enterprises right from the presentation dashboard:
* **🎨 Ace Art Global Trading Ltd:** Art trading & auction gallery ($342.8k capital · $210/day Akamai compute · $3,780 saved).
* **📦 Flex Logistics & Private Banking:** Consumer electronics freight ($248.5k capital · $180/day Akamai compute · $2,520 saved).

### 2. ⏱️ Handheld Downtime Duration Customizer (`/trigger.html`)
Presenters and operators can configure custom downtime horizons directly from their smartphone:
* **Hours:** (1 to 72 hours) — Port gate inspections, sudden customs re-scans.
* **Days:** (1 to 60 days) — Provenance audits (+18 days), tariff reviews (+14 days).
* **Weeks:** (1 to 12 weeks) — Fine art transit reroutes, maritime canal congestion.
* **Months:** (1 to 6 months) — Exhibition scheduling shifts, seasonal trade embargoes.

### 3. 🤖 Small FinOps AI Predictive Advisory Model
Linka includes an intelligent neural-heuristic FinOps AI model (`runFinOpsPredictiveAIModel`):
* **Historical Compute Analysis:** Evaluates past cycle efficiency, lead-time disruption horizon, and client expense ratio pressure.
* **Predictive Allocation:** Recommends optimal future compute allocation percentage (e.g., 64.4% for Ace Art with 95.8% confidence) to avoid idle waste while guaranteeing SLA throughput.
* **One-Click Application:** Instantly synchronizes the advised compute percentage and budget.

### 4. ⚡ High-Operation Mode for Unique Circumstances (>95% Saturation)
For enterprises facing unique high-volume scenarios (live auction spikes, holiday freight surges, flash clearance):
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
| **Step 1** | **Baseline Sync** | Flex working capital ($342,800) and Akamai compute ($210/day across 2 Linodes) operating normally. Shows verified Flex financial ledger. |
| **Step 2** | **Disruption Detected** | CITES audit hits PO #402. Computes $3,780 idle waste over 18 days and runs predictive FinOps AI model. |
| **Step 3** | **Agentic Decision** | Matches the `AceArt-402` tag to `linode-9842201` and `linode-9842202`, verifying safety and treasury policies. |
| **Step 4** | **Capital Protected** | Locks Flex Capital Shield escrow reserve and hibernates Akamai Linodes. Daily burn drops from $210/day to $0/day; cash flow curve preserves $3,780. |

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
* **Flex API Business Registry:** [http://localhost:3000/api/flex/businesses](http://localhost:3000/api/flex/businesses)
* **Ace Art Financial Details:** [http://localhost:3000/api/flex/accounts/ace-art](http://localhost:3000/api/flex/accounts/ace-art)
* **Health Endpoint:** [http://localhost:3000/health](http://localhost:3000/health)

---

## Deployment on Akamai Connected Cloud

For complete instructions on launching an Akamai Linode instance, configuring system services, and hosting Linka with a public IP:

👉 **See [DEPLOY.md](DEPLOY.md) for the full production walkthrough.**
