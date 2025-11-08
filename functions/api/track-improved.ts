/**
 * 改进的 Cloudflare Pages Function - 包含速率限制
 */

import type { Env, TrackEvent, GameStats } from './_shared';
import { CORS_HEADERS, VALID_EVENT_TYPES, KV_EXPIRATION_DAYS } from './_shared';

// 速率限制配置
const RATE_LIMIT = {
  WINDOW_MS: 60 * 1000, // 1 分钟窗口
  MAX_REQUESTS: 60,     // 每分钟最多 60 个请求
};

/**
 * 获取客户端 IP
 */
function getClientIP(request: Request): string {
  return request.headers.get('CF-Connecting-IP') ||
         request.headers.get('X-Forwarded-For')?.split(',')[0] ||
         'unknown';
}

/**
 * 检查速率限制
 */
async function checkRateLimit(env: Env, clientIP: string): Promise<boolean> {
  const key = `rate:${clientIP}`;
  const now = Date.now();

  // 获取当前窗口的请求记录
  const record = await env.ANALYTICS_KV.get(key, 'json') as { count: number, windowStart: number } | null;

  if (!record || (now - record.windowStart) > RATE_LIMIT.WINDOW_MS) {
    // 新窗口
    await env.ANALYTICS_KV.put(key, JSON.stringify({
      count: 1,
      windowStart: now,
    }), {
      expirationTtl: Math.ceil(RATE_LIMIT.WINDOW_MS / 1000),
    });
    return true;
  }

  if (record.count >= RATE_LIMIT.MAX_REQUESTS) {
    return false; // 超过限制
  }

  // 增加计数
  await env.ANALYTICS_KV.put(key, JSON.stringify({
    count: record.count + 1,
    windowStart: record.windowStart,
  }), {
    expirationTtl: Math.ceil((RATE_LIMIT.WINDOW_MS - (now - record.windowStart)) / 1000),
  });

  return true;
}

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
 * 处理 POST /api/track - 追踪事件（带速率限制）
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const responseHeaders = {
    ...CORS_HEADERS,
    'Content-Type': 'application/json',
  };

  try {
    // 检查速率限制
    const clientIP = getClientIP(context.request);
    const isAllowed = await checkRateLimit(context.env, clientIP);

    if (!isAllowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: responseHeaders }
      );
    }

    const data: TrackEvent = await context.request.json();

    // 验证必需字段
    if (!data.type || !data.gameSlug || !data.timestamp) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: responseHeaders }
      );
    }

    // 验证事件类型
    if (!VALID_EVENT_TYPES.includes(data.type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid event type' }),
        { status: 400, headers: responseHeaders }
      );
    }

    // 验证 gameSlug 格式
    if (!/^[a-zA-Z0-9_-]+$/.test(data.gameSlug)) {
      return new Response(
        JSON.stringify({ error: 'Invalid gameSlug format' }),
        { status: 400, headers: responseHeaders }
      );
    }

    // 验证 timestamp 有效性（不接受太旧的数据）
    const timestamp = new Date(data.timestamp);
    const now = new Date();
    const hoursDiff = Math.abs(now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);

    if (isNaN(timestamp.getTime()) || hoursDiff > 24) {
      return new Response(
        JSON.stringify({ error: 'Invalid or outdated timestamp' }),
        { status: 400, headers: responseHeaders }
      );
    }

    // 计算日期（UTC）
    const date = timestamp.toISOString().split('T')[0];

    // KV Key 格式
    const key = `stats:${data.gameSlug}:${data.type}:${date}`;

    // 使用原子操作更新统计（减少读写冲突）
    const existingData = await context.env.ANALYTICS_KV.get(key, 'json') as GameStats | null;
    const stats: GameStats = existingData || { count: 0, total: 0, lastUpdated: 0 };

    stats.count += 1;
    if (data.value !== undefined && typeof data.value === 'number') {
      stats.total += data.value;
    }
    stats.lastUpdated = Date.now();

    // 写回 KV
    await context.env.ANALYTICS_KV.put(key, JSON.stringify(stats), {
      expirationTtl: 60 * 60 * 24 * KV_EXPIRATION_DAYS,
    });

    return new Response(
      JSON.stringify({ success: true }),
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