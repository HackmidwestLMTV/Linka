const socket = io();
let currentResources = [];
let chartInstance = null;
let projectedSavings = 0;

// Initialize Chart
function initChart() {
    const ctx = document.getElementById('cashflowChart').getContext('2d');
    
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Inter', sans-serif";

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Day 1', 'Day 3', 'Day 7', 'Day 10', 'Day 14'],
            datasets: [
                {
                    label: 'Projected Burn (Idle)',
                    data: [180, 540, 1260, 1800, 2520],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    borderDash: [5, 5]
                },
                {
                    label: 'Optimized Burn',
                    data: [180, 180, 180, 180, 180],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    hidden: true // hide until action taken
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 6 } },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#cbd5e1',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    padding: 10
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { callback: (value) => '$' + value }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

function renderResources(resources) {
    const list = document.getElementById('resource-list');
    list.innerHTML = '';
    
    let totalBurn = 0;

    resources.forEach(res => {
        if (res.status === 'RUNNING') totalBurn += res.dailyCost;
        
        const isHibernated = res.status !== 'RUNNING';
        const statusColor = isHibernated ? 'text-slate-500' : 'text-emerald-400';
        const statusBg = isHibernated ? 'bg-slate-500/20' : 'bg-emerald-500/20 border-emerald-500/30';
        const statusDot = isHibernated ? '' : '<div class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>';
        
        const icon = res.type.includes('r5') ? 'fa-database' : 'fa-microchip';
        
        list.innerHTML += `
            <div class="resource-card bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 flex items-center justify-between ${isHibernated ? 'hibernated' : ''}">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-300">
                        <i class="fa-solid ${icon}"></i>
                    </div>
                    <div>
                        <div class="font-bold text-white flex items-center gap-2">
                            ${res.name}
                            <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-700 text-slate-300">${res.type}</span>
                        </div>
                        <div class="text-xs text-slate-400 mt-1">${res.id}</div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="font-bold text-white">$${res.dailyCost.toFixed(2)}<span class="text-xs text-slate-500 font-normal">/day</span></div>
                    <div class="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded border ${statusBg} ${statusColor} text-[10px] font-bold uppercase tracking-wider">
                        ${statusDot}
                        ${res.status}
                    </div>
                </div>
            </div>
        `;
    });

    document.getElementById('daily-burn').innerHTML = `$${totalBurn}<span class="text-lg text-slate-500">.00</span>`;
}

// Socket Events
socket.on('INIT_STATE', (data) => {
    currentResources = data.resources;
    renderResources(currentResources);
    initChart();
});

socket.on('LOGISTICS_DISRUPTION_ALERT', (data) => {
    projectedSavings = data.projectedSavings;
    
    // Update Left Pane (Flex)
    document.getElementById('shipment-card').classList.add('border-red-500/50', 'bg-red-900/20', 'alert-flash');
    const statusBadge = document.getElementById('shipment-status');
    statusBadge.className = "px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/30 animate-pulse";
    statusBadge.innerText = "CUSTOMS HOLD";
    
    document.getElementById('shipment-progress').classList.replace('bg-blue-500', 'bg-red-500');
    document.getElementById('shipment-eta').innerText = "Delayed (+14 Days)";
    document.getElementById('disruption-alert').classList.remove('hidden');

    // Update Right Pane (AWS Action)
    const panel = document.getElementById('action-panel');
    panel.className = "bg-red-900/20 rounded-xl p-5 border border-red-500/50 flex flex-col items-center justify-center text-center transition-all duration-300 opacity-100";
    
    document.getElementById('action-icon').className = "fa-solid fa-money-bill-trend-up text-4xl text-red-400 mb-3 animate-bounce";
    document.getElementById('action-heading').className = "text-white font-bold text-lg mb-1";
    document.getElementById('action-heading').innerText = `Projected Waste: $${data.projectedSavings.toLocaleString()}`;
    document.getElementById('action-subtext').className = "text-red-300 text-sm";
    document.getElementById('action-subtext').innerText = `${data.delayDays} days of idle compute burn on tagged resources.`;
    
    document.getElementById('execute-btn').classList.remove('hidden');
});

socket.on('PROTECTION_CONFIRMED', (data) => {
    currentResources = data.resources;
    renderResources(currentResources);

    // Update Action Panel
    const panel = document.getElementById('action-panel');
    panel.className = "bg-emerald-900/20 rounded-xl p-5 border border-emerald-500/50 flex flex-col items-center justify-center text-center transition-all duration-300 opacity-100";
    
    document.getElementById('action-icon').className = "fa-solid fa-shield-check text-4xl text-emerald-400 mb-3";
    document.getElementById('action-heading').className = "text-white font-bold text-lg mb-1";
    document.getElementById('action-heading').innerText = "Capital Protected";
    document.getElementById('action-subtext').className = "text-emerald-300 text-sm";
    document.getElementById('action-subtext').innerText = `$${data.savedAmount.toLocaleString()} saved. Infrastructure hibernated until clearance.`;
    
    document.getElementById('execute-btn').classList.add('hidden');

    // Update Chart
    chartInstance.data.datasets[0].hidden = true;
    chartInstance.data.datasets[1].hidden = false;
    chartInstance.update();

    // Update Liquidity
    const liq = document.getElementById('liquidity-val');
    liq.innerHTML = `<span class="text-emerald-400">$142,500</span><span class="text-lg text-emerald-500/50">.00</span>`;
    liq.classList.add('animate-pulse-slow');
});

document.getElementById('execute-btn').addEventListener('click', () => {
    document.getElementById('execute-btn').innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Executing...';
    socket.emit('EXECUTE_PROTECTION', { projectedSavings });
});
