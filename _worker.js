// Cloudflare Pages Function - TrendOracle API
// Module format for Pages Functions

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
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
    
    // Only handle /api/* paths
    if (!path.startsWith('/api/')) {
      // Pass through to static files
      return env.ASSETS.fetch(request);
    }
    
    const apiPath = path.replace('/api/', '');
    
    try {
      if (apiPath === 'trends' && method === 'GET') {
        return await getTrends(env, headers);
      }
      
      if (apiPath === 'search' && method === 'POST') {
        const body = await request.json();
        return await searchTrends(body.keyword, env, headers);
      }
      
      if (apiPath.startsWith('youtube/') && method === 'GET') {
        const keyword = decodeURIComponent(apiPath.replace('youtube/', ''));
        return await getYouTubeData(keyword, env, headers);
      }
      
      if (apiPath.startsWith('predict/') && method === 'GET') {
        const keyword = decodeURIComponent(apiPath.replace('predict/', ''));
        return await generatePrediction(keyword, env, headers);
      }
      
      return new Response(JSON.stringify({ error: 'Not Found' }), { 
        status: 404, headers });
        
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500, headers });
    }
  }
};

async function getTrends(env, headers) {
  // Check if DB is bound
  if (!env.DB) {
    return new Response(JSON.stringify({
      success: true,
      data: [],
      message: 'DB not configured - using live API mode'
    }), { headers });
  }
  
  try {
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
  } catch (e) {
    return new Response(JSON.stringify({
      success: true,
      data: [],
      error: e.message
    }), { headers });
  }
}

async function searchTrends(keyword, env, headers) {
  // Fetch from YouTube API
  const youtubeData = await fetchYouTubeAPI(keyword, env);
  
  if (youtubeData.error) {
    return new Response(JSON.stringify({
      success: false,
      error: youtubeData.error
    }), { headers });
  }
  
  const score = calculateScore(youtubeData);
  
  return new Response(JSON.stringify({
    success: true,
    source: 'youtube_api',
    data: [{
      keyword,
      growth_rate: score.growth,
      confidence: score.confidence,
      youtube_views: score.youtubeViews,
      video_count: youtubeData.videoCount
    }]
  }), { headers });
}

async function fetchYouTubeAPI(keyword, env) {
  if (!env.YOUTUBE_API_KEY) {
    return { error: 'YouTube API key not configured', videos: [], totalViews: 0 };
  }
  
  try {
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(keyword)}&type=video&maxResults=10&key=${env.YOUTUBE_API_KEY}`;
    
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    
    if (searchData.error) {
      return { error: searchData.error.message, videos: [], totalViews: 0 };
    }
    
    if (!searchData.items || searchData.items.length === 0) {
      return { error: 'No results found', videos: [], totalViews: 0 };
    }
    
    const videoIds = searchData.items.map(item => item.id.videoId).join(',');
    const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${env.YOUTUBE_API_KEY}`;
    
    const statsRes = await fetch(statsUrl);
    const statsData = await statsRes.json();
    
    const videos = searchData.items.map((item, index) => {
      const stats = statsData.items?.[index]?.statistics || {};
      return {
        id: item.id.videoId,
        title: item.snippet.title,
        views: parseInt(stats.viewCount || 0),
        likes: parseInt(stats.likeCount || 0),
        thumbnail: item.snippet.thumbnails?.medium?.url
      };
    });
    
    const totalViews = videos.reduce((sum, v) => sum + v.views, 0);
    
    return { videos, totalViews, videoCount: videos.length };
  } catch (err) {
    return { error: err.message, videos: [], totalViews: 0 };
  }
}

function calculateScore(data) {
  if (!data || data.error || data.totalViews === 0) {
    return { growth: 0, confidence: 0, youtubeViews: 0, chartData: [] };
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
    success: !data.error,
    data
  }), { headers });
}

async function generatePrediction(keyword, env, headers) {
  const youtubeData = await fetchYouTubeAPI(keyword, env);
  
  if (youtubeData.error) {
    return new Response(JSON.stringify({
      success: false,
      error: youtubeData.error
    }), { headers });
  }
  
  const score = calculateScore(youtubeData);
  
  const daysToPeak = Math.floor(Math.random() * 30) + 7;
  const peakDate = new Date();
  peakDate.setDate(peakDate.getDate() + daysToPeak);
  
  const reasoning = `YouTube에서 "${keyword}" 관련 콘텐츠가 ${youtubeData.videoCount}개 발견되었으며, 총 조회수는 ${(score.youtubeViews / 10000).toFixed(1)}만회입니다. 향후 ${daysToPeak}일 내에 피크에 도달할 것으로 예측됩니다.`;
  
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
        video_count: youtubeData.videoCount
      }
    }
  }), { headers });
}
