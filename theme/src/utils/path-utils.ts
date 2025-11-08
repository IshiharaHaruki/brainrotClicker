/**
 * 路径处理工具函数
 * 提供统一的 locale 和 gameSlug 提取逻辑
 */

/**
 * 从 URL 路径中提取语言代码
 * @param path URL 路径
 * @returns 语言代码，默认为 'en'
 */
export function getLocaleFromPath(path: string): string {
    const match = path.match(/^\/([a-z]{2})(\/|$)/);
    return match ? match[1] : 'en';
}

/**
 * 从路径中提取游戏 slug
 * @param path URL 路径
 * @returns 游戏 slug 或 null
 *
 * 示例:
 * - /en/games/cookie-clicker → cookie-clicker
 * - /games/cookie-clicker → cookie-clicker
 * - /en/about → null
 */
export function extractGameSlug(path: string): string | null {
    // 支持带语言前缀和不带语言前缀的路径
    const match = path.match(/\/games\/([^\/\?#]+)/);
    return match ? match[1] : null;
}

/**
 * 从游戏路径中提取 slug（用于 GameCard）
 * @param href 游戏相对路径（例如: /games/cookie-clicker）
 * @returns 游戏 slug
 */
export function getGameSlugFromHref(href: string): string {
    const slug = extractGameSlug(href);
    if (!slug) {
        // 如果无法提取，尝试简单移除 /games/ 前缀
        return href.replace(/^\/games\//, '');
    }
    return slug;
}

/**
 * 构建完整的本地化路径
 * @param locale 语言代码
 * @param path 相对路径
 * @returns 完整路径
 */
export function buildLocalizedPath(locale: string, path: string): string {
    // 确保路径以 / 开头
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `/${locale}${normalizedPath}`;
}