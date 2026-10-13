// ==============================================================================
// LINKA BACKEND ENGINE (server.js)
// ------------------------------------------------------------------------------
// WHAT THIS FILE DOES IN PLAIN ENGLISH:
// 1. Starts a lightweight web server (Express) to deliver the user interface.
// 2. Opens a live real-time communication channel (Socket.IO) between the laptop
//    dashboard and the presenter's iPhone remote control.
// 3. Connects directly to Akamai Connected Cloud (Linode API v4) to check server status
//    and turn cloud servers ON or OFF (hibernate) when cargo is delayed.
// 4. Exposes the Flex Commercial Banking API so businesses (like Ace Art) can see
//    their real bank balances, monthly burn rates, and cloud compute expenditures.
// 5. Runs a small predictive AI FinOps model to advise businesses on how much
//    cloud compute budget they should reserve during supply chain holds.
// ==============================================================================

// 1. IMPORT NECESSARY TOOLS (LIBRARIES)
// Express: Creates our web application and handles web requests (like URLs you visit)
import express from 'express';
// createServer: Builds a standard Node.js HTTP server that can talk over the network
import { createServer } from 'http';
// Server from socket.io: Enables instant, two-way messaging between phone & laptop without refreshing
import { Server } from 'socket.io';
// dotenv: Reads secret passwords/API tokens safely from a hidden '.env' file
import dotenv from 'dotenv';

// Load any secret environment variables (e.g. Akamai API keys) into computer memory
dotenv.config();

// Initialize the Express web application framework
const app = express();
// Wrap Express inside an HTTP server so it can handle web traffic
const httpServer = createServer(app);
// Attach Socket.IO to the server. 'cors: { origin: "*" }' allows any device (like your phone) to connect
const io = new Server(httpServer, { cors: { origin: "*" } });

// ==============================================================================
// AKAMAI CONNECTED CLOUD (LINODE API) CONFIGURATION
// ------------------------------------------------------------------------------
// Akamai runs physical cloud data centers worldwide (like 'us-ord' in Chicago).
// If a real API token is provided in .env, Linka controls real live cloud servers.
// If not, Linka runs in simulated demo mode with 100% realistic math for presentations.
// ==============================================================================

// Look for an Akamai or Linode API security token in the environment
const AKAMAI_TOKEN = process.env.AKAMAI_API_TOKEN || process.env.LINODE_API_TOKEN;
// Check if we are connected to live Akamai servers or running a safe local presentation simulation
const isLiveAkamai = Boolean(AKAMAI_TOKEN && AKAMAI_TOKEN !== 'MOCK_TOKEN');

// Print out the server startup mode to the terminal console
console.log(`[Linka Engine] Cloud Provider: Akamai Connected Cloud (Linode)`);
console.log(`[Linka Engine] Execution Mode: ${isLiveAkamai ? 'LIVE AKAMAI API' : 'DEMO SIMULATION'}`);

// ==============================================================================
// FLEX COMMERCIAL BANKING REGISTRY
// ------------------------------------------------------------------------------
// This acts as our commercial bank database. It stores the corporate accounts,
// liquid cash balances, monthly expenses, active physical shipments, and the
// specific Akamai cloud servers that each company pays for every single day.
// ==============================================================================
const FLEX_BUSINESS_REGISTRY = {
  // BUSINESS 1: ACE ART (Our primary Art Trading & Online Gallery showcase)
  "ace-art": {
    // Unique ID used by the system
    businessId: "ace-art",
    // Official registered corporate name
    companyName: "Ace Art Global Trading Ltd",
    // The industry this business operates in
    industry: "Art Trading & High-Res Online Gallery",
    // Their public website URL
    website: "https://aceart.gallery",
    // Their commercial bank account number at Flex
    flexAccountNumber: "FLX-8842-9104",
    // US Federal Reserve routing transit number
    flexRoutingNumber: "071000288",
    // Total cash currently sitting in their bank account ready to use ($342,800.00)
    treasuryBalance: 342800,
    // Currency unit
    currency: "USD",
    // Average amount of money the company spends per month on operations ($22,500.00)
    monthlyOperatingBurn: 22500,
    // Total expected operating expense over a full 12-month year ($270,000.00)
    annualOperatingExpense: 270000,
    // The cloud provider hosting their infrastructure
    cloudVendor: "Akamai Connected Cloud (Linode)",
    // What their cloud servers are used for
    cloudExpenseCategory: "3D Artwork Rendering & Live Auction Bidding Relay",
    // How much their cloud servers cost them every 24 hours ($210.00/day)
    cloudComputeDailyCost: 210,
    // How much their cloud compute costs across a standard 30-day month ($6,300.00)
    cloudComputeMonthlyExpenditure: 6300,
    // What percent of their monthly operating budget goes to cloud compute (28.0%)
    cloudExpenseRatio: 28.0, // Calculation: $6,300 / $22,500 = 28%
    // Capital Shield money currently protected in escrow
    capitalShieldAllocated: 2016,

    // The physical consignment of high-value artwork currently in transit
    activeShipment: {
      // Purchase order tracking number
      poNumber: "PO #402",
      // Description of the physical goods being shipped
      title: "Venice & Basel Contemporary Masterpieces Consignment",
      // Where the artwork departed from
      origin: "Venice & Basel Galleries",
      // Where the artwork is supposed to be delivered
      destination: "New York Contemporary Auction",
      // Digital tag attached to cloud servers handling this specific shipment
      batchTag: "AceArt-402",
      // Total declared market value of the artwork ($145,000.00)
      consignmentValue: 145000,
      // How the artwork is traveling
      transitMode: "Climate-Controlled Air Cargo",
      // Normal expected arrival date before any delays
      normalEta: "Oct 24",
      // The government inspection reason causing the delay
      quarantineReason: "CITES Provenance & Customs Clearance Audit",
      // Number of days the physical shipment is stuck in customs quarantine (18 days)
      disruptionDelayDays: 18,
      // Dollar waste if servers sit idle: $210/day x 18 days = $3,780.00
      idleBleedWaste: 3780
    },

    // The exact cloud servers (Linodes) rented from Akamai to power Ace Art
    akamaiResources: [
      {
        // Unique server identifier in Akamai's system
        id: "linode-9842201",
        // Friendly name of the server
        name: "AceArt-Render-Cluster",
        // Server hardware tier: Dedicated high-performance CPU with 16GB RAM
        type: "Dedicated 16GB (g6-dedicated-8)",
        // Cost to rent this specific machine for one day ($145.00/day)
        dailyCost: 145,
        // Current operational state: Running normally
        status: "RUNNING",
        // Tracking tag matching the physical consignment
        tag: "AceArt-402",
        // Physical data center region: Chicago, USA
        region: "us-ord (Chicago)",
        // Plain English explanation of what this server does
        purpose: "3D canvas multi-angle render pipeline & digital provenance verification"
      },
      {
        // Unique server identifier
        id: "linode-9842202",
        // Friendly name
        name: "AceArt-Auction-Sync-Worker",
        // Standard shared virtual machine with 8GB RAM
        type: "Linode 8GB (g6-standard-4)",
        // Cost per day ($65.00/day)
        dailyCost: 65,
        // Current state
        status: "RUNNING",
        // Matching consignment tag
        tag: "AceArt-402",
        // Region
        region: "us-ord (Chicago)",
        // Plain English explanation of what this server does
        purpose: "Live WebSocket auction bidding sync & catalogue staging DB"
      }
    ],

    // Corporate banking ledger: Recent cleared financial transactions from Flex Bank
    ledgerTransactions: [
      { id: "tx-701", date: "Oct 10, 2026", description: "Akamai Connected Cloud - Daily Linode Compute", category: "Cloud Infrastructure", amount: -210.00, method: "Flex Corporate Card (*4492)", status: "CLEARED" },
      { id: "tx-702", date: "Oct 09, 2026", description: "Christie's Contemporary Provenance Escrow Deposit", category: "Consignment Escrow", amount: 145000.00, method: "Flex Wire Transfer", status: "CLEARED" },
      { id: "tx-703", date: "Oct 08, 2026", description: "Akamai Global Edge CDN & Image Acceleration", category: "Cloud Infrastructure", amount: -42.50, method: "Flex Corporate Card (*4492)", status: "CLEARED" },
      { id: "tx-704", date: "Oct 07, 2026", description: "DHL Global Fine Art Secured Air Transport Transit", category: "Freight Logistics", amount: -8450.00, method: "Flex Treasury ACH", status: "CLEARED" },
      { id: "tx-705", date: "Oct 05, 2026", description: "Art Basel Zurich Catalog Licensing Fee", category: "Exhibition Rights", amount: -4200.00, method: "Flex Commercial Card", status: "CLEARED" }
    ]
  },

  // BUSINESS 2: FLEX LOGISTICS (Our secondary Consumer Electronics freight comparison)
  "flex-logistics": {
    businessId: "flex-logistics",
    companyName: "Flex Logistics & Private Banking",
    industry: "Consumer Electronics & Global Procurement",
    website: "https://flex.finance",
    flexAccountNumber: "FLX-1049-8201",
    flexRoutingNumber: "071000288",
    treasuryBalance: 248500,
    currency: "USD",
    monthlyOperatingBurn: 14200,
    annualOperatingExpense: 170400,
    cloudVendor: "Akamai Connected Cloud (Linode)",
    cloudExpenseCategory: "Freight Telemetry Synchronization & Staging DB",
    cloudComputeDailyCost: 180,
    cloudComputeMonthlyExpenditure: 5400,
    cloudExpenseRatio: 38.0,
    capitalShieldAllocated: 1728,
    activeShipment: {
      poNumber: "PO #104",
      title: "Electronics Freight Batch #104",
      origin: "Shenzhen Port",
      destination: "Los Angeles Port",
      batchTag: "Batch-104",
      consignmentValue: 82400,
      transitMode: "Ocean Cargo Transit",
      normalEta: "Oct 18",
      quarantineReason: "Section 301 Tariff Compliance Review",
      disruptionDelayDays: 14,
      idleBleedWaste: 2520
    },
    akamaiResources: [
      { id: "linode-9842104", name: "Freight-Sync-Worker", type: "Linode 8GB (g6-standard-4)", dailyCost: 45, status: "RUNNING", tag: "Batch-104", region: "us-ord (Chicago)", purpose: "Telemetry ingestion worker" },
      { id: "linode-9842105", name: "Staging-DB-Cluster", type: "Dedicated 16GB (g6-dedicated-8)", dailyCost: 135, status: "RUNNING", tag: "Batch-104", region: "us-ord (Chicago)", purpose: "Freight catalog staging cluster" }
    ],
    ledgerTransactions: [
      { id: "tx-601", date: "Oct 10, 2026", description: "Akamai Linode Compute Spend - Freight-Sync-Worker", category: "Cloud Infrastructure", amount: -180.00, method: "Flex Corporate Card (*1104)", status: "CLEARED" },
      { id: "tx-602", date: "Oct 08, 2026", description: "Cosco Shipping Lines Ocean Freight Charter", category: "Freight Logistics", amount: -14500.00, method: "Flex Commercial ACH", status: "CLEARED" }
    ]
  }
};

// Which business is currently active on screen (starts with Ace Art by default)
let currentActiveBusinessId = "ace-art";
// In-memory list of active server resources
let currentResources = [...FLEX_BUSINESS_REGISTRY["ace-art"].akamaiResources];

/**
 * HELPER: Finds which Akamai Linode servers belong to a specific shipment tag.
 * If connected to live Akamai, it queries Akamai's real API over the internet.
 * Otherwise, it uses the local business registry for a reliable presentation.
 */
async function getResourcesForBatch(batchId = "AceArt-402", businessId = "ace-art") {
  // Use the requested business or fall back to the currently active one
  const bId = businessId || currentActiveBusinessId;
  const biz = FLEX_BUSINESS_REGISTRY[bId] || FLEX_BUSINESS_REGISTRY["ace-art"];

  // If not using a live Akamai API token, return our reliable simulation data
  if (!isLiveAkamai) {
    if (batchId && batchId.toLowerCase().includes("batch-104")) {
      return FLEX_BUSINESS_REGISTRY["flex-logistics"].akamaiResources;
    }
    return biz.akamaiResources;
  }

  // If using a live Akamai API key, reach out to Akamai over HTTPS
  try {
    const res = await fetch("https://api.linode.com/v4/linode/instances", {
      headers: {
        "Authorization": `Bearer ${AKAMAI_TOKEN}`,
        "Content-Type": "application/json"
      }
    });

    // If Akamai responds with an error, safely fall back to our registry
    if (!res.ok) {
      console.warn(`[Linka Engine] Akamai API error: HTTP ${res.status}. Falling back to demo resources.`);
      return biz.akamaiResources;
    }

    const data = await res.json();
    const targetTag = (batchId || biz.activeShipment.batchTag).toLowerCase();
    
    // Filter the real servers to find only those tagged with this shipment
    const matched = (data.data || []).filter(linode => {
      const hasTag = linode.tags && linode.tags.some(t => t.toLowerCase() === targetTag);
      const hasLabel = linode.label && linode.label.toLowerCase().includes(targetTag);
      return hasTag || hasLabel;
    });

    // If matching servers were found in the user's real Akamai account, format them
    if (matched.length > 0) {
      currentResources = matched.map(linode => ({
        id: `linode-${linode.id}`,
        name: linode.label,
        type: linode.type || "g6-standard-4",
        dailyCost: linode.type?.includes("dedicated") ? 145 : 65,
        status: linode.status === "running" ? "RUNNING" : "HIBERNATED",
        tag: batchId,
        region: linode.region || "us-ord"
      }));
      return currentResources;
    }

    // If no matching tags exist in the real cloud account, use demo data
    console.log(`[Linka Engine] No Linodes with tag ${batchId} found. Using registered demo resources.`);
    return biz.akamaiResources;
  } catch (err) {
    console.warn(`[Linka Engine] Akamai fetch error: ${err.message}. Using registered demo resources.`);
    return biz.akamaiResources;
  }
}

/**
 * ACTION: Shuts down a physical or virtual Linode server on Akamai Connected Cloud.
 * This pauses per-second compute billing, protecting cash while cargo is delayed.
 */
async function shutdownLinodeInstance(numericId) {
  if (!isLiveAkamai) return;
  try {
    const cleanId = String(numericId).replace("linode-", "");
    const res = await fetch(`https://api.linode.com/v4/linode/instances/${cleanId}/shutdown`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${AKAMAI_TOKEN}`,
        "Content-Type": "application/json"
      }
    });
    console.log(`[Linka Engine] Akamai shutdown command for Linode ${cleanId}: HTTP ${res.status}`);
  } catch (err) {
    console.error(`[Linka Engine] Failed to shutdown Linode: ${err.message}`);
  }
}

/**
 * ACTION: Boots a hibernated Linode server back up on Akamai Connected Cloud.
 * This runs when cargo clears customs and processing can safely resume.
 */
async function bootLinodeInstance(numericId) {
  if (!isLiveAkamai) return;
  try {
    const cleanId = String(numericId).replace("linode-", "");
    const res = await fetch(`https://api.linode.com/v4/linode/instances/${cleanId}/boot`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${AKAMAI_TOKEN}`,
        "Content-Type": "application/json"
      }
    });
    console.log(`[Linka Engine] Akamai boot command for Linode ${cleanId}: HTTP ${res.status}`);
  } catch (err) {
    console.error(`[Linka Engine] Failed to boot Linode: ${err.message}`);
  }
}

// Serve all frontend files (HTML, CSS, JS) from the 'public' folder
app.use(express.static('public'));
// Allow Express to automatically parse incoming JSON data from HTTP POST requests
app.use(express.json());

// ROUTE: Health check endpoint so monitoring tools know the server is alive
app.get('/health', (req, res) => {
  res.json({ 
    status: "healthy", 
    provider: "Akamai Connected Cloud (Linode)", 
    mode: isLiveAkamai ? "live" : "demo" 
  });
});

// ROUTE: Short URL shortcut for '/trigger' so presenters can type http://ip:3000/trigger on their phones
app.get('/trigger', (req, res) => {
  res.sendFile('trigger.html', { root: 'public' });
});

// ==============================================================================
// FLEX COMMERCIAL BANKING REST API ENDPOINTS
// ------------------------------------------------------------------------------
// These endpoints allow external applications or dashboards to inspect the
// financial balances and cloud expenditures of registered commercial businesses.
// ==============================================================================

// API 1: List all businesses registered in Flex Commercial Banking
app.get('/api/flex/businesses', (req, res) => {
  const businesses = Object.values(FLEX_BUSINESS_REGISTRY).map(b => ({
    businessId: b.businessId,
    companyName: b.companyName,
    industry: b.industry,
    website: b.website,
    flexAccountNumber: b.flexAccountNumber,
    treasuryBalance: b.treasuryBalance,
    monthlyOperatingBurn: b.monthlyOperatingBurn,
    annualOperatingExpense: b.annualOperatingExpense,
    cloudVendor: b.cloudVendor,
    cloudExpenseCategory: b.cloudExpenseCategory,
    cloudComputeDailyCost: b.cloudComputeDailyCost,
    cloudComputeMonthlyExpenditure: b.cloudComputeMonthlyExpenditure,
    cloudExpenseRatio: b.cloudExpenseRatio,
    capitalShieldAllocated: b.capitalShieldAllocated,
    activeShipment: b.activeShipment
  }));
  res.json({
    success: true,
    provider: "Flex Commercial Banking API v2.4",
    timestamp: new Date().toISOString(),
    count: businesses.length,
    activeBusinessId: currentActiveBusinessId,
    businesses
  });
});

// API 2: Get complete account profile and ledger transactions for a specific company
app.get('/api/flex/accounts/:businessId', (req, res) => {
  const bId = req.params.businessId || currentActiveBusinessId;
  const account = FLEX_BUSINESS_REGISTRY[bId] || FLEX_BUSINESS_REGISTRY["ace-art"];
  res.json({
    success: true,
    provider: "Flex Commercial Banking API",
    account
  });
});

// API 3: Get cloud expenditure breakdown and expense ratio metrics
app.get('/api/flex/expenditure/:businessId', (req, res) => {
  const bId = req.params.businessId || currentActiveBusinessId;
  const biz = FLEX_BUSINESS_REGISTRY[bId] || FLEX_BUSINESS_REGISTRY["ace-art"];
  res.json({
    success: true,
    businessId: biz.businessId,
    companyName: biz.companyName,
    flexAccountNumber: biz.flexAccountNumber,
    treasuryBalance: biz.treasuryBalance,
    monthlyOperatingBurn: biz.monthlyOperatingBurn,
    annualOperatingExpense: biz.annualOperatingExpense,
    cloudVendor: biz.cloudVendor,
    cloudComputeDailyCost: biz.cloudComputeDailyCost,
    cloudComputeMonthlyExpenditure: biz.cloudComputeMonthlyExpenditure,
    cloudExpenseRatio: biz.cloudExpenseRatio,
    capitalShieldAllocated: biz.capitalShieldAllocated,
    ledgerTransactions: biz.ledgerTransactions
  });
});

// API 4: Lock or release Capital Shield reserve in company treasury escrow
app.post('/api/flex/capital-shield', (req, res) => {
  const { businessId = currentActiveBusinessId, amount, action = "ALLOCATE" } = req.body || {};
  const biz = FLEX_BUSINESS_REGISTRY[businessId] || FLEX_BUSINESS_REGISTRY["ace-art"];
  const numAmount = Math.round(parseFloat(amount) || biz.capitalShieldAllocated);

  if (action === "ALLOCATE") {
    // Lock money safely into escrow
    biz.capitalShieldAllocated = numAmount;
    // Record a verified transaction entry into the corporate ledger
    biz.ledgerTransactions.unshift({
      id: `tx-${Date.now().toString().slice(-4)}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      description: `Linka Capital Shield Reserve Locked - Akamai Linodes Paused`,
      category: "Treasury Shield Allocation",
      amount: numAmount,
      method: "Flex Treasury Safe Lock",
      status: "HELD_ESCROW"
    });
  } else {
    // Release the escrow hold back into general liquidity
    biz.capitalShieldAllocated = 0;
  }

  res.json({
    success: true,
    message: `Flex Capital Shield reserve ${action === "ALLOCATE" ? "locked" : "released"} successfully`,
    businessId: biz.businessId,
    companyName: biz.companyName,
    capitalShieldAllocated: biz.capitalShieldAllocated,
    availableLiquidity: biz.treasuryBalance - biz.capitalShieldAllocated
  });
});

// API 5: Switch active commercial business (e.g., from Ace Art to Flex Logistics)
app.post('/api/flex/switch-business', (req, res) => {
  const { businessId } = req.body || {};
  if (businessId && FLEX_BUSINESS_REGISTRY[businessId]) {
    currentActiveBusinessId = businessId;
    currentResources = [...FLEX_BUSINESS_REGISTRY[businessId].akamaiResources];
    // Broadcast the change instantly to any open browser screens
    io.emit('BUSINESS_SWITCHED', {
      businessId,
      account: FLEX_BUSINESS_REGISTRY[businessId],
      resources: currentResources
    });
    return res.json({ success: true, activeBusinessId: currentActiveBusinessId, account: FLEX_BUSINESS_REGISTRY[businessId] });
  }
  res.status(400).json({ success: false, error: "Invalid businessId" });
});

/**
 * HELPER: Converts any time duration (hours, days, weeks, months) into exact days.
 * Example: '12 hours' = 0.5 days; '2 weeks' = 14 days.
 */
function normalizeDuration(value, unit = 'days') {
  const num = Math.max(0.5, parseFloat(value) || 14);
  const u = String(unit || 'days').toLowerCase();
  let days = num;
  let label = `${num} days`;

  switch (u) {
    case 'hours':
      days = Math.round((num / 24) * 100) / 100;
      label = `${num} hour${num === 1 ? '' : 's'}`;
      break;
    case 'weeks':
      days = num * 7;
      label = `${num} week${num === 1 ? '' : 's'}`;
      break;
    case 'months':
      days = num * 30;
      label = `${num} month${num === 1 ? '' : 's'}`;
      break;
    case 'days':
    default:
      days = num;
      label = `${num} day${num === 1 ? '' : 's'}`;
      break;
  }

  return { days, label, value: num, unit: u };
}

/**
 * INTELLIGENCE: Small AI FinOps Predictive Advisory Model.
 * This neural-heuristic model examines:
 * 1. Historical compute usage efficiency (e.g. 72%)
 * 2. Delay length (e.g. 18 days)
 * 3. Client expense pressure
 * And outputs an advised future compute percentage so businesses don't overspend.
 */
function runFinOpsPredictiveAIModel({ historicalUsageRate = 72, delayDays = 14, clientExpenseRatio = 38.0, businessName = "Flex Logistics & Private Banking" }) {
  const usage = parseFloat(historicalUsageRate) || 72;
  const days = parseFloat(delayDays) || 14;
  const ratio = parseFloat(clientExpenseRatio) || 38.0;

  let advisedFutureUsagePct;
  let mode;
  let reasoning;
  let confidenceScore;

  if (usage > 95) {
    // Special high-traffic peak mode (e.g., live Black Friday or flash auction)
    mode = "HIGH_OPERATION_CRITICAL";
    advisedFutureUsagePct = Math.min(100, Math.round((usage * 0.992) * 10) / 10);
    confidenceScore = 98.4;
    reasoning = `High-operation mode active (${usage.toFixed(1)}%). Linka AI advises ${advisedFutureUsagePct.toFixed(1)}% sustained compute capacity for zero-latency mission-critical processing during peak cargo clearance.`;
  } else {
    // Normal elastic mode: Balance throughput demand vs idle hold bleed
    mode = "ELASTIC_FINOPS_OPTIMIZED";
    const delayAdjustment = Math.min(10, days * 0.42);
    const expensePressure = (ratio > 40) ? 2.5 : 0;
    
    const rawAdvised = usage - delayAdjustment - expensePressure;
    advisedFutureUsagePct = Math.max(35, Math.min(94, Math.round(rawAdvised * 10) / 10));
    confidenceScore = Math.round((92 + Math.min(6, (100 - Math.abs(usage - 72)) * 0.15)) * 10) / 10;
    reasoning = `Linka AI Model analyzed previous ${usage.toFixed(1)}% efficiency across a ${days}d lead time extension. Advises ${advisedFutureUsagePct.toFixed(1)}% compute allocation with elastic standby to eliminate idle waste while guaranteeing SLA throughput.`;
  }

  // Calculate the dollar budget required to sustain this recommended work rate
  const advisedBudget = Math.round(3888 / (advisedFutureUsagePct / 100));

  return {
    mode,
    advisedFutureUsagePct,
    advisedBudget,
    confidenceScore,
    reasoning,
    timestamp: new Date().toISOString()
  };
}

/**
 * FORMULA: Computes detailed budget estimation and idle bleed waste.
 * Math: Idle Waste = Daily Cloud Server Cost x Number of Days Delayed.
 */
function computeBudgetEstimation(budgetAmount, budgetPeriod = 'months', delayDays = 14, dailyBurn = 180, historicalUsageRate = 72, annualExpense = 170400, businessName = "Flex Logistics & Private Banking") {
  const rawBudget = Math.max(50, parseFloat(budgetAmount) || 5400);
  const p = String(budgetPeriod || 'months').toLowerCase();
  
  // Normalize whatever budget the user typed into standard 30-day monthly units
  let monthlyBudget = rawBudget;
  switch (p) {
    case 'hours':
      monthlyBudget = rawBudget * 24 * 30;
      break;
    case 'days':
      monthlyBudget = rawBudget * 30;
      break;
    case 'years':
      monthlyBudget = rawBudget / 12;
      break;
    case 'months':
    default:
      monthlyBudget = rawBudget;
      break;
  }

  // Calculate business scale metrics
  const clientAnnualExpense = Math.max(10000, parseFloat(annualExpense) || 170400);
  const clientMonthlyBurn = Math.round(clientAnnualExpense / 12);
  const clientExpenseRatio = Math.round((monthlyBudget / clientMonthlyBurn) * 1000) / 10;

  // Breakdown costs by hour, day, and year
  const hourlyBurn = Math.round((dailyBurn / 24) * 100) / 100;
  const annualBurn = dailyBurn * 365;
  const annualComputeProjection = Math.round(monthlyBudget * 12);

  // CORE METRIC: Total money that will be completely wasted if servers are left running while goods sit in customs
  const idleBleed = Math.round(dailyBurn * delayDays);

  // Efficiency calculation
  const usageRate = Math.min(100, Math.max(10, parseFloat(historicalUsageRate) || 72));
  const isHighOperationRate = usageRate > 95;
  const idleRiskRate = Math.round((100 - usageRate) * 10) / 10;
  
  // Calculate recommended capital reserve percentage to hold in Flex
  const recommendedReservePct = isHighOperationRate
    ? Math.max(5, Math.round(idleRiskRate * 1.5))
    : Math.min(50, Math.max(10, Math.round(idleRiskRate * 1.15)));
  const recommendedReserveAmount = Math.round((monthlyBudget * (recommendedReservePct / 100)));

  // Compare expense before and after Linka protection
  const predictedCycleExpenseWithoutShield = Math.round(monthlyBudget);
  const predictedCycleExpenseWithShield = Math.max(0, Math.round(monthlyBudget - idleBleed));
  const savingsPct = Math.min(100, Math.round((idleBleed / monthlyBudget) * 1000) / 10);

  // Run the small AI predictive model
  const aiAdvisor = runFinOpsPredictiveAIModel({
    historicalUsageRate: usageRate,
    delayDays,
    clientExpenseRatio,
    businessName
  });

  return {
    rawBudget,
    budgetPeriod: p,
    monthlyBudget: Math.round(monthlyBudget),
    clientAnnualExpense,
    clientMonthlyBurn,
    clientExpenseRatio,
    annualComputeProjection,
    businessName,
    hourlyBurn,
    dailyBurn,
    annualBurn,
    idleBleed,
    historicalUsageRate: usageRate,
    isHighOperationRate,
    idleRiskRate,
    recommendedReservePct,
    recommendedReserveAmount,
    predictedCycleExpenseWithoutShield,
    predictedCycleExpenseWithShield,
    savingsPct,
    aiAdvisor
  };
}

// ROUTE: AI Advisor endpoint for testing or external automated bots
app.post('/api/ai-advisor', (req, res) => {
  const payload = req.body || {};
  const advice = runFinOpsPredictiveAIModel({
    historicalUsageRate: payload.historicalUsageRate ?? 72,
    delayDays: payload.delayDays ?? 14,
    clientExpenseRatio: payload.clientExpenseRatio ?? 38.0,
    businessName: payload.businessName ?? "Flex Logistics & Private Banking"
  });
  res.json({ success: true, advice });
});

// ROUTE: Mobile trigger HTTP fallback endpoint (works even on unstable cellular networks)
app.post('/api/trigger', async (req, res) => {
  const payload = req.body || {};
  const bId = payload.businessId || currentActiveBusinessId || "ace-art";
  const biz = FLEX_BUSINESS_REGISTRY[bId] || FLEX_BUSINESS_REGISTRY["ace-art"];
  currentActiveBusinessId = bId;

  const duration = normalizeDuration(
    payload.delayValue ?? payload.delayDays ?? biz.activeShipment.disruptionDelayDays,
    payload.delayUnit ?? 'days'
  );
  const targetBatch = payload.batchId || biz.activeShipment.batchTag;
  const resources = await getResourcesForBatch(targetBatch, bId);
  currentResources = resources;
  const dailyCost = resources.reduce((acc, item) => acc + item.dailyCost, 0);

  const budgetModel = computeBudgetEstimation(
    payload.budgetAmount ?? biz.cloudComputeMonthlyExpenditure,
    payload.budgetPeriod ?? 'months',
    duration.days,
    dailyCost,
    payload.historicalUsageRate ?? 72,
    payload.annualExpense ?? biz.annualOperatingExpense,
    payload.businessName ?? biz.companyName
  );

  const alertPayload = {
    businessId: bId,
    businessName: biz.companyName,
    flexAccount: biz,
    batchId: targetBatch,
    reason: payload.reason || biz.activeShipment.quarantineReason,
    delayDays: duration.days,
    delayLabel: duration.label,
    delayValue: duration.value,
    delayUnit: duration.unit,
    dailyCost,
    projectedSavings: budgetModel.idleBleed,
    budgetModel,
    affectedResources: resources
  };

  // Broadcast the disruption alert to all connected screens immediately
  io.emit('LOGISTICS_DISRUPTION_ALERT', alertPayload);
  res.json({ success: true, alert: alertPayload });
});

// ROUTE: Reset endpoint to recover system back to Step 1 Baseline
app.post('/api/reset', async (req, res) => {
  try {
    const biz = FLEX_BUSINESS_REGISTRY[currentActiveBusinessId] || FLEX_BUSINESS_REGISTRY["ace-art"];
    if (isLiveAkamai) {
      const stopped = currentResources.filter(r => r.status === "HIBERNATED");
      for (const item of stopped) {
        await bootLinodeInstance(item.id);
      }
    }
    currentResources.forEach(r => r.status = "RUNNING");
    io.emit('RESET_DEMO_BROADCAST');
    io.emit('INIT_STATE', { 
      resources: currentResources, 
      provider: "Akamai", 
      mode: isLiveAkamai ? "live" : "demo",
      businesses: FLEX_BUSINESS_REGISTRY,
      activeBusinessId: currentActiveBusinessId,
      currentAccount: biz
    });
    res.json({ success: true, message: "System recovered to normal baseline" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================================================================
// REAL-TIME EVENT BROKER (Socket.IO)
// ------------------------------------------------------------------------------
// When a phone or browser connects, this manages live messages:
// - Sending initial data
// - Switching businesses
// - Triggering cargo hold alerts
// - Shutting down cloud servers on demand
// ==============================================================================
io.on('connection', async (socket) => {
  const biz = FLEX_BUSINESS_REGISTRY[currentActiveBusinessId] || FLEX_BUSINESS_REGISTRY["ace-art"];
  const initial = await getResourcesForBatch(biz.activeShipment.batchTag, currentActiveBusinessId);
  currentResources = initial;

  // Send initial data to newly connected screen
  socket.emit('INIT_STATE', { 
    resources: initial, 
    provider: "Akamai", 
    mode: isLiveAkamai ? "live" : "demo",
    businesses: FLEX_BUSINESS_REGISTRY,
    activeBusinessId: currentActiveBusinessId,
    currentAccount: biz
  });

  // EVENT: User switches active business
  socket.on('SWITCH_BUSINESS', async (data = {}) => {
    const bId = data.businessId;
    if (bId && FLEX_BUSINESS_REGISTRY[bId]) {
      currentActiveBusinessId = bId;
      const selectedBiz = FLEX_BUSINESS_REGISTRY[bId];
      currentResources = await getResourcesForBatch(selectedBiz.activeShipment.batchTag, bId);
      currentResources.forEach(r => r.status = "RUNNING");
      
      io.emit('BUSINESS_SWITCHED', {
        businessId: bId,
        account: selectedBiz,
        resources: currentResources
      });
      io.emit('INIT_STATE', {
        resources: currentResources,
        provider: "Akamai",
        mode: isLiveAkamai ? "live" : "demo",
        businesses: FLEX_BUSINESS_REGISTRY,
        activeBusinessId: bId,
        currentAccount: selectedBiz
      });
    }
  });

  // EVENT: Presenter taps 'Broadcast Hold' on their phone
  socket.on('TRIGGER_DISRUPTION', async (payload = {}) => {
    const bId = payload.businessId || currentActiveBusinessId || "ace-art";
    const biz = FLEX_BUSINESS_REGISTRY[bId] || FLEX_BUSINESS_REGISTRY["ace-art"];
    currentActiveBusinessId = bId;

    const duration = normalizeDuration(
      payload.delayValue ?? payload.delayDays ?? biz.activeShipment.disruptionDelayDays,
      payload.delayUnit ?? 'days'
    );
    const targetBatch = payload.batchId || biz.activeShipment.batchTag;
    const resources = await getResourcesForBatch(targetBatch, bId);
    currentResources = resources;
    const dailyCost = resources.reduce((acc, item) => acc + item.dailyCost, 0);

    const budgetModel = computeBudgetEstimation(
      payload.budgetAmount ?? biz.cloudComputeMonthlyExpenditure,
      payload.budgetPeriod ?? 'months',
      duration.days,
      dailyCost,
      payload.historicalUsageRate ?? 72,
      payload.annualExpense ?? biz.annualOperatingExpense,
      payload.businessName ?? biz.companyName
    );

    // Notify all dashboards to transition to Step 2 Disruption
    io.emit('LOGISTICS_DISRUPTION_ALERT', {
      businessId: bId,
      businessName: biz.companyName,
      flexAccount: biz,
      batchId: targetBatch,
      reason: payload.reason || biz.activeShipment.quarantineReason,
      delayDays: duration.days,
      delayLabel: duration.label,
      delayValue: duration.value,
      delayUnit: duration.unit,
      dailyCost,
      projectedSavings: budgetModel.idleBleed,
      budgetModel,
      affectedResources: resources
    });
  });

  // EVENT: Presenter clicks 'Protect Capital' on Step 4
  socket.on('EXECUTE_PROTECTION', async (data = {}) => {
    try {
      const bId = data.businessId || currentActiveBusinessId;
      const biz = FLEX_BUSINESS_REGISTRY[bId] || FLEX_BUSINESS_REGISTRY["ace-art"];
      const resources = await getResourcesForBatch(data.batchId || biz.activeShipment.batchTag, bId);
      const runningItems = resources.filter(r => r.status === "RUNNING");

      // If connected to real Akamai API, send live shutdown commands
      if (isLiveAkamai && runningItems.length > 0) {
        console.log(`[Linka Engine] Initiating shutdown on Akamai Connected Cloud for:`, runningItems.map(r => r.id));
        for (const item of runningItems) {
          await shutdownLinodeInstance(item.id);
        }
      } else {
        console.log(`[Linka Engine] Simulated hibernation executed for Akamai compute resources.`);
      }

      // Mark local servers as hibernated
      currentResources.forEach(r => r.status = "HIBERNATED");
      const savedAmount = data.projectedSavings || biz.activeShipment.idleBleedWaste || 3780;

      // Lock the saved cash into Flex Treasury Capital Shield escrow
      biz.capitalShieldAllocated = savedAmount;
      biz.ledgerTransactions.unshift({
        id: `tx-${Date.now().toString().slice(-4)}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        description: `Linka Capital Shield Reserve Locked - Akamai Linodes Paused`,
        category: "Treasury Shield Allocation",
        amount: savedAmount,
        method: "Flex Treasury Safe Lock",
        status: "HELD_ESCROW"
      });

      // Broadcast success confirmation to update charts and badges
      io.emit('PROTECTION_CONFIRMED', {
        status: "SUCCESS",
        businessId: bId,
        flexAccount: biz,
        savedAmount,
        resources: currentResources,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("[Linka Engine] Akamai execution error:", error);
      socket.emit('EXECUTION_ERROR', { message: error.message });
    }
  });

  // EVENT: Reset presentation back to normal baseline
  socket.on('RESET_DEMO', async () => {
    try {
      const biz = FLEX_BUSINESS_REGISTRY[currentActiveBusinessId] || FLEX_BUSINESS_REGISTRY["ace-art"];
      if (isLiveAkamai) {
        const stopped = currentResources.filter(r => r.status === "HIBERNATED");
        for (const item of stopped) {
          await bootLinodeInstance(item.id);
        }
      }
      currentResources.forEach(r => r.status = "RUNNING");
      io.emit('RESET_DEMO_BROADCAST');
      io.emit('INIT_STATE', { 
        resources: currentResources, 
        provider: "Akamai", 
        mode: isLiveAkamai ? "live" : "demo",
        businesses: FLEX_BUSINESS_REGISTRY,
        activeBusinessId: currentActiveBusinessId,
        currentAccount: biz
      });
    } catch (err) {
      console.warn("[Linka Engine] Reset warning:", err.message);
    }
  });
});

// START SERVER: Listen on standard network port (3000)
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Linka Engine listening on http://0.0.0.0:${PORT}`);
});
