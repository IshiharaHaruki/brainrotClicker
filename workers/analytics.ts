/**
 * Cloudflare Workers - 游戏分析追踪 API
 *
 * 功能：
 * - 接收客户端发送的游戏统计事件
 * - 存储到 Cloudflare KV
 * - 按天聚合数据（PV、点击、启动、停留时长）
 */

interface Env {
  ANALYTICS_KV: KVNamespace;
}

interface TrackEvent {
  type: 'pv' | 'card_click' | 'game_start' | 'time_spent';
  gameSlug: string;
  value?: number;  // 用于 time_spent（秒数）
  locale?: string;
  timestamp: number;
  userAgent?: string;
}

interface GameStats {
  count: number;   // 事件发生次数
  total: number;   // 总值（用于计算平均停留时长）
  lastUpdated: number;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // CORS 头部
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // 处理 OPTIONS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    const url = new URL(request.url);

    // POST /api/track - 追踪事件
    if (request.method === 'POST' && url.pathname === '/api/track') {
      try {
        const data: TrackEvent = await request.json();

        // 验证必需字段
        if (!data.type || !data.gameSlug || !data.timestamp) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // 验证事件类型
        const validTypes = ['pv', 'card_click', 'game_start', 'time_spent'];
        if (!validTypes.includes(data.type)) {
          return new Response(
            JSON.stringify({ error: 'Invalid event type' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // 计算日期（UTC）
        const date = new Date(data.timestamp).toISOString().split('T')[0];

        // KV Key 格式: stats:{gameSlug}:{type}:{date}
        const key = `stats:${data.gameSlug}:${data.type}:${date}`;

        // 从 KV 读取现有数据
        const existingData = await env.ANALYTICS_KV.get(key, 'json') as GameStats | null;
        const stats: GameStats = existingData || { count: 0, total: 0, lastUpdated: 0 };

        // 累加统计
        stats.count += 1;
        if (data.value !== undefined) {
          stats.total += data.value;
        }
        stats.lastUpdated = Date.now();

        // 写回 KV（保留 90 天）
        await env.ANALYTICS_KV.put(key, JSON.stringify(stats), {
          expirationTtl: 60 * 60 * 24 * 90,  // 90 days
        });

        return new Response(
          JSON.stringify({ success: true, key }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );

      } catch (error) {
        console.error('Error tracking event:', error);
        return new Response(
          JSON.stringify({ error: 'Internal server error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // GET /api/stats/:gameSlug - 查询统计数据（可选功能）
    if (request.method === 'GET' && url.pathname.startsWith('/api/stats/')) {
      try {
        const gameSlug = url.pathname.split('/api/stats/')[1];
        const days = parseInt(url.searchParams.get('days') || '7', 10);

        const stats: Record<string, any> = {};
        const types = ['pv', 'card_click', 'game_start', 'time_spent'];

        // 获取最近 N 天的数据
        for (let i = 0; i < days; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];

          for (const type of types) {
            const key = `stats:${gameSlug}:${type}:${dateStr}`;
            const data = await env.ANALYTICS_KV.get(key, 'json') as GameStats | null;

            if (data) {
              if (!stats[type]) {
                stats[type] = { count: 0, total: 0 };
              }
              stats[type].count += data.count;
              stats[type].total += data.total;
            }
          }
        }

        // 计算平均停留时长
        if (stats.time_spent) {
          stats.avgTimeSpent = stats.time_spent.count > 0
            ? stats.time_spent.total / stats.time_spent.count
            : 0;
        }

        return new Response(
          JSON.stringify({ gameSlug, days, stats }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );

      } catch (error) {
        console.error('Error fetching stats:', error);
        return new Response(
          JSON.stringify({ error: 'Internal server error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // 默认响应
    return new Response(
      JSON.stringify({ error: 'Not Found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  },
};
