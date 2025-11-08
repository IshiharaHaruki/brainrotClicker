/**
 * 共享类型和常量
 */

export interface Env {
  ANALYTICS_KV: KVNamespace;
}

export interface TrackEvent {
  type: 'pv' | 'card_click' | 'game_start' | 'time_spent';
  gameSlug: string;
  value?: number;  // 用于 time_spent（秒数）
  locale?: string;
  timestamp: number;
  userAgent?: string;
}

export interface GameStats {
  count: number;   // 事件发生次数
  total: number;   // 总值（用于计算平均停留时长）
  lastUpdated: number;
}

// CORS 配置
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// 有效的事件类型
export const VALID_EVENT_TYPES = ['pv', 'card_click', 'game_start', 'time_spent'] as const;

// KV 数据保留天数
export const KV_EXPIRATION_DAYS = 90;

// 统计查询最大天数
export const MAX_STATS_DAYS = 90;
