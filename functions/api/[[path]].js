// Cloudflare Pages Function - TrendOracle API
// Path: /functions/api/[[path]].js

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace('/api', '');
  const method = request.method;
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  
  if (method === 'OPTIONS') {
    return new Response(null, { headers });
  }
  
  try {
    // Initialize DB
    await initDB(env);
    
    if (path === '/trends' && method === 'GET') {
      return await getTrends(env, headers);
    }
    
    if (path === '/search' && method === 'POST') {
      const body = await request.json();
      return await searchTrends(body.keyword, env, headers);
    }
    
    if (path.startsWith('/youtube/') && method === 'GET') {
      const keyword = decodeURIComponent(path.split('/').pop());
      return await getYouTubeData(keyword, env, headers);
    }
    
    if (path.startsWith('/predict/') && method === 'GET') {
      const keyword = decodeURIComponent(path.split('/').pop());
      return await generatePrediction(keyword, env, headers);
    }
    
    return new Response(JSON.stringify({ error: 'Not Found' }), { 
      status: 404, headers });
      
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, headers });
  }
}

async function initDB(env) {
  if (!env.DB) return;
  
  await env.DB.exec(`
    CREATE TABLE IF NOT EXISTS trends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      keyword TEXT UNIQUE NOT NULL,
      category TEXT,
      growth_rate INTEGER,
      confidence INTEGER,
      youtube_views INTEGER,
      youtube_growth REAL,
      google_trends_score INTEGER,
      news_count INTEGER,
      social_mentions INTEGER,
      peak_date TEXT,
      chart_data TEXT,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function getTrends(env, headers) {
  const { results } = await env.DB.prepare(`
    SELECT * FROM trends 
    ORDER BY growth_rate DESC 
    LIMIT 50
  `).all();
  
  return new Response(JSON.stringify({
    success: true,
    data: results || [],
    timestamp: new Date().toISOString()
  }), { headers });
}

async function searchTrends(keyword, env, headers) {
  // Fetch from YouTube
  const youtubeData = await fetchYouTubeAPI(keyword, env);
  
  // Calculate score
  const score = calculateScore(youtubeData);
  
  return new Response(JSON.stringify({
    success: true,
    source: 'fresh',
    data: [{
      keyword,
      growth_rate: score.growth,
      confidence: score.confidence,
      youtube_views: score.youtubeViews
    }]
  }), { headers });
}

async function fetchYouTubeAPI(keyword, env) {
  if (!env.YOUTUBE_API_KEY) {
    return { error: 'No API key', videos: [], totalViews: 0 };
  }
  
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(keyword)}&type=video&maxResults=10&key=${env.YOUTUBE_API_KEY}`;
  
  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();
  
  if (!searchData.items || searchData.items.length === 0) {
    return { error: 'No results', videos: [], totalViews: 0 };
  }
  
  const videoIds = searchData.items.map(item => item.id.videoId).join(',');
  const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${env.YOUTUBE_API_KEY}`;
  
  const statsRes = await fetch(statsUrl);
  const statsData = await statsRes.json();
  
  const videos = searchData.items.map((item, index) => {
    const stats = statsData.items[index]?.statistics || {};
    return {
      id: item.id.videoId,
      title: item.snippet.title,
      views: parseInt(stats.viewCount || 0),
      likes: parseInt(stats.likeCount || 0)
    };
  });
  
  const totalViews = videos.reduce((sum, v) => sum + v.views, 0);
  
  return { videos, totalViews, videoCount: videos.length };
}

function calculateScore(data) {
  if (!data || data.error) {
    return { growth: 100, confidence: 60, youtubeViews: 0, chartData: [] };
  }
  
  const avgViews = data.totalViews / (data.videoCount || 1);
  const youtubeScore = Math.min(avgViews / 10000, 100);
  
  const growth = Math.floor(youtubeScore * 10);
  const confidence = Math.floor(60 + (youtubeScore * 0.3));
  
  const chartData = Array.from({length: 30}, (_, i) => {
    return Math.floor((youtubeScore / 3) + (i / 30) * youtubeScore + (Math.random() * 20 - 10));
  });
  
  return {
    growth: Math.min(growth, 999),
    confidence: Math.min(confidence, 99),
    youtubeViews: data.totalViews,
    chartData
  };
}

async function getYouTubeData(keyword, env, headers) {
  const data = await fetchYouTubeAPI(keyword, env);
  return new Response(JSON.stringify({
    success: true,
    data
  }), { headers });
}

async function generatePrediction(keyword, env, headers) {
  const youtubeData = await fetchYouTubeAPI(keyword, env);
  const score = calculateScore(youtubeData);
  
  const daysToPeak = Math.floor(Math.random() * 30) + 7;
  const peakDate = new Date();
  peakDate.setDate(peakDate.getDate() + daysToPeak);
  
  const reasoning = `YouTube에서 "${keyword}" 관련 콘텐츠가 ${youtubeData.videoCount || 0}개 발견되었으며, 총 조회수는 ${(score.youtubeViews / 10000).toFixed(1)}만회입니다.`;
  
  return new Response(JSON.stringify({
    success: true,
    prediction: {
      keyword,
      predicted_growth: score.growth,
      confidence: score.confidence,
      peak_date: peakDate.toISOString().split('T')[0],
      days_to_peak: daysToPeak,
      reasoning,
      chart_data: score.chartData,
      youtube_stats: {
        total_views: score.youtubeViews,
        video_count: youtubeData.videoCount || 0
      }
    }
  }), { headers });
}
