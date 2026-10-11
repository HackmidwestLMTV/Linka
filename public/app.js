// Linka dashboard logic: step navigation, dynamic disruption models, and live socket sync.
const socket = io();
const $ = (id) => document.getElementById(id);
const getEl = (...ids) => ids.map(id => $(id)).find(Boolean);

const TOTAL_STEPS = 4;
let currentStep = 1;
let isExecuted = false;
let chart = null;

// Dynamic model state (customizable via remote)
let currentSavings = 2520;
let currentDelayDays = 14;
let currentDelayLabel = "14 days";
let activeBudgetModel = {
    monthlyBudget: 5400,
    historicalUsageRate: 72.0,
    idleRiskRate: 28.0,
    recommendedReservePct: 32,
    recommendedReserveAmount: 1728,
    predictedCycleExpenseWithShield: 2880,
    savingsPct: 46.7
};

const EXECUTE_BTN_DEFAULT = {
    className: 'vision-btn-emerald px-7 py-3.5 text-[16px] flex items-center gap-2 shrink-0',
    html: '<i class="fa-solid fa-shield-halved"></i> Protect capital'
};

// Header status presets
const STATES = {
    normal:    { dot: 'dot dot-green', text: 'Operating normally',   cloud: 'Running · $180/day',    cloudColor: 'text-emerald-400' },
    alert:     { dot: 'dot dot-red',   text: 'Tariff hold detected', cloud: 'Idle burn · $180/day',  cloudColor: 'text-red-400' },
    protected: { dot: 'dot dot-green', text: 'Capital protected',    cloud: 'Hibernated · $0/day',   cloudColor: 'text-sky-400' }
};

function setState(name) {
    const s = STATES[name];
    const dot = $('global-pulse-dot');
    const statusText = $('global-status-text');
    if (dot) dot.className = s.dot;
    if (statusText) statusText.textContent = s.text;

    const cloud = getEl('header-cloud-status', 'header-aws-status');
    if (cloud) {
        cloud.textContent = s.cloud;
        cloud.className = `num font-medium ${s.cloudColor}`;
    }
}

function switchStep(step) {
    currentStep = step;
    for (let i = 1; i <= TOTAL_STEPS; i++) {
        const content = $(`step-${i}-content`);
        const btn = $(`step-btn-${i}`);
        if (content) content.classList.toggle('hidden', i !== step);
        if (btn) {
            btn.classList.toggle('vision-step-active', i === step);
            btn.setAttribute('aria-selected', i === step);
        }
    }
    if (step >= 2 && !isExecuted) setState('alert');
}

function updateChartCurves(savedAmount = 2520, delayDays = 14) {
    if (!chart) return;
    const baseCapital = 248500;
    const dailyLoss = 180;
    
    // Dataset 0: Unprotected bleed
    chart.data.datasets[0].data = [
        baseCapital,
        baseCapital - (dailyLoss * 4),
        baseCapital - (dailyLoss * 9),
        baseCapital - Math.min(savedAmount, dailyLoss * 14),
        baseCapital - Math.min(savedAmount + 1000, dailyLoss * 20),
        baseCapital - Math.min(savedAmount + 2000, dailyLoss * 25),
        baseCapital - Math.min(savedAmount + 3000, dailyLoss * 30)
    ];

    // Dataset 1: Protected with Linka shield
    chart.data.datasets[1].data = [
        baseCapital,
        baseCapital - (dailyLoss * 4),
        baseCapital - (dailyLoss * 7),
        baseCapital - (dailyLoss * 7), // shielded point
        baseCapital - (dailyLoss * 7.5),
        baseCapital - (dailyLoss * 8),
        baseCapital - (dailyLoss * 8.2)
    ];

    chart.update();
}

function initChart() {
    const chartEl = $('cashFlowChart');
    if (!chartEl) return;

    const muted = '#c7c7cc';
    const chartFont = { family: '-apple-system, BlinkMacSystemFont, Inter, sans-serif', size: 14 };
    chart = new Chart(chartEl.getContext('2d'), {
        type: 'line',
        data: {
            labels: ['Day 1', 'Day 5', 'Day 10', 'Day 14', 'Day 20', 'Day 25', 'Day 30'],
            datasets: [
                {
                    label: 'Without Linka',
                    data: [248500, 245000, 241000, 237000, 233000, 229000, 225000],
                    borderColor: '#ff453a',
                    borderDash: [5, 5],
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.35
                },
                {
                    label: 'With Linka',
                    data: [248500, 245000, 241000, 241000, 240500, 240000, 239800],
                    borderColor: '#34c759',
                    backgroundColor: 'rgba(52, 199, 89, 0.08)',
                    borderWidth: 3,
                    pointRadius: 0,
                    tension: 0.35,
                    fill: true,
                    hidden: true // revealed after protection executes
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
                    backgroundColor: 'rgba(28, 28, 30, 0.9)',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    padding: 12,
                    titleFont: chartFont,
                    bodyFont: chartFont,
                    callbacks: { label: (c) => ` ${c.dataset.label}: $${c.parsed.y.toLocaleString()}` }
                }
            },
            scales: {
                x: { grid: { display: false }, ticks: { color: muted, font: chartFont } },
                y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: muted, font: chartFont, callback: (v) => `$${v / 1000}k` } }
            }
        }
    });
}

function executeProtectionNow() {
    if (isExecuted) return;
    isExecuted = true;

    const savedEl = $('saved-amount-display');
    if (savedEl) {
        savedEl.textContent = `$${currentSavings.toLocaleString()}`;
        savedEl.className = 'num text-[38px] font-semibold text-emerald-400 mt-1';
    }

    const burnEl = getEl('cloud-burn-display', 'aws-burn-display');
    if (burnEl) {
        burnEl.textContent = '$0/day';
        burnEl.className = 'num font-medium text-emerald-400';
    }

    const clusterEl = getEl('cloud-cluster-status', 'aws-cluster-status');
    if (clusterEl) {
        clusterEl.textContent = 'Hibernated';
        clusterEl.className = 'font-medium text-sky-400';
    }

    const badgeEl = $('chart-status-badge');
    if (badgeEl) {
        badgeEl.textContent = `Protected · $${currentSavings.toLocaleString()} saved`;
        badgeEl.className = 'text-[14px] text-emerald-400';
    }

    const btn = $('execute-now-btn');
    if (btn) {
        btn.className = 'px-7 py-3.5 rounded-full bg-white/10 border border-emerald-400/30 text-emerald-400 text-[16px] flex items-center gap-2 shrink-0 cursor-default';
        btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Protected';
    }

    if (chart && chart.data.datasets[1]) {
        chart.data.datasets[1].hidden = false;
        chart.update();
    }

    setState('protected');
    socket.emit('EXECUTE_PROTECTION', { projectedSavings: currentSavings, batchId: "Batch-104" });
}

function resetWholeDemo(emitEvent = true) {
    isExecuted = false;
    currentSavings = 2520;
    currentDelayDays = 14;
    currentDelayLabel = "14 days";

    const savedEl = $('saved-amount-display');
    if (savedEl) {
        savedEl.textContent = '$0';
        savedEl.className = 'num text-[38px] font-semibold text-neutral-400 mt-1';
    }

    const burnEl = getEl('cloud-burn-display', 'aws-burn-display');
    if (burnEl) {
        burnEl.textContent = '$180/day';
        burnEl.className = 'num font-medium text-red-400';
    }

    const clusterEl = getEl('cloud-cluster-status', 'aws-cluster-status');
    if (clusterEl) {
        clusterEl.textContent = 'Running';
        clusterEl.className = 'font-medium text-emerald-400';
    }

    const badgeEl = $('chart-status-badge');
    if (badgeEl) {
        badgeEl.textContent = 'Unprotected';
        badgeEl.className = 'text-[14px] text-red-400';
    }

    const btn = $('execute-now-btn');
    if (btn) {
        btn.className = EXECUTE_BTN_DEFAULT.className;
        btn.innerHTML = EXECUTE_BTN_DEFAULT.html;
    }

    // Reset Step 2 cards to defaults
    const idleWasteEl = $('step2-idle-waste');
    if (idleWasteEl) idleWasteEl.textContent = '$2,520';
    const wasteMathEl = $('step2-waste-math');
    if (wasteMathEl) wasteMathEl.textContent = '$180/day × 14 days';
    const leadTimeEl = $('step2-lead-time');
    if (leadTimeEl) leadTimeEl.textContent = '+14 days';
    const narrativeDaysEl = $('step2-narrative-days');
    if (narrativeDaysEl) narrativeDaysEl.textContent = '14 days';

    const ratioDisp = $('model-ratio-display');
    if (ratioDisp) ratioDisp.textContent = '38.0%';
    const bDisp = $('model-budget-display');
    if (bDisp) bDisp.textContent = '$5,400';
    const uDisp = $('model-usage-display');
    if (uDisp) uDisp.textContent = '72.0%';
    const rSub = $('model-risk-sub');
    if (rSub) rSub.textContent = '28.0% idle risk rate';
    const pExp = $('model-predicted-expense');
    if (pExp) pExp.textContent = '$2,880';
    const sSub = $('model-savings-sub');
    if (sSub) sSub.textContent = 'Saves 46.7% of budget';
    const rBuf = $('model-reserve-buffer');
    if (rBuf) rBuf.textContent = '$1,728';
    const recSub = $('model-reserve-sub');
    if (recSub) recSub.textContent = '32% capital shield';
    const recChip = $('model-recommendation-chip');
    if (recChip) recChip.textContent = 'Recommendation: Shield 32% Reserve ($1,728)';

    if (chart && chart.data.datasets[1]) {
        chart.data.datasets[1].hidden = true;
        updateChartCurves(2520, 14);
    }

    setState('normal');
    switchStep(1);
    if (emitEvent && socket && socket.connected) {
        socket.emit('RESET_DEMO');
    }
}

// Arrow keys step through the demo during the live pitch
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' && currentStep < TOTAL_STEPS) switchStep(currentStep + 1);
    if (e.key === 'ArrowLeft' && currentStep > 1) switchStep(currentStep - 1);
});

// Live events from the server / mobile trigger
socket.on('LOGISTICS_DISRUPTION_ALERT', (data) => {
    if (data) {
        currentSavings = data.projectedSavings || (data.dailyCost ? Math.round(data.dailyCost * (data.delayDays || 14)) : 2520);
        currentDelayDays = data.delayDays || 14;
        currentDelayLabel = data.delayLabel || `${currentDelayDays} days`;
        activeBudgetModel = data.budgetModel || null;

        // Update Step 2 metrics
        const idleWasteEl = $('step2-idle-waste');
        if (idleWasteEl) idleWasteEl.textContent = `$${currentSavings.toLocaleString()}`;

        const wasteMathEl = $('step2-waste-math');
        if (wasteMathEl) wasteMathEl.textContent = `$${data.dailyCost || 180}/day × ${currentDelayLabel}`;

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
                    : ((activeBudgetModel.monthlyBudget / 14200) * 100);
                ratioDisp.textContent = `${Number(ratioVal).toFixed(1)}%`;
            }

            const uDisp = $('model-usage-display');
            if (uDisp) uDisp.textContent = `${activeBudgetModel.historicalUsageRate.toFixed(1)}%`;

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
        }

        // Update JSON Preview
        const jsonDays = $('json-delay-days');
        if (jsonDays) jsonDays.textContent = currentDelayDays;
        const jsonLabel = $('json-delay-label');
        if (jsonLabel) jsonLabel.textContent = `"${currentDelayLabel}"`;
        const jsonWaste = $('json-waste');
        if (jsonWaste) jsonWaste.textContent = `${currentSavings.toFixed(2)}`;

        if (activeBudgetModel) {
            const jBud = $('json-budget');
            if (jBud) jBud.textContent = `${activeBudgetModel.monthlyBudget.toFixed(2)}`;
            const jRatio = $('json-ratio');
            if (jRatio) {
                const ratioVal = activeBudgetModel.clientExpenseRatio !== undefined 
                    ? activeBudgetModel.clientExpenseRatio 
                    : ((activeBudgetModel.monthlyBudget / 14200) * 100);
                jRatio.textContent = `"${Number(ratioVal).toFixed(1)}%"`;
            }
            const jUse = $('json-usage');
            if (jUse) jUse.textContent = `${activeBudgetModel.historicalUsageRate.toFixed(1)}`;
            const jExp = $('json-pred-expense');
            if (jExp) jExp.textContent = `${activeBudgetModel.predictedCycleExpenseWithShield.toFixed(2)}`;
            const jRec = $('json-rec-pct');
            if (jRec) jRec.textContent = `${activeBudgetModel.recommendedReservePct}`;
        }

        updateChartCurves(currentSavings, currentDelayDays);
    }
    switchStep(2);
});

socket.on('PROTECTION_CONFIRMED', () => { if (!isExecuted) executeProtectionNow(); });
socket.on('RESET_DEMO_BROADCAST', () => resetWholeDemo(false));
socket.on('INIT_STATE', (data) => {
    if (data && data.resources && data.resources.every(r => r.status === 'RUNNING')) {
        resetWholeDemo(false);
    }
});

document.addEventListener('DOMContentLoaded', initChart);
