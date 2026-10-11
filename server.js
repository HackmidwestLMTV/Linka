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

// Default Linode compute resources for Freight Batch #104
let currentResources = [
  { 
    id: "linode-9842104", 
    name: "Freight-Sync-Worker", 
    type: "Linode 8GB (g6-standard-4)", 
    dailyCost: 45, 
    status: "RUNNING", 
    tag: "Batch-104",
    region: "us-ord (Chicago)"
  },
  { 
    id: "linode-9842105", 
    name: "Staging-DB-Cluster", 
    type: "Dedicated 16GB (g6-dedicated-8)", 
    dailyCost: 135, 
    status: "RUNNING", 
    tag: "Batch-104",
    region: "us-ord (Chicago)"
  }
];

/**
 * Fetch Linode compute instances from Akamai API if live token is present,
 * otherwise return current resources.
 */
async function getResourcesForBatch(batchId = "Batch-104") {
  if (!isLiveAkamai) {
    return currentResources;
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
      return currentResources;
    }

    const data = await res.json();
    const batchTag = batchId.toLowerCase();
    
    // Match Linodes with tag or prefix
    const matched = (data.data || []).filter(linode => {
      const hasTag = linode.tags && linode.tags.some(t => t.toLowerCase() === batchTag);
      const hasLabel = linode.label && linode.label.toLowerCase().includes(batchTag);
      return hasTag || hasLabel;
    });

    if (matched.length > 0) {
      currentResources = matched.map(linode => ({
        id: `linode-${linode.id}`,
        name: linode.label,
        type: linode.type || "g6-standard-4",
        dailyCost: linode.type?.includes("dedicated") ? 135 : 45,
        status: linode.status === "running" ? "RUNNING" : "HIBERNATED",
        tag: batchId,
        region: linode.region || "us-ord"
      }));
      return currentResources;
    }

    console.log(`[Linka Engine] No Linodes with tag ${batchId} found. Using demo resources.`);
    return currentResources;
  } catch (err) {
    console.warn(`[Linka Engine] Akamai fetch error: ${err.message}. Using demo resources.`);
    return currentResources;
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
 * Computes detailed compute budget estimation, 30-day baseline, and predictive recommendation model.
 * Enables customization across hours, days, months, years, and usage efficiency percentage.
 */
function computeBudgetEstimation(budgetAmount, budgetPeriod = 'months', delayDays = 14, dailyBurn = 180, historicalUsageRate = 72) {
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

  // Cost breakdowns
  const hourlyBurn = Math.round((dailyBurn / 24) * 100) / 100;
  const annualBurn = dailyBurn * 365;

  // Unbound idle waste during downtime
  const idleBleed = Math.round(dailyBurn * delayDays);

  // Percentage predictive recommendation model:
  // Based on previous cycle usage efficiency rate (e.g. 72%)
  const usageRate = Math.min(99, Math.max(10, parseFloat(historicalUsageRate) || 72));
  const idleRiskRate = Math.round((100 - usageRate) * 10) / 10;
  
  // Recommended capital shield reserve (calibrated to idle risk rate + contingency)
  const recommendedReservePct = Math.min(50, Math.max(10, Math.round(idleRiskRate * 1.15)));
  const recommendedReserveAmount = Math.round((monthlyBudget * (recommendedReservePct / 100)));

  // Predicted expense for new cycle
  const predictedCycleExpenseWithoutShield = Math.round(monthlyBudget);
  const predictedCycleExpenseWithShield = Math.max(0, Math.round(monthlyBudget - idleBleed));
  const savingsPct = Math.min(100, Math.round((idleBleed / monthlyBudget) * 1000) / 10);

  return {
    rawBudget,
    budgetPeriod: p,
    monthlyBudget: Math.round(monthlyBudget),
    hourlyBurn,
    dailyBurn,
    annualBurn,
    idleBleed,
    historicalUsageRate: usageRate,
    idleRiskRate,
    recommendedReservePct,
    recommendedReserveAmount,
    predictedCycleExpenseWithoutShield,
    predictedCycleExpenseWithShield,
    savingsPct
  };
}

// REST endpoint for mobile disruption trigger (guaranteed delivery over mobile carrier networks)
app.post('/api/trigger', async (req, res) => {
  const payload = req.body || {};
  const duration = normalizeDuration(payload.delayValue ?? payload.delayDays ?? 14, payload.delayUnit ?? 'days');
  const resources = await getResourcesForBatch(payload.batchId || "Batch-104");
  const dailyCost = resources.reduce((acc, item) => acc + item.dailyCost, 0);
  const budgetModel = computeBudgetEstimation(
    payload.budgetAmount ?? 5400,
    payload.budgetPeriod ?? 'months',
    duration.days,
    dailyCost,
    payload.historicalUsageRate ?? 72
  );

  const alertPayload = {
    batchId: payload.batchId || "Batch-104",
    reason: payload.reason || "Section 301 Tariff Compliance Review",
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
      mode: isLiveAkamai ? "live" : "demo" 
    });
    res.json({ success: true, message: "System recovered to normal baseline" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

io.on('connection', async (socket) => {
  const initial = await getResourcesForBatch("Batch-104");
  socket.emit('INIT_STATE', { 
    resources: initial, 
    provider: "Akamai", 
    mode: isLiveAkamai ? "live" : "demo" 
  });

  // Handle simulated logistics disruption
  socket.on('TRIGGER_DISRUPTION', async (payload = {}) => {
    const duration = normalizeDuration(payload.delayValue ?? payload.delayDays ?? 14, payload.delayUnit ?? 'days');
    const resources = await getResourcesForBatch(payload.batchId || "Batch-104");
    const dailyCost = resources.reduce((acc, item) => acc + item.dailyCost, 0);
    const budgetModel = computeBudgetEstimation(
      payload.budgetAmount ?? 5400,
      payload.budgetPeriod ?? 'months',
      duration.days,
      dailyCost,
      payload.historicalUsageRate ?? 72
    );

    io.emit('LOGISTICS_DISRUPTION_ALERT', {
      batchId: payload.batchId || "Batch-104",
      reason: payload.reason || "Section 301 Tariff Compliance Review",
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
  socket.on('EXECUTE_PROTECTION', async (data) => {
    try {
      const resources = await getResourcesForBatch(data.batchId || "Batch-104");
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

      io.emit('PROTECTION_CONFIRMED', {
        status: "SUCCESS",
        savedAmount: data.projectedSavings || 2520,
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
        mode: isLiveAkamai ? "live" : "demo" 
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
