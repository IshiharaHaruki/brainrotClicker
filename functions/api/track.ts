/**
 * Cloudflare Pages Function - 游戏分析追踪 API
 *
 * 功能：
 * - 接收客户端发送的游戏统计事件
 * - 存储到 Cloudflare KV
 * - 按天聚合数据（PV、点击、启动、停留时长）
 */

import type {
  Env,
  TrackEvent,
  GameStats,
} from './_shared';

import {
  CORS_HEADERS,
  VALID_EVENT_TYPES,
  KV_EXPIRATION_DAYS,
} from './_shared';

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
 * 处理 POST /api/track - 追踪事件
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const responseHeaders = {
    ...CORS_HEADERS,
    'Content-Type': 'application/json',
  };

  try {
    const data: TrackEvent = await context.request.json();

    // 验证必需字段
    if (!data.type || !data.gameSlug || !data.timestamp) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: type, gameSlug, timestamp' }),
        { status: 400, headers: responseHeaders }
      );
    }

    // 验证事件类型
    if (!VALID_EVENT_TYPES.includes(data.type)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid event type',
          validTypes: VALID_EVENT_TYPES
        }),
        { status: 400, headers: responseHeaders }
      );
    }

    // 验证 gameSlug 格式（只允许字母、数字、连字符、下划线）
    if (!/^[a-zA-Z0-9_-]+$/.test(data.gameSlug)) {
      return new Response(
        JSON.stringify({ error: 'Invalid gameSlug format' }),
        { status: 400, headers: responseHeaders }
      );
    }

    // 验证 timestamp 有效性
    const timestamp = new Date(data.timestamp);
    if (isNaN(timestamp.getTime())) {
      return new Response(
        JSON.stringify({ error: 'Invalid timestamp' }),
        { status: 400, headers: responseHeaders }
      );
    }

    // 计算日期（UTC）
    const date = timestamp.toISOString().split('T')[0];

    // KV Key 格式: stats:{gameSlug}:{type}:{date}
    const key = `stats:${data.gameSlug}:${data.type}:${date}`;

    // 从 KV 读取现有数据
    const existingData = await context.env.ANALYTICS_KV.get(key, 'json') as GameStats | null;
    const stats: GameStats = existingData || { count: 0, total: 0, lastUpdated: 0 };

    // 累加统计
    stats.count += 1;
    if (data.value !== undefined && typeof data.value === 'number') {
      stats.total += data.value;
    }
    stats.lastUpdated = Date.now();

    // 写回 KV（保留配置的天数）
    await context.env.ANALYTICS_KV.put(key, JSON.stringify(stats), {
      expirationTtl: 60 * 60 * 24 * KV_EXPIRATION_DAYS,
    });

    return new Response(
      JSON.stringify({ success: true, key }),
      { status: 200, headers: responseHeaders }
    );

  } catch (error) {
    console.error('Error tracking event:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: responseHeaders }
    );
  }
};
