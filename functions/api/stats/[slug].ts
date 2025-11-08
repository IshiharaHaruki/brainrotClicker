/**
 * Cloudflare Pages Function - 游戏统计数据查询 API
 *
 * 功能：
 * - GET /api/stats/:gameSlug - 查询指定游戏的统计数据
 * - 支持按天数筛选（默认 7 天，最多 90 天）
 * - 返回聚合后的统计数据（PV、点击、启动、平均停留时长）
 */

import type {
  Env,
  GameStats,
} from '../_shared';

import {
  CORS_HEADERS,
  VALID_EVENT_TYPES,
  MAX_STATS_DAYS,
} from '../_shared';

/**
 * 处理 OPTIONS 预检请求
 */
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
};

/**
 * 处理 GET /api/stats/:slug - 查询统计数据
 */
export const onRequestGet: PagesFunction<Env, string> = async (context) => {
  const responseHeaders = {
    ...CORS_HEADERS,
    'Content-Type': 'application/json',
  };

  try {
    // 获取动态路由参数
    const gameSlug = context.params.slug as string;

    // 验证 gameSlug 格式
    if (!gameSlug || !/^[a-zA-Z0-9_-]+$/.test(gameSlug)) {
      return new Response(
        JSON.stringify({ error: 'Invalid gameSlug format' }),
        { status: 400, headers: responseHeaders }
      );
    }

    // 获取查询参数（默认 7 天，最多 90 天）
    const url = new URL(context.request.url);
    let days = parseInt(url.searchParams.get('days') || '7', 10);

    // 验证 days 参数
    if (isNaN(days) || days < 1) {
      days = 7;
    } else if (days > MAX_STATS_DAYS) {
      days = MAX_STATS_DAYS;
    }

    const stats: Record<string, any> = {};

    // 获取最近 N 天的数据
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      for (const type of VALID_EVENT_TYPES) {
        const key = `stats:${gameSlug}:${type}:${dateStr}`;
        const data = await context.env.ANALYTICS_KV.get(key, 'json') as GameStats | null;

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
    if (stats.time_spent && stats.time_spent.count > 0) {
      stats.avgTimeSpent = stats.time_spent.total / stats.time_spent.count;
    }

    return new Response(
      JSON.stringify({ gameSlug, days, stats }),
      { status: 200, headers: responseHeaders }
    );

  } catch (error) {
    console.error('Error fetching stats:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: responseHeaders }
    );
  }
};
