// TrendOracle Data
const TRENDS_DATA = [
    {
        id: 1,
        keyword: '공간 컴퓨팅 에코시스템',
        category: 'tech',
        category_name: '테크',
        subcategory: 'AR/VR',
        growth_rate: 890,
        confidence: 87,
        peak_date: '2026-03-05',
        days_to_peak: 18,
        description: '메타버스와 실제 세계를 연결하는 공간 컴퓨팅 기술이 급부상하고 있습니다.',
        reasoning: 'Apple Vision Pro 출시 이후 기업들의 R&D 투자가 340% 증가했습니다. 특히 산업용 AR 애플리케이션에서 강한 수요를 보이고 있습니다.',
        data_points: 2450,
        sources: ['Google Trends', 'Naver DataLab', 'GitHub'],
        chart_data: [23, 28, 35, 42, 58, 67, 89, 95, 120, 145, 180, 210, 245, 290, 340, 380, 420, 480, 530, 590, 650, 720, 800, 890]
    },
    {
        id: 2,
        keyword: '나이키 덩크 로우 흰색',
        category: 'fashion',
        category_name: '패션',
        subcategory: '스니커즈',
        growth_rate: 340,
        confidence: 87,
        peak_date: '2026-03-15',
        days_to_peak: 28,
        description: '봄 시즌 진입으로 흰색 스니커즈 수요가 급증하고 있습니다.',
        reasoning: '과거 3년간의 패턴 분석 결과, 3월에 흰색 스니커즈 검색량이 평균 280% 증가했습니다. 특히 Z세대 사이에서 '클린핏' 트렌드가 유행 중입니다.',
        data_points: 1800,
        sources: ['Naver Shopping', 'Google Trends', 'Instagram'],
        chart_data: [45, 48, 52, 58, 65, 72, 80, 95, 110, 125, 145, 170, 195, 220, 250, 280, 310, 340]
    },
    {
        id: 3,
        keyword: '재생 여행 디자인',
        category: 'travel',
        category_name: '여행',
        subcategory: '라이프스타일',
        growth_rate: 670,
        confidence: 78,
        peak_date: '2026-03-08',
        days_to_peak: 21,
        description: '환경을 회복시키는 여행, 지속가능한 관광이 새로운 트렌드로 떠오르고 있습니다.',
        reasoning: '탄소 중립에 대한 관심 증가로 '리제너레이티브 트래블'이 주목받고 있습니다. 특히 밀레니얼 세대에서 450% 이상의 검색 증가를 보였습니다.',
        data_points: 1200,
        sources: ['Naver Blog', 'Google Trends', 'YouTube'],
        chart_data: [30, 35, 42, 55, 72, 95, 125, 160, 200, 250, 310, 380, 460, 540, 620, 670]
    },
    {
        id: 4,
        keyword: '바이오 섬유',
        category: 'fashion',
        category_name: '패션',
        subcategory: '지속가능성',
        growth_rate: 540,
        confidence: 72,
        peak_date: '2026-03-15',
        days_to_peak: 28,
        description: '버섯, 해초 등에서 추출한 친환경 소재가 패션업계를 변화시키고 있습니다.',
        reasoning: '주요 패션 브랜드들의 ESG 경영 강화로 바이오 소재 수요가 급증하고 있습니다. 특히 Mycelium 가죽 대체재가 주목받고 있습니다.',
        data_points: 980,
        sources: ['Google Trends', 'Naver News'],
        chart_data: [25, 30, 38, 48, 62, 78, 98, 125, 158, 195, 240, 290, 350, 420, 490, 540]
    },
    {
        id: 5,
        keyword: '디그로스 경제 모델',
        category: 'finance',
        category_name: '금융',
        subcategory: '경제',
        growth_rate: 430,
        confidence: 65,
        peak_date: '2026-03-22',
        days_to_peak: 35,
        description: '성장보다 안정과 분배를 중시하는 새로운 경제 패러다임이 주목받고 있습니다.',
        reasoning: '경제 불확실성 증가로 '더 나은 성장'보다 '덜하지만 안정적인' 경제 모델에 대한 논의가 활발해지고 있습니다.',
        data_points: 750,
        sources: ['Naver News', 'Google Scholar'],
        chart_data: [20, 25, 32, 42, 55, 72, 95, 125, 165, 210, 265, 330, 380, 430]
    },
    {
        id: 6,
        keyword: '신경다양성 워크스페이스',
        category: 'career',
        category_name: '커리어',
        subcategory: 'HR',
        growth_rate: 120,
        confidence: 52,
        peak_date: '2026-03-29',
        days_to_peak: 42,
        description: 'ADHD, 자폐 스펙트럼 등 신경다양성 직원들을 위한 포용적 근무 환경.',
        reasoning: '구글, 마이크로소프트 등 글로벌 기업들의 신경다양성 채용 확대가 국내에서도 논의되고 있습니다.',
        data_points: 520,
        sources: ['Naver News', 'LinkedIn'],
        chart_data: [15, 18, 22, 28, 35, 45, 58, 72, 88, 105, 120]
    }
];

const CATEGORIES_DATA = [
    {
        id: 'food',
        name: '푸드 & 디저트',
        slug: 'food',
        growth_rate: 340,
        trend_count: 12,
        icon: 'restaurant',
        color: '#ff6b6b',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600',
        description: '음식, 디저트, 레스토랑 트렌드'
    },
    {
        id: 'finance',
        name: '금융 & 투자',
        slug: 'finance',
        growth_rate: 280,
        trend_count: 8,
        icon: 'trending_up',
        color: '#4ecdc4',
        image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600',
        description: '주식, 코인, 경제 트렌드'
    },
    {
        id: 'fashion',
        name: '패션 & 뷰티',
        slug: 'fashion',
        growth_rate: 520,
        trend_count: 15,
        icon: 'checkroom',
        color: '#45b7d1',
        image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200',
        description: '의류, 뷰티, 스타일 트렌드'
    },
    {
        id: 'entertainment',
        name: '엔터테인먼트',
        slug: 'entertainment',
        growth_rate: 180,
        trend_count: 6,
        icon: 'movie',
        color: '#96ceb4',
        image: 'https://images.unsplash.com/photo-1515634928627-2a4e0dae3ddf?w=600',
        description: '영화, 드라마, 음악 트렌드'
    },
    {
        id: 'sports',
        name: '스포츠 & 피트니스',
        slug: 'sports',
        growth_rate: 410,
        trend_count: 9,
        icon: 'fitness_center',
        color: '#feca57',
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600',
        description: '운동, 건강, 웰니스 트렌드'
    },
    {
        id: 'tech',
        name: '테크 & 스타트업',
        slug: 'tech',
        growth_rate: 670,
        trend_count: 11,
        icon: 'computer',
        color: '#ff9ff3',
        image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600',
        description: '기술, 스타트업, 혁신 트렌드'
    },
    {
        id: 'lifestyle',
        name: '라이프스타일',
        slug: 'lifestyle',
        growth_rate: 230,
        trend_count: 7,
        icon: 'home',
        color: '#54a0ff',
        image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600',
        description: '인테리어, 취미, 생활 트렌드'
    },
    {
        id: 'travel',
        name: '여행 & 숙박',
        slug: 'travel',
        growth_rate: 390,
        trend_count: 10,
        icon: 'flight',
        color: '#48dbfb',
        image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600',
        description: '여행, 호텔, 체험 트렌드'
    }
];

// User Data (LocalStorage)
let savedTrends = JSON.parse(localStorage.getItem('trendoracle_saved') || '[]');
let searchHistory = JSON.parse(localStorage.getItem('trendoracle_history') || '[]');

// Helper Functions
function getTrendById(id) {
    return TRENDS_DATA.find(t => t.id === id);
}

function getTrendsByCategory(category) {
    return TRENDS_DATA.filter(t => t.category === category);
}

function searchTrends(query) {
    const lowerQuery = query.toLowerCase();
    return TRENDS_DATA.filter(t => 
        t.keyword.toLowerCase().includes(lowerQuery) ||
        t.category_name.toLowerCase().includes(lowerQuery) ||
        t.description.toLowerCase().includes(lowerQuery)
    );
}

function getDaysUntil(dateStr) {
    const target = new Date(dateStr);
    const today = new Date();
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`;
}

function saveTrend(trendId) {
    if (!savedTrends.includes(trendId)) {
        savedTrends.push(trendId);
        localStorage.setItem('trendoracle_saved', JSON.stringify(savedTrends));
        return true;
    }
    return false;
}

function unsaveTrend(trendId) {
    savedTrends = savedTrends.filter(id => id !== trendId);
    localStorage.setItem('trendoracle_saved', JSON.stringify(savedTrends));
}

function isTrendSaved(trendId) {
    return savedTrends.includes(trendId);
}

function getSavedTrends() {
    return savedTrends.map(id => getTrendById(id)).filter(Boolean);
}

function addToHistory(query) {
    if (!searchHistory.includes(query)) {
        searchHistory.unshift(query);
        if (searchHistory.length > 10) searchHistory.pop();
        localStorage.setItem('trendoracle_history', JSON.stringify(searchHistory));
    }
}
