import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

// Akamai / Linode API configuration
const AKAMAI_TOKEN = process.env.AKAMAI_API_TOKEN || process.env.LINODE_API_TOKEN;
const isLiveAkamai = Boolean(AKAMAI_TOKEN && AKAMAI_TOKEN !== 'MOCK_TOKEN');

console.log(`[Linka Engine] Cloud Provider: Akamai Connected Cloud (Linode)`);
console.log(`[Linka Engine] Execution Mode: ${isLiveAkamai ? 'LIVE AKAMAI API' : 'DEMO SIMULATION'}`);

// Flex Commercial Banking Registry: Registered businesses using Akamai Cloud
const FLEX_BUSINESS_REGISTRY = {
  "ace-art": {
    businessId: "ace-art",
    companyName: "Ace Art Global Trading Ltd",
    industry: "Art Trading & High-Res Online Gallery",
    website: "https://aceart.gallery",
    flexAccountNumber: "FLX-8842-9104",
    flexRoutingNumber: "071000288",
    treasuryBalance: 342800,
    currency: "USD",
    monthlyOperatingBurn: 22500,
    annualOperatingExpense: 270000,
    cloudVendor: "Akamai Connected Cloud (Linode)",
    cloudExpenseCategory: "3D Artwork Rendering & Live Auction Bidding Relay",
    cloudComputeDailyCost: 210,
    cloudComputeMonthlyExpenditure: 6300,
    cloudExpenseRatio: 28.0, // $6,300 / $22,500
    capitalShieldAllocated: 2016,
    activeShipment: {
      poNumber: "PO #402",
      title: "Venice & Basel Contemporary Masterpieces Consignment",
      origin: "Venice & Basel Galleries",
      destination: "New York Contemporary Auction",
      batchTag: "AceArt-402",
      consignmentValue: 145000,
      transitMode: "Climate-Controlled Air Cargo",
      normalEta: "Oct 24",
      quarantineReason: "CITES Provenance & Customs Clearance Audit",
      disruptionDelayDays: 18,
      idleBleedWaste: 3780
    },
    akamaiResources: [
      {
        id: "linode-9842201",
        name: "AceArt-Render-Cluster",
        type: "Dedicated 16GB (g6-dedicated-8)",
        dailyCost: 145,
        status: "RUNNING",
        tag: "AceArt-402",
        region: "us-ord (Chicago)",
        purpose: "3D canvas multi-angle render pipeline & digital provenance verification"
      },
      {
        id: "linode-9842202",
        name: "AceArt-Auction-Sync-Worker",
        type: "Linode 8GB (g6-standard-4)",
        dailyCost: 65,
        status: "RUNNING",
        tag: "AceArt-402",
        region: "us-ord (Chicago)",
        purpose: "Live WebSocket auction bidding sync & catalogue staging DB"
      }
    ],
    ledgerTransactions: [
      { id: "tx-701", date: "Oct 10, 2026", description: "Akamai Connected Cloud - Daily Linode Compute", category: "Cloud Infrastructure", amount: -210.00, method: "Flex Corporate Card (*4492)", status: "CLEARED" },
      { id: "tx-702", date: "Oct 09, 2026", description: "Christie's Contemporary Provenance Escrow Deposit", category: "Consignment Escrow", amount: 145000.00, method: "Flex Wire Transfer", status: "CLEARED" },
      { id: "tx-703", date: "Oct 08, 2026", description: "Akamai Global Edge CDN & Image Acceleration", category: "Cloud Infrastructure", amount: -42.50, method: "Flex Corporate Card (*4492)", status: "CLEARED" },
      { id: "tx-704", date: "Oct 07, 2026", description: "DHL Global Fine Art Secured Air Transport Transit", category: "Freight Logistics", amount: -8450.00, method: "Flex Treasury ACH", status: "CLEARED" },
      { id: "tx-705", date: "Oct 05, 2026", description: "Art Basel Zurich Catalog Licensing Fee", category: "Exhibition Rights", amount: -4200.00, method: "Flex Commercial Card", status: "CLEARED" }
    ]
  },
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

let currentActiveBusinessId = "ace-art";
let currentResources = [...FLEX_BUSINESS_REGISTRY["ace-art"].akamaiResources];

/**
 * Fetch Linode compute instances from Akamai API if live token is present,
 * otherwise return current resources for the requested batch or business.
 */
async function getResourcesForBatch(batchId = "AceArt-402", businessId = "ace-art") {
  const bId = businessId || currentActiveBusinessId;
  const biz = FLEX_BUSINESS_REGISTRY[bId] || FLEX_BUSINESS_REGISTRY["ace-art"];

  if (!isLiveAkamai) {
    if (batchId && batchId.toLowerCase().includes("batch-104")) {
      return FLEX_BUSINESS_REGISTRY["flex-logistics"].akamaiResources;
    }
    return biz.akamaiResources;
  }

  try {
    const res = await fetch("https://api.linode.com/v4/linode/instances", {
      headers: {
        "Authorization": `Bearer ${AKAMAI_TOKEN}`,
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) {
      console.warn(`[Linka Engine] Akamai API error: HTTP ${res.status}. Falling back to demo resources.`);
      return biz.akamaiResources;
    }

    const data = await res.json();
    const targetTag = (batchId || biz.activeShipment.batchTag).toLowerCase();
    
    // Match Linodes with tag or prefix
    const matched = (data.data || []).filter(linode => {
      const hasTag = linode.tags && linode.tags.some(t => t.toLowerCase() === targetTag);
      const hasLabel = linode.label && linode.label.toLowerCase().includes(targetTag);
      return hasTag || hasLabel;
    });

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

    console.log(`[Linka Engine] No Linodes with tag ${batchId} found. Using registered demo resources.`);
    return biz.akamaiResources;
  } catch (err) {
    console.warn(`[Linka Engine] Akamai fetch error: ${err.message}. Using registered demo resources.`);
    return biz.akamaiResources;
  }
}

/**
 * Shut down Linode instance on Akamai Connected Cloud
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
 * Boot Linode instance back up on Akamai Connected Cloud
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

app.use(express.static('public'));
app.use(express.json());

// Health & status endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: "healthy", 
    provider: "Akamai Connected Cloud (Linode)", 
    mode: isLiveAkamai ? "live" : "demo" 
  });
});

// Clean route for /trigger (works with or without .html)
app.get('/trigger', (req, res) => {
  res.sendFile('trigger.html', { root: 'public' });
});

// ==========================================
// FLEX COMMERCIAL BANKING API ENDPOINTS
// ==========================================

// Flex API: List all registered commercial businesses
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

// Flex API: Full account and financial ledger details for a business
app.get('/api/flex/accounts/:businessId', (req, res) => {
  const bId = req.params.businessId || currentActiveBusinessId;
  const account = FLEX_BUSINESS_REGISTRY[bId] || FLEX_BUSINESS_REGISTRY["ace-art"];
  res.json({
    success: true,
    provider: "Flex Commercial Banking API",
    account
  });
});

// Flex API: Expenditure breakdown and cloud compute ratio
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

// Flex API: Capital Shield reserve allocation
app.post('/api/flex/capital-shield', (req, res) => {
  const { businessId = currentActiveBusinessId, amount, action = "ALLOCATE" } = req.body || {};
  const biz = FLEX_BUSINESS_REGISTRY[businessId] || FLEX_BUSINESS_REGISTRY["ace-art"];
  const numAmount = Math.round(parseFloat(amount) || biz.capitalShieldAllocated);

  if (action === "ALLOCATE") {
    biz.capitalShieldAllocated = numAmount;
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

// Flex API: Switch active commercial business
app.post('/api/flex/switch-business', (req, res) => {
  const { businessId } = req.body || {};
  if (businessId && FLEX_BUSINESS_REGISTRY[businessId]) {
    currentActiveBusinessId = businessId;
    currentResources = [...FLEX_BUSINESS_REGISTRY[businessId].akamaiResources];
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
 * Normalizes user-selected downtime duration into days and human-readable label.
 * Supports: hours, days, weeks, months.
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
 * Lightweight FinOps AI Model (Neural-heuristic regression)
 * Bases on previous cloud compute usage patterns, lead time delay, and business scale
 * to advise on optimal future compute allocation percentage and dynamic risk buffer.
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
    // Unique high-operation circumstances (>95% saturation mode)
    mode = "HIGH_OPERATION_CRITICAL";
    advisedFutureUsagePct = Math.min(100, Math.round((usage * 0.992) * 10) / 10);
    confidenceScore = 98.4;
    reasoning = `High-operation mode active (${usage.toFixed(1)}%). Linka AI advises ${advisedFutureUsagePct.toFixed(1)}% sustained compute capacity for zero-latency mission-critical processing during peak cargo clearance.`;
  } else {
    // Standard and volatile logistics environments: AI balances throughput demand vs idle hold bleed
    mode = "ELASTIC_FINOPS_OPTIMIZED";
    const delayAdjustment = Math.min(10, days * 0.42);
    const expensePressure = (ratio > 40) ? 2.5 : 0;
    
    const rawAdvised = usage - delayAdjustment - expensePressure;
    advisedFutureUsagePct = Math.max(35, Math.min(94, Math.round(rawAdvised * 10) / 10));
    confidenceScore = Math.round((92 + Math.min(6, (100 - Math.abs(usage - 72)) * 0.15)) * 10) / 10;
    reasoning = `Linka AI Model analyzed previous ${usage.toFixed(1)}% efficiency across a ${days}d lead time extension. Advises ${advisedFutureUsagePct.toFixed(1)}% compute allocation with elastic standby to eliminate idle waste while guaranteeing SLA throughput.`;
  }

  // Advised budget based on active throughput work demand ($3,888) scaled by advised percentage
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
 * Computes detailed compute budget estimation, customizable annual projections for different businesses,
 * and integrates the small predictive AI model.
 */
function computeBudgetEstimation(budgetAmount, budgetPeriod = 'months', delayDays = 14, dailyBurn = 180, historicalUsageRate = 72, annualExpense = 170400, businessName = "Flex Logistics & Private Banking") {
  const rawBudget = Math.max(50, parseFloat(budgetAmount) || 5400);
  const p = String(budgetPeriod || 'months').toLowerCase();
  
  // Normalize budget to 30-day equivalent for consistent comparison
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

  // Customizable annual expense baseline for different businesses
  const clientAnnualExpense = Math.max(10000, parseFloat(annualExpense) || 170400);
  const clientMonthlyBurn = Math.round(clientAnnualExpense / 12);
  const clientExpenseRatio = Math.round((monthlyBudget / clientMonthlyBurn) * 1000) / 10;

  // Cost breakdowns
  const hourlyBurn = Math.round((dailyBurn / 24) * 100) / 100;
  const annualBurn = dailyBurn * 365;
  const annualComputeProjection = Math.round(monthlyBudget * 12);

  // Unbound idle waste during downtime
  const idleBleed = Math.round(dailyBurn * delayDays);

  // Percentage predictive recommendation model:
  // Supports high operation rates up to 100% for unique circumstances (>95%)
  const usageRate = Math.min(100, Math.max(10, parseFloat(historicalUsageRate) || 72));
  const isHighOperationRate = usageRate > 95;
  const idleRiskRate = Math.round((100 - usageRate) * 10) / 10;
  
  // Recommended capital shield reserve (calibrated to idle risk rate + contingency)
  const recommendedReservePct = isHighOperationRate
    ? Math.max(5, Math.round(idleRiskRate * 1.5))
    : Math.min(50, Math.max(10, Math.round(idleRiskRate * 1.15)));
  const recommendedReserveAmount = Math.round((monthlyBudget * (recommendedReservePct / 100)));

  // Predicted expense for new cycle
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

// AI Advisor endpoint for on-demand FinOps predictive model inference
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

// REST endpoint for mobile disruption trigger (guaranteed delivery over mobile carrier networks)
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

  io.emit('LOGISTICS_DISRUPTION_ALERT', alertPayload);
  res.json({ success: true, alert: alertPayload });
});

// REST endpoint for remote demo reset
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

io.on('connection', async (socket) => {
  const biz = FLEX_BUSINESS_REGISTRY[currentActiveBusinessId] || FLEX_BUSINESS_REGISTRY["ace-art"];
  const initial = await getResourcesForBatch(biz.activeShipment.batchTag, currentActiveBusinessId);
  currentResources = initial;

  socket.emit('INIT_STATE', { 
    resources: initial, 
    provider: "Akamai", 
    mode: isLiveAkamai ? "live" : "demo",
    businesses: FLEX_BUSINESS_REGISTRY,
    activeBusinessId: currentActiveBusinessId,
    currentAccount: biz
  });

  // Handle commercial business switching
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

  // Handle simulated logistics disruption
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

  // Handle one-click protection execution
  socket.on('EXECUTE_PROTECTION', async (data = {}) => {
    try {
      const bId = data.businessId || currentActiveBusinessId;
      const biz = FLEX_BUSINESS_REGISTRY[bId] || FLEX_BUSINESS_REGISTRY["ace-art"];
      const resources = await getResourcesForBatch(data.batchId || biz.activeShipment.batchTag, bId);
      const runningItems = resources.filter(r => r.status === "RUNNING");

      if (isLiveAkamai && runningItems.length > 0) {
        console.log(`[Linka Engine] Initiating shutdown on Akamai Connected Cloud for:`, runningItems.map(r => r.id));
        for (const item of runningItems) {
          await shutdownLinodeInstance(item.id);
        }
      } else {
        console.log(`[Linka Engine] Simulated hibernation executed for Akamai compute resources.`);
      }

      currentResources.forEach(r => r.status = "HIBERNATED");
      const savedAmount = data.projectedSavings || biz.activeShipment.idleBleedWaste || 3780;

      // Update Flex Treasury Capital Shield reserve
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

  // Reset demo
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

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Linka Engine listening on http://0.0.0.0:${PORT}`);
});
