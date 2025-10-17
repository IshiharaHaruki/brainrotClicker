/**
 * Locale 路径处理工具函数
 * 用于处理多语言路由中的 locale 前缀
 */

/**
 * 从路由中移除 locale 前缀
 * @param route - 完整路由路径，例如 "/en/games/clicker/game1"
 * @param supportedLocales - 支持的 locale 列表，例如 ["en", "es"]
 * @returns 去掉 locale 的相对路径，例如 "/games/clicker/game1"
 */
export function stripLocaleFromRoute(route: string, supportedLocales: string[]): string {
    if (!route) return route;

    // 标准化路径，确保以 / 开头
    const normalizedRoute = route.startsWith('/') ? route : `/${route}`;

    // 检查路径是否以某个 locale 开头
    for (const locale of supportedLocales) {
        const localePrefix = `/${locale}/`;
        const localeOnly = `/${locale}`;

        // 如果路径以 /locale/ 开头，移除它
        if (normalizedRoute.startsWith(localePrefix)) {
            return normalizedRoute.substring(locale.length + 1); // +1 是为了保留前导斜杠
        }

        // 如果路径就是 /locale，返回 /
        if (normalizedRoute === localeOnly) {
            return '/';
        }
    }

    // 如果没有找到 locale 前缀，返回原路径
    return normalizedRoute;
}

/**
 * 用当前 locale 构建完整路径
 * @param path - 相对路径，例如 "/games/clicker/game1"
 * @param locale - 当前 locale，例如 "es"
 * @returns 带 locale 的完整路径，例如 "/es/games/clicker/game1"
 */
export function buildLocaleRoute(path: string, locale: string): string {
    if (!path) return `/${locale}`;

    // 标准化路径
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    // 如果路径是根路径
    if (normalizedPath === '/') {
        return `/${locale}`;
    }

    // 构建完整路径
    return `/${locale}${normalizedPath}`;
}
