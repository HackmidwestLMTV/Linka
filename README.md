# Linka

**When a shipment gets stuck, stop paying for the servers that are waiting on it.**

Linka connects shipping delays tracked in **Flex** (business banking) to the cloud servers on **AWS** that process those shipments. If a customs hold delays a freight batch by two weeks, Linka works out how much money the related servers will waste while idle. It then lets you pause them with one click.

Built for **Hack Midwest 2026** · Flex Challenge · AWS Challenge · Best AI & Agentic Workflow

---

## The problem

Businesses run two systems that never talk to each other:

| | Flex (finance) | AWS (cloud) |
|---|---|---|
| **Knows about** | Purchase orders, shipping dates, customs holds, cash reserves | CPU usage, memory, per-second billing |
| **Doesn't know about** | What servers are running | Whether the goods have even arrived |

When a container ship is held at customs:

- The **logistics manager** knows the goods are stuck but has no access to AWS.
- The **engineer** has AWS access but never sees the shipping updates.
- **Result:** servers that sync inventory and run staging databases sit idle for weeks and keep billing the whole time.

AWS's own cost tools only flag idle servers *after* days of low usage, and they have no idea a shipment is delayed. Linka acts on the delay itself, before the money is spent.

## How it works

```
 Flex shipping update         Linka                         AWS
 ────────────────────         ─────                         ───
 Batch #104 delayed    ──►    Finds servers tagged   ──►    Pause those servers
 +14 days (customs)           "Batch-104"                   until the shipment clears
                              $180/day × 14 = $2,520
```

1. **Detect.** A shipping disruption arrives for a freight batch, for example *"Batch-104, tariff hold, +14 days"*.
2. **Match.** Linka finds the AWS resources tagged with that batch.
3. **Calculate.** Daily cost × delay days = money at risk.
4. **Act.** You approve, and Linka stops the matched instances.

## The demo

The dashboard walks through the story in four steps. Click the tabs or use the **← →** arrow keys.

| Step | What you see |
|---|---|
| **1. Baseline** | Flex and AWS side by side, everything running normally |
| **2. Disruption** | A customs hold hits Batch #104, with $2,520 of projected waste |
| **3. Agent** | How Linka links the delay to the tagged servers, and the safety checks it runs |
| **4. Protect** | One click pauses the servers, and the chart shows the cash you kept |

**Live trigger:** open `/trigger.html` on a phone (same Wi-Fi) and tap **Trigger Tariff Hold**. The dashboard jumps to step 2 instantly over WebSockets.

## Quick start

**Requires:** [Node.js](https://nodejs.org) 18 or newer.

```bash
git clone https://github.com/HackmidwestLMTV/Linka.git
cd Linka
npm install
npm start
```

Then open:

- **Dashboard:** http://localhost:3000
- **Phone trigger:** http://localhost:3000/trigger.html (on a phone, replace `localhost` with your computer's local IP)

### Demo mode vs. real AWS

By default Linka runs in **demo mode** with sample servers, and **nothing in AWS is touched**.

To stop real EC2 instances, create a `.env` file in the project root:

```env
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
```

> [!WARNING]
> With real credentials, clicking **Protect capital** sends a `StopInstances` call for the instance IDs listed in `server.js`. Replace those sample IDs with your own test instances first, and use an IAM user limited to `ec2:StopInstances`. `.env` is git-ignored, so never commit keys.

## Project structure

```
Linka/
├── server.js            # Express + Socket.IO server; AWS EC2 calls
├── package.json
└── public/
    ├── index.html       # Four-step dashboard
    ├── app.js           # Dashboard logic: steps, chart, live updates
    ├── styles.css       # visionOS-style glass theme
    └── trigger.html     # Phone page that fires the disruption event
```

### Real-time events

| Event | Sent by | Purpose |
|---|---|---|
| `TRIGGER_DISRUPTION` | Phone trigger → server | Report a delayed batch `{ batchId, reason, delayDays }` |
| `LOGISTICS_DISRUPTION_ALERT` | Server → dashboard | Delay details and projected savings |
| `EXECUTE_PROTECTION` | Dashboard → server | User approved pausing the servers |
| `PROTECTION_CONFIRMED` | Server → dashboard | Servers stopped, new status |

## Tech stack

- **Backend:** Node.js, Express, Socket.IO, AWS SDK v3 (`@aws-sdk/client-ec2`)
- **Frontend:** HTML, Tailwind CSS (CDN), Chart.js, Font Awesome

## Current limits and next steps

This is a hackathon prototype:

- **Flex data is simulated.** The disruption comes from the phone trigger, not a live Flex API.
- **Servers are stopped, not hibernated.** The code calls EC2 `StopInstances`. True hibernation needs instances launched with hibernation enabled.
- **Sample resources are hard-coded.** The next step is looking up resources by tag through the AWS Resource Groups Tagging API.
- **No auto-restart yet.** Next is restarting the servers automatically when Flex reports the shipment cleared.
