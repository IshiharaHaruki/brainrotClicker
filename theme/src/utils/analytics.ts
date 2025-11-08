/**
 * 客户端游戏分析追踪工具
 *
 * 功能：
 * - trackPageView: 追踪游戏页面浏览量（PV）
 * - trackCardClick: 追踪游戏卡片点击
 * - trackGameStart: 追踪游戏启动
 * - trackTimeSpent: 追踪用户停留时长
 */

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
        keepalive: true,  // 确保页面卸载时请求仍能发送
      }).catch((error) => {
        console.error('Analytics tracking failed:', error);
      });
    }
  } catch (error) {
    // 静默失败，不影响用户体验
    console.error('Analytics error:', error);
  }
}

/**
 * 追踪游戏页面浏览量（PV）
 *
 * @param gameSlug 游戏 slug（例如：/games/clicker/cookie-clicker）
 * @param locale 语言代码（例如：en, es, cn）
 *
 * 用法：
 * ```tsx
 * useEffect(() => {
 *   trackPageView('/games/clicker/cookie-clicker', 'en');
 * }, []);
 * ```
 */
export function trackPageView(gameSlug: string, locale?: string): void {
  sendEvent({
    type: 'pv',
    gameSlug,
    locale,
  });
}

/**
 * 追踪游戏卡片点击
 *
 * @param gameSlug 游戏 slug
 * @param locale 语言代码
 *
 * 用法：
 * ```tsx
 * <GameCard
 *   onClick={() => trackCardClick('/games/clicker/cookie-clicker', 'en')}
 * />
 * ```
 */
export function trackCardClick(gameSlug: string, locale?: string): void {
  sendEvent({
    type: 'card_click',
    gameSlug,
    locale,
  });
}

/**
 * 追踪游戏启动（PLAY 按钮点击或 iframe 加载）
 *
 * @param gameSlug 游戏 slug
 * @param locale 语言代码
 *
 * 用法：
 * ```tsx
 * <button onClick={() => trackGameStart('/games/clicker/cookie-clicker', 'en')}>
 *   PLAY
 * </button>
 * ```
 */
export function trackGameStart(gameSlug: string, locale?: string): void {
  sendEvent({
    type: 'game_start',
    gameSlug,
    locale,
  });
}

/**
 * 追踪用户停留时长
 *
 * @param gameSlug 游戏 slug
 * @param seconds 停留时长（秒）
 * @param locale 语言代码
 *
 * 用法：
 * ```tsx
 * useEffect(() => {
 *   const startTime = Date.now();
 *
 *   const handleBeforeUnload = () => {
 *     const seconds = Math.floor((Date.now() - startTime) / 1000);
 *     trackTimeSpent('/games/clicker/cookie-clicker', seconds, 'en');
 *   };
 *
 *   window.addEventListener('beforeunload', handleBeforeUnload);
 *   return () => window.removeEventListener('beforeunload', handleBeforeUnload);
 * }, []);
 * ```
 */
export function trackTimeSpent(gameSlug: string, seconds: number, locale?: string): void {
  // 只追踪有意义的停留时长（> 5 秒）
  if (seconds < 5) return;

  sendEvent({
    type: 'time_spent',
    gameSlug,
    value: seconds,
    locale,
  });
}

/**
 * Hook: 自动追踪游戏页面的 PV 和停留时长
 *
 * @param gameSlug 游戏 slug
 * @param locale 语言代码
 *
 * 用法（在游戏详情页组件中）：
 * ```tsx
 * export function GameDetailPage({ gameSlug, locale }) {
 *   useGamePageTracking(gameSlug, locale);
 *
 *   return (
 *     <div>...</div>
 *   );
 * }
 * ```
 */
export function useGamePageTracking(gameSlug: string, locale?: string): void {
  // 只在客户端执行
  if (typeof window === 'undefined') return;

  const React = require('react');
  const { useEffect } = React;

  useEffect(() => {
    // 追踪 PV
    trackPageView(gameSlug, locale);

    // 记录进入时间
    const startTime = Date.now();
    let isVisible = true;

    // 监听页面可见性变化
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isVisible = false;
        // 页面隐藏时发送停留时长
        const seconds = Math.floor((Date.now() - startTime) / 1000);
        trackTimeSpent(gameSlug, seconds, locale);
      } else {
        isVisible = true;
      }
    };

    // 监听页面卸载
    const handleBeforeUnload = () => {
      if (isVisible) {
        const seconds = Math.floor((Date.now() - startTime) / 1000);
        trackTimeSpent(gameSlug, seconds, locale);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);

      // 组件卸载时发送停留时长
      if (isVisible) {
        const seconds = Math.floor((Date.now() - startTime) / 1000);
        trackTimeSpent(gameSlug, seconds, locale);
      }
    };
  }, [gameSlug, locale]);
}
