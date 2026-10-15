// ==============================================================================
// LINKA PRESENTATION DASHBOARD LOGIC (public/app.js)
// ------------------------------------------------------------------------------
// WHAT THIS JAVASCRIPT FILE DOES IN PLAIN ENGLISH:
// 1. Manages what judges see on the laptop or projector screen during the pitch.
// 2. Connects to the backend server via WebSockets for instant, live updates.
// 3. Handles tab navigation between the 4 steps of the presentation:
//      Step 1: Baseline (Everything operating in sync)
//      Step 2: Disruption (CITES customs audit delays art consignment PO #402)
//      Step 3: Agent (Linka detects the server tags & calculates $3,780 at risk)
//      Step 4: Protect (One click hibernates Linode servers and locks cash in escrow)
// 4. Draws and updates the interactive 30-day cash flow forecast chart (Chart.js),
//    showing the red dashed line (cash bleed) vs the green solid line (capital saved).
// 5. Connects with the Flex Commercial Banking API to render live bank balances,
//    monthly operating burns, and corporate ledger transactions.
// ==============================================================================

// 1. INITIALIZE NETWORK & DOM SHORTCUTS
// Connect this web browser page to the Socket.IO real-time server
const socket = io();
// Shortcut helper: $(id) gets an HTML element by its ID (like document.getElementById)
const $ = (id) => document.getElementById(id);
// Helper: Finds the first valid element from a list of possible IDs
const getEl = (...ids) => ids.map(id => $(id)).find(Boolean);

// Total number of presentation slides/tabs (1: Baseline, 2: Disruption, 3: Agent, 4: Protect)
const TOTAL_STEPS = 4;
// Current active step on screen (starts at Step 1)
let currentStep = 1;
// Flag to track whether the user has clicked "Protect Capital" yet
let isExecuted = false;
// Global variable holding the interactive Chart.js line chart instance
let chart = null;

// ==============================================================================
// BUSINESS STATE & FINANCIAL BASELINE
// ------------------------------------------------------------------------------
// Tracks the active business profile (defaults to Ace Art Global Trading Ltd).
// ==============================================================================
let activeBusinessId = "ace-art";
// Holds the full account object returned by the Flex Commercial Banking API
let activeAccountData = null;

// Dynamic model numbers (updated live when the phone remote triggers a disruption)
// Total dollar amount Linka will save ($3,780 for Ace Art by default)
let currentSavings = 3780;
// Number of days physical shipment is delayed (18 days for Ace Art CITES audit)
let currentDelayDays = 18;
// Formatted label for display (e.g. "18 days")
let currentDelayLabel = "18 days";
// Cost of running cloud servers per day ($210/day for Ace Art)
let activeDailyCost = 210;
// Initial treasury working capital in the company's Flex bank account ($342,800)
let activeBaseCapital = 342800;

// The current FinOps predictive calculation model
let activeBudgetModel = {
    monthlyBudget: 6300,              // 30-day cloud compute budget ($6,300)
    historicalUsageRate: 72.0,        // Past server capacity efficiency (72%)
    idleRiskRate: 28.0,               // Idle capacity risk (100% - 72% = 28%)
    recommendedReservePct: 32,        // Recommended capital shield percentage (32%)
    recommendedReserveAmount: 2016,   // Recommended dollar buffer to hold in escrow ($2,016)
    predictedCycleExpenseWithShield: 3528, // Expense when protected by Linka ($3,528)
    savingsPct: 44.0,                 // Percentage of budget preserved
    clientAnnualExpense: 270000,      // Company's annual operating expense ($270,000/yr)
    clientMonthlyBurn: 22500,         // Company's monthly cash burn ($22,500/mo)
    clientExpenseRatio: 28.0,         // Cloud spend as % of monthly burn ($6,300 / $22,500 = 28%)
    businessName: "Ace Art Global Trading Ltd",
    // Small AI FinOps predictive advisor recommendation
    aiAdvisor: {
        advisedFutureUsagePct: 64.4,  // AI advised future compute allocation (64.4%)
        confidenceScore: 95.8,        // Statistical model confidence (95.8%)
        reasoning: "AI calibrated against Ace Art's 3D render workloads and 18-day CITES provenance quarantine.",
        mode: "ELASTIC_FINOPS"        // Optimization mode
    }
};

// Default styling and text for the main "Protect Capital" button before it is clicked
const EXECUTE_BTN_DEFAULT = {
    className: 'vision-btn-emerald px-7 py-3.5 text-[16px] flex items-center gap-2 shrink-0',
    html: '<i class="fa-solid fa-shield-halved"></i> Protect capital'
};

// ==============================================================================
// HEADER STATUS INDICATORS
// ------------------------------------------------------------------------------
// Updates the small status badge in the top-right corner of the VisionOS header:
// - Green: Operating normally ($210/day)
// - Red: Customs hold detected (Idle burn)
// - Blue: Capital protected (Linodes hibernated, $0/day)
// ==============================================================================
function getHeaderStates() {
    const dailyStr = `$${activeDailyCost}/day`;
    return {
        normal:    { dot: 'dot dot-green', text: 'Operating normally',   cloud: `Running · ${dailyStr}`,    cloudColor: 'text-emerald-400' },
        alert:     { dot: 'dot dot-red',   text: 'Quarantine hold detected', cloud: `Idle burn · ${dailyStr}`,  cloudColor: 'text-red-400' },
        protected: { dot: 'dot dot-green', text: 'Capital protected',    cloud: 'Hibernated · $0/day',   cloudColor: 'text-sky-400' }
    };
}

// Function to visually switch the header status pill
function setState(name) {
    const states = getHeaderStates();
    const s = states[name] || states.normal;
    const dot = $('global-pulse-dot');
    const statusText = $('global-status-text');
    if (dot) dot.className = s.dot;
    if (statusText) statusText.textContent = s.text;

    const cloud = getEl('header-cloud-status', 'header-akamai-status');
    if (cloud) {
        cloud.textContent = s.cloud;
        cloud.className = `num font-medium ${s.cloudColor}`;
    }
}

// ==============================================================================
// STEP NAVIGATION (Step 1 -> 2 -> 3 -> 4)
// ------------------------------------------------------------------------------
// Switches tabs so only the active presentation step is visible to the audience.
// ==============================================================================
function switchStep(step) {
    currentStep = step;
    // Loop through all 4 steps: hide inactive steps, show the chosen one
    for (let i = 1; i <= TOTAL_STEPS; i++) {
        const content = $(`step-${i}-content`);
        const btn = $(`step-btn-${i}`);
        if (content) content.classList.toggle('hidden', i !== step);
        if (btn) {
            btn.classList.toggle('vision-step-active', i === step);
            btn.setAttribute('aria-selected', i === step);
        }
    }
    // If the presenter moves to Step 2 (Disruption) or beyond, turn header red (alert)
    if (step >= 2 && !isExecuted) setState('alert');
}

// ==============================================================================
// INTERACTIVE CASH RUNWAY CHART (Chart.js)
// ------------------------------------------------------------------------------
// Draws the 30-day financial forecast.
// - Red dashed curve: Shows the cash account steadily bleeding down if servers run idle.
// - Green solid curve: Shows the cash account flatlining once Linka hibernates servers,
//   saving $3,780 for Ace Art.
// ==============================================================================
function updateChartCurves(savedAmount = currentSavings, delayDays = currentDelayDays) {
    if (!chart) return;
    const baseCapital = activeBaseCapital || 342800;
    const dailyLoss = activeDailyCost || 210;

    // Line 1: Without Linka (Continuous bleed over 30 days)
    chart.data.datasets[0].data = [
        baseCapital,
        Math.round(baseCapital - (dailyLoss * 4)),
        Math.round(baseCapital - (dailyLoss * 9)),
        Math.round(baseCapital - Math.min(savedAmount, dailyLoss * 14)),
        Math.round(baseCapital - Math.min(savedAmount + (dailyLoss * 4), dailyLoss * 20)),
        Math.round(baseCapital - Math.min(savedAmount + (dailyLoss * 7), dailyLoss * 25)),
        Math.round(baseCapital - Math.min(savedAmount + (dailyLoss * 10), dailyLoss * 30))
    ];

    // Line 2: With Linka Shield (Cash stops bleeding when protection executes!)
    chart.data.datasets[1].data = [
        baseCapital,
        Math.round(baseCapital - (dailyLoss * 4)),
        Math.round(baseCapital - (dailyLoss * 7)),
        Math.round(baseCapital - (dailyLoss * 7)), // SHIELD POINT: Cash line flatlines!
        Math.round(baseCapital - (dailyLoss * 7.4)),
        Math.round(baseCapital - (dailyLoss * 7.8)),
        Math.round(baseCapital - (dailyLoss * 8.0))
    ];

    // Re-render the chart smoothly with new numbers
    chart.update();
}

// Builds the Chart.js line chart canvas when the web page first loads
function initChart() {
    const chartEl = $('cashFlowChart');
    if (!chartEl) return;

    const muted = '#6e6e73'; // Graphite grey labels for the light glass theme
    const chartFont = { family: '-apple-system, BlinkMacSystemFont, Inter, sans-serif', size: 14 };
    const baseCapital = activeBaseCapital || 342800;
    const dailyLoss = activeDailyCost || 210;

    chart = new Chart(chartEl.getContext('2d'), {
        type: 'line',
        data: {
            labels: ['Day 1', 'Day 5', 'Day 10', 'Day 14', 'Day 20', 'Day 25', 'Day 30'],
            datasets: [
                {
                    label: 'Without Linka',
                    data: [
                        baseCapital,
                        baseCapital - (dailyLoss * 4),
                        baseCapital - (dailyLoss * 9),
                        baseCapital - (dailyLoss * 14),
                        baseCapital - (dailyLoss * 20),
                        baseCapital - (dailyLoss * 25),
                        baseCapital - (dailyLoss * 30)
                    ],
                    borderColor: '#ff453a', // Red dashed line
                    borderDash: [5, 5],
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.35
                },
                {
                    label: 'With Linka Shield',
                    data: [
                        baseCapital,
                        baseCapital - (dailyLoss * 4),
                        baseCapital - (dailyLoss * 7),
                        baseCapital - (dailyLoss * 7),
                        baseCapital - (dailyLoss * 7.4),
                        baseCapital - (dailyLoss * 7.8),
                        baseCapital - (dailyLoss * 8.0)
                    ],
                    borderColor: '#34c759', // Green solid line
                    backgroundColor: 'rgba(52, 199, 89, 0.08)',
                    borderWidth: 3,
                    pointRadius: 0,
                    tension: 0.35,
                    fill: true,
                    hidden: true // Stays hidden until user clicks "Protect Capital" on Step 4!
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { labels: { color: muted, usePointStyle: true, boxWidth: 8, padding: 16, font: chartFont } },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Frosted white tooltip
                    borderColor: 'rgba(15,23,42,0.1)',
                    borderWidth: 1,
                    titleColor: '#1d1d1f',
                    bodyColor: '#3a3a3c',
                    padding: 12,
                    titleFont: chartFont,
                    bodyFont: chartFont,
                    callbacks: { label: (c) => ` ${c.dataset.label}: $${c.parsed.y.toLocaleString()}` }
                }
            },
            scales: {
                x: { grid: { display: false }, ticks: { color: muted, font: chartFont } },
                y: { grid: { color: 'rgba(15,23,42,0.06)' }, ticks: { color: muted, font: chartFont, callback: (v) => `$${(v / 1000).toFixed(0)}k` } }
            }
        }
    });
}

// ==============================================================================
// STEP 4 ACTION: EXECUTE CAPITAL PROTECTION
// ------------------------------------------------------------------------------
// When the presenter clicks "Protect Capital":
// 1. Sends an API request to Flex Commercial Bank to lock cash into escrow.
// 2. Turns off (hibernates) the Akamai Linode servers.
// 3. Drops the daily burn to $0/day.
// 4. Reveals the green protected cash flow curve on the chart.
// ==============================================================================
async function executeProtectionNow() {
    if (isExecuted) return;
    isExecuted = true;

    // Call Flex Commercial Banking API to allocate Capital Shield reserve in company escrow
    try {
        await fetch('/api/flex/capital-shield', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                businessId: activeBusinessId,
                amount: activeBudgetModel ? activeBudgetModel.recommendedReserveAmount : 2016,
                action: 'ALLOCATE'
            })
        });
    } catch (err) {
        console.warn('Flex capital shield API call:', err);
    }

    // Update the "Capital preserved" counter on screen (e.g. $3,780)
    const savedEl = $('saved-amount-display');
    if (savedEl) {
        savedEl.textContent = `$${currentSavings.toLocaleString()}`;
        savedEl.className = 'num text-[38px] font-semibold text-emerald-400 mt-1';
    }

    // Drop cloud burn rate to $0/day
    const burnEl = getEl('cloud-burn-display', 'akamai-burn-display');
    if (burnEl) {
        burnEl.textContent = '$0/day';
        burnEl.className = 'num font-medium text-emerald-400';
    }

    // Change server cluster badge to "Hibernated"
    const clusterEl = getEl('cloud-cluster-status', 'akamai-cluster-status');
    if (clusterEl) {
        clusterEl.textContent = 'Hibernated';
        clusterEl.className = 'font-medium text-sky-400';
    }

    // Update chart status badge
    const badgeEl = $('chart-status-badge');
    if (badgeEl) {
        badgeEl.textContent = `Protected · $${currentSavings.toLocaleString()} preserved`;
        badgeEl.className = 'text-[14px] text-emerald-400';
    }

    // Update the button to show checked status
    const btn = $('execute-now-btn');
    if (btn) {
        btn.className = 'px-7 py-3.5 rounded-full bg-white/10 border border-emerald-400/30 text-emerald-400 text-[16px] flex items-center gap-2 shrink-0 cursor-default';
        btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Capital protected in Flex account';
    }

    // Reveal the green line on the Chart.js graph
    if (chart && chart.data.datasets[1]) {
        chart.data.datasets[1].hidden = false;
        chart.update();
    }

    // Set header badge to "Capital protected"
    setState('protected');

    // Notify backend server over WebSockets
    socket.emit('EXECUTE_PROTECTION', {
        projectedSavings: currentSavings,
        batchId: activeAccountData?.activeShipment?.batchTag || (activeBusinessId === 'ace-art' ? "AceArt-402" : "Batch-104"),
        businessId: activeBusinessId
    });
}

// ==============================================================================
// RESET DEMO BACK TO STEP 1 BASELINE
// ------------------------------------------------------------------------------
// Recovers the demonstration so the user can pitch again for the next judge.
// ==============================================================================
function resetWholeDemo(emitEvent = true) {
    isExecuted = false;

    // Reset default parameters based on which business is active
    if (activeBusinessId === 'ace-art') {
        currentSavings = 3780;
        currentDelayDays = 18;
        currentDelayLabel = "18 days";
        activeDailyCost = 210;
        activeBaseCapital = 342800;
    } else {
        currentSavings = 2520;
        currentDelayDays = 14;
        currentDelayLabel = "14 days";
        activeDailyCost = 180;
        activeBaseCapital = 248500;
    }

    // Reset saved amount to $0
    const savedEl = $('saved-amount-display');
    if (savedEl) {
        savedEl.textContent = '$0';
        savedEl.className = 'num text-[38px] font-semibold text-neutral-400 mt-1';
    }

    // Reset burn rate back to standard baseline ($210/day)
    const burnEl = getEl('cloud-burn-display', 'akamai-burn-display');
    if (burnEl) {
        burnEl.textContent = `$${activeDailyCost}/day`;
        burnEl.className = 'num font-medium text-red-400';
    }

    // Reset cluster state back to "Running"
    const clusterEl = getEl('cloud-cluster-status', 'akamai-cluster-status');
    if (clusterEl) {
        clusterEl.textContent = 'Running';
        clusterEl.className = 'font-medium text-emerald-400';
    }

    // Reset chart badge
    const badgeEl = $('chart-status-badge');
    if (badgeEl) {
        badgeEl.textContent = 'Unprotected';
        badgeEl.className = 'text-[14px] text-red-400';
    }

    // Reset execution button
    const btn = $('execute-now-btn');
    if (btn) {
        btn.className = EXECUTE_BTN_DEFAULT.className;
        btn.innerHTML = EXECUTE_BTN_DEFAULT.html;
    }

    // Reset Step 2 cards
    const idleWasteEl = $('step2-idle-waste');
    if (idleWasteEl) idleWasteEl.textContent = `$${currentSavings.toLocaleString()}`;
    const wasteMathEl = $('step2-waste-math');
    if (wasteMathEl) wasteMathEl.textContent = `$${activeDailyCost}/day × ${currentDelayLabel}`;
    const leadTimeEl = $('step2-lead-time');
    if (leadTimeEl) leadTimeEl.textContent = `+${currentDelayLabel}`;
    const narrativeDaysEl = $('step2-narrative-days');
    if (narrativeDaysEl) narrativeDaysEl.textContent = currentDelayLabel;

    // Refresh business data view
    if (activeAccountData) {
        renderBusinessData(activeAccountData);
    }

    // Hide green line on chart
    if (chart && chart.data.datasets[1]) {
        chart.data.datasets[1].hidden = true;
        updateChartCurves(currentSavings, currentDelayDays);
    }

    // Return header to normal and return to Step 1
    setState('normal');
    switchStep(1);

    // Notify backend over WebSockets if required
    if (emitEvent && socket && socket.connected) {
        socket.emit('RESET_DEMO');
    }
}

// ==============================================================================
// RENDER BUSINESS DATA (FLEX API INTEGRATION)
// ------------------------------------------------------------------------------
// Fills the screen with verified numbers directly from Flex Commercial Banking.
// ==============================================================================
function renderBusinessData(account) {
    if (!account) return;
    activeAccountData = account;
    activeBaseCapital = account.treasuryBalance || 342800;
    activeDailyCost = account.cloudComputeDailyCost || 210;

    // Header cloud status
    const cloudEl = $('header-cloud-status');
    if (cloudEl && !isExecuted) {
        cloudEl.textContent = `Running · $${activeDailyCost}/day`;
    }

    // Update directory switcher button styles
    const btnAce = $('biz-btn-ace');
    const btnLogistics = $('biz-btn-logistics');
    if (btnAce && btnLogistics) {
        if (account.businessId === 'ace-art') {
            btnAce.className = "px-3 py-1.5 rounded-lg transition font-semibold bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5";
            btnLogistics.className = "px-3 py-1.5 rounded-lg transition text-neutral-400 hover:text-white flex items-center gap-1.5";
        } else {
            btnAce.className = "px-3 py-1.5 rounded-lg transition text-neutral-400 hover:text-white flex items-center gap-1.5";
            btnLogistics.className = "px-3 py-1.5 rounded-lg transition font-semibold bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5";
        }
    }

    // Step 1 Company badges & narrative
    const bBadge = $('step1-company-badge');
    if (bBadge) bBadge.textContent = account.companyName;

    const s1Narrative = $('step1-narrative');
    if (s1Narrative) {
        if (account.businessId === 'ace-art') {
            s1Narrative.textContent = "Flex monitors fine art consignment PO #402 while Akamai Connected Cloud 3D render clusters process incoming digital exhibits normally.";
        } else {
            s1Narrative.textContent = "Flex tracks Freight Batch #104 while its Akamai Connected Cloud telemetry ingest pipeline runs normally.";
        }
    }

    // Fill Flex Commercial Banking card
    const nameEl = $('flex-biz-name');
    if (nameEl) nameEl.textContent = account.companyName;

    const acctEl = $('flex-acct-num');
    if (acctEl) acctEl.textContent = account.flexAccountNumber;

    const indEl = $('flex-industry-label');
    if (indEl) indEl.textContent = `${account.industry} · ${account.website}`;

    const balEl = $('flex-treasury-balance');
    if (balEl) balEl.textContent = `$${account.treasuryBalance.toLocaleString()}`;

    const burnEl = $('flex-monthly-burn');
    if (burnEl) burnEl.textContent = `$${account.monthlyOperatingBurn.toLocaleString()}`;

    const annSubEl = $('flex-annual-exp-sub');
    if (annSubEl) annSubEl.textContent = `$${account.annualOperatingExpense.toLocaleString()}/yr total budget`;

    // Fill active shipment or consignment card
    if (account.activeShipment) {
        const s = account.activeShipment;
        const poRouteEl = $('shipment-po-route');
        if (poRouteEl) poRouteEl.textContent = `${s.poNumber} · ${s.origin} → ${s.destination}`;

        const sTitleEl = $('shipment-title');
        if (sTitleEl) sTitleEl.textContent = s.title;

        const sValEl = $('shipment-value');
        if (sValEl) sValEl.textContent = `$${s.consignmentValue.toLocaleString()}`;

        const sModeEl = $('shipment-mode');
        if (sModeEl) sModeEl.textContent = s.transitMode;

        const sEtaEl = $('shipment-eta');
        if (sEtaEl) sEtaEl.textContent = s.normalEta;
    }

    // Fill Flex Corporate Financial Ledger table
    const ledgerContainer = $('flex-ledger-list');
    if (ledgerContainer && account.ledgerTransactions && account.ledgerTransactions.length > 0) {
        ledgerContainer.innerHTML = account.ledgerTransactions.slice(0, 4).map(tx => {
            const isNegative = tx.amount < 0;
            const amtStr = `${isNegative ? '-' : '+'}$${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            const amtClass = isNegative ? 'text-red-400' : 'text-emerald-400';
            const iconClass = tx.category.includes('Cloud') ? 'fa-cloud text-sky-400 bg-sky-500/20' :
                             tx.category.includes('Escrow') ? 'fa-arrow-down-left text-emerald-400 bg-emerald-500/20' :
                             'fa-money-bill-transfer text-purple-400 bg-purple-500/20';

            return `
                <div class="vision-card p-3 flex items-center justify-between">
                    <div class="flex items-center gap-2.5">
                        <div class="h-7 w-7 rounded-lg flex items-center justify-center text-xs ${iconClass}">
                            <i class="fa-solid ${iconClass.split(' ')[0]}"></i>
                        </div>
                        <div>
                            <p class="text-white font-medium truncate max-w-[280px]">${tx.description}</p>
                            <p class="text-[11px] text-neutral-400">${tx.date} · ${tx.method}</p>
                        </div>
                    </div>
                    <span class="${amtClass} font-bold font-mono ml-2 shrink-0">${amtStr}</span>
                </div>
            `;
        }).join('');
    }

    // Fill Akamai Connected Cloud Linode server cards
    const tagEl = $('akamai-tag-label');
    if (tagEl) {
        tagEl.innerHTML = `Linodes tagged <code class="font-mono text-neutral-300">${account.activeShipment?.batchTag || 'AceArt-402'}</code>`;
    }

    const linodeContainer = $('linode-resource-list');
    if (linodeContainer && account.akamaiResources) {
        linodeContainer.innerHTML = account.akamaiResources.map(res => `
            <div class="vision-card p-4 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="h-9 w-9 rounded-lg bg-white/[0.05] flex items-center justify-center ${res.type.includes('Dedicated') ? 'text-emerald-400' : 'text-sky-400'}">
                        <i class="fa-solid ${res.type.includes('Dedicated') ? 'fa-database' : 'fa-server'} text-sm"></i>
                    </div>
                    <div>
                        <h4 class="text-[16px] font-medium text-white">${res.name}</h4>
                        <p class="text-[14px] text-neutral-400">${res.type} · <span class="font-mono">${res.id}</span></p>
                        <p class="text-[12px] text-neutral-400">${res.purpose || 'Active pipeline cluster'}</p>
                    </div>
                </div>
                <p class="num text-[16px] text-white shrink-0">$${res.dailyCost}<span class="text-neutral-400">/day</span></p>
            </div>
        `).join('');
    }

    const dailyTotalEl = $('akamai-daily-total');
    if (dailyTotalEl) dailyTotalEl.textContent = `$${account.cloudComputeDailyCost}/day`;

    const monthlyTotalEl = $('akamai-monthly-total');
    if (monthlyTotalEl) monthlyTotalEl.textContent = `$${account.cloudComputeMonthlyExpenditure.toLocaleString()}/mo`;

    const ratioTotalEl = $('akamai-ratio-total');
    if (ratioTotalEl) ratioTotalEl.textContent = `${account.cloudExpenseRatio.toFixed(1)}%`;

    // Fill Step 2 Disruption Headlines & Narrative
    const s2Heading = $('step2-heading');
    if (s2Heading) {
        s2Heading.textContent = account.businessId === 'ace-art' 
            ? "Customs & Provenance hold on PO #402." 
            : "Customs hold on Batch #104.";
    }

    const s2Narrative = $('step2-narrative');
    if (s2Narrative) {
        if (account.businessId === 'ace-art') {
            s2Narrative.innerHTML = `A CITES Provenance and customs clearance audit adds <span id="step2-narrative-days" class="font-semibold text-white">18 days</span>. Ace Art's Akamai render pipeline will sit idle the whole time.`;
        } else {
            s2Narrative.innerHTML = `A Section 301 tariff review adds <span id="step2-narrative-days" class="font-semibold text-white">14 days</span>. The Akamai pipeline will sit idle the whole time.`;
        }
    }

    // Step 2 Predictive Models
    const modelBadge = $('model-business-badge');
    if (modelBadge) modelBadge.textContent = account.companyName;

    const modelAnnExp = $('model-annual-expense');
    if (modelAnnExp) modelAnnExp.textContent = `$${account.annualOperatingExpense.toLocaleString()}/yr`;

    const modelBudgetDisp = $('model-budget-display');
    if (modelBudgetDisp) modelBudgetDisp.textContent = `$${account.cloudComputeMonthlyExpenditure.toLocaleString()}`;

    const modelRatioDisp = $('model-ratio-display');
    if (modelRatioDisp) modelRatioDisp.textContent = `${account.cloudExpenseRatio.toFixed(1)}%`;

    const modelAnnualProj = $('model-annual-proj');
    if (modelAnnualProj) modelAnnualProj.textContent = `$${((account.cloudComputeMonthlyExpenditure * 12) / 1000).toFixed(1)}k/yr`;

    // Step 3 Agent narrative
    const s3FlexEvent = $('step3-flex-event');
    if (s3FlexEvent) {
        s3FlexEvent.textContent = account.businessId === 'ace-art' ? "PO #402 delayed 18 days." : "Batch #104 delayed 14 days.";
    }

    const s3AgentText = $('step3-agent-text');
    if (s3AgentText) {
        const tag = account.activeShipment?.batchTag || (account.businessId === 'ace-art' ? 'AceArt-402' : 'Batch-104');
        const waste = account.activeShipment?.idleBleedWaste || (account.businessId === 'ace-art' ? 3780 : 2520);
        s3AgentText.innerHTML = `Matches the <code class="font-mono">${tag}</code> tag and computes $${waste.toLocaleString()} at risk.`;
    }

    // Step 4 Headline
    const s4Headline = $('step4-headline');
    if (s4Headline) {
        const waste = account.activeShipment?.idleBleedWaste || (account.businessId === 'ace-art' ? 3780 : 2520);
        s4Headline.textContent = `One click. $${waste.toLocaleString()} saved.`;
    }

    // Recalibrate Chart curves to active business capital baseline
    updateChartCurves(account.activeShipment?.idleBleedWaste || currentSavings, account.activeShipment?.disruptionDelayDays || currentDelayDays);
}

// ==============================================================================
// BUSINESS SWITCHER (Ace Art vs. Flex Logistics)
// ------------------------------------------------------------------------------
// Invoked when user clicks the directory switcher pills at the top of the app.
// ==============================================================================
async function selectBusiness(businessId) {
    if (!businessId || businessId === activeBusinessId) return;
    activeBusinessId = businessId;

    try {
        const res = await fetch('/api/flex/switch-business', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ businessId })
        });
        const data = await res.json();
        if (data.success && data.account) {
            renderBusinessData(data.account);
        }
    } catch (err) {
        console.warn('Switch business error:', err);
    }

    if (socket && socket.connected) {
        socket.emit('SWITCH_BUSINESS', { businessId });
    }
}

// Fetch initial business profile from Flex API on page load
async function loadFlexBusinessProfile(businessId = "ace-art") {
    try {
        const res = await fetch(`/api/flex/accounts/${businessId}`);
        const data = await res.json();
        if (data.success && data.account) {
            renderBusinessData(data.account);
        }
    } catch (err) {
        console.warn('Load Flex business profile failed:', err);
    }
}

// Keyboard arrow navigation (Left/Right arrows change steps for seamless live pitching)
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' && currentStep < TOTAL_STEPS) switchStep(currentStep + 1);
    if (e.key === 'ArrowLeft' && currentStep > 1) switchStep(currentStep - 1);
});

// ==============================================================================
// WEBSOCKET REAL-TIME LISTENERS
// ------------------------------------------------------------------------------
// Listens for live messages sent from the presenter's mobile phone remote.
// ==============================================================================

// Event: Another device switched the business
socket.on('BUSINESS_SWITCHED', (data) => {
    if (data && data.account) {
        activeBusinessId = data.businessId;
        renderBusinessData(data.account);
    }
});

// Event: Presenter pressed 'Broadcast Hold' on their phone
socket.on('LOGISTICS_DISRUPTION_ALERT', (data) => {
    if (data) {
        if (data.businessId && data.businessId !== activeBusinessId) {
            activeBusinessId = data.businessId;
            if (data.flexAccount) renderBusinessData(data.flexAccount);
        }

        currentSavings = data.projectedSavings || (data.dailyCost ? Math.round(data.dailyCost * (data.delayDays || 18)) : 3780);
        currentDelayDays = data.delayDays || 18;
        currentDelayLabel = data.delayLabel || `${currentDelayDays} days`;
        activeDailyCost = data.dailyCost || 210;
        activeBudgetModel = data.budgetModel || null;

        // Update Step 2 metrics on screen
        const idleWasteEl = $('step2-idle-waste');
        if (idleWasteEl) idleWasteEl.textContent = `$${currentSavings.toLocaleString()}`;

        const wasteMathEl = $('step2-waste-math');
        if (wasteMathEl) wasteMathEl.textContent = `$${activeDailyCost}/day × ${currentDelayLabel}`;

        const leadTimeEl = $('step2-lead-time');
        if (leadTimeEl) leadTimeEl.textContent = `+${currentDelayLabel}`;

        const narrativeDaysEl = $('step2-narrative-days');
        if (narrativeDaysEl) narrativeDaysEl.textContent = currentDelayLabel;

        // Update Predictive Model Cards
        if (activeBudgetModel) {
            const bDisp = $('model-budget-display');
            if (bDisp) bDisp.textContent = `$${activeBudgetModel.monthlyBudget.toLocaleString()}`;

            const ratioDisp = $('model-ratio-display');
            if (ratioDisp) {
                const ratioVal = activeBudgetModel.clientExpenseRatio !== undefined 
                    ? activeBudgetModel.clientExpenseRatio 
                    : ((activeBudgetModel.monthlyBudget / (activeBudgetModel.clientMonthlyBurn || 22500)) * 100);
                ratioDisp.textContent = `${Number(ratioVal).toFixed(1)}%`;
            }

            const annualProj = $('model-annual-proj');
            if (annualProj) {
                const aVal = activeBudgetModel.annualComputeProjection || (activeBudgetModel.monthlyBudget * 12);
                annualProj.textContent = `$${(aVal / 1000).toFixed(1)}k/yr`;
            }

            const bBadge = $('model-business-badge');
            if (bBadge && activeBudgetModel.businessName) {
                bBadge.textContent = activeBudgetModel.businessName;
            }

            const aExp = $('model-annual-expense');
            if (aExp && activeBudgetModel.clientAnnualExpense) {
                aExp.textContent = `$${Number(activeBudgetModel.clientAnnualExpense).toLocaleString()}/yr`;
            }

            const uDisp = $('model-usage-display');
            if (uDisp) uDisp.textContent = `${activeBudgetModel.historicalUsageRate.toFixed(1)}%`;

            const highOpFlag = $('high-op-flag');
            if (highOpFlag) {
                highOpFlag.classList.toggle('hidden', !activeBudgetModel.isHighOperationRate);
            }

            const rSub = $('model-risk-sub');
            if (rSub) rSub.textContent = `${activeBudgetModel.idleRiskRate.toFixed(1)}% idle risk rate`;

            const pExp = $('model-predicted-expense');
            if (pExp) pExp.textContent = `$${activeBudgetModel.predictedCycleExpenseWithShield.toLocaleString()}`;

            const sSub = $('model-savings-sub');
            if (sSub) sSub.textContent = `Saves ${activeBudgetModel.savingsPct.toFixed(1)}% of budget`;

            const rBuf = $('model-reserve-buffer');
            if (rBuf) rBuf.textContent = `$${activeBudgetModel.recommendedReserveAmount.toLocaleString()}`;

            const recSub = $('model-reserve-sub');
            if (recSub) recSub.textContent = `${activeBudgetModel.recommendedReservePct}% capital shield`;

            const recChip = $('model-recommendation-chip');
            if (recChip) recChip.textContent = `Recommendation: Shield ${activeBudgetModel.recommendedReservePct}% Reserve ($${activeBudgetModel.recommendedReserveAmount.toLocaleString()})`;

            // Update Small AI Model Advisory Banner
            if (activeBudgetModel.aiAdvisor) {
                const aiPct = $('ai-banner-pct');
                if (aiPct) aiPct.textContent = `${activeBudgetModel.aiAdvisor.advisedFutureUsagePct.toFixed(1)}%`;
                const aiConf = $('ai-banner-conf');
                if (aiConf) aiConf.textContent = `${activeBudgetModel.aiAdvisor.confidenceScore.toFixed(1)}%`;
                const aiReason = $('ai-banner-reasoning');
                if (aiReason) aiReason.textContent = activeBudgetModel.aiAdvisor.reasoning;
                const aiTag = $('ai-banner-tag');
                if (aiTag) aiTag.textContent = activeBudgetModel.aiAdvisor.mode;
            }
        }

        // Update JSON Preview
        const jsonDays = $('json-delay-days');
        if (jsonDays) jsonDays.textContent = currentDelayDays;
        const jsonLabel = $('json-delay-label');
        if (jsonLabel) jsonLabel.textContent = `"${currentDelayLabel}"`;
        const jsonWaste = $('json-waste');
        if (jsonWaste) jsonWaste.textContent = `${currentSavings.toFixed(2)}`;

        if (activeBudgetModel) {
            const jBiz = $('json-business');
            if (jBiz) jBiz.textContent = `"${activeBudgetModel.businessName || 'Ace Art Global Trading Ltd'}"`;
            const jAnnExp = $('json-annual-expense');
            if (jAnnExp) jAnnExp.textContent = `${(activeBudgetModel.clientAnnualExpense || 270000).toFixed(2)}`;
            const jBud = $('json-budget');
            if (jBud) jBud.textContent = `${activeBudgetModel.monthlyBudget.toFixed(2)}`;
            const jAnnComp = $('json-annual-compute');
            if (jAnnComp) jAnnComp.textContent = `${(activeBudgetModel.annualComputeProjection || activeBudgetModel.monthlyBudget * 12).toFixed(2)}`;
            const jRatio = $('json-ratio');
            if (jRatio) {
                const ratioVal = activeBudgetModel.clientExpenseRatio !== undefined 
                    ? activeBudgetModel.clientExpenseRatio 
                    : ((activeBudgetModel.monthlyBudget / (activeBudgetModel.clientMonthlyBurn || 22500)) * 100);
                jRatio.textContent = `"${Number(ratioVal).toFixed(1)}%"`;
            }
            const jUse = $('json-usage');
            if (jUse) jUse.textContent = `${activeBudgetModel.historicalUsageRate.toFixed(1)}`;
            const jHighOp = $('json-high-op');
            if (jHighOp) jHighOp.textContent = `${Boolean(activeBudgetModel.isHighOperationRate)}`;
            
            if (activeBudgetModel.aiAdvisor) {
                const jAiPct = $('json-ai-pct');
                if (jAiPct) jAiPct.textContent = `${activeBudgetModel.aiAdvisor.advisedFutureUsagePct.toFixed(1)}`;
                const jAiConf = $('json-ai-conf');
                if (jAiConf) jAiConf.textContent = `"${activeBudgetModel.aiAdvisor.confidenceScore.toFixed(1)}%"`;
                const jAiMode = $('json-ai-mode');
                if (jAiMode) jAiMode.textContent = `"${activeBudgetModel.aiAdvisor.mode}"`;
            }
        }

        // Recalculate and re-draw the chart lines
        updateChartCurves(currentSavings, currentDelayDays);
    }
    // Automatically jump presentation view to Step 2!
    switchStep(2);
});

// Event: Protection was confirmed
socket.on('PROTECTION_CONFIRMED', () => { if (!isExecuted) executeProtectionNow(); });
// Event: Remote trigger reset the demo
socket.on('RESET_DEMO_BROADCAST', () => resetWholeDemo(false));

// Event: Server sent initial startup state
socket.on('INIT_STATE', (data) => {
    if (data) {
        if (data.currentAccount) {
            activeBusinessId = data.activeBusinessId || "ace-art";
            renderBusinessData(data.currentAccount);
        }
        if (data.resources && data.resources.every(r => r.status === 'RUNNING')) {
            resetWholeDemo(false);
        }
    }
});

// STARTUP: Initialize chart and load Ace Art profile when page is ready
document.addEventListener('DOMContentLoaded', () => {
    initChart();
    loadFlexBusinessProfile("ace-art");
});
