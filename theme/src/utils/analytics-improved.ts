/**
 * 改进的游戏分析追踪工具
 * 修复了原始实现中的问题
 */

import { useEffect, useRef } from 'react';

const ANALYTICS_ENDPOINT = '/api/track';

interface TrackEvent {
  type: 'pv' | 'card_click' | 'game_start' | 'time_spent';
  gameSlug: string;
  value?: number;
  locale?: string;
}

/**
 * 发送追踪事件到 Cloudflare Workers
 */
async function sendEvent(event: TrackEvent): Promise<void> {
  try {
    // 只在浏览器环境中执行
    if (typeof window === 'undefined') return;

    // 验证 gameSlug 不为空
    if (!event.gameSlug || event.gameSlug.trim() === '') {
      console.warn('Analytics: Invalid gameSlug provided', event);
      return;
    }

    // 添加时间戳和 UserAgent
    const payload = {
      ...event,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
    };

    // 使用 sendBeacon 或 fetch
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon(ANALYTICS_ENDPOINT, blob);
    } else {
      fetch(ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch((error) => {
        console.error('Analytics tracking failed:', error);
      });
    }
  } catch (error) {
    console.error('Analytics error:', error);
  }
}

// 导出原有的追踪函数
export function trackPageView(gameSlug: string, locale?: string): void {
  sendEvent({ type: 'pv', gameSlug, locale });
}

export function trackCardClick(gameSlug: string, locale?: string): void {
  sendEvent({ type: 'card_click', gameSlug, locale });
}

export function trackGameStart(gameSlug: string, locale?: string): void {
  sendEvent({ type: 'game_start', gameSlug, locale });
}

export function trackTimeSpent(gameSlug: string, seconds: number, locale?: string): void {
  if (seconds < 5) return;
  sendEvent({ type: 'time_spent', gameSlug, value: seconds, locale });
}

/**
 * 改进的 Hook：自动追踪游戏页面的 PV 和停留时长
 * 修复了重复发送和条件执行的问题
 */
export function useGamePageTracking(gameSlug: string | null, locale?: string): void {
  const startTimeRef = useRef<number>(0);
  const hasSentTimeRef = useRef<boolean>(false);

  useEffect(() => {
    // 如果没有有效的 gameSlug，不执行追踪
    if (!gameSlug || gameSlug.trim() === '') {
      return;
    }

    // 追踪 PV
    trackPageView(gameSlug, locale);

    // 记录进入时间
    startTimeRef.current = Date.now();
    hasSentTimeRef.current = false;

    // 发送停留时长的函数（确保只发送一次）
    const sendTimeSpentOnce = () => {
      if (!hasSentTimeRef.current && startTimeRef.current > 0) {
        const seconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        if (seconds >= 5) {  // 只追踪有意义的停留时长
          trackTimeSpent(gameSlug, seconds, locale);
          hasSentTimeRef.current = true;
        }
      }
    };

    // 监听页面可见性变化
    const handleVisibilityChange = () => {
      if (document.hidden) {
        sendTimeSpentOnce();
      }
    };

    // 监听页面卸载
    const handleBeforeUnload = () => {
      sendTimeSpentOnce();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);

      // 组件卸载时发送停留时长
      sendTimeSpentOnce();
    };
  }, [gameSlug, locale]);
}