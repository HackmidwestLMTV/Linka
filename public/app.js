// Linka dashboard logic: step navigation, protection flow, and live socket sync.
const socket = io();
const $ = (id) => document.getElementById(id);

const TOTAL_STEPS = 4;
let currentStep = 1;
let isExecuted = false;
let chart = null;

const EXECUTE_BTN_DEFAULT = {
    className: 'vision-btn-emerald px-7 py-3.5 text-[16px] flex items-center gap-2 shrink-0',
    html: '<i class="fa-solid fa-shield-halved"></i> Protect capital'
};

// Header status presets
const STATES = {
    normal:    { dot: 'dot dot-green', text: 'Operating normally',   aws: 'Running · $180/day',    awsColor: 'text-emerald-400' },
    alert:     { dot: 'dot dot-red',   text: 'Tariff hold detected', aws: 'Idle burn · $180/day',  awsColor: 'text-red-400' },
    protected: { dot: 'dot dot-green', text: 'Capital protected',    aws: 'Hibernated · $0/day',   awsColor: 'text-sky-400' }
};

function setState(name) {
    const s = STATES[name];
    $('global-pulse-dot').className = s.dot;
    $('global-status-text').textContent = s.text;
    const aws = $('header-aws-status');
    aws.textContent = s.aws;
    aws.className = `num font-medium ${s.awsColor}`;
}

function switchStep(step) {
    currentStep = step;
    for (let i = 1; i <= TOTAL_STEPS; i++) {
        $(`step-${i}-content`).classList.toggle('hidden', i !== step);
        const btn = $(`step-btn-${i}`);
        btn.classList.toggle('vision-step-active', i === step);
        btn.setAttribute('aria-selected', i === step);
    }
    if (step >= 2 && !isExecuted) setState('alert');
}

function initChart() {
    const muted = '#c7c7cc';
    const chartFont = { family: '-apple-system, BlinkMacSystemFont, Inter, sans-serif', size: 14 };
    chart = new Chart($('cashFlowChart').getContext('2d'), {
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

    $('saved-amount-display').textContent = '$2,520';
    $('saved-amount-display').className = 'num text-[38px] font-semibold text-emerald-400 mt-1';
    $('aws-burn-display').textContent = '$0/day';
    $('aws-burn-display').className = 'num font-medium text-emerald-400';
    $('aws-cluster-status').textContent = 'Hibernated';
    $('aws-cluster-status').className = 'font-medium text-sky-400';
    $('chart-status-badge').textContent = 'Protected · $2,520 saved';
    $('chart-status-badge').className = 'text-[14px] text-emerald-400';

    const btn = $('execute-now-btn');
    btn.className = 'px-7 py-3.5 rounded-full bg-white/10 border border-emerald-400/30 text-emerald-400 text-[16px] flex items-center gap-2 shrink-0 cursor-default';
    btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Protected';

    chart.data.datasets[1].hidden = false;
    chart.update();

    setState('protected');
    socket.emit('EXECUTE_PROTECTION', { projectedSavings: 2520 });
}

function resetWholeDemo() {
    isExecuted = false;

    $('saved-amount-display').textContent = '$0';
    $('saved-amount-display').className = 'num text-[38px] font-semibold text-neutral-400 mt-1';
    $('aws-burn-display').textContent = '$180/day';
    $('aws-burn-display').className = 'num font-medium text-red-400';
    $('aws-cluster-status').textContent = 'Running';
    $('aws-cluster-status').className = 'font-medium text-emerald-400';
    $('chart-status-badge').textContent = 'Unprotected';
    $('chart-status-badge').className = 'text-[14px] text-red-400';

    const btn = $('execute-now-btn');
    btn.className = EXECUTE_BTN_DEFAULT.className;
    btn.innerHTML = EXECUTE_BTN_DEFAULT.html;

    chart.data.datasets[1].hidden = true;
    chart.update();

    setState('normal');
    switchStep(1);
}

// Arrow keys step through the demo during the live pitch
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' && currentStep < TOTAL_STEPS) switchStep(currentStep + 1);
    if (e.key === 'ArrowLeft' && currentStep > 1) switchStep(currentStep - 1);
});

// Live events from the server / mobile trigger
socket.on('LOGISTICS_DISRUPTION_ALERT', () => switchStep(2));
socket.on('PROTECTION_CONFIRMED', () => { if (!isExecuted) executeProtectionNow(); });

document.addEventListener('DOMContentLoaded', initChart);
