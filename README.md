# Linka

**When a shipment gets stuck, stop paying for the servers that are waiting on it.**

Linka connects shipping disruptions tracked in **Flex** (business banking & logistics) to cloud infrastructure on **Akamai Connected Cloud (Linode)** that processes those shipments. If a customs hold delays a freight batch by two weeks, Linka computes the working capital that idle servers will drain, matching the logistics PO with cloud tags to pause them with one click.

Built for **Hack Midwest 2026** · Akamai Cloud Challenge · Flex Challenge · Best AI & Agentic Workflow

---

## The Problem

Businesses run two operational systems that never communicate:

| | Flex (Finance & Logistics) | Akamai Cloud (Compute Infrastructure) |
|---|---|---|
| **Knows about** | Purchase orders, ocean transit, customs holds, working capital | CPU, memory, Linode instances, daily billing |
| **Doesn't know about** | What cloud servers are currently running | Whether the goods are stuck in transit |

When a container ship is held at customs for a Section 301 tariff review:

- The **logistics manager** knows the cargo is stuck for 14 days, but has no cloud access.
- The **cloud engineer** has infrastructure access, but never sees supply chain events.
- **Result:** compute workers and staging databases sit at 0% utilization while burning **$180/day** ($2,520 wasted).

Native cloud cost tools only flag idle servers *weeks after* money has already been wasted. Linka acts proactively on the shipping disruption event itself.

---

## How It Works

```
 Flex Logistics Event            Linka FinOps Engine          Akamai Connected Cloud
 ────────────────────            ───────────────────          ──────────────────────
 Batch #104 Delayed        ──►   Discovers Linodes      ──►   Hibernates idle Linodes
 +14 days (Tariff hold)          tagged "Batch-104"           until shipment clears
                                 $180/day × 14d = $2,520
```

1. **Detect.** A logistics disruption occurs (e.g., *"Batch-104, tariff hold, +14 days"*).
2. **Correlate.** Linka locates the Akamai Linodes tagged with that freight batch (`Batch-104`).
3. **Quantify.** Daily cost × delay duration = working capital at risk ($2,520).
4. **Shield.** One click hibernates the Linode compute workloads, preserving cash flow in Flex.

---

## The 4-Step Interactive Demo (VisionOS Design)

Designed in Apple Vision Pro spatial glassmorphism (`#000000` base, frosted blur, tabular figures):

| Step | What you see |
|---|---|
| **1. Baseline** | Flex working capital and Akamai Linode cluster running normally |
| **2. Disruption** | A customs tariff hold hits Batch #104, projecting $2,520 idle waste |
| **3. Agent** | Linka links the delay to tagged Linodes and passes automated safety checks |
| **4. Protect** | One-click execution pauses the Linodes; 30-day forecast chart locks in the savings |

**Mobile Remote Trigger:** Open `/trigger.html` on your phone (or judge's phone). Tapping **Trigger Tariff Hold** broadcasts over WebSockets to transition the live dashboard to Step 2 immediately.

---

## Quick Start (Local)

**Requires:** [Node.js](https://nodejs.org) 18 or newer.

```bash
git clone https://github.com/HackmidwestLMTV/Linka.git
cd Linka
npm install
npm start
```

Open:
- **Dashboard:** [http://localhost:3000](http://localhost:3000)
- **Phone trigger:** [ http://172.237.128.254:3000/trigger.html)

---

## 🌐 Cloud Deployment (Akamai Connected Cloud / Linode)

For step-by-step instructions on launching a Linode instance, connecting via SSH, and hosting Linka live with a public IP for Hack Midwest judging:

👉 **See [DEPLOY.md](DEPLOY.md) for the complete walkthrough.**
