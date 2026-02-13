// TrendOracle Main App
let currentPage = 'home';
let previousPage = 'home';
let currentTrend = null;
let chartInstance = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderTrendList();
    renderCategoryGrid();
    renderDiscoverCategories();
    renderSavedTrends();
    updateSavedCount();
});

// Navigation
function showPage(page) {
    previousPage = currentPage;
    currentPage = page;
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Show target page
    const targetPage = document.getElementById(`page-${page}`);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Update nav
    document.querySelectorAll('nav button').forEach(btn => {
        btn.classList.remove('nav-active', 'text-blue-600');
        btn.classList.add('text-gray-400');
    });
    
    const navBtn = document.getElementById(`nav-${page}`);
    if (navBtn) {
        navBtn.classList.add('nav-active', 'text-blue-600');
        navBtn.classList.remove('text-gray-400');
    }
    
    window.scrollTo(0, 0);
    
    // Special handling
    if (page === 'saved') {
        renderSavedTrends();
    }
}

function goBack() {
    showPage(previousPage);
}

// Render Functions
function renderTrendList() {
    const container = document.getElementById('trendListContainer');
    if (!container) return;
    
    const sortedTrends = [...TRENDS_DATA].sort((a, b) => b.growth_rate - a.growth_rate);
    
    container.innerHTML = sortedTrends.map((trend, index) => `
        <div onclick="showDetail(${trend.id})" class="trend-item bg-white rounded-xl p-4 shadow-sm cursor-pointer">
            <div class="flex items-center gap-4">
                <span class="text-3xl font-black text-blue-100 italic">${String(index + 1).padStart(2, '0')}</span>
                <div class="flex-1">
                    <p class="font-bold text-sm">${trend.keyword}</p>
                    <p class="text-xs text-blue-600">${trend.category_name} · ${trend.subcategory}</p>
                </div>
                <div class="text-right">
                    <p class="text-green-600 font-bold">+${trend.growth_rate}%</p>
                    <p class="text-xs text-gray-400">${getDaysUntil(trend.peak_date)}</p>
                </div>
            </div>
            <div class="mt-3">
                <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-blue-600 to-green-400 rounded-full" style="width: ${trend.confidence}%"></div>
                </div>
                <p class="text-xs text-gray-500 mt-1">확신도 ${trend.confidence}% · 피크: ${trend.peak_date}</p>
            </div>
        </div>
    `).join('');
}

function renderCategoryGrid() {
    const container = document.getElementById('categoryGrid');
    if (!container) return;
    
    const displayCategories = CATEGORIES_DATA.slice(0, 4);
    
    container.innerHTML = displayCategories.map((cat, index) => `
        <div onclick="showCategoryDetail('${cat.slug}')" class="relative ${index === 2 ? 'col-span-2 aspect-[2/1]' : 'aspect-square'} overflow-hidden rounded-2xl group cursor-pointer">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
            <img src="${cat.image}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
            <div class="absolute top-3 left-3 z-20">
                <span class="bg-green-500 text-white text-xs px-2 py-1 rounded font-bold">+${cat.growth_rate}%</span>
            </div>
            <div class="absolute bottom-0 left-0 p-4 z-20">
                <p class="text-white/80 text-xs">${cat.trend_count}개 트렌드</p>
                <p class="text-white font-bold ${index === 2 ? 'text-xl' : 'text-lg'}">${cat.name}</p>
            </div>
        </div>
    `).join('');
}

function renderDiscoverCategories() {
    const container = document.getElementById('discoverCategoryList');
    if (!container) return;
    
    container.innerHTML = CATEGORIES_DATA.map(cat => `
        <div onclick="showCategoryDetail('${cat.slug}')" class="bg-white rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center" style="background-color: ${cat.color}20">
                <span class="material-symbols-outlined" style="color: ${cat.color}">${cat.icon}</span>
            </div>
            <div class="flex-1">
                <p class="font-bold">${cat.name}</p>
                <p class="text-xs text-gray-500">${cat.description}</p>
            </div>
            <div class="text-right">
                <p class="text-green-600 font-bold">+${cat.growth_rate}%</p>
                <p class="text-xs text-gray-400">${cat.trend_count}개</p>
            </div>
        </div>
    `).join('');
}

function renderSavedTrends() {
    const container = document.getElementById('savedListContainer');
    if (!container) return;
    
    const saved = getSavedTrends();
    
    if (saved.length === 0) {
        container.innerHTML = `
            <div class="bg-white rounded-2xl p-8 text-center">
                <span class="material-symbols-outlined text-6xl text-gray-300 mb-4">bookmark_border</span>
                <p class="text-gray-500">아직 저장한 예측이 없습니다</p>
                <p class="text-sm text-gray-400 mt-2">관심 있는 트렌드를 저장하세요</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = saved.map(trend => `
        <div class="bg-white rounded-xl p-4 shadow-sm">
            <div class="flex items-center justify-between">
                <div onclick="showDetail(${trend.id})" class="flex-1 cursor-pointer">
                    <p class="font-bold">${trend.keyword}</p>
                    <p class="text-xs text-blue-600">${trend.category_name}</p>
                    <p class="text-xs text-gray-500 mt-1">확신도 ${trend.confidence}% · +${trend.growth_rate}%</p>
                </div>
                <button onclick="unsaveTrend(${trend.id}); renderSavedTrends(); updateSavedCount();" class="p-2 text-red-500 hover:bg-red-50 rounded-full">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            </div>
        </div>
    `).join('');
}

function updateSavedCount() {
    const countEl = document.getElementById('savedCount');
    if (countEl) {
        countEl.textContent = savedTrends.length;
    }
}

// Detail Page
function showDetail(trendId) {
    currentTrend = getTrendById(trendId);
    if (!currentTrend) return;
    
    document.getElementById('detailTitle').textContent = currentTrend.keyword;
    document.getElementById('detailCategory').textContent = `${currentTrend.category_name} · ${currentTrend.subcategory}`;
    document.getElementById('detailConfidence').textContent = currentTrend.confidence + '%';
    document.getElementById('detailGrowth').textContent = '+' + currentTrend.growth_rate + '%';
    document.getElementById('detailDays').textContent = getDaysUntil(currentTrend.peak_date);
    document.getElementById('detailPeak').textContent = currentTrend.peak_date.slice(5);
    document.getElementById('detailReasoning').textContent = currentTrend.reasoning;
    
    showPage('detail');
    
    // Render chart
    setTimeout(() => renderChart(currentTrend), 100);
}

function renderChart(trend) {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;
    
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    const labels = trend.chart_data.map((_, i) => `${i + 1}일`);
    
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '트렌드 지수',
                data: trend.chart_data,
                borderColor: '#0f49bd',
                backgroundColor: 'rgba(15, 73, 189, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointBackgroundColor: '#0f49bd'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.05)' }
                },
                x: {
                    grid: { display: false },
                    ticks: { maxTicksLimit: 6 }
                }
            }
        }
    });
}

function saveCurrentTrend() {
    if (!currentTrend) return;
    
    if (saveTrend(currentTrend.id)) {
        alert('예측이 저장되었습니다!');
        updateSavedCount();
    } else {
        alert('이미 저장된 예측입니다.');
    }
}

// Category Detail
function showCategoryDetail(slug) {
    const category = CATEGORIES_DATA.find(c => c.slug === slug);
    const trends = getTrendsByCategory(slug);
    
    // Create category detail view dynamically
    const container = document.getElementById('page-discover');
    
    container.innerHTML = `
        <div class="px-6 py-4 border-b flex items-center gap-4">
            <button onclick="restoreDiscoverPage()" class="p-2 hover:bg-gray-100 rounded-full">
                <span class="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
                <h1 class="text-xl font-bold">${category.name}</h1>
                <p class="text-sm text-gray-500">${trends.length}개 트렌드</p>
            </div>
        </div>
        <div class="relative h-48">
            <img src="${category.image}" class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div class="absolute bottom-4 left-6 text-white">
                <p class="text-2xl font-bold">+${category.growth_rate}%</p>
                <p class="text-sm">카테고리 평균 성장률</p>
            </div>
        </div>
        <div class="px-6 pt-6 pb-6">
            <div class="space-y-3">
                ${trends.map(trend => `
                    <div onclick="showDetail(${trend.id})" class="bg-white rounded-xl p-4 shadow-sm cursor-pointer">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="font-bold">${trend.keyword}</p>
                                <p class="text-xs text-blue-600">확신도 ${trend.confidence}%</p>
                            </div>
                            <div class="text-right">
                                <p class="text-green-600 font-bold">+${trend.growth_rate}%</p>
                                <p class="text-xs text-gray-400">${getDaysUntil(trend.peak_date)}</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function restoreDiscoverPage() {
    const container = document.getElementById('page-discover');
    container.innerHTML = `
        <div class="px-6 py-4 border-b flex items-center gap-4">
            <button onclick="showPage('home')" class="p-2 hover:bg-gray-100 rounded-full">
                <span class="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 class="text-xl font-bold">발견</h1>
        </div>
        <div class="px-6 pt-6">
            <div class="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white mb-6">
                <h2 class="text-xl font-bold mb-2">새로운 트렌드 발견</h2>
                <p class="text-blue-100">매일 업데이트되는 전 세계 트렌드</p>
            </div>
            <h3 class="text-lg font-bold mb-4">모든 카테고리</h3>
            <div id="discoverCategoryList" class="space-y-3"></div>
        </div>
    `;
    renderDiscoverCategories();
}

// Search Functions
function openSearch() {
    document.getElementById('searchModal').classList.remove('hidden');
    document.getElementById('searchModal').classList.add('flex');
    document.getElementById('searchInput').focus();
}

function closeSearch() {
    document.getElementById('searchModal').classList.add('hidden');
    document.getElementById('searchModal').classList.remove('flex');
}

function quickSearch(query) {
    document.getElementById('searchInput').value = query;
    performSearch();
}

function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) return;
    
    addToHistory(query);
    
    const results = searchTrends(query);
    
    document.getElementById('searchQuery').textContent = query;
    
    const container = document.getElementById('searchResults');
    
    if (results.length === 0) {
        // Generate simulated result
        const simulatedTrend = {
            id: 'sim_' + Date.now(),
            keyword: query,
            category_name: '검색 결과',
            growth_rate: Math.floor(Math.random() * 400) + 100,
            confidence: Math.floor(Math.random() * 30) + 60,
            peak_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            reasoning: `"${query}"에 대한 AI 분석 결과, 유사 패턴에서 평균 240%의 성장률을 보였습니다.`,
            chart_data: Array.from({length: 20}, (_, i) => 20 + i * 15 + Math.random() * 20)
        };
        
        container.innerHTML = `
            <div class="bg-yellow-50 rounded-xl p-4 mb-4">
                <p class="text-sm text-yellow-800">"${query}"에 대한 기존 데이터가 없습니다. AI가 예측을 생성했습니다.</p>
            </div>
            <div onclick="showSimulatedDetail('${query}')" class="bg-white rounded-xl p-4 shadow-sm cursor-pointer">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="font-bold">${query}</p>
                        <p class="text-xs text-blue-600">AI 생성 예측</p>
                    </div>
                    <div class="text-right">
                        <p class="text-green-600 font-bold">+${simulatedTrend.growth_rate}%</p>
                        <p class="text-xs text-gray-400">확신도 ${simulatedTrend.confidence}%</p>
                    </div>
                </div>
                <div class="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-blue-600 to-green-400 rounded-full" style="width: ${simulatedTrend.confidence}%"></div>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = results.map(trend => `
            <div onclick="showDetail(${trend.id})" class="bg-white rounded-xl p-4 shadow-sm cursor-pointer">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="font-bold">${trend.keyword}</p>
                        <p class="text-xs text-blue-600">${trend.category_name}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-green-600 font-bold">+${trend.growth_rate}%</p>
                        <p class="text-xs text-gray-400">${getDaysUntil(trend.peak_date)}</p>
                    </div>
                </div>
                <div class="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-blue-600 to-green-400 rounded-full" style="width: ${trend.confidence}%"></div>
                </div>
            </div>
        `).join('');
    }
    
    closeSearch();
    showPage('search');
}

function showSimulatedDetail(keyword) {
    const simulatedTrend = {
        keyword: keyword,
        category_name: 'AI 생성 예측',
        growth_rate: Math.floor(Math.random() * 400) + 100,
        confidence: Math.floor(Math.random() * 30) + 60,
        peak_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reasoning: `AI가 "${keyword}"에 대한 예측을 생성했습니다. 과거 유사 키워드의 패턴과 현재 소셜 미디어 언급량을 분석한 결과입니다.`,
        chart_data: Array.from({length: 30}, (_, i) => 20 + i * 12 + Math.random() * 30)
    };
    
    document.getElementById('detailTitle').textContent = simulatedTrend.keyword;
    document.getElementById('detailCategory').textContent = simulatedTrend.category_name;
    document.getElementById('detailConfidence').textContent = simulatedTrend.confidence + '%';
    document.getElementById('detailGrowth').textContent = '+' + simulatedTrend.growth_rate + '%';
    document.getElementById('detailDays').textContent = 'D-21';
    document.getElementById('detailPeak').textContent = simulatedTrend.peak_date.slice(5);
    document.getElementById('detailReasoning').textContent = simulatedTrend.reasoning;
    
    showPage('detail');
    setTimeout(() => {
        const ctx = document.getElementById('trendChart');
        if (chartInstance) chartInstance.destroy();
        
        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: simulatedTrend.chart_data.map((_, i) => `${i + 1}일`),
                datasets: [{
                    label: '트렌드 지수',
                    data: simulatedTrend.chart_data,
                    borderColor: '#0f49bd',
                    backgroundColor: 'rgba(15, 73, 189, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true },
                    x: { ticks: { maxTicksLimit: 6 } }
                }
            }
        });
    }, 100);
}
