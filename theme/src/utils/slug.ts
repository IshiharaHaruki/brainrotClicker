/**
 * gameSlug 提取和验证工具
 *
 * 说明：
 * - gameSlug 是游戏的唯一标识符，用于数据追踪和 KV 存储
 * - 必须符合格式：只允许字母、数字、连字符、下划线
 * - 从 URL 路径的 /games/ 后提取最后一段
 */

// 与 API 校验保持一致 (functions/api/track.ts)
const GAME_SLUG_REGEX = /^[a-zA-Z0-9_-]+$/;

/**
 * 类型守卫：检查是否为有效的 gameSlug
 *
 * @param slug - 待检查的值
 * @returns 是否为有效的 gameSlug
 *
 * @example
 * isValidGameSlug('brainrot-clicker') // true
 * isValidGameSlug('brain rot') // false (包含空格)
 * isValidGameSlug('') // false (空字符串)
 */
export function isValidGameSlug(slug: unknown): slug is string {
    return typeof slug === 'string' && slug.length > 0 && GAME_SLUG_REGEX.test(slug);
}

/**
 * 从路径中提取 gameSlug
 *
 * 支持以下路径格式：
 * - 简单路径：/games/brainrot-clicker
 * - 多级路径：/games/clicker/brainrot-clicker
 * - 带语言前缀：/en/games/clicker/brainrot-clicker
 * - 末尾斜杠：/games/brainrot-clicker/
 * - 查询参数：/games/brainrot-clicker?ref=home
 * - Hash：/games/brainrot-clicker#section
 *
 * @param path - URL 路径
 * @returns gameSlug（无效时返回 null）
 *
 * @example
 * extractGameSlug('/games/brainrot-clicker') // 'brainrot-clicker'
 * extractGameSlug('/en/games/clicker/brainrot-clicker') // 'brainrot-clicker'
 * extractGameSlug('/games/brainrot-clicker/') // 'brainrot-clicker'
 * extractGameSlug('/games/brainrot-clicker?ref=home') // 'brainrot-clicker'
 * extractGameSlug('/games/') // null
 * extractGameSlug('/about') // null
 */
export function extractGameSlug(path: string): string | null {
    // 边界情况检查
    if (!path || typeof path !== 'string') {
        return null;
    }

    // 匹配 /games/ 后的内容，支持多级路径，提取最后一段
    // 正则说明：
    // - \/games\/ : 匹配 /games/ 前缀
    // - (?:[^\/\?#]+\/)* : 非捕获组，匹配中间的分类路径（0 次或多次）
    // - ([^\/\?#]+) : 捕获组，匹配最后一段（gameSlug）
    // - \/? : 可选的末尾斜杠
    // - $ : 确保匹配到路径末尾（查询参数和 hash 会被忽略）
    const match = path.match(/\/games\/(?:[^\/\?#]+\/)*([^\/\?#]+)\/?(?:\?|#|$)/);
    const slug = match ? match[1] : null;

    // 验证格式（与 API 校验保持一致）
    if (slug && !isValidGameSlug(slug)) {
        console.warn(`[slug] Invalid gameSlug format extracted from path: ${path}, slug: ${slug}`);
        return null;
    }

    return slug;
}
