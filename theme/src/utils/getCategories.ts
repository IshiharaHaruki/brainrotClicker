import type { Folder, MdxFile, PageMapItem } from 'nextra'
import type { FrontMatter } from '../types'
import themeConfig from '../../../theme.config'

function isMdxFile(item: PageMapItem): item is MdxFile {
    return 'frontMatter' in item && 'name' in item;
}

function isFolder(item: PageMapItem): item is Folder {
    return 'children' in item && 'name' in item;
}

export interface Category {
    title: string;
    icon: string;
    slug: string;
    description?: string;
}

/**
 * 从 pageMap 中提取所有游戏分类
 * 只提取 games 目录下的分类页面（不包括子目录中的游戏页面）
 */
export function getCategories(pageMap: PageMapItem[], locale: string = 'en'): Category[] {
    const categories: Category[] = [];
    const i18nEnabled = themeConfig.features?.i18n;

    // 递归遍历页面树
    const traverse = (items: PageMapItem[]) => {
        items.forEach(item => {
            if (isMdxFile(item)) {
                const route = item.route || '';

                // 匹配 games 目录下的分类页面
                // 例如: /en/games/action.mdx 或 /games/action.mdx (非国际化)
                const categoryPattern = i18nEnabled
                    ? new RegExp(`^/${locale}/games/[^/]+$`)
                    : /^\/games\/[^/]+$/;

                if (categoryPattern.test(route)) {
                    const { frontMatter = {} } = item;

                    // 只收集配置了 icon 的分类页面
                    if (frontMatter.icon) {
                        categories.push({
                            title: frontMatter.title || item.name,
                            icon: frontMatter.icon,
                            slug: route,
                            description: frontMatter.description
                        });
                    }
                }
            }

            if (isFolder(item)) {
                traverse(item.children);
            }
        });
    };

    traverse(pageMap);

    // 按标题排序
    return categories.sort((a, b) => a.title.localeCompare(b.title));
}
